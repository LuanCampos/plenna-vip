/**
 * Tests for useServices hook.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { serviceService } from '@/lib/services/serviceService';
import { 
  MOCK_TENANT_ID, 
  MOCK_SERVICE_ID, 
  MOCK_SERVICE_ENTITY, 
  MOCK_TENANT_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/serviceService', () => ({
  serviceService: {
    getAll: vi.fn(),
    getActive: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn(),
    getByIds: vi.fn(),
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
import { serviceKeys } from './useServices';
import { 
  useServices, 
  useActiveServices, 
  useService, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  useToggleServiceActive,
} from '@/hooks/useServices';

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

describe('useServices hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useServices', () => {
    it('should fetch all services', async () => {
      vi.mocked(serviceService.getAll).mockResolvedValue([MOCK_SERVICE_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useServices(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_SERVICE_ENTITY]);
      expect(serviceService.getAll).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should handle error', async () => {
      vi.mocked(serviceService.getAll).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useServices(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useActiveServices', () => {
    it('should fetch only active services', async () => {
      const activeService = { ...MOCK_SERVICE_ENTITY, active: true };
      vi.mocked(serviceService.getActive).mockResolvedValue([activeService]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useActiveServices(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([activeService]);
      expect(serviceService.getActive).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });
  });

  describe('useService', () => {
    it('should fetch a single service by ID', async () => {
      vi.mocked(serviceService.getById).mockResolvedValue(MOCK_SERVICE_ENTITY);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useService(MOCK_SERVICE_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_SERVICE_ENTITY);
      expect(serviceService.getById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_SERVICE_ID);
    });

    it('should not fetch when ID is not provided', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useService(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(serviceService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateService', () => {
    it('should create a service successfully and invalidate list', async () => {
      vi.mocked(serviceService.create).mockResolvedValue(MOCK_SERVICE_ENTITY);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateService(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: MOCK_SERVICE_ENTITY.name,
          duration: MOCK_SERVICE_ENTITY.duration,
          price: MOCK_SERVICE_ENTITY.price,
          active: true,
        });
      });

      expect(serviceService.create).toHaveBeenCalledWith({
        name: MOCK_SERVICE_ENTITY.name,
        duration: MOCK_SERVICE_ENTITY.duration,
        price: MOCK_SERVICE_ENTITY.price,
        active: true,
        tenant_id: MOCK_TENANT_ID,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: serviceKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when creating a service', async () => {
      vi.mocked(serviceService.create).mockRejectedValue(new Error('create failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateService(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({
          name: 'Err',
          duration: 30,
          price: 10,
          active: true,
        }),
      ).rejects.toThrow('create failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useCreateService.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useUpdateService', () => {
    it('should update a service successfully', async () => {
      const updatedService = { ...MOCK_SERVICE_ENTITY, name: 'Updated Service' };
      vi.mocked(serviceService.update).mockResolvedValue(updatedService);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateService(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          serviceId: MOCK_SERVICE_ID,
          data: { name: 'Updated Service' },
        });
      });

      expect(serviceService.update).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_SERVICE_ID, { name: 'Updated Service' });
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: serviceKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: serviceKeys.detail(MOCK_TENANT_ID, MOCK_SERVICE_ID) });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when updating service', async () => {
      vi.mocked(serviceService.update).mockRejectedValue(new Error('update failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateService(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ serviceId: MOCK_SERVICE_ID, data: { name: 'Err' } }),
      ).rejects.toThrow('update failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useUpdateService.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useDeleteService', () => {
    it('should delete a service successfully and invalidate list', async () => {
      vi.mocked(serviceService.delete).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteService(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(MOCK_SERVICE_ID);
      });

      expect(serviceService.delete).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_SERVICE_ID);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: serviceKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('deleted');
    });

    it('should handle errors when deleting service', async () => {
      vi.mocked(serviceService.delete).mockRejectedValue(new Error('delete failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteService(), {
        wrapper,
      });

      await expect(result.current.mutateAsync(MOCK_SERVICE_ID)).rejects.toThrow('delete failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useDeleteService.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorDeleting');
    });
  });

  describe('useToggleServiceActive', () => {
    it('should toggle service active status', async () => {
      const toggledService = { ...MOCK_SERVICE_ENTITY, active: false };
      vi.mocked(serviceService.toggleActive).mockResolvedValue(toggledService);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleServiceActive(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ serviceId: MOCK_SERVICE_ID, active: false });
      });

      expect(serviceService.toggleActive).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_SERVICE_ID, false);
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: serviceKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: serviceKeys.detail(MOCK_TENANT_ID, MOCK_SERVICE_ID) });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when toggling active status', async () => {
      vi.mocked(serviceService.toggleActive).mockRejectedValue(new Error('toggle failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleServiceActive(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ serviceId: MOCK_SERVICE_ID, active: false }),
      ).rejects.toThrow('toggle failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useToggleServiceActive.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });
});
