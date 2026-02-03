/**
 * Professional service for Supabase operations.
 * All database operations for professionals go through this service.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Professional, ProfessionalCreate, ProfessionalUpdate, ProfessionalWithServices } from '@/types/professional';

const TABLE_NAME = 'professionals';
const PROFESSIONAL_SERVICES_TABLE = 'professional_services';

export const professionalService = {
  /**
   * Get all professionals for a tenant (excludes soft-deleted).
   */
  async getAll(tenantId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('professionalService.getAll.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get active professionals for a tenant.
   */
  async getActive(tenantId: string): Promise<Professional[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('professionalService.getActive.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get a single professional by ID.
   */
  async getById(tenantId: string, professionalId: string): Promise<Professional | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', professionalId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('professionalService.getById.failed', { tenantId, professionalId, error });
      throw error;
    }

    return data;
  },

  /**
   * Get professional with associated services.
   */
  async getWithServices(tenantId: string, professionalId: string): Promise<ProfessionalWithServices | null> {
    const professional = await this.getById(tenantId, professionalId);
    if (!professional) {
      return null;
    }

    const { data: serviceLinks, error } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .select('service_id, services(id, name)')
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId);

    if (error) {
      logger.error('professionalService.getWithServices.failed', { tenantId, professionalId, error });
      throw error;
    }

    const serviceIds = serviceLinks?.map(link => link.service_id) ?? [];
    const services = serviceLinks?.map(link => {
      const svc = link.services as unknown as { id: string; name: string } | null;
      return svc ? { id: svc.id, name: svc.name } : null;
    }).filter((s): s is { id: string; name: string } => s !== null) ?? [];

    return {
      ...professional,
      service_ids: serviceIds,
      services,
    };
  },

  /**
   * Get all professionals with their services.
   */
  async getAllWithServices(tenantId: string): Promise<ProfessionalWithServices[]> {
    const professionals = await this.getAll(tenantId);
    
    // Get all service links for this tenant
    const { data: allLinks, error } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .select('professional_id, service_id, services(id, name)')
      .eq('tenant_id', tenantId);

    if (error) {
      logger.error('professionalService.getAllWithServices.links.failed', { tenantId, error });
      throw error;
    }

    // Map professionals with their services
    return professionals.map(professional => {
      const links = allLinks?.filter(link => link.professional_id === professional.id) ?? [];
      const serviceIds = links.map(link => link.service_id);
      const services = links.map(link => {
        const svc = link.services as unknown as { id: string; name: string } | null;
        return svc ? { id: svc.id, name: svc.name } : null;
      }).filter((s): s is { id: string; name: string } => s !== null);

      return {
        ...professional,
        service_ids: serviceIds,
        services,
      };
    });
  },

  /**
   * Create a new professional.
   */
  async create(data: ProfessionalCreate & { service_ids?: string[] }): Promise<Professional> {
    const { service_ids, ...professionalData } = data;

    const { data: professional, error } = await supabase
      .from(TABLE_NAME)
      .insert(professionalData)
      .select()
      .single();

    if (error) {
      logger.error('professionalService.create.failed', { data, error });
      throw error;
    }

    // Link services if provided
    if (service_ids && service_ids.length > 0) {
      await this.setServices(data.tenant_id, professional.id, service_ids);
    }

    return professional;
  },

  /**
   * Update an existing professional.
   */
  async update(
    tenantId: string, 
    professionalId: string, 
    data: ProfessionalUpdate & { service_ids?: string[] }
  ): Promise<Professional> {
    const { service_ids, ...professionalData } = data;

    const { data: professional, error } = await supabase
      .from(TABLE_NAME)
      .update(professionalData)
      .eq('tenant_id', tenantId)
      .eq('id', professionalId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      logger.error('professionalService.update.failed', { tenantId, professionalId, data, error });
      throw error;
    }

    // Update service links if provided
    if (service_ids !== undefined) {
      await this.setServices(tenantId, professionalId, service_ids);
    }

    return professional;
  },

  /**
   * Soft delete a professional.
   */
  async delete(tenantId: string, professionalId: string): Promise<void> {
    // First remove service associations
    const { error: linkError } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .delete()
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId);

    if (linkError) {
      logger.error('professionalService.delete.links.failed', { tenantId, professionalId, error: linkError });
      throw linkError;
    }

    // Soft delete the professional
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq('tenant_id', tenantId)
      .eq('id', professionalId);

    if (error) {
      logger.error('professionalService.delete.failed', { tenantId, professionalId, error });
      throw error;
    }
  },

  /**
   * Set services for a professional (replaces existing).
   */
  async setServices(tenantId: string, professionalId: string, serviceIds: string[]): Promise<void> {
    // Delete existing links
    const { error: deleteError } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .delete()
      .eq('tenant_id', tenantId)
      .eq('professional_id', professionalId);

    if (deleteError) {
      logger.error('professionalService.setServices.delete.failed', { tenantId, professionalId, error: deleteError });
      throw deleteError;
    }

    // Insert new links
    if (serviceIds.length > 0) {
      const links = serviceIds.map(serviceId => ({
        tenant_id: tenantId,
        professional_id: professionalId,
        service_id: serviceId,
      }));

      const { error: insertError } = await supabase
        .from(PROFESSIONAL_SERVICES_TABLE)
        .insert(links);

      if (insertError) {
        logger.error('professionalService.setServices.insert.failed', { tenantId, professionalId, serviceIds, error: insertError });
        throw insertError;
      }
    }
  },

  /**
   * Get professionals by service ID.
   */
  async getByService(tenantId: string, serviceId: string): Promise<Professional[]> {
    const { data: links, error: linkError } = await supabase
      .from(PROFESSIONAL_SERVICES_TABLE)
      .select('professional_id')
      .eq('tenant_id', tenantId)
      .eq('service_id', serviceId);

    if (linkError) {
      logger.error('professionalService.getByService.links.failed', { tenantId, serviceId, error: linkError });
      throw linkError;
    }

    if (!links || links.length === 0) {
      return [];
    }

    const professionalIds = links.map(l => l.professional_id);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .in('id', professionalIds)
      .order('name');

    if (error) {
      logger.error('professionalService.getByService.failed', { tenantId, serviceId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Toggle professional active status.
   */
  async toggleActive(tenantId: string, professionalId: string, active: boolean): Promise<Professional> {
    return this.update(tenantId, professionalId, { active });
  },
};
