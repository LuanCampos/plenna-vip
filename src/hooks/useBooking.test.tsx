/**
 * Tests for useBooking hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useTenantBySlug,
  usePublicServices,
  useProfessionalsForServices,
  useCreateBooking,
} from './useBooking';
import { bookingService } from '@/lib/services/bookingService';
import {
  MOCK_TENANT_ID,
  MOCK_VALID_TENANT,
  MOCK_SERVICE_ENTITY,
  MOCK_PROFESSIONAL_ENTITY,
  createMockClient,
} from '@/test/mocks';
import type { PublicBookingInput } from '@/types/booking';

vi.mock('@/lib/services/bookingService', () => ({
  bookingService: {
    getTenantBySlug: vi.fn(),
    getActiveServices: vi.fn(),
    getProfessionalsForServices: vi.fn(),
    createBooking: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBooking hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTenantBySlug', () => {
    it('should fetch tenant by slug', async () => {
      vi.mocked(bookingService.getTenantBySlug).mockResolvedValue(MOCK_VALID_TENANT);

      const { result } = renderHook(() => useTenantBySlug('test-salon'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_VALID_TENANT);
      expect(bookingService.getTenantBySlug).toHaveBeenCalledWith('test-salon');
    });

    it('should not fetch when slug is undefined', async () => {
      const { result } = renderHook(() => useTenantBySlug(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(bookingService.getTenantBySlug).not.toHaveBeenCalled();
    });

    it('should return null when tenant not found', async () => {
      vi.mocked(bookingService.getTenantBySlug).mockResolvedValue(null);

      const { result } = renderHook(() => useTenantBySlug('non-existent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('usePublicServices', () => {
    it('should fetch active services for tenant', async () => {
      vi.mocked(bookingService.getActiveServices).mockResolvedValue([MOCK_SERVICE_ENTITY]);

      const { result } = renderHook(() => usePublicServices(MOCK_TENANT_ID), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([MOCK_SERVICE_ENTITY]);
      expect(bookingService.getActiveServices).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should not fetch when tenantId is undefined', async () => {
      const { result } = renderHook(() => usePublicServices(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(bookingService.getActiveServices).not.toHaveBeenCalled();
    });
  });

  describe('useProfessionalsForServices', () => {
    it('should fetch professionals that can perform selected services', async () => {
      vi.mocked(bookingService.getProfessionalsForServices).mockResolvedValue([
        { ...MOCK_PROFESSIONAL_ENTITY, service_ids: ['service-1'] },
      ]);

      const { result } = renderHook(
        () => useProfessionalsForServices(MOCK_TENANT_ID, ['service-1']),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(bookingService.getProfessionalsForServices).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        ['service-1']
      );
    });

    it('should not fetch when no services selected', async () => {
      const { result } = renderHook(
        () => useProfessionalsForServices(MOCK_TENANT_ID, []),
        { wrapper: createWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(bookingService.getProfessionalsForServices).not.toHaveBeenCalled();
    });

    it('should not fetch when tenantId is undefined', async () => {
      const { result } = renderHook(
        () => useProfessionalsForServices(undefined, ['service-1']),
        { wrapper: createWrapper() }
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(bookingService.getProfessionalsForServices).not.toHaveBeenCalled();
    });
  });

  describe('useCreateBooking', () => {
    const mockBookingInput: PublicBookingInput = {
      tenant_id: MOCK_TENANT_ID,
      professional_id: 'professional-123',
      service_ids: ['service-123'],
      start_time: '2026-02-02T10:00:00Z',
      client_name: 'Maria Silva',
      client_phone: '11999999999',
      client_email: 'maria@example.com',
      notes: 'Test booking',
    };

    it('should create booking successfully', async () => {
      const mockResult = {
        appointment: {
          id: 'appointment-123',
          tenant_id: MOCK_TENANT_ID,
          services: [],
          status: 'scheduled' as const,
          start_time: '2026-02-02T10:00:00Z',
          end_time: '2026-02-02T10:30:00Z',
          total_duration: 30,
          total_price: 50,
          client_id: 'client-123',
          professional_id: 'professional-123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        client: createMockClient({ id: 'client-123' }),
        summary: {
          services: [{ name: 'Test Service', duration: 30, price: 50 }],
          totalDuration: 30,
          totalPrice: 50,
          professionalName: 'Test Professional',
          dateTime: new Date('2026-02-02T10:00:00Z'),
        },
      };

      vi.mocked(bookingService.createBooking).mockResolvedValue(mockResult);

      const { result } = renderHook(() => useCreateBooking(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockBookingInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResult);
      expect(bookingService.createBooking).toHaveBeenCalledWith(mockBookingInput);
    });

    it('should handle booking creation error', async () => {
      const error = new Error('Booking failed');
      vi.mocked(bookingService.createBooking).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateBooking(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockBookingInput);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});
