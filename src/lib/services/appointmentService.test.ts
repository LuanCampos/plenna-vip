/**
 * Tests for appointmentService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appointmentService } from './appointmentService';
import { supabase } from '@/lib/supabase';
import {
  MOCK_TENANT_ID,
  MOCK_APPOINTMENT_ID,
  MOCK_CLIENT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_VALID_APPOINTMENT,
  MOCK_APPOINTMENT_ENTITY,
  MOCK_APPOINTMENT_WITH_DETAILS,
  MOCK_SERVICE_ENTITY,
  MOCK_SERVICE_ENTITY_2,
} from '@/test/mocks';

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

describe('appointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all appointments for a tenant', async () => {
      const mockAppointments = [MOCK_APPOINTMENT_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getAll(MOCK_TENANT_ID);

      expect(supabase.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual(mockAppointments);
    });

    it('should return empty array when no appointments', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getAll(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(appointmentService.getAll(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getByDateRange', () => {
    it('should return appointments in date range', async () => {
      const mockAppointments = [MOCK_APPOINTMENT_WITH_DETAILS];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAppointments, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getByDateRange(
        MOCK_TENANT_ID,
        '2026-02-01T00:00:00Z',
        '2026-02-28T23:59:59Z'
      );

      expect(result).toEqual(mockAppointments);
    });

    it('should filter by professional when provided', async () => {
      // Create proper chain mock that returns itself for all methods
      const mockChain: Record<string, ReturnType<typeof vi.fn>> = {};
      mockChain.select = vi.fn(() => mockChain);
      mockChain.eq = vi.fn(() => mockChain);
      mockChain.gte = vi.fn(() => mockChain);
      mockChain.lte = vi.fn(() => mockChain);
      // order returns the chain, and the chain itself is thenable (then resolves to data)
      mockChain.order = vi.fn(() => mockChain);
      mockChain.then = vi.fn((resolve) => resolve({ data: [], error: null }));
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.getByDateRange(
        MOCK_TENANT_ID,
        '2026-02-01',
        '2026-02-28',
        MOCK_PROFESSIONAL_ID
      );

      expect(mockChain.eq).toHaveBeenCalledWith('professional_id', MOCK_PROFESSIONAL_ID);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.getByDateRange(MOCK_TENANT_ID, '2026-02-01', '2026-02-28')
      ).rejects.toEqual(mockError);
    });
  });

  describe('getById', () => {
    it('should return appointment with details', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getById(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID);

      expect(result).toEqual(MOCK_APPOINTMENT_WITH_DETAILS);
    });

    it('should return null when not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getById(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID);

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(appointmentService.getById(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should create appointment with services', async () => {
      const services = [MOCK_SERVICE_ENTITY];
      const createdAppointment = {
        ...MOCK_APPOINTMENT_ENTITY,
        id: MOCK_APPOINTMENT_ID,
      };

      // Mock for insert appointment
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdAppointment, error: null }),
      };

      // Mock for insert services
      const servicesChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock for events
      const eventsChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock for getById
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(servicesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(eventsChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.create(
        MOCK_VALID_APPOINTMENT,
        services,
        'staff',
        'user-123'
      );

      expect(result).toEqual(MOCK_APPOINTMENT_WITH_DETAILS);
      expect(supabase.from).toHaveBeenCalledWith('appointments');
      expect(supabase.from).toHaveBeenCalledWith('appointment_services');
      expect(supabase.from).toHaveBeenCalledWith('appointment_events');
    });

    it('should calculate totals from multiple services', async () => {
      const services = [MOCK_SERVICE_ENTITY, MOCK_SERVICE_ENTITY_2];
      const expectedDuration = services.reduce((sum, s) => sum + s.duration, 0);

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_ENTITY, error: null }),
      };

      const servicesChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const eventsChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(servicesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(eventsChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.create(MOCK_VALID_APPOINTMENT, services, 'staff', 'user-123');

      expect(insertChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          total_duration: expectedDuration,
        })
      );
    });

    it('should throw on appointment insert error', async () => {
      const mockError = { message: 'Insert failed', code: '500' };
      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from).mockReturnValue(insertChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.create(MOCK_VALID_APPOINTMENT, [MOCK_SERVICE_ENTITY], 'staff', 'user-123')
      ).rejects.toEqual(mockError);
    });

    it('should rollback on services insert error', async () => {
      const mockError = { message: 'Services insert failed', code: '500' };

      const insertChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_ENTITY, error: null }),
      };

      const servicesChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(servicesChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(deleteChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.create(MOCK_VALID_APPOINTMENT, [MOCK_SERVICE_ENTITY], 'staff', 'user-123')
      ).rejects.toEqual(mockError);

      expect(deleteChain.delete).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status and create event', async () => {
      // Mock getById for current status
      const getByIdChain1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      // Mock update
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      updateChain.eq.mockReturnValueOnce(updateChain).mockResolvedValueOnce({ data: null, error: null });

      // Mock event insert
      const eventsChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock getById after update
      const getByIdChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...MOCK_APPOINTMENT_WITH_DETAILS, status: 'confirmed' },
          error: null,
        }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain1 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(eventsChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(getByIdChain2 as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.updateStatus(
        MOCK_TENANT_ID,
        MOCK_APPOINTMENT_ID,
        'confirmed',
        'staff',
        'user-123'
      );

      expect(result.status).toBe('confirmed');
      expect(eventsChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'status_changed',
          payload: { from: 'scheduled', to: 'confirmed' },
        })
      );
    });

    it('should throw when appointment not found', async () => {
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };

      vi.mocked(supabase.from).mockReturnValue(getByIdChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.updateStatus(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID, 'confirmed', 'staff', 'user-123')
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('cancel', () => {
    it('should cancel appointment and create event', async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      updateChain.eq.mockReturnValueOnce(updateChain).mockResolvedValueOnce({ data: null, error: null });

      const eventsChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(eventsChain as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.cancel(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID, 'staff', 'user-123');

      expect(updateChain.update).toHaveBeenCalledWith({ status: 'cancelled' });
      expect(eventsChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ event_type: 'cancelled' })
      );
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Cancel failed', code: '500' };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      updateChain.eq.mockReturnValueOnce(updateChain).mockResolvedValueOnce({ data: null, error: mockError });

      vi.mocked(supabase.from).mockReturnValue(updateChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.cancel(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID, 'staff', 'user-123')
      ).rejects.toEqual(mockError);
    });
  });

  describe('checkConflict', () => {
    it('should return true when conflict exists', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [{ id: 'conflict-id' }], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.checkConflict(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        '2026-02-02T10:30:00Z'
      );

      expect(result).toBe(true);
    });

    it('should return false when no conflict', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.checkConflict(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        '2026-02-02T10:30:00Z'
      );

      expect(result).toBe(false);
    });

    it('should exclude specific appointment when provided', async () => {
      // Create proper chain mock that returns itself for all methods
      const mockChain: Record<string, ReturnType<typeof vi.fn>> = {};
      mockChain.select = vi.fn(() => mockChain);
      mockChain.eq = vi.fn(() => mockChain);
      mockChain.neq = vi.fn(() => mockChain);
      // or returns the chain, and the chain itself is thenable
      mockChain.or = vi.fn(() => mockChain);
      mockChain.then = vi.fn((resolve) => resolve({ data: [], error: null }));
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.checkConflict(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-02T10:00:00Z',
        '2026-02-02T10:30:00Z',
        MOCK_APPOINTMENT_ID
      );

      expect(mockChain.neq).toHaveBeenCalledWith('id', MOCK_APPOINTMENT_ID);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.checkConflict(
          MOCK_TENANT_ID,
          MOCK_PROFESSIONAL_ID,
          '2026-02-02T10:00:00Z',
          '2026-02-02T10:30:00Z'
        )
      ).rejects.toEqual(mockError);
    });
  });

  describe('getByClient', () => {
    it('should return appointments for a client', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_APPOINTMENT_WITH_DETAILS], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getByClient(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toEqual([MOCK_APPOINTMENT_WITH_DETAILS]);
      expect(mockChain.eq).toHaveBeenCalledWith('client_id', MOCK_CLIENT_ID);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(appointmentService.getByClient(MOCK_TENANT_ID, MOCK_CLIENT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getByProfessional', () => {
    it('should return appointments for a professional in date range', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_APPOINTMENT_ENTITY], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.getByProfessional(
        MOCK_TENANT_ID,
        MOCK_PROFESSIONAL_ID,
        '2026-02-01',
        '2026-02-28'
      );

      expect(result).toEqual([MOCK_APPOINTMENT_ENTITY]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.getByProfessional(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, '2026-02-01', '2026-02-28')
      ).rejects.toEqual(mockError);
    });
  });

  describe('delete', () => {
    it('should delete appointment and services', async () => {
      const servicesDeleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const appointmentDeleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      appointmentDeleteChain.eq.mockReturnValueOnce(appointmentDeleteChain).mockResolvedValueOnce({ data: null, error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce(servicesDeleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentDeleteChain as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.delete(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID);

      expect(supabase.from).toHaveBeenCalledWith('appointment_services');
      expect(supabase.from).toHaveBeenCalledWith('appointments');
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };

      const servicesDeleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      const appointmentDeleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      appointmentDeleteChain.eq.mockReturnValueOnce(appointmentDeleteChain).mockResolvedValueOnce({ data: null, error: mockError });

      vi.mocked(supabase.from)
        .mockReturnValueOnce(servicesDeleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentDeleteChain as unknown as ReturnType<typeof supabase.from>);

      await expect(appointmentService.delete(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should update appointment and create event with changes', async () => {
      const updateData = { notes: 'Updated notes' };
      const updatedAppointment = { ...MOCK_APPOINTMENT_WITH_DETAILS, notes: 'Updated notes' };

      // Mock getById for current state
      const getByIdChain1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      // Mock update
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedAppointment, error: null }),
      };

      // Mock event insert
      const eventsChain = {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock getById after update
      const getByIdChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedAppointment, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain1 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(eventsChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(getByIdChain2 as unknown as ReturnType<typeof supabase.from>);

      const result = await appointmentService.update(
        MOCK_TENANT_ID,
        MOCK_APPOINTMENT_ID,
        updateData,
        'staff',
        'user-123'
      );

      expect(result.notes).toBe('Updated notes');
      expect(eventsChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'updated',
          payload: expect.objectContaining({
            changes: expect.objectContaining({
              notes: expect.objectContaining({
                old: 'Cliente preferencial',
                new: 'Updated notes',
              }),
            }),
          }),
        })
      );
    });

    it('should not create event if no changes', async () => {
      const updateData = { notes: 'Cliente preferencial' }; // Same value

      // Mock getById for current state
      const getByIdChain1 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      // Mock update
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      // Mock getById after update
      const getByIdChain2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain1 as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(getByIdChain2 as unknown as ReturnType<typeof supabase.from>);

      await appointmentService.update(
        MOCK_TENANT_ID,
        MOCK_APPOINTMENT_ID,
        updateData,
        'staff',
        'user-123'
      );

      // Event should not be called (only 3 calls: getById, update, getById)
      expect(supabase.from).toHaveBeenCalledTimes(3);
    });

    it('should throw when appointment not found', async () => {
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };

      vi.mocked(supabase.from).mockReturnValue(getByIdChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.update(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID, { notes: 'test' }, 'staff', 'user-123')
      ).rejects.toThrow('Appointment not found');
    });

    it('should throw on update error', async () => {
      const mockError = { message: 'Update failed', code: '500' };

      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_APPOINTMENT_WITH_DETAILS, error: null }),
      };

      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>);

      await expect(
        appointmentService.update(MOCK_TENANT_ID, MOCK_APPOINTMENT_ID, { notes: 'test' }, 'staff', 'user-123')
      ).rejects.toEqual(mockError);
    });
  });
});
