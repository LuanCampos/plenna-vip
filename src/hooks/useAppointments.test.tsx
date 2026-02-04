/**
 * Tests for useAppointments hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appointmentService } from '@/lib/services/appointmentService';
import { serviceService } from '@/lib/services/serviceService';
import {
  MOCK_TENANT_ID,
  MOCK_APPOINTMENT_ID,
  MOCK_CLIENT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_APPOINTMENT_ENTITY,
  MOCK_APPOINTMENT_WITH_DETAILS,
  MOCK_SERVICE_ENTITY,
  MOCK_TENANT_CONTEXT,
  MOCK_AUTH_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/appointmentService', () => ({
  appointmentService: {
    getAll: vi.fn(),
    getByDateRange: vi.fn(),
    getById: vi.fn(),
    getByClient: vi.fn(),
    getByProfessional: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    cancel: vi.fn(),
    delete: vi.fn(),
    checkConflict: vi.fn(),
  },
}));

vi.mock('@/lib/services/serviceService', () => ({
  serviceService: {
    getByIds: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
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
import {
  appointmentKeys,
  useAppointments,
  useAppointmentsByDateRange,
  useAppointment,
  useAppointmentsByClient,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useDeleteAppointment,
  useCheckConflict,
} from './useAppointments';

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('useAppointments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('appointmentKeys', () => {
    it('should generate correct query keys', () => {
      expect(appointmentKeys.all).toEqual(['appointments']);
      expect(appointmentKeys.list(MOCK_TENANT_ID)).toEqual([
        'appointments',
        'list',
        MOCK_TENANT_ID,
      ]);
      expect(appointmentKeys.dateRange(MOCK_TENANT_ID, '2026-02-01', '2026-02-28')).toEqual([
        'appointments',
        'list',
        MOCK_TENANT_ID,
        '2026-02-01',
        '2026-02-28',
        'all',
      ]);
      expect(
        appointmentKeys.dateRange(MOCK_TENANT_ID, '2026-02-01', '2026-02-28', MOCK_PROFESSIONAL_ID)
      ).toEqual([
        'appointments',
        'list',
        MOCK_TENANT_ID,
        '2026-02-01',
        '2026-02-28',
        MOCK_PROFESSIONAL_ID,
      ]);
    });
  });

  describe('useAppointments', () => {
    it('should fetch all appointments', async () => {
      vi.mocked(appointmentService.getAll).mockResolvedValue([MOCK_APPOINTMENT_ENTITY]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAppointments(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_APPOINTMENT_ENTITY]);
      expect(appointmentService.getAll).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should handle error', async () => {
      vi.mocked(appointmentService.getAll).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAppointments(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useAppointmentsByDateRange', () => {
    it('should fetch appointments in date range', async () => {
      vi.mocked(appointmentService.getByDateRange).mockResolvedValue([MOCK_APPOINTMENT_WITH_DETAILS]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useAppointmentsByDateRange('2026-02-01', '2026-02-28'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_APPOINTMENT_WITH_DETAILS]);
      expect(appointmentService.getByDateRange).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        '2026-02-01',
        '2026-02-28',
        undefined
      );
    });

    it('should filter by professional when provided', async () => {
      vi.mocked(appointmentService.getByDateRange).mockResolvedValue([]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useAppointmentsByDateRange('2026-02-01', '2026-02-28', MOCK_PROFESSIONAL_ID),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(appointmentService.getByDateRange).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        '2026-02-01',
        '2026-02-28',
        MOCK_PROFESSIONAL_ID
      );
    });
  });

  describe('useAppointment', () => {
    it('should fetch a single appointment', async () => {
      vi.mocked(appointmentService.getById).mockResolvedValue(MOCK_APPOINTMENT_WITH_DETAILS);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAppointment(MOCK_APPOINTMENT_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_APPOINTMENT_WITH_DETAILS);
      expect(appointmentService.getById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID);
    });

    it('should not fetch when appointmentId is null', async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAppointment(null), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(appointmentService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useAppointmentsByClient', () => {
    it('should fetch appointments for a client', async () => {
      vi.mocked(appointmentService.getByClient).mockResolvedValue([MOCK_APPOINTMENT_WITH_DETAILS]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAppointmentsByClient(MOCK_CLIENT_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_APPOINTMENT_WITH_DETAILS]);
      expect(appointmentService.getByClient).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_CLIENT_ID);
    });
  });

  describe('useCreateAppointment', () => {
    it('should create an appointment', async () => {
      const services = [MOCK_SERVICE_ENTITY];
      vi.mocked(serviceService.getByIds).mockResolvedValue(services);
      vi.mocked(appointmentService.create).mockResolvedValue(MOCK_APPOINTMENT_WITH_DETAILS);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          input: {
            client_id: MOCK_CLIENT_ID,
            professional_id: MOCK_PROFESSIONAL_ID,
            start_time: '2026-02-02T10:00:00Z',
            service_ids: [MOCK_SERVICE_ENTITY.id],
          },
        });
      });

      expect(serviceService.getByIds).toHaveBeenCalledWith(MOCK_TENANT_ID, [MOCK_SERVICE_ENTITY.id]);
      expect(appointmentService.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('appointmentCreated');
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('should handle error', async () => {
      vi.mocked(serviceService.getByIds).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            input: {
              client_id: MOCK_CLIENT_ID,
              professional_id: MOCK_PROFESSIONAL_ID,
              start_time: '2026-02-02T10:00:00Z',
              service_ids: ['service-1'],
            },
          });
        } catch {
          // Expected to throw
        }
      });

      expect(toast.error).toHaveBeenCalledWith('errorCreatingAppointment');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('useUpdateAppointmentStatus', () => {
    it('should update appointment status', async () => {
      const updatedAppointment = { ...MOCK_APPOINTMENT_WITH_DETAILS, status: 'confirmed' as const };
      vi.mocked(appointmentService.updateStatus).mockResolvedValue(updatedAppointment);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateAppointmentStatus(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          appointmentId: MOCK_APPOINTMENT_ID,
          status: 'confirmed',
        });
      });

      expect(appointmentService.updateStatus).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_APPOINTMENT_ID,
        'confirmed',
        'staff',
        MOCK_AUTH_CONTEXT.user.id
      );
      expect(toast.success).toHaveBeenCalledWith('statusUpdated');
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useCancelAppointment', () => {
    it('should cancel an appointment', async () => {
      vi.mocked(appointmentService.cancel).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCancelAppointment(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ appointmentId: MOCK_APPOINTMENT_ID });
      });

      expect(appointmentService.cancel).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_APPOINTMENT_ID,
        'staff',
        MOCK_AUTH_CONTEXT.user.id
      );
      expect(toast.success).toHaveBeenCalledWith('appointmentCancelled');
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useDeleteAppointment', () => {
    it('should delete an appointment', async () => {
      vi.mocked(appointmentService.delete).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteAppointment(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(MOCK_APPOINTMENT_ID);
      });

      expect(appointmentService.delete).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID);
      expect(toast.success).toHaveBeenCalledWith('deleted');
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useCheckConflict', () => {
    it('should check for conflicts', async () => {
      vi.mocked(appointmentService.checkConflict).mockResolvedValue(true);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCheckConflict(), {
        wrapper,
      });

      await act(async () => {
        const hasConflict = await result.current.mutateAsync({
          professionalId: MOCK_PROFESSIONAL_ID,
          startTime: '2026-02-02T10:00:00Z',
          endTime: '2026-02-02T10:30:00Z',
        });
        expect(hasConflict).toBe(true);
      });

      expect(appointmentService.checkConflict).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        '2026-02-02T10:30:00Z',
        undefined
      );
    });
  });
});
