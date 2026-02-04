/**
 * Tests for useAvailability hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { availabilityService } from '@/lib/services/availabilityService';
import {
  MOCK_TENANT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_TENANT_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';
import type { TimeSlot } from '@/types/booking';

// Mock services
vi.mock('@/lib/services/availabilityService', () => ({
  availabilityService: {
    getAvailableSlots: vi.fn(),
    isSlotAvailable: vi.fn(),
    getNextAvailableDate: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

// Import hooks after mocks
import {
  availabilityKeys,
  useAvailableSlots,
  useOnlyAvailableSlots,
  useIsSlotAvailable,
  useNextAvailableDate,
} from './useAvailability';

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

const MOCK_SLOTS: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
];

describe('useAvailability hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('availabilityKeys', () => {
    it('should generate correct query keys', () => {
      expect(availabilityKeys.all).toEqual(['availability']);
      expect(
        availabilityKeys.slotsForDate(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, '2026-02-02', 30)
      ).toEqual([
        'availability',
        'slots',
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
      ]);
    });
  });

  describe('useAvailableSlots', () => {
    it('should fetch available slots', async () => {
      vi.mocked(availabilityService.getAvailableSlots).mockResolvedValue(MOCK_SLOTS);

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useAvailableSlots(MOCK_PROFESSIONAL_ID, '2026-02-02', 30),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_SLOTS);
      expect(availabilityService.getAvailableSlots).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );
    });

    it('should not fetch when professionalId is null', async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAvailableSlots(null, '2026-02-02', 30), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(availabilityService.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('should not fetch when date is null', async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useAvailableSlots(MOCK_PROFESSIONAL_ID, null, 30), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(availabilityService.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('should not fetch when totalDuration is 0', async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useAvailableSlots(MOCK_PROFESSIONAL_ID, '2026-02-02', 0),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(false);
      expect(availabilityService.getAvailableSlots).not.toHaveBeenCalled();
    });
  });

  describe('useOnlyAvailableSlots', () => {
    it('should filter to only available slots', async () => {
      vi.mocked(availabilityService.getAvailableSlots).mockResolvedValue(MOCK_SLOTS);

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useOnlyAvailableSlots(MOCK_PROFESSIONAL_ID, '2026-02-02', 30),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should only include available slots (3 out of 4)
      expect(result.current.data).toHaveLength(3);
      expect(result.current.data.every((s) => s.available)).toBe(true);
    });

    it('should return empty array when data is undefined', async () => {
      vi.mocked(availabilityService.getAvailableSlots).mockResolvedValue([]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useOnlyAvailableSlots(MOCK_PROFESSIONAL_ID, '2026-02-02', 30),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useIsSlotAvailable', () => {
    it('should check if slot is available', async () => {
      vi.mocked(availabilityService.isSlotAvailable).mockResolvedValue(true);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useIsSlotAvailable(), { wrapper });

      await act(async () => {
        const available = await result.current.mutateAsync({
          professionalId: MOCK_PROFESSIONAL_ID,
          startTime: '2026-02-02T10:00:00Z',
          totalDuration: 30,
        });
        expect(available).toBe(true);
      });

      expect(availabilityService.isSlotAvailable).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30,
        undefined
      );
    });

    it('should pass excludeAppointmentId when provided', async () => {
      vi.mocked(availabilityService.isSlotAvailable).mockResolvedValue(true);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useIsSlotAvailable(), { wrapper });

      await act(async () => {
        await result.current.mutateAsync({
          professionalId: MOCK_PROFESSIONAL_ID,
          startTime: '2026-02-02T10:00:00Z',
          totalDuration: 30,
          excludeAppointmentId: 'exclude-123',
        });
      });

      expect(availabilityService.isSlotAvailable).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30,
        'exclude-123'
      );
    });
  });

  describe('useNextAvailableDate', () => {
    it('should fetch next available date', async () => {
      vi.mocked(availabilityService.getNextAvailableDate).mockResolvedValue('2026-02-03');

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useNextAvailableDate(MOCK_PROFESSIONAL_ID, 30), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe('2026-02-03');
      expect(availabilityService.getNextAvailableDate).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        30,
        undefined
      );
    });

    it('should not fetch when professionalId is null', async () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useNextAvailableDate(null, 30), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(availabilityService.getNextAvailableDate).not.toHaveBeenCalled();
    });

    it('should pass startFrom when provided', async () => {
      vi.mocked(availabilityService.getNextAvailableDate).mockResolvedValue('2026-02-05');

      const { wrapper } = createWrapper();

      const { result } = renderHook(
        () => useNextAvailableDate(MOCK_PROFESSIONAL_ID, 30, '2026-02-04'),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(availabilityService.getNextAvailableDate).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        30,
        '2026-02-04'
      );
    });
  });
});
