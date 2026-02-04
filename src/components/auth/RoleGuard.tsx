/**
 * RoleGuard - Conditionally renders children based on user role.
 * Hierarchy: owner > admin > staff
 */
import { ReactNode } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { useQuery } from '@tanstack/react-query';
import type { UserRole } from '@/types/user';

interface RoleGuardProps {
  /** Minimum role required to view children */
  minRole: UserRole;
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback content if user lacks permission */
  fallback?: ReactNode;
}

/**
 * Role hierarchy values for comparison.
 * Higher number = more permissions.
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  staff: 1,
};

/**
 * Check if a user role has at least the minimum required role.
 */
export const hasMinimumRole = (userRole: UserRole | undefined, minRole: UserRole): boolean => {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
};

/**
 * Hook to get the current user's role in the current tenant.
 */
export const useCurrentUserRole = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ['current-user-role', currentTenant?.id, user?.id],
    queryFn: () => tenantUserService.getUserRole(currentTenant!.id, user!.id),
    enabled: !!currentTenant?.id && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Renders children only if the current user has the minimum required role.
 * 
 * @example
 * <RoleGuard minRole="admin">
 *   <DeleteButton />
 * </RoleGuard>
 */
export const RoleGuard = ({ minRole, children, fallback = null }: RoleGuardProps) => {
  const { data: tenantUser, isLoading } = useCurrentUserRole();

  // While loading, don't render anything (or could render skeleton)
  if (isLoading) {
    return null;
  }

  // Check if user has the required role
  const userRole = tenantUser?.role;
  if (!hasMinimumRole(userRole, minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
