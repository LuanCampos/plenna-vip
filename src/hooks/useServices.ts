/**
 * React Query hooks for service operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceService } from '@/lib/services/serviceService';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { Service, ServiceCreate, ServiceUpdate } from '@/types/service';

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (tenantId: string) => [...serviceKeys.lists(), tenantId] as const,
  active: (tenantId: string) => [...serviceKeys.lists(), tenantId, 'active'] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (tenantId: string, serviceId: string) => [...serviceKeys.details(), tenantId, serviceId] as const,
};

/**
 * Get all services for the current tenant.
 */
export const useServices = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: serviceKeys.list(tenantId ?? ''),
    queryFn: () => serviceService.getAll(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get active services for the current tenant.
 */
export const useActiveServices = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: serviceKeys.active(tenantId ?? ''),
    queryFn: () => serviceService.getActive(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get a single service by ID.
 */
export const useService = (serviceId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: serviceKeys.detail(tenantId ?? '', serviceId ?? ''),
    queryFn: () => serviceService.getById(tenantId!, serviceId!),
    enabled: !!tenantId && !!serviceId,
  });
};

/**
 * Create a new service.
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (data: Omit<ServiceCreate, 'tenant_id'>) =>
      serviceService.create({ ...data, tenant_id: tenantId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useCreateService.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Update an existing service.
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: ServiceUpdate }) =>
      serviceService.update(tenantId!, serviceId, data),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(tenantId!, serviceId) });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useUpdateService.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Delete (soft delete) a service.
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (serviceId: string) => serviceService.delete(tenantId!, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error) => {
      logger.error('useDeleteService.failed', { error });
      toast.error(t('errorDeleting'));
    },
  });
};

/**
 * Toggle service active status.
 */
export const useToggleServiceActive = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ serviceId, active }: { serviceId: string; active: boolean }) =>
      serviceService.toggleActive(tenantId!, serviceId, active),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(tenantId!, serviceId) });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useToggleServiceActive.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

// Type exports for convenience
export type { Service, ServiceCreate, ServiceUpdate };
