/**
 * Tests for serviceService.
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { serviceService } from './serviceService';
import { supabase } from '@/lib/supabase';
import { MOCK_TENANT_ID, MOCK_SERVICE_ID, MOCK_SERVICE_ENTITY, MOCK_VALID_SERVICE } from '@/test/mocks';

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

describe('serviceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all services for a tenant', async () => {
      const mockServices = [MOCK_SERVICE_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getAll(MOCK_TENANT_ID);

      expect(supabase.from).toHaveBeenCalledWith('services');
      expect(result).toEqual(mockServices);
    });

    it('should return empty array when no services', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getAll(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getActive', () => {
    it('should return only active services', async () => {
      const activeService = { ...MOCK_SERVICE_ENTITY, active: true };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [activeService], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getActive(MOCK_TENANT_ID);

      expect(mockChain.eq).toHaveBeenCalledWith('active', true);
      expect(result).toEqual([activeService]);
    });
  });

  describe('getById', () => {
    it('should return a service by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_SERVICE_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getById(MOCK_TENANT_ID, MOCK_SERVICE_ID);

      expect(result).toEqual(MOCK_SERVICE_ENTITY);
    });

    it('should return null when service not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getById(MOCK_TENANT_ID, MOCK_SERVICE_ID);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_SERVICE_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.create(MOCK_VALID_SERVICE);

      expect(mockChain.insert).toHaveBeenCalledWith(MOCK_VALID_SERVICE);
      expect(result).toEqual(MOCK_SERVICE_ENTITY);
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const updateData = { name: 'Updated Service', price: 60 };
      const updatedService = { ...MOCK_SERVICE_ENTITY, ...updateData };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedService, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.update(MOCK_TENANT_ID, MOCK_SERVICE_ID, updateData);

      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(result.name).toBe('Updated Service');
      expect(result.price).toBe(60);
    });
  });

  describe('delete', () => {
    it('should soft delete a service and set active to false', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      mockChain.eq
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await serviceService.delete(MOCK_TENANT_ID, MOCK_SERVICE_ID);

      expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
        active: false,
      }));
    });
  });

  describe('toggleActive', () => {
    it('should toggle service active status', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...MOCK_SERVICE_ENTITY, active: false }, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.toggleActive(MOCK_TENANT_ID, MOCK_SERVICE_ID, false);

      expect(result.active).toBe(false);
    });
  });

  describe('getByIds', () => {
    it('should return services by IDs', async () => {
      const mockServices = [MOCK_SERVICE_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: mockServices, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getByIds(MOCK_TENANT_ID, [MOCK_SERVICE_ID]);

      expect(mockChain.in).toHaveBeenCalledWith('id', [MOCK_SERVICE_ID]);
      expect(result).toEqual(mockServices);
    });

    it('should return empty array for empty IDs array', async () => {
      const result = await serviceService.getByIds(MOCK_TENANT_ID, []);

      expect(supabase.from).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array when no matches', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await serviceService.getByIds(MOCK_TENANT_ID, [MOCK_SERVICE_ID]);

      expect(result).toEqual([]);
    });

    it('should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.getByIds(MOCK_TENANT_ID, [MOCK_SERVICE_ID])).rejects.toEqual(mockError);
    });
  });

  describe('error handling', () => {
    it('getAll should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.getAll(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });

    it('getActive should throw on error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.getActive(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });

    it('getById should throw on error other than not found', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.getById(MOCK_TENANT_ID, MOCK_SERVICE_ID)).rejects.toEqual(mockError);
    });

    it('create should throw on error', async () => {
      const mockError = { message: 'Insert failed', code: '500' };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.create(MOCK_VALID_SERVICE)).rejects.toEqual(mockError);
    });

    it('update should throw on error', async () => {
      const mockError = { message: 'Update failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.update(MOCK_TENANT_ID, MOCK_SERVICE_ID, { name: 'Test' })).rejects.toEqual(mockError);
    });

    it('delete should throw on error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      mockChain.eq
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ data: null, error: mockError });
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(serviceService.delete(MOCK_TENANT_ID, MOCK_SERVICE_ID)).rejects.toEqual(mockError);
    });
  });
});
