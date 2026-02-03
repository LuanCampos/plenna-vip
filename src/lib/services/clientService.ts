/**
 * Client service for Supabase operations.
 * All database operations for clients go through this service.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Client, ClientCreate, ClientUpdate, ClientWithHistory } from '@/types/client';

const TABLE_NAME = 'clients';

export const clientService = {
  /**
   * Get all clients for a tenant (excludes soft-deleted).
   */
  async getAll(tenantId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('name');

    if (error) {
      logger.error('clientService.getAll.failed', { tenantId, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get a single client by ID.
   */
  async getById(tenantId: string, clientId: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', clientId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('clientService.getById.failed', { tenantId, clientId, error });
      throw error;
    }

    return data;
  },

  /**
   * Create a new client.
   */
  async create(data: ClientCreate): Promise<Client> {
    const { data: client, error } = await supabase
      .from(TABLE_NAME)
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error('clientService.create.failed', { data, error });
      throw error;
    }

    return client;
  },

  /**
   * Update an existing client.
   */
  async update(tenantId: string, clientId: string, data: ClientUpdate): Promise<Client> {
    const { data: client, error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', clientId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      logger.error('clientService.update.failed', { tenantId, clientId, data, error });
      throw error;
    }

    return client;
  },

  /**
   * Soft delete a client.
   */
  async delete(tenantId: string, clientId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', clientId);

    if (error) {
      logger.error('clientService.delete.failed', { tenantId, clientId, error });
      throw error;
    }
  },

  /**
   * Search clients by phone number.
   */
  async searchByPhone(tenantId: string, phone: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .ilike('phone', `%${phone}%`)
      .is('deleted_at', null)
      .order('name')
      .limit(10);

    if (error) {
      logger.error('clientService.searchByPhone.failed', { tenantId, phone, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Search clients by name or phone.
   */
  async search(tenantId: string, query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('name')
      .limit(20);

    if (error) {
      logger.error('clientService.search.failed', { tenantId, query, error });
      throw error;
    }

    return data ?? [];
  },

  /**
   * Get client with appointment history.
   */
  async getWithHistory(tenantId: string, clientId: string): Promise<ClientWithHistory | null> {
    const client = await this.getById(tenantId, clientId);
    if (!client) {
      return null;
    }

    // Get appointment stats
    const { data: stats, error: statsError } = await supabase
      .from('appointments')
      .select('id, start_time')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .order('start_time', { ascending: false });

    if (statsError) {
      logger.error('clientService.getWithHistory.stats.failed', { tenantId, clientId, error: statsError });
      throw statsError;
    }

    return {
      ...client,
      total_appointments: stats?.length ?? 0,
      last_appointment: stats?.[0]?.start_time,
    };
  },

  /**
   * Check if a client exists by phone (for public booking).
   */
  async findByPhone(tenantId: string, phone: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('phone', phone)
      .is('deleted_at', null)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('clientService.findByPhone.failed', { tenantId, phone, error });
      throw error;
    }

    return data;
  },
};
