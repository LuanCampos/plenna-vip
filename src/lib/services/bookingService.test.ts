/**
 * Tests for bookingService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingService } from './bookingService';
import { supabase } from '@/lib/supabase';
import { clientService } from './clientService';
import { appointmentService } from './appointmentService';
import {
  MOCK_TENANT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_CLIENT_ID,
  MOCK_VALID_TENANT,
  MOCK_SERVICE_ENTITY,
  MOCK_PROFESSIONAL_ENTITY,
  createMockClient,
} from '@/test/mocks';
import type { PublicBookingInput } from '@/types/booking';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
          single: vi.fn(),
          is: vi.fn(() => ({
            order: vi.fn(),
          })),
          in: vi.fn(),
          order: vi.fn(),
        })),
      })),
    })),
  },
}));

vi.mock('./clientService', () => ({
  clientService: {
    findByPhone: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('./appointmentService', () => ({
  appointmentService: {
    create: vi.fn(),
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTenantBySlug', () => {
    it('should return tenant when found', async () => {
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: MOCK_VALID_TENANT, error: null }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await bookingService.getTenantBySlug('test-salon');

      expect(result).toEqual(MOCK_VALID_TENANT);
    });

    it('should return null when tenant not found', async () => {
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await bookingService.getTenantBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getActiveServices', () => {
    it('should return active services for tenant', async () => {
      const mockServices = [MOCK_SERVICE_ENTITY];
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await bookingService.getActiveServices(MOCK_TENANT_ID);

      expect(result).toEqual(mockServices);
    });

    it('should return empty array when no services', async () => {
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await bookingService.getActiveServices(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getActiveProfessionals', () => {
    it('should return active professionals for tenant', async () => {
      const mockProfessionals = [MOCK_PROFESSIONAL_ENTITY];
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockProfessionals, error: null }),
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await bookingService.getActiveProfessionals(MOCK_TENANT_ID);

      expect(result).toEqual(mockProfessionals);
    });
  });

  describe('findOrCreateClient', () => {
    it('should return existing client if phone matches', async () => {
      const existingClient = createMockClient({
        id: MOCK_CLIENT_ID,
        name: 'Existing Client',
        phone: '11999999999',
      });

      vi.mocked(clientService.findByPhone).mockResolvedValue(existingClient);

      const result = await bookingService.findOrCreateClient(
        MOCK_TENANT_ID,
        'Existing Client',
        '11999999999'
      );

      expect(result).toEqual(existingClient);
      expect(clientService.findByPhone).toHaveBeenCalledWith(MOCK_TENANT_ID, '11999999999');
      expect(clientService.create).not.toHaveBeenCalled();
    });

    it('should create new client if phone not found', async () => {
      const newClient = createMockClient({
        id: MOCK_CLIENT_ID,
        name: 'New Client',
        phone: '11888888888',
      });

      vi.mocked(clientService.findByPhone).mockResolvedValue(null);
      vi.mocked(clientService.create).mockResolvedValue(newClient);

      const result = await bookingService.findOrCreateClient(
        MOCK_TENANT_ID,
        'New Client',
        '(11) 88888-8888'
      );

      expect(result).toEqual(newClient);
      expect(clientService.create).toHaveBeenCalledWith({
        tenant_id: MOCK_TENANT_ID,
        name: 'New Client',
        phone: '11888888888',
        email: undefined,
      });
    });

    it('should update client name if different', async () => {
      const existingClient = createMockClient({
        id: MOCK_CLIENT_ID,
        name: 'Old Name',
        phone: '11999999999',
        email: 'existing@example.com',
      });
      const updatedClient = { ...existingClient, name: 'New Name' };

      vi.mocked(clientService.findByPhone).mockResolvedValue(existingClient);
      vi.mocked(clientService.update).mockResolvedValue(updatedClient);

      const result = await bookingService.findOrCreateClient(
        MOCK_TENANT_ID,
        'New Name',
        '11999999999'
      );

      expect(result).toEqual(updatedClient);
      // When no email is passed, it preserves the existing email
      expect(clientService.update).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_CLIENT_ID,
        { name: 'New Name', email: 'existing@example.com' }
      );
    });
  });

  describe('createBooking', () => {
    const mockBookingInput: PublicBookingInput = {
      tenant_id: MOCK_TENANT_ID,
      professional_id: MOCK_PROFESSIONAL_ID,
      service_ids: ['service-123'],
      start_time: '2026-02-02T10:00:00Z',
      client_name: 'Maria Silva',
      client_phone: '11999999999',
      client_email: 'maria@example.com',
      notes: 'Test booking',
    };

    it('should create complete booking flow', async () => {
      const mockClient = createMockClient({ id: MOCK_CLIENT_ID });
      const mockAppointment = {
        id: 'appointment-123',
        tenant_id: MOCK_TENANT_ID,
        client_id: MOCK_CLIENT_ID,
        professional_id: MOCK_PROFESSIONAL_ID,
        start_time: mockBookingInput.start_time,
        end_time: '2026-02-02T10:30:00Z',
        status: 'scheduled' as const,
        total_duration: 30,
        total_price: 50,
        services: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock findOrCreateClient
      vi.mocked(clientService.findByPhone).mockResolvedValue(null);
      vi.mocked(clientService.create).mockResolvedValue(mockClient);

      // Mock services fetch
      const mockSupabase = vi.mocked(supabase);
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'services') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [MOCK_SERVICE_ENTITY],
                  error: null,
                }),
              }),
            }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'professionals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: MOCK_PROFESSIONAL_ENTITY,
                  error: null,
                }),
              }),
            }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {} as ReturnType<typeof supabase.from>;
      });

      // Mock appointment creation
      vi.mocked(appointmentService.create).mockResolvedValue(mockAppointment);

      const result = await bookingService.createBooking(mockBookingInput);

      expect(result).toHaveProperty('appointment');
      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('summary');
      expect(result.summary.totalDuration).toBe(MOCK_SERVICE_ENTITY.duration);
      expect(result.summary.totalPrice).toBe(MOCK_SERVICE_ENTITY.price);
    });
  });
});
