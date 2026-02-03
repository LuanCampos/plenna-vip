/**
 * Service service for Supabase operations.
 * All database operations for services go through this service.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Service, ServiceCreate, ServiceUpdate } from '@/types/service';

const TABLE_NAME = 'services';

export const serviceService = {
  /**
   * Get all services for a tenant (excludes soft-deleted).
   */
  async getAll(tenantId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('serviceService.getAll.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get active services for a tenant.
   */
  async getActive(tenantId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('serviceService.getActive.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get a single service by ID.
   */
  async getById(tenantId: string, serviceId: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('serviceService.getById.failed', { tenantId, serviceId, error });
      throw error;
    }

    return data;
  },

  /**
   * Create a new service.
   */
  async create(data: ServiceCreate): Promise<Service> {
    const { data: service, error } = await supabase
      .from(TABLE_NAME)
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error('serviceService.create.failed', { data, error });
      throw error;
    }

    return service;
  },

  /**
   * Update an existing service.
   */
  async update(tenantId: string, serviceId: string, data: ServiceUpdate): Promise<Service> {
    const { data: service, error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      logger.error('serviceService.update.failed', { tenantId, serviceId, data, error });
      throw error;
    }

    return service;
  },

  /**
   * Soft delete a service.
   */
  async delete(tenantId: string, serviceId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString(), active: false })
      .eq('tenant_id', tenantId)
      .eq('id', serviceId);

    if (error) {
      logger.error('serviceService.delete.failed', { tenantId, serviceId, error });
      throw error;
    }
  },

  /**
   * Toggle service active status.
   */
  async toggleActive(tenantId: string, serviceId: string, active: boolean): Promise<Service> {
    return this.update(tenantId, serviceId, { active });
  },

  /**
   * Get services by IDs.
   */
  async getByIds(tenantId: string, serviceIds: string[]): Promise<Service[]> {
    if (serviceIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .in('id', serviceIds)
      .is('deleted_at', null);

    if (error) {
      logger.error('serviceService.getByIds.failed', { tenantId, serviceIds, error });
      throw error;
    }

    return data ?? [];
  },
};
