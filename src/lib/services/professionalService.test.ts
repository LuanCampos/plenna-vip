/**
 * Tests for professionalService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { professionalService } from './professionalService';
import { supabase } from '@/lib/supabase';
import { 
  MOCK_TENANT_ID, 
  MOCK_PROFESSIONAL_ID, 
  MOCK_PROFESSIONAL_ENTITY, 
  MOCK_VALID_PROFESSIONAL,
  MOCK_SERVICE_ID,
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

describe('professionalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all professionals for a tenant', async () => {
      const mockProfessionals = [MOCK_PROFESSIONAL_ENTITY];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProfessionals, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getAll(MOCK_TENANT_ID);

      expect(supabase.from).toHaveBeenCalledWith('professionals');
      expect(result).toEqual(mockProfessionals);
    });

    it('should return empty array when no professionals', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getAll(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });
  });

  describe('getActive', () => {
    it('should return only active professionals', async () => {
      const activeProfessional = { ...MOCK_PROFESSIONAL_ENTITY, active: true };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [activeProfessional], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getActive(MOCK_TENANT_ID);

      expect(mockChain.eq).toHaveBeenCalledWith('active', true);
      expect(result).toEqual([activeProfessional]);
    });
  });

  describe('getById', () => {
    it('should return a professional by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getById(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(result).toEqual(MOCK_PROFESSIONAL_ENTITY);
    });

    it('should return null when professional not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getById(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new professional without services', async () => {
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.create(MOCK_VALID_PROFESSIONAL);

      expect(mockChain.insert).toHaveBeenCalledWith(MOCK_VALID_PROFESSIONAL);
      expect(result).toEqual(MOCK_PROFESSIONAL_ENTITY);
    });

    it('should create a professional with service associations', async () => {
      const professionalData = { ...MOCK_VALID_PROFESSIONAL, service_ids: [MOCK_SERVICE_ID] };
      
      // First call for creating professional
      const createChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      
      // Second call for deleting existing links
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });
      
      // Third call for inserting new links
      const insertLinksChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(createChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(deleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(insertLinksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.create(professionalData);

      expect(result).toEqual(MOCK_PROFESSIONAL_ENTITY);
    });
  });

  describe('update', () => {
    it('should update a professional', async () => {
      const updateData = { name: 'Updated Professional' };
      const updatedProfessional = { ...MOCK_PROFESSIONAL_ENTITY, name: 'Updated Professional' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfessional, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.update(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, updateData);

      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(result.name).toBe('Updated Professional');
    });
  });

  describe('delete', () => {
    it('should soft delete a professional and remove service links', async () => {
      // First call for deleting service links
      const deleteLinksChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteLinksChain.eq.mockReturnValueOnce(deleteLinksChain).mockResolvedValueOnce({ error: null });
      
      // Second call for soft deleting professional
      const softDeleteChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      softDeleteChain.eq.mockReturnValueOnce(softDeleteChain).mockResolvedValueOnce({ error: null });
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(deleteLinksChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(softDeleteChain as unknown as ReturnType<typeof supabase.from>);

      await professionalService.delete(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(deleteLinksChain.delete).toHaveBeenCalled();
      expect(softDeleteChain.update).toHaveBeenCalledWith(expect.objectContaining({
        deleted_at: expect.any(String),
        active: false,
      }));
    });
  });

  describe('setServices', () => {
    it('should replace all services for a professional', async () => {
      const serviceIds = [MOCK_SERVICE_ID];
      
      // First call for deleting existing links
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });
      
      // Second call for inserting new links
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(deleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>);

      await professionalService.setServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, serviceIds);

      expect(deleteChain.delete).toHaveBeenCalled();
      expect(insertChain.insert).toHaveBeenCalledWith([
        {
          tenant_id: MOCK_TENANT_ID,
          professional_id: MOCK_PROFESSIONAL_ID,
          service_id: MOCK_SERVICE_ID,
        },
      ]);
    });

    it('should only delete existing links when empty serviceIds provided', async () => {
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });
      
      vi.mocked(supabase.from).mockReturnValue(deleteChain as unknown as ReturnType<typeof supabase.from>);

      await professionalService.setServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, []);

      expect(deleteChain.delete).toHaveBeenCalled();
      // Should only be called once (for delete), not for insert
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByService', () => {
    it('should return professionals for a specific service', async () => {
      // First call for getting professional IDs from links
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ data: [{ professional_id: MOCK_PROFESSIONAL_ID }], error: null });
      
      // Second call for getting professionals
      const professionalsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_PROFESSIONAL_ENTITY], error: null }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(professionalsChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getByService(MOCK_TENANT_ID, MOCK_SERVICE_ID);

      expect(result).toEqual([MOCK_PROFESSIONAL_ENTITY]);
    });

    it('should return empty array when no professionals for service', async () => {
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ data: [], error: null });
      
      vi.mocked(supabase.from).mockReturnValue(linksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getByService(MOCK_TENANT_ID, MOCK_SERVICE_ID);

      expect(result).toEqual([]);
    });
  });

  describe('toggleActive', () => {
    it('should toggle professional active status', async () => {
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { ...MOCK_PROFESSIONAL_ENTITY, active: false }, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.toggleActive(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, false);

      expect(result.active).toBe(false);
    });
  });

  describe('getWithServices', () => {
    it('should return professional with services', async () => {
      // Mock getById
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      
      // Mock service links query
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ 
          data: [{ 
            service_id: MOCK_SERVICE_ID, 
            services: { id: MOCK_SERVICE_ID, name: 'Corte' } 
          }], 
          error: null 
        });
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getWithServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(result).toEqual({
        ...MOCK_PROFESSIONAL_ENTITY,
        service_ids: [MOCK_SERVICE_ID],
        services: [{ id: MOCK_SERVICE_ID, name: 'Corte' }],
      });
    });

    it('should return null when professional not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getWithServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(result).toBeNull();
    });

    it('should throw on links query error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      
      // Mock getById success
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      
      // Mock links query failure
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ data: null, error: mockError });
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.getWithServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID)).rejects.toEqual(mockError);
    });

    it('should handle null services in links', async () => {
      // Mock getById
      const getByIdChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROFESSIONAL_ENTITY, error: null }),
      };
      
      // Mock service links with null service
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ 
          data: [{ service_id: MOCK_SERVICE_ID, services: null }], 
          error: null 
        });
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getByIdChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getWithServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID);

      expect(result?.service_ids).toEqual([MOCK_SERVICE_ID]);
      expect(result?.services).toEqual([]);
    });
  });

  describe('getAllWithServices', () => {
    it('should return all professionals with their services', async () => {
      // Mock getAll
      const getAllChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_PROFESSIONAL_ENTITY], error: null }),
      };
      
      // Mock all links query
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ 
          data: [{ 
            professional_id: MOCK_PROFESSIONAL_ID,
            service_id: MOCK_SERVICE_ID, 
            services: { id: MOCK_SERVICE_ID, name: 'Corte' } 
          }], 
          error: null 
        }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getAllChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getAllWithServices(MOCK_TENANT_ID);

      expect(result).toHaveLength(1);
      expect(result[0]!.service_ids).toEqual([MOCK_SERVICE_ID]);
      expect(result[0]!.services).toEqual([{ id: MOCK_SERVICE_ID, name: 'Corte' }]);
    });

    it('should throw on links query error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      
      // Mock getAll success
      const getAllChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_PROFESSIONAL_ENTITY], error: null }),
      };
      
      // Mock links query failure
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getAllChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.getAllWithServices(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });

    it('should handle null services in links', async () => {
      // Mock getAll
      const getAllChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [MOCK_PROFESSIONAL_ENTITY], error: null }),
      };
      
      // Mock links with null service
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ 
          data: [{ 
            professional_id: MOCK_PROFESSIONAL_ID,
            service_id: MOCK_SERVICE_ID, 
            services: null 
          }], 
          error: null 
        }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(getAllChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.getAllWithServices(MOCK_TENANT_ID);

      expect(result[0]!.service_ids).toEqual([MOCK_SERVICE_ID]);
      expect(result[0]!.services).toEqual([]);
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

      await expect(professionalService.getAll(MOCK_TENANT_ID)).rejects.toEqual(mockError);
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

      await expect(professionalService.getActive(MOCK_TENANT_ID)).rejects.toEqual(mockError);
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

      await expect(professionalService.getById(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID)).rejects.toEqual(mockError);
    });

    it('create should throw on error', async () => {
      const mockError = { message: 'Insert failed', code: '500' };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.create(MOCK_VALID_PROFESSIONAL)).rejects.toEqual(mockError);
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

      await expect(professionalService.update(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, { name: 'Test' })).rejects.toEqual(mockError);
    });

    it('delete should throw on soft delete error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };
      
      // Mock delete links success
      const deleteLinksChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteLinksChain.eq.mockReturnValueOnce(deleteLinksChain).mockResolvedValueOnce({ error: null });
      
      // Mock soft delete error
      const softDeleteChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      softDeleteChain.eq.mockReturnValueOnce(softDeleteChain).mockResolvedValueOnce({ error: mockError });
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(deleteLinksChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(softDeleteChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.delete(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID)).rejects.toEqual(mockError);
    });

    it('delete should throw on links delete error', async () => {
      const mockError = { message: 'Links delete failed', code: '500' };
      
      // Mock delete links failure
      const deleteLinksChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteLinksChain.eq.mockReturnValueOnce(deleteLinksChain).mockResolvedValueOnce({ error: mockError });
      
      vi.mocked(supabase.from).mockReturnValue(deleteLinksChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.delete(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID)).rejects.toEqual(mockError);
    });

    it('setServices should throw on delete error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };
      
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: mockError });
      
      vi.mocked(supabase.from).mockReturnValue(deleteChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.setServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, [MOCK_SERVICE_ID])).rejects.toEqual(mockError);
    });

    it('setServices should throw on insert error', async () => {
      const mockError = { message: 'Insert failed', code: '500' };
      
      // Mock delete success
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });
      
      // Mock insert failure
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: mockError }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(deleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.setServices(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, [MOCK_SERVICE_ID])).rejects.toEqual(mockError);
    });

    it('getByService should throw on links error', async () => {
      const mockError = { message: 'Links query failed', code: '500' };
      
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq.mockReturnValueOnce(linksChain).mockResolvedValueOnce({ data: null, error: mockError });
      
      vi.mocked(supabase.from).mockReturnValue(linksChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.getByService(MOCK_TENANT_ID, MOCK_SERVICE_ID)).rejects.toEqual(mockError);
    });

    it('getByService should throw on professionals query error', async () => {
      const mockError = { message: 'Professionals query failed', code: '500' };
      
      // Mock links success
      const linksChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      linksChain.eq
        .mockReturnValueOnce(linksChain)
        .mockResolvedValueOnce({ data: [{ professional_id: MOCK_PROFESSIONAL_ID }], error: null });
      
      // Mock professionals query failure
      const professionalsChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(linksChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(professionalsChain as unknown as ReturnType<typeof supabase.from>);

      await expect(professionalService.getByService(MOCK_TENANT_ID, MOCK_SERVICE_ID)).rejects.toEqual(mockError);
    });
  });

  describe('update with service_ids', () => {
    it('should update professional and set services when service_ids provided', async () => {
      const updatedProfessional = { ...MOCK_PROFESSIONAL_ENTITY, name: 'Updated' };
      
      // Mock update
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfessional, error: null }),
      };
      
      // Mock setServices - delete existing
      const deleteChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      deleteChain.eq.mockReturnValueOnce(deleteChain).mockResolvedValueOnce({ error: null });
      
      // Mock setServices - insert new
      const insertChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
      
      vi.mocked(supabase.from)
        .mockReturnValueOnce(updateChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(deleteChain as unknown as ReturnType<typeof supabase.from>)
        .mockReturnValueOnce(insertChain as unknown as ReturnType<typeof supabase.from>);

      const result = await professionalService.update(MOCK_TENANT_ID, MOCK_PROFESSIONAL_ID, { 
        name: 'Updated', 
        service_ids: [MOCK_SERVICE_ID] 
      });

      expect(result.name).toBe('Updated');
      expect(insertChain.insert).toHaveBeenCalled();
    });
  });
});
