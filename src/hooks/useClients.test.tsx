/**
 * Tests for useClients hook.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clientService } from '@/lib/services/clientService';
import { 
  MOCK_TENANT_ID, 
  MOCK_CLIENT_ID, 
  MOCK_CLIENT_ENTITY, 
  MOCK_TENANT_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/clientService', () => ({
  clientService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getWithHistory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    findByPhone: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import hooks after mocks
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { clientKeys } from './useClients';
import { 
  useClients, 
  useClient, 
  useCreateClient, 
  useUpdateClient, 
  useDeleteClient,
  useClientSearch,
  useFindClientByPhone,
  useClientWithHistory,
} from '@/hooks/useClients';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('useClients hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useClients', () => {
    it('should fetch all clients', async () => {
      vi.mocked(clientService.getAll).mockResolvedValue([MOCK_CLIENT_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClients(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_CLIENT_ENTITY]);
      expect(clientService.getAll).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should handle error', async () => {
      vi.mocked(clientService.getAll).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClients(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useClient', () => {
    it('should fetch a single client by ID', async () => {
      vi.mocked(clientService.getById).mockResolvedValue(MOCK_CLIENT_ENTITY);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClient(MOCK_CLIENT_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_CLIENT_ENTITY);
      expect(clientService.getById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_CLIENT_ID);
    });

    it('should not fetch when ID is not provided', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClient(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(clientService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateClient', () => {
    it('should create a client successfully and invalidate list', async () => {
      vi.mocked(clientService.create).mockResolvedValue(MOCK_CLIENT_ENTITY);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateClient(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: MOCK_CLIENT_ENTITY.name,
          phone: MOCK_CLIENT_ENTITY.phone,
        });
      });

      expect(clientService.create).toHaveBeenCalledWith({
        name: MOCK_CLIENT_ENTITY.name,
        phone: MOCK_CLIENT_ENTITY.phone,
        tenant_id: MOCK_TENANT_ID,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: clientKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when creating client', async () => {
      vi.mocked(clientService.create).mockRejectedValue(new Error('create failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateClient(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ name: 'Error', phone: '123' }),
      ).rejects.toThrow('create failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useCreateClient.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useUpdateClient', () => {
    it('should update a client successfully', async () => {
      const updatedClient = { ...MOCK_CLIENT_ENTITY, name: 'Updated Name' };
      vi.mocked(clientService.update).mockResolvedValue(updatedClient);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          clientId: MOCK_CLIENT_ID,
          data: { name: 'Updated Name' },
        });
      });

      expect(clientService.update).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_CLIENT_ID, { name: 'Updated Name' });
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: clientKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: clientKeys.detail(MOCK_TENANT_ID, MOCK_CLIENT_ID) });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when updating client', async () => {
      vi.mocked(clientService.update).mockRejectedValue(new Error('update failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ clientId: MOCK_CLIENT_ID, data: { name: 'Err' } }),
      ).rejects.toThrow('update failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useUpdateClient.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useDeleteClient', () => {
    it('should delete a client successfully and invalidate list', async () => {
      vi.mocked(clientService.delete).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(MOCK_CLIENT_ID);
      });

      expect(clientService.delete).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_CLIENT_ID);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: clientKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('deleted');
    });

    it('should handle errors when deleting client', async () => {
      vi.mocked(clientService.delete).mockRejectedValue(new Error('delete failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper,
      });

      await expect(result.current.mutateAsync(MOCK_CLIENT_ID)).rejects.toThrow('delete failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useDeleteClient.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorDeleting');
    });
  });

  describe('useClientSearch', () => {
    it('should search clients by query', async () => {
      vi.mocked(clientService.search).mockResolvedValue([MOCK_CLIENT_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClientSearch('Maria'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_CLIENT_ENTITY]);
      expect(clientService.search).toHaveBeenCalledWith(MOCK_TENANT_ID, 'Maria');
    });

    it('should not search when query is too short', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClientSearch('M'), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(clientService.search).not.toHaveBeenCalled();
    });
  });

  describe('useFindClientByPhone', () => {
    it('should find client by phone', async () => {
      vi.mocked(clientService.findByPhone).mockResolvedValue(MOCK_CLIENT_ENTITY);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useFindClientByPhone(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync('11999999999');
      });

      expect(clientService.findByPhone).toHaveBeenCalledWith(MOCK_TENANT_ID, '11999999999');
    });
  });

  describe('useClientWithHistory', () => {
    it('should fetch client with history', async () => {
      vi.mocked(clientService.getWithHistory).mockResolvedValue(MOCK_CLIENT_ENTITY as never);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClientWithHistory(MOCK_CLIENT_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(clientService.getWithHistory).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_CLIENT_ID);
    });

    it('should be disabled when no client id provided', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useClientWithHistory(null), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(clientService.getWithHistory).not.toHaveBeenCalled();
    });
  });
});
