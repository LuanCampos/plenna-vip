/**
 * React Query hooks for professional operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { professionalService } from '@/lib/services/professionalService';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { Professional, ProfessionalCreate, ProfessionalUpdate, ProfessionalWithServices } from '@/types/professional';

// Query keys
export const professionalKeys = {
  all: ['professionals'] as const,
  lists: () => [...professionalKeys.all, 'list'] as const,
  list: (tenantId: string) => [...professionalKeys.lists(), tenantId] as const,
  active: (tenantId: string) => [...professionalKeys.lists(), tenantId, 'active'] as const,
  withServices: (tenantId: string) => [...professionalKeys.lists(), tenantId, 'withServices'] as const,
  details: () => [...professionalKeys.all, 'detail'] as const,
  detail: (tenantId: string, professionalId: string) => [...professionalKeys.details(), tenantId, professionalId] as const,
  byService: (tenantId: string, serviceId: string) => [...professionalKeys.all, 'byService', tenantId, serviceId] as const,
};

/**
 * Get all professionals for the current tenant.
 */
export const useProfessionals = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: professionalKeys.list(tenantId ?? ''),
    queryFn: () => professionalService.getAll(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get active professionals for the current tenant.
 */
export const useActiveProfessionals = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: professionalKeys.active(tenantId ?? ''),
    queryFn: () => professionalService.getActive(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get all professionals with their associated services.
 */
export const useProfessionalsWithServices = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery<ProfessionalWithServices[]>({
    queryKey: professionalKeys.withServices(tenantId ?? ''),
    queryFn: () => professionalService.getAllWithServices(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get a single professional by ID.
 */
export const useProfessional = (professionalId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: professionalKeys.detail(tenantId ?? '', professionalId ?? ''),
    queryFn: () => professionalService.getById(tenantId!, professionalId!),
    enabled: !!tenantId && !!professionalId,
  });
};

/**
 * Get professional with associated services.
 */
export const useProfessionalWithServices = (professionalId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery<ProfessionalWithServices | null>({
    queryKey: [...professionalKeys.detail(tenantId ?? '', professionalId ?? ''), 'withServices'],
    queryFn: () => professionalService.getWithServices(tenantId!, professionalId!),
    enabled: !!tenantId && !!professionalId,
  });
};

/**
 * Get professionals by service ID.
 */
export const useProfessionalsByService = (serviceId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: professionalKeys.byService(tenantId ?? '', serviceId ?? ''),
    queryFn: () => professionalService.getByService(tenantId!, serviceId!),
    enabled: !!tenantId && !!serviceId,
  });
};

/**
 * Create a new professional.
 */
export const useCreateProfessional = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (data: Omit<ProfessionalCreate, 'tenant_id'> & { service_ids?: string[] }) =>
      professionalService.create({ ...data, tenant_id: tenantId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.lists() });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useCreateProfessional.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Update an existing professional.
 */
export const useUpdateProfessional = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ professionalId, data }: { professionalId: string; data: ProfessionalUpdate & { service_ids?: string[] } }) =>
      professionalService.update(tenantId!, professionalId, data),
    onSuccess: (_, { professionalId }) => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: professionalKeys.detail(tenantId!, professionalId) });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useUpdateProfessional.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Delete (soft delete) a professional.
 */
export const useDeleteProfessional = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (professionalId: string) => professionalService.delete(tenantId!, professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error) => {
      logger.error('useDeleteProfessional.failed', { error });
      toast.error(t('errorDeleting'));
    },
  });
};

/**
 * Toggle professional active status.
 */
export const useToggleProfessionalActive = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ professionalId, active }: { professionalId: string; active: boolean }) =>
      professionalService.toggleActive(tenantId!, professionalId, active),
    onSuccess: (_, { professionalId }) => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: professionalKeys.detail(tenantId!, professionalId) });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useToggleProfessionalActive.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

// Type exports for convenience
export type { Professional, ProfessionalCreate, ProfessionalUpdate, ProfessionalWithServices };
