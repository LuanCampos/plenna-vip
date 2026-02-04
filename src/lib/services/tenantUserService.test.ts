/**
 * Tests for tenantUserService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tenantUserService } from './tenantUserService';
import { supabase } from '@/lib/supabase';
import { 
  MOCK_TENANT_ID, 
  MOCK_USER_ID, 
  MOCK_USER_ID_2,
  MOCK_TENANT,
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

const MOCK_TENANT_USER_ID = 'bb0e8400-e29b-41d4-a716-446655440001';
const MOCK_TENANT_USER_ID_2 = 'bb0e8400-e29b-41d4-a716-446655440002';

const MOCK_TENANT_USER = {
  id: MOCK_TENANT_USER_ID,
  tenant_id: MOCK_TENANT_ID,
  user_id: MOCK_USER_ID,
  role: 'owner' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const MOCK_TENANT_USER_STAFF = {
  id: MOCK_TENANT_USER_ID_2,
  tenant_id: MOCK_TENANT_ID,
  user_id: MOCK_USER_ID_2,
  role: 'staff' as const,
  created_at: '2026-01-02T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

const MOCK_USER_PROFILE = {
  id: MOCK_USER_ID,
  name: 'Owner User',
  phone: '11999999999',
  avatar_url: undefined,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const MOCK_USER_PROFILE_2 = {
  id: MOCK_USER_ID_2,
  name: 'Staff User',
  phone: '11888888888',
  avatar_url: undefined,
  created_at: '2026-01-02T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
};

const MOCK_TENANT_USER_WITH_PROFILE = {
  ...MOCK_TENANT_USER,
  user_profile: MOCK_USER_PROFILE,
};

const MOCK_TENANT_USER_WITH_PROFILE_STAFF = {
  ...MOCK_TENANT_USER_STAFF,
  user_profile: MOCK_USER_PROFILE_2,
};

describe('tenantUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByTenant', () => {
    it('should return all tenant users with profiles', async () => {
      const mockData = [MOCK_TENANT_USER_WITH_PROFILE, MOCK_TENANT_USER_WITH_PROFILE_STAFF];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getByTenant(MOCK_TENANT_ID);

      expect(supabase.from).toHaveBeenCalledWith('tenant_users');
      expect(mockChain.eq).toHaveBeenCalledWith('tenant_id', MOCK_TENANT_ID);
      expect(result).toHaveLength(2);
      expect(result[0]?.user_profile.name).toBe('Owner User');
      expect(result[1]?.user_profile.name).toBe('Staff User');
    });

    it('should return empty array when no members', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getByTenant(MOCK_TENANT_ID);

      expect(result).toEqual([]);
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.getByTenant(MOCK_TENANT_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getById', () => {
    it('should return tenant user by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_USER, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getById(MOCK_TENANT_ID, MOCK_TENANT_USER_ID);

      expect(result).toEqual(MOCK_TENANT_USER);
    });

    it('should return null when not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getById(MOCK_TENANT_ID, MOCK_TENANT_USER_ID);

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.getById(MOCK_TENANT_ID, MOCK_TENANT_USER_ID)).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should create a new tenant user', async () => {
      const createData = {
        tenant_id: MOCK_TENANT_ID,
        user_id: MOCK_USER_ID_2,
        role: 'staff' as const,
      };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_USER_STAFF, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.create(createData);

      expect(supabase.from).toHaveBeenCalledWith('tenant_users');
      expect(mockChain.insert).toHaveBeenCalledWith(createData);
      expect(result.role).toBe('staff');
    });

    it('should throw on creation error', async () => {
      const mockError = { message: 'Insert failed', code: '23505' };
      const mockChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.create({
        tenant_id: MOCK_TENANT_ID,
        user_id: MOCK_USER_ID,
        role: 'staff',
      })).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should update tenant user role', async () => {
      const updatedUser = { ...MOCK_TENANT_USER_STAFF, role: 'admin' as const };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedUser, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.update(MOCK_TENANT_ID, MOCK_TENANT_USER_ID_2, { role: 'admin' });

      expect(mockChain.update).toHaveBeenCalledWith({ role: 'admin' });
      expect(mockChain.neq).toHaveBeenCalledWith('role', 'owner');
      expect(result.role).toBe('admin');
    });

    it('should throw on update error', async () => {
      const mockError = { message: 'Update failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.update(MOCK_TENANT_ID, MOCK_TENANT_USER_ID, { role: 'admin' })).rejects.toEqual(mockError);
    });
  });

  describe('delete', () => {
    it('should delete a tenant user', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await tenantUserService.delete(MOCK_TENANT_ID, MOCK_TENANT_USER_ID_2);

      expect(supabase.from).toHaveBeenCalledWith('tenant_users');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.neq).toHaveBeenCalledWith('role', 'owner');
    });

    it('should throw on delete error', async () => {
      const mockError = { message: 'Delete failed', code: '500' };
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.delete(MOCK_TENANT_ID, MOCK_TENANT_USER_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getUserTenants', () => {
    it('should return all tenants for a user', async () => {
      const mockData = [
        { tenant_id: MOCK_TENANT_ID, role: 'owner', tenant: MOCK_TENANT },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getUserTenants(MOCK_USER_ID);

      expect(supabase.from).toHaveBeenCalledWith('tenant_users');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', MOCK_USER_ID);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Salão Teste');
    });

    it('should return empty array when user has no tenants', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getUserTenants(MOCK_USER_ID);

      expect(result).toEqual([]);
    });

    it('should filter null tenants', async () => {
      const mockData = [
        { tenant_id: MOCK_TENANT_ID, role: 'owner', tenant: MOCK_TENANT },
        { tenant_id: 'deleted-tenant-id', role: 'staff', tenant: null },
      ];
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getUserTenants(MOCK_USER_ID);

      expect(result).toHaveLength(1);
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.getUserTenants(MOCK_USER_ID)).rejects.toEqual(mockError);
    });
  });

  describe('getUserRole', () => {
    it('should return user role in tenant', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_USER, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getUserRole(MOCK_TENANT_ID, MOCK_USER_ID);

      expect(result?.role).toBe('owner');
    });

    it('should return null when user is not a member', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.getUserRole(MOCK_TENANT_ID, 'unknown-user-id');

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(tenantUserService.getUserRole(MOCK_TENANT_ID, MOCK_USER_ID)).rejects.toEqual(mockError);
    });
  });

  describe('isUserMember', () => {
    it('should return true when user is a member', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_TENANT_USER, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.isUserMember(MOCK_TENANT_ID, MOCK_USER_ID);

      expect(result).toBe(true);
    });

    it('should return false when user is not a member', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await tenantUserService.isUserMember(MOCK_TENANT_ID, 'unknown-user-id');

      expect(result).toBe(false);
    });
  });
});
