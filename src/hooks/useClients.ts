/**
 * React Query hooks for client operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { clientService } from '@/lib/services/clientService';
import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { Client, ClientCreate, ClientUpdate, ClientWithHistory } from '@/types/client';

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (tenantId: string) => [...clientKeys.lists(), tenantId] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (tenantId: string, clientId: string) => [...clientKeys.details(), tenantId, clientId] as const,
  search: (tenantId: string, query: string) => [...clientKeys.all, 'search', tenantId, query] as const,
};

/**
 * Get all clients for the current tenant.
 */
export const useClients = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: clientKeys.list(tenantId ?? ''),
    queryFn: () => clientService.getAll(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get a single client by ID.
 */
export const useClient = (clientId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: clientKeys.detail(tenantId ?? '', clientId ?? ''),
    queryFn: () => clientService.getById(tenantId!, clientId!),
    enabled: !!tenantId && !!clientId,
  });
};

/**
 * Get client with appointment history.
 */
export const useClientWithHistory = (clientId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery<ClientWithHistory | null>({
    queryKey: [...clientKeys.detail(tenantId ?? '', clientId ?? ''), 'history'],
    queryFn: () => clientService.getWithHistory(tenantId!, clientId!),
    enabled: !!tenantId && !!clientId,
  });
};

/**
 * Search clients by name or phone.
 */
export const useClientSearch = (query: string) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: clientKeys.search(tenantId ?? '', query),
    queryFn: () => clientService.search(tenantId!, query),
    enabled: !!tenantId && query.length >= 2,
  });
};

/**
 * Create a new client.
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (data: Omit<ClientCreate, 'tenant_id'>) => 
      clientService.create({ ...data, tenant_id: tenantId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useCreateClient.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Update an existing client.
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: ClientUpdate }) =>
      clientService.update(tenantId!, clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(tenantId!, clientId) });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useUpdateClient.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Delete (soft delete) a client.
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (clientId: string) => clientService.delete(tenantId!, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error) => {
      logger.error('useDeleteClient.failed', { error });
      toast.error(t('errorDeleting'));
    },
  });
};

/**
 * Find client by phone (for checking duplicates).
 */
export const useFindClientByPhone = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (phone: string) => clientService.findByPhone(tenantId!, phone),
  });
};

// Type exports for convenience
export type { Client, ClientCreate, ClientUpdate, ClientWithHistory };
