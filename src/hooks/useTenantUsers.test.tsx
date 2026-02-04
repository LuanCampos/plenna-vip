/**
 * Tests for useTenantUsers hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { 
  MOCK_TENANT_ID,
  MOCK_USER_ID,
  MOCK_USER_ID_2,
  MOCK_TENANT_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock IDs for tenant users
const MOCK_TENANT_USER_ID = 'bb0e8400-e29b-41d4-a716-446655440001';
const MOCK_TENANT_USER_ID_2 = 'bb0e8400-e29b-41d4-a716-446655440002';

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getByTenant: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
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

// Import hooks and mocks after mock setup
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  useTenantUsers,
  useTenantUser,
  useCreateTenantUser,
  useUpdateTenantUser,
  useDeleteTenantUser,
  tenantUserKeys,
} from './useTenantUsers';

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
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('useTenantUsers hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tenantUserKeys', () => {
    it('should generate correct query keys', () => {
      expect(tenantUserKeys.all).toEqual(['tenant-users']);
      expect(tenantUserKeys.lists()).toEqual(['tenant-users', 'list']);
      expect(tenantUserKeys.list('tenant-123')).toEqual(['tenant-users', 'list', 'tenant-123']);
      expect(tenantUserKeys.details()).toEqual(['tenant-users', 'detail']);
      expect(tenantUserKeys.detail('tenant-123', 'user-456')).toEqual(['tenant-users', 'detail', 'tenant-123', 'user-456']);
    });
  });

  describe('useTenantUsers', () => {
    it('should fetch all team members', async () => {
      const mockData = [MOCK_TENANT_USER_WITH_PROFILE, MOCK_TENANT_USER_WITH_PROFILE_STAFF];
      vi.mocked(tenantUserService.getByTenant).mockResolvedValue(mockData);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUsers(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(tenantUserService.getByTenant).toHaveBeenCalledWith(MOCK_TENANT_ID);
    });

    it('should handle empty team', async () => {
      vi.mocked(tenantUserService.getByTenant).mockResolvedValue([]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUsers(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle error', async () => {
      vi.mocked(tenantUserService.getByTenant).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUsers(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useTenantUser', () => {
    it('should fetch a single team member by ID', async () => {
      vi.mocked(tenantUserService.getById).mockResolvedValue(MOCK_TENANT_USER);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUser(MOCK_TENANT_USER_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_TENANT_USER);
      expect(tenantUserService.getById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_TENANT_USER_ID);
    });

    it('should not fetch when ID is null', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUser(null), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(tenantUserService.getById).not.toHaveBeenCalled();
    });

    it('should not fetch when ID is empty', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useTenantUser(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(tenantUserService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateTenantUser', () => {
    it('should add a new team member', async () => {
      vi.mocked(tenantUserService.create).mockResolvedValue(MOCK_TENANT_USER_STAFF);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateTenantUser(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          user_id: MOCK_USER_ID_2,
          role: 'staff',
        });
      });

      expect(tenantUserService.create).toHaveBeenCalledWith({
        tenant_id: MOCK_TENANT_ID,
        user_id: MOCK_USER_ID_2,
        role: 'staff',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tenantUserKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('memberAdded');
    });

    it('should handle creation error', async () => {
      vi.mocked(tenantUserService.create).mockRejectedValue(new Error('Create failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateTenantUser(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ user_id: MOCK_USER_ID_2, role: 'staff' }),
      ).rejects.toThrow('Create failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useCreateTenantUser.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('memberAddError');
    });
  });

  describe('useUpdateTenantUser', () => {
    it('should update team member role', async () => {
      const updatedUser = { ...MOCK_TENANT_USER_STAFF, role: 'admin' as const };
      vi.mocked(tenantUserService.update).mockResolvedValue(updatedUser);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateTenantUser(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          tenantUserId: MOCK_TENANT_USER_ID_2,
          data: { role: 'admin' },
        });
      });

      expect(tenantUserService.update).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_TENANT_USER_ID_2,
        { role: 'admin' },
      );
      expect(invalidateSpy).toHaveBeenNthCalledWith(1, { queryKey: tenantUserKeys.lists() });
      expect(invalidateSpy).toHaveBeenNthCalledWith(2, {
        queryKey: tenantUserKeys.detail(MOCK_TENANT_ID, MOCK_TENANT_USER_ID_2),
      });
      expect(toast.success).toHaveBeenCalledWith('memberUpdated');
    });

    it('should handle update error', async () => {
      vi.mocked(tenantUserService.update).mockRejectedValue(new Error('Update failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateTenantUser(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ tenantUserId: MOCK_TENANT_USER_ID_2, data: { role: 'admin' } }),
      ).rejects.toThrow('Update failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useUpdateTenantUser.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('memberUpdateError');
    });
  });

  describe('useDeleteTenantUser', () => {
    it('should remove team member', async () => {
      vi.mocked(tenantUserService.delete).mockResolvedValue(undefined);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteTenantUser(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(MOCK_TENANT_USER_ID_2);
      });

      expect(tenantUserService.delete).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_TENANT_USER_ID_2);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: tenantUserKeys.lists() });
      expect(toast.success).toHaveBeenCalledWith('memberRemoved');
    });

    it('should handle delete error', async () => {
      vi.mocked(tenantUserService.delete).mockRejectedValue(new Error('Delete failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteTenantUser(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync(MOCK_TENANT_USER_ID_2),
      ).rejects.toThrow('Delete failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useDeleteTenantUser.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('memberRemoveError');
    });
  });
});
