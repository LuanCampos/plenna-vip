/**
 * Booking service for public booking operations.
 * Handles the complete flow: get tenant by slug, find/create client, create appointment.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { clientService } from './clientService';
import { appointmentService } from './appointmentService';
import type { Tenant } from '@/types/tenant';
import type { Service } from '@/types/service';
import type { Professional, ProfessionalWithServices } from '@/types/professional';
import type { AppointmentWithDetails } from '@/types/appointment';
import type { PublicBookingInput, BookingSummary } from '@/types/booking';
import type { Client, ClientCreate } from '@/types/client';

const TENANTS_TABLE = 'tenants';
const SERVICES_TABLE = 'services';
const PROFESSIONALS_TABLE = 'professionals';
const PROFESSIONAL_SERVICES_TABLE = 'professional_services';

export interface CreateBookingResult {
  appointment: AppointmentWithDetails;
  client: Client;
  summary: BookingSummary;
}

export const bookingService = {
  /**
   * Get tenant by slug (for public booking page).
   */
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from(TENANTS_TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('bookingService.getTenantBySlug.failed', { slug, error });
      throw error;
    }

    return data;
  },

  /**
   * Get all active services for a tenant (public).
   */
  async getActiveServices(tenantId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('bookingService.getActiveServices.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get all active professionals for a tenant (public).
   */
  async getActiveProfessionals(tenantId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from(PROFESSIONALS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('bookingService.getActiveProfessionals.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get professionals that can perform specific services.
   */
  async getProfessionalsForServices(
    tenantId: string,
    serviceIds: string[]
  ): Promise<ProfessionalWithServices[]> {
    // Get all professional-service mappings for these services
    const { data: mappings, error: mappingsError } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .select('professional_id, service_id')
      .eq('tenant_id', tenantId)
      .in('service_id', serviceIds);

    if (mappingsError) {
      logger.error('bookingService.getProfessionalsForServices.mappings.failed', {
        tenantId,
        serviceIds,
        error: mappingsError,
      });
      throw mappingsError;
    }

    if (!mappings || mappings.length === 0) {
      return [];
    }

    // Find professionals that have ALL selected services
    const professionalServiceMap = new Map<string, Set<string>>();
    for (const mapping of mappings) {
      const services = professionalServiceMap.get(mapping.professional_id) ?? new Set();
      services.add(mapping.service_id);
      professionalServiceMap.set(mapping.professional_id, services);
    }

    // Filter to professionals who can do all selected services
    const qualifiedProfessionalIds = Array.from(professionalServiceMap.entries())
      .filter(([_, services]) => serviceIds.every((id) => services.has(id)))
      .map(([professionalId]) => professionalId);

    if (qualifiedProfessionalIds.length === 0) {
      return [];
    }

    // Fetch the professionals
    const { data: professionals, error: profError } = await supabase
      .from(PROFESSIONALS_TABLE)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .in('id', qualifiedProfessionalIds)
      .order('name');

    if (profError) {
      logger.error('bookingService.getProfessionalsForServices.professionals.failed', {
        tenantId,
        qualifiedProfessionalIds,
        error: profError,
      });
      throw profError;
    }

    // Add service_ids to each professional
    return (professionals ?? []).map((prof) => ({
      ...prof,
      service_ids: Array.from(professionalServiceMap.get(prof.id) ?? []),
    }));
  },

  /**
   * Find or create a client for public booking.
   */
  async findOrCreateClient(
    tenantId: string,
    name: string,
    phone: string,
    email?: string
  ): Promise<Client> {
    // Clean phone for search (remove formatting)
    const cleanPhone = phone.replace(/\D/g, '');

    // Try to find existing client by phone
    const existing = await clientService.findByPhone(tenantId, cleanPhone);

    if (existing) {
      // Update name/email if different
      if (existing.name !== name || (email && existing.email !== email)) {
        return clientService.update(tenantId, existing.id, {
          name,
          email: email || existing.email,
        });
      }
      return existing;
    }

    // Create new client
    const clientData: ClientCreate = {
      tenant_id: tenantId,
      name,
      phone: cleanPhone,
      email,
    };

    return clientService.create(clientData);
  },

  /**
   * Create a public booking.
   * This is the main entry point for the public booking flow.
   */
  async createBooking(input: PublicBookingInput): Promise<CreateBookingResult> {
    // 1. Find or create the client
    const client = await this.findOrCreateClient(
      input.tenant_id,
      input.client_name,
      input.client_phone,
      input.client_email
    );

    // 2. Fetch service details
    const { data: services, error: servicesError } = await supabase
      .from(SERVICES_TABLE)
      .select('*')
      .eq('tenant_id', input.tenant_id)
      .in('id', input.service_ids);

    if (servicesError) {
      logger.error('bookingService.createBooking.services.failed', { input, error: servicesError });
      throw servicesError;
    }

    if (!services || services.length === 0) {
      throw new Error('No valid services found');
    }

    // 3. Fetch professional details
    const { data: professional, error: profError } = await supabase
      .from(PROFESSIONALS_TABLE)
      .select('*')
      .eq('id', input.professional_id)
      .single();

    if (profError) {
      logger.error('bookingService.createBooking.professional.failed', { input, error: profError });
      throw profError;
    }

    // 4. Create the appointment
    const appointment = await appointmentService.create(
      {
        tenant_id: input.tenant_id,
        client_id: client.id,
        professional_id: input.professional_id,
        start_time: input.start_time,
        service_ids: input.service_ids,
        notes: input.notes,
      },
      services,
      'client', // actor_type
      client.user_id ?? null // actor_id
    );

    // 5. Build summary
    const summary: BookingSummary = {
      services: services.map((s) => ({
        name: s.name,
        duration: s.duration,
        price: s.price,
      })),
      totalDuration: services.reduce((sum, s) => sum + s.duration, 0),
      totalPrice: services.reduce((sum, s) => sum + s.price, 0),
      professionalName: professional.name,
      dateTime: new Date(input.start_time),
    };

    return {
      appointment,
      client,
      summary,
    };
  },
};
