/**
 * React Query hooks for tenant user (team) operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { TenantUser, TenantUserCreate, TenantUserUpdate, TenantUserWithProfile } from '@/types/user';

// Query keys
export const tenantUserKeys = {
  all: ['tenant-users'] as const,
  lists: () => [...tenantUserKeys.all, 'list'] as const,
  list: (tenantId: string) => [...tenantUserKeys.lists(), tenantId] as const,
  details: () => [...tenantUserKeys.all, 'detail'] as const,
  detail: (tenantId: string, tenantUserId: string) => [...tenantUserKeys.details(), tenantId, tenantUserId] as const,
};

/**
 * Get all team members for the current tenant.
 */
export const useTenantUsers = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: tenantUserKeys.list(tenantId ?? ''),
    queryFn: () => tenantUserService.getByTenant(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get a single tenant user by ID.
 */
export const useTenantUser = (tenantUserId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: tenantUserKeys.detail(tenantId ?? '', tenantUserId ?? ''),
    queryFn: () => tenantUserService.getById(tenantId!, tenantUserId!),
    enabled: !!tenantId && !!tenantUserId,
  });
};

/**
 * Add a new member to the team.
 */
export const useCreateTenantUser = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (data: Omit<TenantUserCreate, 'tenant_id'>) =>
      tenantUserService.create({ ...data, tenant_id: tenantId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
      toast.success(t('memberAdded'));
    },
    onError: (error) => {
      logger.error('useCreateTenantUser.failed', { error });
      toast.error(t('memberAddError'));
    },
  });
};

/**
 * Update a team member's role.
 */
export const useUpdateTenantUser = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ tenantUserId, data }: { tenantUserId: string; data: TenantUserUpdate }) =>
      tenantUserService.update(tenantId!, tenantUserId, data),
    onSuccess: (_, { tenantUserId }) => {
      queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantUserKeys.detail(tenantId!, tenantUserId) });
      toast.success(t('memberUpdated'));
    },
    onError: (error) => {
      logger.error('useUpdateTenantUser.failed', { error });
      toast.error(t('memberUpdateError'));
    },
  });
};

/**
 * Remove a member from the team.
 */
export const useDeleteTenantUser = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (tenantUserId: string) => tenantUserService.delete(tenantId!, tenantUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
      toast.success(t('memberRemoved'));
    },
    onError: (error) => {
      logger.error('useDeleteTenantUser.failed', { error });
      toast.error(t('memberRemoveError'));
    },
  });
};

// Type exports for convenience
export type { TenantUser, TenantUserCreate, TenantUserUpdate, TenantUserWithProfile };
