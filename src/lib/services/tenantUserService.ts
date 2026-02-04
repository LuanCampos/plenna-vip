/**
 * Tenant user service for Supabase operations.
 * Manages staff/team members of a tenant.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { TenantUser, TenantUserCreate, TenantUserUpdate, TenantUserWithProfile } from '@/types/user';
import type { Tenant } from '@/types/tenant';

const TABLE_NAME = 'tenant_users';

export const tenantUserService = {
  /**
   * Get all tenant users with their profiles.
   * Returns team members of a specific tenant.
   */
  async getByTenant(tenantId: string): Promise<TenantUserWithProfile[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        user_profile:user_profiles(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at');

    if (error) {
      logger.error('tenantUserService.getByTenant.failed', { tenantId, error });
      throw error;
    }

    return (data ?? []).map(item => ({
      ...item,
      user_profile: item.user_profile,
    })) as TenantUserWithProfile[];
  },

  /**
   * Get a single tenant user by ID.
   */
  async getById(tenantId: string, tenantUserId: string): Promise<TenantUser | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', tenantUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('tenantUserService.getById.failed', { tenantId, tenantUserId, error });
      throw error;
    }

    return data;
  },

  /**
   * Create a new tenant user (add member to team).
   * Requires the user to already exist in the system.
   */
  async create(data: TenantUserCreate): Promise<TenantUser> {
    const { data: tenantUser, error } = await supabase
      .from(TABLE_NAME)
      .insert(data)
      .select()
      .single();

    if (error) {
      logger.error('tenantUserService.create.failed', { data, error });
      throw error;
    }

    return tenantUser;
  },

  /**
   * Update a tenant user's role.
   * Cannot change owner role.
   */
  async update(tenantId: string, tenantUserId: string, data: TenantUserUpdate): Promise<TenantUser> {
    const { data: tenantUser, error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', tenantUserId)
      .neq('role', 'owner') // Cannot update owner
      .select()
      .single();

    if (error) {
      logger.error('tenantUserService.update.failed', { tenantId, tenantUserId, data, error });
      throw error;
    }

    return tenantUser;
  },

  /**
   * Remove a member from the team.
   * Cannot remove the owner.
   */
  async delete(tenantId: string, tenantUserId: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', tenantUserId)
      .neq('role', 'owner'); // Cannot delete owner

    if (error) {
      logger.error('tenantUserService.delete.failed', { tenantId, tenantUserId, error });
      throw error;
    }
  },

  /**
   * Get all tenants that a user belongs to.
   * Used for tenant selection after login.
   */
  async getUserTenants(userId: string): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        tenant_id,
        role,
        tenant:tenants(*)
      `)
      .eq('user_id', userId);

    if (error) {
      logger.error('tenantUserService.getUserTenants.failed', { userId, error });
      throw error;
    }

    // Extract tenant from the join and filter nulls
    // Type assertion needed due to Supabase's complex join types
    return (data ?? [])
      .map(item => item.tenant as unknown as Tenant | null)
      .filter((tenant): tenant is Tenant => tenant !== null);
  },

  /**
   * Get the current user's role in a tenant.
   */
  async getUserRole(tenantId: string, userId: string): Promise<TenantUser | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('tenantUserService.getUserRole.failed', { tenantId, userId, error });
      throw error;
    }

    return data;
  },

  /**
   * Check if a user is already a member of a tenant.
   */
  async isUserMember(tenantId: string, userId: string): Promise<boolean> {
    const role = await this.getUserRole(tenantId, userId);
    return role !== null;
  },
};
