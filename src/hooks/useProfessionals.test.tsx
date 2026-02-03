/**
 * Tests for useProfessionals hook.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { professionalService } from '@/lib/services/professionalService';
import { 
  MOCK_TENANT_ID, 
  MOCK_PROFESSIONAL_ID, 
  MOCK_PROFESSIONAL_ENTITY, 
  MOCK_SERVICE_ID,
  MOCK_TENANT_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/professionalService', () => ({
  professionalService: {
    getAll: vi.fn(),
    getActive: vi.fn(),
    getAllWithServices: vi.fn(),
    getById: vi.fn(),
    getWithServices: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setServices: vi.fn(),
    getByService: vi.fn(),
    toggleActive: vi.fn(),
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
import { professionalKeys } from './useProfessionals';
import { 
  useProfessionals, 
  useActiveProfessionals, 
  useProfessionalsWithServices,
  useProfessional, 
  useProfessionalWithServices,
  useCreateProfessional, 
  useUpdateProfessional, 
  useDeleteProfessional,
  useProfessionalsByService,
  useToggleProfessionalActive,
} from '@/hooks/useProfessionals';

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

describe('useProfessionals hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProfessionals', () => {
    it('should fetch all professionals', async () => {
      vi.mocked(professionalService.getAll).mockResolvedValue([MOCK_PROFESSIONAL_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionals(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_PROFESSIONAL_ENTITY]);
      expect(professionalService.getAll).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should handle error', async () => {
      vi.mocked(professionalService.getAll).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionals(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useActiveProfessionals', () => {
    it('should fetch only active professionals', async () => {
      const activeProfessional = { ...MOCK_PROFESSIONAL_ENTITY, active: true };
      vi.mocked(professionalService.getActive).mockResolvedValue([activeProfessional]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useActiveProfessionals(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([activeProfessional]);
      expect(professionalService.getActive).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });
  });

  describe('useProfessionalsWithServices', () => {
    it('should fetch professionals with their services', async () => {
      const professionalWithServices = { 
        ...MOCK_PROFESSIONAL_ENTITY, 
        service_ids: [MOCK_SERVICE_ID],
      };
      vi.mocked(professionalService.getAllWithServices).mockResolvedValue([professionalWithServices]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionalsWithServices(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([professionalWithServices]);
      expect(professionalService.getAllWithServices).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });
  });

  describe('useProfessional', () => {
    it('should fetch a single professional by ID', async () => {
      vi.mocked(professionalService.getById).mockResolvedValue(MOCK_PROFESSIONAL_ENTITY);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessional(MOCK_PROFESSIONAL_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_PROFESSIONAL_ENTITY);
      expect(professionalService.getById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);
    });

    it('should not fetch when ID is not provided', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessional(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(professionalService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useProfessionalWithServices', () => {
    it('should fetch a professional with their services', async () => {
      const professionalWithServices = { 
        ...MOCK_PROFESSIONAL_ENTITY, 
        service_ids: [MOCK_SERVICE_ID],
      };
      vi.mocked(professionalService.getWithServices).mockResolvedValue(professionalWithServices);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionalWithServices(MOCK_PROFESSIONAL_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(professionalWithServices);
      expect(professionalService.getWithServices).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);
    });

    it('should be disabled without professional id', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionalWithServices(null), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(professionalService.getWithServices).not.toHaveBeenCalled();
    });
  });

  describe('useCreateProfessional', () => {
    it('should create a professional successfully', async () => {
      vi.mocked(professionalService.create).mockResolvedValue(MOCK_PROFESSIONAL_ENTITY);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateProfessional(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: MOCK_PROFESSIONAL_ENTITY.name,
          active: true,
        });
      });

      expect(professionalService.create).toHaveBeenCalledWith({
        name: MOCK_PROFESSIONAL_ENTITY.name,
        active: true,
        tenant_id: MOCK_TENANT_ID,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: professionalKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when creating professional', async () => {
      vi.mocked(professionalService.create).mockRejectedValue(new Error('create failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateProfessional(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ name: 'Err', active: true }),
      ).rejects.toThrow('create failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useCreateProfessional.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useUpdateProfessional', () => {
    it('should update a professional successfully', async () => {
      const updatedProfessional = { ...MOCK_PROFESSIONAL_ENTITY, name: 'Updated Professional' };
      vi.mocked(professionalService.update).mockResolvedValue(updatedProfessional);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProfessional(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          professionalId: MOCK_PROFESSIONAL_ID,
          data: { name: 'Updated Professional' },
        });
      });

      expect(professionalService.update).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, { name: 'Updated Professional' });
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: professionalKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: professionalKeys.detail(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID) });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when updating professional', async () => {
      vi.mocked(professionalService.update).mockRejectedValue(new Error('update failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProfessional(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ professionalId: MOCK_PROFESSIONAL_ID, data: { name: 'Err' } }),
      ).rejects.toThrow('update failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useUpdateProfessional.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });

  describe('useDeleteProfessional', () => {
    it('should delete a professional successfully', async () => {
      vi.mocked(professionalService.delete).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteProfessional(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(MOCK_PROFESSIONAL_ID);
      });

      expect(professionalService.delete).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: professionalKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('deleted');
    });

    it('should handle errors when deleting professional', async () => {
      vi.mocked(professionalService.delete).mockRejectedValue(new Error('delete failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteProfessional(), {
        wrapper,
      });

      await expect(result.current.mutateAsync(MOCK_PROFESSIONAL_ID)).rejects.toThrow('delete failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useDeleteProfessional.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorDeleting');
    });
  });

  describe('useProfessionalsByService', () => {
    it('should fetch professionals by service', async () => {
      vi.mocked(professionalService.getByService).mockResolvedValue([MOCK_PROFESSIONAL_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionalsByService(MOCK_SERVICE_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_PROFESSIONAL_ENTITY]);
      expect(professionalService.getByService).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_SERVICE_ID);
    });

    it('should not fetch when service ID is not provided', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useProfessionalsByService(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(professionalService.getByService).not.toHaveBeenCalled();
    });
  });

  describe('useToggleProfessionalActive', () => {
    it('should toggle professional active status', async () => {
      const toggledProfessional = { ...MOCK_PROFESSIONAL_ENTITY, active: false };
      vi.mocked(professionalService.toggleActive).mockResolvedValue(toggledProfessional);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleProfessionalActive(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ professionalId: MOCK_PROFESSIONAL_ID, active: false });
      });

      expect(professionalService.toggleActive).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, false);
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: professionalKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, { queryKey: professionalKeys.detail(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID) });
      expect(toast.success).toHaveBeenCalledWith('saved');
    });

    it('should handle errors when toggling active status', async () => {
      vi.mocked(professionalService.toggleActive).mockRejectedValue(new Error('toggle failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useToggleProfessionalActive(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ professionalId: MOCK_PROFESSIONAL_ID, active: false }),
      ).rejects.toThrow('toggle failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useToggleProfessionalActive.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('errorSaving');
    });
  });
});
