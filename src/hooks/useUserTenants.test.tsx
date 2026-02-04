/**
 * Tests for useUserTenants hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { 
  MOCK_USER_ID,
  MOCK_TENANT,
  MOCK_AUTH_CONTEXT,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Create a second mock tenant
const MOCK_TENANT_2 = {
  ...MOCK_TENANT,
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Segundo Salão',
  slug: 'segundo-salao',
};

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getUserTenants: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
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

// Import hooks after mock setup
import {
  useUserTenants,
  useHasAnyTenant,
  userTenantsKeys,
} from './useUserTenants';

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

describe('useUserTenants hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userTenantsKeys', () => {
    it('should generate correct query keys', () => {
      expect(userTenantsKeys.all).toEqual(['user-tenants']);
      expect(userTenantsKeys.list('user-123')).toEqual(['user-tenants', 'user-123']);
    });
  });

  describe('useUserTenants', () => {
    it('should fetch user tenants', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockResolvedValue([MOCK_TENANT]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserTenants(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]?.name).toBe('Salão Teste');
      expect(tenantUserService.getUserTenants).toHaveBeenCalledWith(MOCK_USER_ID);
    });

    it('should return multiple tenants', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockResolvedValue([MOCK_TENANT, MOCK_TENANT_2]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserTenants(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]?.name).toBe('Salão Teste');
      expect(result.current.data?.[1]?.name).toBe('Segundo Salão');
    });

    it('should return empty array when user has no tenants', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockResolvedValue([]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserTenants(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle error', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserTenants(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useHasAnyTenant', () => {
    it('should return true when user has tenants', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockResolvedValue([MOCK_TENANT]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useHasAnyTenant(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasTenant).toBe(true);
      expect(result.current.tenants).toHaveLength(1);
    });

    it('should return false when user has no tenants', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockResolvedValue([]);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useHasAnyTenant(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasTenant).toBe(false);
      expect(result.current.tenants).toEqual([]);
    });

    it('should indicate loading state', () => {
      vi.mocked(tenantUserService.getUserTenants).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useHasAnyTenant(), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.hasTenant).toBe(false);
    });

    it('should indicate error state', async () => {
      vi.mocked(tenantUserService.getUserTenants).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useHasAnyTenant(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.hasTenant).toBe(false);
    });
  });
});
