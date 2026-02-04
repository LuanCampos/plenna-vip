/**
 * Appointment service for Supabase operations.
 * All database operations for appointments go through this service.
 * Every mutation creates an event for audit trail and future notifications.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
  AppointmentWithDetails,
  AppointmentCreateInput,
} from '@/types/appointment';
import type { AppointmentServiceCreate } from '@/types/appointmentService';
import type { AppointmentEventCreate, EventType, ActorType, UpdatePayload } from '@/types/event';
import type { Service } from '@/types/service';

const TABLE_NAME = 'appointments';
const SERVICES_TABLE = 'appointment_services';
const EVENTS_TABLE = 'appointment_events';

/**
 * Create an event for audit trail.
 */
async function createEvent(
  tenantId: string,
  appointmentId: string,
  eventType: EventType,
  actorType: ActorType,
  actorId: string | null,
  payload?: Record<string, unknown>
): Promise<void> {
  const event: AppointmentEventCreate = {
    tenant_id: tenantId,
    appointment_id: appointmentId,
    event_type: eventType,
    actor_type: actorType,
    actor_id: actorId,
    payload,
  };

  const { error } = await supabase.from(EVENTS_TABLE).insert(event);

  if (error) {
    // Log but don't throw - event failure shouldn't block the main operation
    logger.error('appointmentService.createEvent.failed', { event, error });
  }
}

export const appointmentService = {
  /**
   * Get all appointments for a tenant.
   */
  async getAll(tenantId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .order('start_time', { ascending: true });

    if (error) {
      logger.error('appointmentService.getAll.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get appointments for a date range.
   */
  async getByDateRange(
    tenantId: string,
    startDate: string,
    endDate: string,
    professionalId?: string
  ): Promise<AppointmentWithDetails[]> {
    let query = supabase
      .from(TABLE_NAME)
      .select(`
        *,
        client:clients(id, name, phone),
        professional:professionals(id, name, avatar_url),
        services:appointment_services(
          id,
          service_id,
          service_name_at_booking,
          price_at_booking,
          duration_at_booking,
          order_index
        )
      `)
      .eq('tenant_id', tenantId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .order('start_time', { ascending: true });

    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('appointmentService.getByDateRange.failed', { tenantId, startDate, endDate, error });
      throw error;
    }

    return (data ?? []) as AppointmentWithDetails[];
  },

  /**
   * Get a single appointment by ID with details.
   */
  async getById(tenantId: string, appointmentId: string): Promise<AppointmentWithDetails | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        client:clients(id, name, phone),
        professional:professionals(id, name, avatar_url),
        services:appointment_services(
          id,
          service_id,
          service_name_at_booking,
          price_at_booking,
          duration_at_booking,
          order_index
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('id', appointmentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('appointmentService.getById.failed', { tenantId, appointmentId, error });
      throw error;
    }

    return data as AppointmentWithDetails;
  },

  /**
   * Create a new appointment with services.
   * Calculates total_duration and total_price from services.
   */
  async create(
    input: AppointmentCreateInput,
    services: Service[],
    actorType: ActorType,
    actorId: string | null
  ): Promise<AppointmentWithDetails> {
    // Calculate totals from services
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

    // Calculate end_time
    const startTime = new Date(input.start_time);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    const appointmentData: AppointmentCreate = {
      tenant_id: input.tenant_id,
      client_id: input.client_id,
      professional_id: input.professional_id,
      start_time: input.start_time,
      end_time: endTime.toISOString(),
      status: 'scheduled',
      notes: input.notes,
      total_duration: totalDuration,
      total_price: totalPrice,
    };

    // Insert appointment
    const { data: appointment, error } = await supabase
      .from(TABLE_NAME)
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      logger.error('appointmentService.create.failed', { input, error });
      throw error;
    }

    // Insert appointment services
    const appointmentServices: AppointmentServiceCreate[] = services.map((service, index) => ({
      tenant_id: input.tenant_id,
      appointment_id: appointment.id,
      service_id: service.id,
      service_name_at_booking: service.name,
      price_at_booking: service.price,
      duration_at_booking: service.duration,
      order_index: index,
    }));

    const { error: servicesError } = await supabase.from(SERVICES_TABLE).insert(appointmentServices);

    if (servicesError) {
      logger.error('appointmentService.create.services.failed', { appointmentId: appointment.id, error: servicesError });
      // Rollback appointment
      await supabase.from(TABLE_NAME).delete().eq('id', appointment.id);
      throw servicesError;
    }

    // Create event
    await createEvent(input.tenant_id, appointment.id, 'created', actorType, actorId, {
      service_ids: input.service_ids,
      professional_id: input.professional_id,
      client_id: input.client_id,
    });

    // Fetch the complete appointment with details
    const result = await this.getById(input.tenant_id, appointment.id);
    if (!result) {
      throw new Error('Failed to fetch created appointment');
    }

    return result;
  },

  /**
   * Update an existing appointment.
   */
  async update(
    tenantId: string,
    appointmentId: string,
    data: AppointmentUpdate,
    actorType: ActorType,
    actorId: string | null
  ): Promise<AppointmentWithDetails> {
    // Get current appointment for comparison
    const current = await this.getById(tenantId, appointmentId);
    if (!current) {
      throw new Error('Appointment not found');
    }

    // Build changes payload for event
    const changes: UpdatePayload['changes'] = {};
    const updateKeys = Object.keys(data) as (keyof AppointmentUpdate)[];
    for (const key of updateKeys) {
      const oldValue = current[key as keyof Appointment];
      const newValue = data[key];
      if (oldValue !== newValue) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      logger.error('appointmentService.update.failed', { tenantId, appointmentId, data, error });
      throw error;
    }

    // Create event if there were changes
    if (Object.keys(changes).length > 0) {
      await createEvent(tenantId, appointmentId, 'updated', actorType, actorId, { changes });
    }

    const result = await this.getById(tenantId, appointmentId);
    if (!result) {
      throw new Error('Failed to fetch updated appointment');
    }

    return result;
  },

  /**
   * Update appointment status.
   */
  async updateStatus(
    tenantId: string,
    appointmentId: string,
    status: Appointment['status'],
    actorType: ActorType,
    actorId: string | null
  ): Promise<AppointmentWithDetails> {
    // Get current status
    const current = await this.getById(tenantId, appointmentId);
    if (!current) {
      throw new Error('Appointment not found');
    }

    const oldStatus = current.status;

    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status })
      .eq('tenant_id', tenantId)
      .eq('id', appointmentId);

    if (error) {
      logger.error('appointmentService.updateStatus.failed', { tenantId, appointmentId, status, error });
      throw error;
    }

    // Create status change event
    await createEvent(tenantId, appointmentId, 'status_changed', actorType, actorId, {
      from: oldStatus,
      to: status,
    });

    const result = await this.getById(tenantId, appointmentId);
    if (!result) {
      throw new Error('Failed to fetch updated appointment');
    }

    return result;
  },

  /**
   * Cancel an appointment (soft cancel via status).
   */
  async cancel(
    tenantId: string,
    appointmentId: string,
    actorType: ActorType,
    actorId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status: 'cancelled' })
      .eq('tenant_id', tenantId)
      .eq('id', appointmentId);

    if (error) {
      logger.error('appointmentService.cancel.failed', { tenantId, appointmentId, error });
      throw error;
    }

    await createEvent(tenantId, appointmentId, 'cancelled', actorType, actorId);
  },

  /**
   * Delete an appointment permanently (admin only).
   */
  async delete(tenantId: string, appointmentId: string): Promise<void> {
    // Delete services first (cascade should handle this, but being explicit)
    await supabase.from(SERVICES_TABLE).delete().eq('appointment_id', appointmentId);

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', appointmentId);

    if (error) {
      logger.error('appointmentService.delete.failed', { tenantId, appointmentId, error });
      throw error;
    }
  },

  /**
   * Check for conflicting appointments.
   * Returns true if there's a conflict.
   */
  async checkConflict(
    tenantId: string,
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    let query = supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('appointmentService.checkConflict.failed', { tenantId, professionalId, startTime, endTime, error });
      throw error;
    }

    return (data?.length ?? 0) > 0;
  },

  /**
   * Get appointments for a client (for history).
   */
  async getByClient(tenantId: string, clientId: string): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        client:clients(id, name, phone),
        professional:professionals(id, name, avatar_url),
        services:appointment_services(
          id,
          service_id,
          service_name_at_booking,
          price_at_booking,
          duration_at_booking,
          order_index
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .order('start_time', { ascending: false });

    if (error) {
      logger.error('appointmentService.getByClient.failed', { tenantId, clientId, error });
      throw error;
    }

    return (data ?? []) as AppointmentWithDetails[];
  },

  /**
   * Get appointments for a professional.
   */
  async getByProfessional(
    tenantId: string,
    professionalId: string,
    startDate: string,
    endDate: string
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });

    if (error) {
      logger.error('appointmentService.getByProfessional.failed', { tenantId, professionalId, error });
      throw error;
    }

    return data ?? [];
  },
};
