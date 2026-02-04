/**
 * Tests for availabilityService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { availabilityService } from './availabilityService';
import { supabase } from '@/lib/supabase';
import { MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID } from '@/test/mocks';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
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

const MOCK_TENANT_WITH_HOURS = {
  id: MOCK_TENANT_ID,
  business_hours: {
    sunday: [],
    monday: [{ start: '09:00', end: '18:00' }],
    tuesday: [{ start: '09:00', end: '18:00' }],
    wednesday: [{ start: '09:00', end: '18:00' }],
    thursday: [{ start: '09:00', end: '18:00' }],
    friday: [{ start: '09:00', end: '18:00' }],
    saturday: [{ start: '09:00', end: '13:00' }],
  },
};

describe('availabilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for a weekday', async () => {
      // Mock tenant
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };

      // Mock overrides (none)
      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock appointments (none)
      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      // Monday 2026-02-02
      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );

      // 09:00 to 18:00 with 30min slots, last slot at 17:30
      // (18-9)*2 = 18 slots
      expect(result.length).toBe(18);
      expect(result[0]).toEqual({ time: '09:00', available: true });
      expect(result[17]).toEqual({ time: '17:30', available: true });
    });

    it('should return empty for Sunday (closed)', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };

      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>);

      // Sunday 2026-02-01
      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-01',
        30,
        30
      );

      expect(result).toEqual([]);
    });

    it('should mark slots as unavailable when appointment exists', async () => {
      // Create proper chain mocks that return themselves
      const tenantChain: Record<string, ReturnType<typeof vi.fn>> = {};
      tenantChain.select = vi.fn(() => tenantChain);
      tenantChain.eq = vi.fn(() => tenantChain);
      tenantChain.single = vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null });

      const overridesChain: Record<string, ReturnType<typeof vi.fn>> = {};
      overridesChain.select = vi.fn(() => overridesChain);
      overridesChain.eq = vi.fn(() => overridesChain);
      overridesChain.lte = vi.fn(() => overridesChain);
      overridesChain.gte = vi.fn().mockResolvedValue({ data: [], error: null });

      // Appointment at 10:00-10:30 UTC
      const existingAppointment = {
        id: 'apt-1',
        start_time: '2026-02-02T10:00:00Z',
        end_time: '2026-02-02T10:30:00Z',
        status: 'scheduled',
      };

      const appointmentsChain: Record<string, ReturnType<typeof vi.fn>> = {};
      appointmentsChain.select = vi.fn(() => appointmentsChain);
      appointmentsChain.eq = vi.fn(() => appointmentsChain);
      appointmentsChain.neq = vi.fn(() => appointmentsChain);
      appointmentsChain.gte = vi.fn(() => appointmentsChain);
      appointmentsChain.lte = vi.fn().mockResolvedValue({ data: [existingAppointment], error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );

      // 10:00 slot should be unavailable
      const slot1000 = result.find((s) => s.time === '10:00');
      expect(slot1000?.available).toBe(false);

      // 09:00 and 10:30 should be available
      const slot0900 = result.find((s) => s.time === '09:00');
      const slot1030 = result.find((s) => s.time === '10:30');
      expect(slot0900?.available).toBe(true);
      expect(slot1030?.available).toBe(true);
    });

    it('should return empty when professional is unavailable (override)', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };

      // Unavailable override (vacation)
      const override = {
        id: 'ov-1',
        professional_id: MOCK_PROFESSIONAL_ID,
        start_date: '2026-02-01',
        end_date: '2026-02-07',
        override_type: 'unavailable',
        reason: 'Vacation',
      };

      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [override], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );

      expect(result).toEqual([]);
    });

    it('should use override hours when available override exists', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };

      // Available override (special Saturday)
      const override = {
        id: 'ov-1',
        professional_id: MOCK_PROFESSIONAL_ID,
        start_date: '2026-02-01',
        end_date: '2026-02-01',
        override_type: 'available',
        start_time: '10:00',
        end_time: '14:00',
        reason: 'Special event',
      };

      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [override], error: null }),
      };

      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      // Sunday normally closed, but override makes it available
      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-01',
        30,
        30
      );

      // 10:00 to 14:00 with 30min slots = 8 slots
      expect(result.length).toBe(8);
      expect(result[0]).toEqual({ time: '10:00', available: true });
      expect(result[7]).toEqual({ time: '13:30', available: true });
    });

    it('should consider total duration when calculating last slot', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };

      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      // 60 min service = last slot at 17:00 (not 17:30)
      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        60,
        30
      );

      // 09:00 to 17:00 with 30min slots and 60min duration
      const lastSlot = result[result.length - 1];
      expect(lastSlot?.time).toBe('17:00');
    });

    it('should return empty when tenant not found', async () => {
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };

      vi.mocked(supabase.from).mockReturnValue(tenantChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );

      expect(result).toEqual([]);
    });

    it('should handle multiple appointments and mark correct slots unavailable', async () => {
      // Create proper chain mocks that return themselves
      const tenantChain: Record<string, ReturnType<typeof vi.fn>> = {};
      tenantChain.select = vi.fn(() => tenantChain);
      tenantChain.eq = vi.fn(() => tenantChain);
      tenantChain.single = vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null });

      const overridesChain: Record<string, ReturnType<typeof vi.fn>> = {};
      overridesChain.select = vi.fn(() => overridesChain);
      overridesChain.eq = vi.fn(() => overridesChain);
      overridesChain.lte = vi.fn(() => overridesChain);
      overridesChain.gte = vi.fn().mockResolvedValue({ data: [], error: null });

      // Multiple appointments
      const appointments = [
        { id: 'apt-1', start_time: '2026-02-02T09:00:00Z', end_time: '2026-02-02T10:00:00Z', status: 'scheduled' },
        { id: 'apt-2', start_time: '2026-02-02T14:00:00Z', end_time: '2026-02-02T14:30:00Z', status: 'confirmed' },
      ];

      const appointmentsChain: Record<string, ReturnType<typeof vi.fn>> = {};
      appointmentsChain.select = vi.fn(() => appointmentsChain);
      appointmentsChain.eq = vi.fn(() => appointmentsChain);
      appointmentsChain.neq = vi.fn(() => appointmentsChain);
      appointmentsChain.gte = vi.fn(() => appointmentsChain);
      appointmentsChain.lte = vi.fn().mockResolvedValue({ data: appointments, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.getAvailableSlots(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02',
        30,
        30
      );

      // Check specific slots
      const slot0900 = result.find((s) => s.time === '09:00');
      const slot0930 = result.find((s) => s.time === '09:30');
      const slot1000 = result.find((s) => s.time === '10:00');
      const slot1400 = result.find((s) => s.time === '14:00');
      const slot1430 = result.find((s) => s.time === '14:30');

      expect(slot0900?.available).toBe(false); // Blocked by apt-1
      expect(slot0930?.available).toBe(false); // Blocked by apt-1
      expect(slot1000?.available).toBe(true);  // After apt-1
      expect(slot1400?.available).toBe(false); // Blocked by apt-2
      expect(slot1430?.available).toBe(true);  // After apt-2
    });
  });

  describe('isSlotAvailable', () => {
    it('should return true when slot is available', async () => {
      // Mock overrides (none)
      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock appointments (none)
      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        gt: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.isSlotAvailable(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30
      );

      expect(result).toBe(true);
    });

    it('should return false when unavailable override exists', async () => {
      const override = {
        id: 'ov-1',
        override_type: 'unavailable',
      };

      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [override], error: null }),
      };

      vi.mocked(supabase.from).mockReturnValue(overridesChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.isSlotAvailable(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30
      );

      expect(result).toBe(false);
    });

    it('should return false when conflicting appointment exists', async () => {
      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        gt: vi.fn().mockResolvedValue({ data: [{ id: 'conflict' }], error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.isSlotAvailable(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30
      );

      expect(result).toBe(false);
    });

    it('should exclude appointment when provided', async () => {
      // Create proper chain mocks that return themselves
      const overridesChain: Record<string, ReturnType<typeof vi.fn>> = {};
      overridesChain.select = vi.fn(() => overridesChain);
      overridesChain.eq = vi.fn(() => overridesChain);
      overridesChain.lte = vi.fn(() => overridesChain);
      overridesChain.gte = vi.fn().mockResolvedValue({ data: [], error: null });

      const appointmentsChain: Record<string, ReturnType<typeof vi.fn>> = {};
      appointmentsChain.select = vi.fn(() => appointmentsChain);
      appointmentsChain.eq = vi.fn(() => appointmentsChain);
      appointmentsChain.neq = vi.fn(() => appointmentsChain);
      appointmentsChain.lt = vi.fn(() => appointmentsChain);
      // gt returns the chain, and the chain itself is thenable
      appointmentsChain.gt = vi.fn(() => appointmentsChain);
      appointmentsChain.then = vi.fn((resolve) => resolve({ data: [], error: null }));

      vi.mocked(supabase.from)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      await availabilityService.isSlotAvailable(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30,
        'exclude-id'
      );

      // neq is called twice: first for status, then for id
      expect(appointmentsChain.neq).toHaveBeenCalledTimes(2);
      expect(appointmentsChain.neq).toHaveBeenNthCalledWith(1, 'status', 'cancelled');
      expect(appointmentsChain.neq).toHaveBeenNthCalledWith(2, 'id', 'exclude-id');
    });

    it('should return false on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        gt: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.isSlotAvailable(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        30
      );

      expect(result).toBe(false);
    });
  });

  describe('getNextAvailableDate', () => {
    it('should return first date with available slots', async () => {
      // Mock for first day (no slots - Sunday)
      const tenantChain1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };
      const overridesChain1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock for second day (has slots - Monday)
      const tenantChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_WITH_HOURS, error: null }),
      };
      const overridesChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      const appointmentsChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      vi.mocked(supabase.from)
        // Sunday 2026-02-01
        .mockReturnValueOnce(tenantChain1 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain1 as unknown as ReturnType<typeof supabase.from>)
        // Monday 2026-02-02
        .mockReturnValueOnce(tenantChain2 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(overridesChain2 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain2 as unknown as ReturnType<typeof supabase.from>);

      const result = await availabilityService.getNextAvailableDate(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        30,
        '2026-02-01'
      );

      expect(result).toBe('2026-02-02');
    });

    it('should return null if no available dates in range', async () => {
      // All days return closed/no slots
      const tenantChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            ...MOCK_TENANT_WITH_HOURS,
            business_hours: {
              sunday: [],
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
            },
          },
          error: null,
        }),
      };
      const overridesChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      // Mock for 30 days
      for (let i = 0; i < 30; i++) {
        vi.mocked(supabase.from)
          .mockReturnValueOnce(tenantChain as unknown as ReturnType<typeof supabase.from>)
          .mockReturnValueOnce(overridesChain as unknown as ReturnType<typeof supabase.from>);
      }

      const result = await availabilityService.getNextAvailableDate(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        30,
        '2026-02-01'
      );

      expect(result).toBeNull();
    });
  });
});
