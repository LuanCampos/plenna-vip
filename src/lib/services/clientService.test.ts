/**
 * Tests for clientService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from './clientService';
import { supabase } from '@/lib/supabase';
import { MOCK_TENANT_ID, MOCK_CLIENT_ID, MOCK_CLIENT_ENTITY, MOCK_VALID_CLIENT } from '@/test/mocks';

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

describe('clientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all clients for a tenant', async () => {
      const mockClients = [MOCK_CLIENT_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getAll(MOCK_TENANT_ID);

      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('tenant_id', MOCK_TENANT_ID);
      expect(mockChain.is).toHaveBeenCalledWith('deleted_at', null);
      expect(result).toEqual(mockClients);
    });

    it('should return empty array when no clients', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getAll(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.getAll(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getById', () => {
    it('should return a client by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getById(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toEqual(MOCK_CLIENT_ENTITY);
    });

    it('should return null when client not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getById(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.create(MOCK_VALID_CLIENT);

      expect(supabase.from).toHaveBeenCalledWith('clients');
      expect(mockChain.insert).toHaveBeenCalledWith(MOCK_VALID_CLIENT);
      expect(result).toEqual(MOCK_CLIENT_ENTITY);
    });

    it('should throw on creation error', async () => {
      const mockError = { message: 'Insert failed', code: '500' };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.create(MOCK_VALID_CLIENT)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedClient = { ...MOCK_CLIENT_ENTITY, name: 'Updated Name' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedClient, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.update(MOCK_TENANT_ID, MOCK_CLIENT_ID, updateData);

      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should soft delete a client', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      // Make eq return a resolved promise on the last call
      mockChain.eq
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await clientService.delete(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
      }));
    });
  });

  describe('search', () => {
    it('should search clients by name or phone', async () => {
      const mockClients = [MOCK_CLIENT_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.search(MOCK_TENANT_ID, 'Maria');

      expect(mockChain.or).toHaveBeenCalledWith(expect.stringContaining('Maria'));
      expect(result).toEqual(mockClients);
    });
  });

  describe('findByPhone', () => {
    it('should find client by exact phone', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.findByPhone(MOCK_TENANT_ID, '11999999999');

      expect(result).toEqual(MOCK_CLIENT_ENTITY);
    });

    it('should return null when client not found by phone', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.findByPhone(MOCK_TENANT_ID, '11000000000');

      expect(result).toBeNull();
    });

    it('should throw on error other than not found', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.findByPhone(MOCK_TENANT_ID, '11000000000')).rejects.toEqual(mockError);
    });
  });

  describe('searchByPhone', () => {
    it('should search clients by phone pattern', async () => {
      const mockClients = [MOCK_CLIENT_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.searchByPhone(MOCK_TENANT_ID, '999');

      expect(mockChain.ilike).toHaveBeenCalledWith('phone', '%999%');
      expect(result).toEqual(mockClients);
    });

    it('should return empty array when no matches', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.searchByPhone(MOCK_TENANT_ID, '000');

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.searchByPhone(MOCK_TENANT_ID, '999')).rejects.toEqual(mockError);
    });
  });

  describe('search', () => {
    it('should search clients by name or phone', async () => {
      const mockClients = [MOCK_CLIENT_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockClients, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.search(MOCK_TENANT_ID, 'Maria');

      expect(mockChain.or).toHaveBeenCalledWith(expect.stringContaining('Maria'));
      expect(result).toEqual(mockClients);
    });

    it('should return empty array when no matches', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.search(MOCK_TENANT_ID, 'Xyz');

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.search(MOCK_TENANT_ID, 'Maria')).rejects.toEqual(mockError);
    });
  });

  describe('getWithHistory', () => {
    it('should return client with appointment stats', async () => {
      // Mock getById
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      
      // Mock appointments query
      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            { id: '1', start_time: '2026-02-01T10:00:00Z' },
            { id: '2', start_time: '2026-01-15T14:00:00Z' },
          ],
          error: null,
        }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getWithHistory(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toEqual({
        ...MOCK_CLIENT_ENTITY,
        total_appointments: 2,
        last_appointment: '2026-02-01T10:00:00Z',
      });
    });

    it('should return null when client not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getWithHistory(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toBeNull();
    });

    it('should throw on appointments query error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      
      // Mock getById success
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      
      // Mock appointments query failure
      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.getWithHistory(MOCK_TENANT_ID, MOCK_CLIENT_ID)).rejects.toEqual(mockError);
    });

    it('should handle empty appointment history', async () => {
      // Mock getById
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_CLIENT_ENTITY, error: null }),
      };
      
      // Mock appointments query - empty
      const appointmentsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(appointmentsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await clientService.getWithHistory(MOCK_TENANT_ID, MOCK_CLIENT_ID);

      expect(result).toEqual({
        ...MOCK_CLIENT_ENTITY,
        total_appointments: 0,
        last_appointment: undefined,
      });
    });
  });

  describe('getById error handling', () => {
    it('should throw on error other than not found', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.getById(MOCK_TENANT_ID, MOCK_CLIENT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('update error handling', () => {
    it('should throw on update error', async () => {
      const mockError = { message: 'Update failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.update(MOCK_TENANT_ID, MOCK_CLIENT_ID, { name: 'Test' })).rejects.toEqual(mockError);
    });
  });

  describe('delete error handling', () => {
    it('should throw on delete error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      mockChain.eq
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ data: null, error: mockError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(clientService.delete(MOCK_TENANT_ID, MOCK_CLIENT_ID)).rejects.toEqual(mockError);
    });
  });
});
