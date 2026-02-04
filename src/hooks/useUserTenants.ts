/**
 * React Query hook for fetching user's tenants.
 * Used for tenant selection after login.
 */
import { useQuery } from '@tanstack/react-query';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { useAuth } from '@/contexts/AuthContext';
import type { Tenant } from '@/types/tenant';

// Query keys
export const userTenantsKeys = {
  all: ['user-tenants'] as const,
  list: (userId: string) => [...userTenantsKeys.all, userId] as const,
};

/**
 * Get all tenants the current user belongs to.
 * Used for:
 * - Tenant selection after login (if user has multiple tenants)
 * - Redirecting to appropriate tenant
 */
export const useUserTenants = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userTenantsKeys.list(userId ?? ''),
    queryFn: () => tenantUserService.getUserTenants(userId!),
    enabled: !!userId,
  });
};

/**
 * Check if user has any tenants.
 * Returns true if user belongs to at least one tenant.
 */
export const useHasAnyTenant = () => {
  const { data: tenants, isLoading, isError } = useUserTenants();
  
  return {
    hasTenant: (tenants?.length ?? 0) > 0,
    isLoading,
    isError,
    tenants,
  };
};

// Type export
export type { Tenant };
