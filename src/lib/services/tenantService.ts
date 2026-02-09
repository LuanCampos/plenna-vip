/**
 * Tenant service for managing tenant settings and configuration.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Tenant, TenantUpdate, BusinessHours, TenantSettings } from '@/types/tenant';

const TENANTS_TABLE = 'tenants';

export const tenantService = {
  /**
   * Get a tenant by ID.
   */
  async getById(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from(TENANTS_TABLE)
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('tenantService.getById.failed', { tenantId, error });
      throw error;
    }

    return data;
  },

  /**
   * Update tenant information.
   */
  async update(tenantId: string, data: TenantUpdate): Promise<Tenant> {
    const { data: updated, error } = await supabase
      .from(TENANTS_TABLE)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      logger.error('tenantService.update.failed', { tenantId, data, error });
      throw error;
    }

    logger.debug('tenantService.update.success', { tenantId });
    return updated;
  },

  /**
   * Update business hours.
   */
  async updateBusinessHours(tenantId: string, businessHours: BusinessHours): Promise<Tenant> {
    return this.update(tenantId, { business_hours: businessHours });
  },

  /**
   * Update tenant settings.
   */
  async updateSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<Tenant> {
    // First get current settings to merge
    const current = await this.getById(tenantId);
    if (!current) {
      throw new Error('Tenant not found');
    }

    const mergedSettings: TenantSettings = {
      ...current.settings,
      ...settings,
    };

    return this.update(tenantId, { settings: mergedSettings });
  },

  /**
   * Update tenant logo.
   */
  async updateLogo(tenantId: string, logoUrl: string | null): Promise<Tenant> {
    return this.update(tenantId, { logo_url: logoUrl ?? undefined });
  },

  /**
   * Check if a slug is available.
   */
  async isSlugAvailable(slug: string, excludeTenantId?: string): Promise<boolean> {
    let query = supabase
      .from(TENANTS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);

    if (excludeTenantId) {
      query = query.neq('id', excludeTenantId);
    }

    const { count, error } = await query;

    if (error) {
      logger.error('tenantService.isSlugAvailable.failed', { slug, error });
      throw error;
    }

    return count === 0;
  },

  /**
   * Update tenant slug.
   */
  async updateSlug(tenantId: string, slug: string): Promise<Tenant> {
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      throw new Error('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
    }

    // Check availability
    const isAvailable = await this.isSlugAvailable(slug, tenantId);
    if (!isAvailable) {
      throw new Error('This URL is already taken.');
    }

    return this.update(tenantId, { slug });
  },
};
