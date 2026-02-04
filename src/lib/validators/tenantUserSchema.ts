/**
 * Tenant user validation schemas
 */
import { z } from 'zod';
import { uuidSchema, emailSchema } from './commonSchemas';

/**
 * Role schema for creating/updating tenant users
 * Does not include 'owner' as it cannot be assigned via UI
 */
export const assignableRoleSchema = z.enum(['admin', 'staff'] as const);

/**
 * Schema for creating a tenant user (invite member)
 */
export const tenantUserCreateSchema = z.object({
  tenant_id: uuidSchema,
  email: emailSchema,
  role: assignableRoleSchema,
});

export type TenantUserCreateInput = z.infer<typeof tenantUserCreateSchema>;

/**
 * Schema for updating a tenant user's role
 */
export const tenantUserUpdateSchema = z.object({
  role: assignableRoleSchema,
});

export type TenantUserUpdateInput = z.infer<typeof tenantUserUpdateSchema>;

/**
 * Full role schema including owner (for display/read purposes)
 */
export const fullRoleSchema = z.enum(['owner', 'admin', 'staff'] as const);
