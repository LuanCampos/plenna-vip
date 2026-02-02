/**
 * Tenant type definition
 * Represents a salon/business in the multi-tenant system
 */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export type TenantCreate = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
export type TenantUpdate = Partial<TenantCreate>;
