/**
 * Custom hook for tenant settings management.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tenantService } from '@/lib/services/tenantService';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { Tenant, TenantUpdate, BusinessHours, TenantSettings } from '@/types/tenant';

/**
 * Query keys for tenant data.
 */
export const tenantKeys = {
  all: ['tenant'] as const,
  detail: (tenantId: string) => [...tenantKeys.all, 'detail', tenantId] as const,
};

/**
 * Hook to fetch current tenant details.
 */
export const useTenantDetails = () => {
  const { currentTenant } = useTenant();

  return useQuery<Tenant | null>({
    queryKey: tenantKeys.detail(currentTenant?.id ?? ''),
    queryFn: () => tenantService.getById(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });
};

/**
 * Hook to update tenant information.
 */
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  const { currentTenant, setCurrentTenant } = useTenant();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (data: TenantUpdate) => tenantService.update(currentTenant!.id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(currentTenant!.id) });
      setCurrentTenant(updated);
      toast.success(t('settingsSaved'));
    },
    onError: (error) => {
      logger.error('useUpdateTenant.failed', { error });
      toast.error(t('errorSavingSettings'));
    },
  });
};

/**
 * Hook to update business hours.
 */
export const useUpdateBusinessHours = () => {
  const queryClient = useQueryClient();
  const { currentTenant, setCurrentTenant } = useTenant();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (businessHours: BusinessHours) =>
      tenantService.updateBusinessHours(currentTenant!.id, businessHours),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(currentTenant!.id) });
      setCurrentTenant(updated);
      toast.success(t('businessHoursSaved'));
    },
    onError: (error) => {
      logger.error('useUpdateBusinessHours.failed', { error });
      toast.error(t('errorSavingBusinessHours'));
    },
  });
};

/**
 * Hook to update tenant settings.
 */
export const useUpdateTenantSettings = () => {
  const queryClient = useQueryClient();
  const { currentTenant, setCurrentTenant } = useTenant();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (settings: Partial<TenantSettings>) =>
      tenantService.updateSettings(currentTenant!.id, settings),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(currentTenant!.id) });
      setCurrentTenant(updated);
      toast.success(t('settingsSaved'));
    },
    onError: (error) => {
      logger.error('useUpdateTenantSettings.failed', { error });
      toast.error(t('errorSavingSettings'));
    },
  });
};

/**
 * Hook to update tenant slug.
 */
export const useUpdateTenantSlug = () => {
  const queryClient = useQueryClient();
  const { currentTenant, setCurrentTenant } = useTenant();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: (slug: string) => tenantService.updateSlug(currentTenant!.id, slug),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(currentTenant!.id) });
      setCurrentTenant(updated);
      toast.success(t('slugSaved'));
    },
    onError: (error: Error) => {
      logger.error('useUpdateTenantSlug.failed', { error });
      if (error.message.includes('already taken')) {
        toast.error(t('slugTaken'));
      } else if (error.message.includes('Invalid slug')) {
        toast.error(t('invalidSlug'));
      } else {
        toast.error(t('errorSavingSlug'));
      }
    },
  });
};

/**
 * Hook to check if slug is available.
 */
export const useCheckSlugAvailability = () => {
  const { currentTenant } = useTenant();

  return useMutation({
    mutationFn: (slug: string) => tenantService.isSlugAvailable(slug, currentTenant?.id),
  });
};
