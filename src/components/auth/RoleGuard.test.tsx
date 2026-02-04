/**
 * Tests for RoleGuard component and utilities.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoleGuard, hasMinimumRole, useCurrentUserRole } from './RoleGuard';
import { renderHook } from '@testing-library/react';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { 
  MOCK_TENANT_CONTEXT, 
  MOCK_AUTH_CONTEXT,
  MOCK_TENANT_ID,
  MOCK_USER_ID,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getUserRole: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
}));

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

describe('hasMinimumRole', () => {
  it('should return true for owner with any minRole', () => {
    expect(hasMinimumRole('owner', 'owner')).toBe(true);
    expect(hasMinimumRole('owner', 'admin')).toBe(true);
    expect(hasMinimumRole('owner', 'staff')).toBe(true);
  });

  it('should return true for admin with admin or staff minRole', () => {
    expect(hasMinimumRole('admin', 'owner')).toBe(false);
    expect(hasMinimumRole('admin', 'admin')).toBe(true);
    expect(hasMinimumRole('admin', 'staff')).toBe(true);
  });

  it('should return true for staff only with staff minRole', () => {
    expect(hasMinimumRole('staff', 'owner')).toBe(false);
    expect(hasMinimumRole('staff', 'admin')).toBe(false);
    expect(hasMinimumRole('staff', 'staff')).toBe(true);
  });

  it('should return false for undefined role', () => {
    expect(hasMinimumRole(undefined, 'staff')).toBe(false);
    expect(hasMinimumRole(undefined, 'admin')).toBe(false);
    expect(hasMinimumRole(undefined, 'owner')).toBe(false);
  });
});

describe('useCurrentUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch current user role', async () => {
    const mockTenantUser = {
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'admin' as const,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(mockTenantUser);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCurrentUserRole(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.role).toBe('admin');
    expect(tenantUserService.getUserRole).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_USER_ID);
  });
});

describe('RoleGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user has owner role', async () => {
    const mockTenantUser = {
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'owner' as const,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(mockTenantUser);

    const { wrapper } = createWrapper();

    render(
      <RoleGuard minRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should render children when user has exact required role', async () => {
    const mockTenantUser = {
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'admin' as const,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(mockTenantUser);

    const { wrapper } = createWrapper();

    render(
      <RoleGuard minRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should render fallback when user has lower role', async () => {
    const mockTenantUser = {
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'staff' as const,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(mockTenantUser);

    const { wrapper } = createWrapper();

    render(
      <RoleGuard minRole="admin" fallback={<div>No Permission</div>}>
        <div>Admin Content</div>
      </RoleGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('No Permission')).toBeInTheDocument();
    });
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render nothing when user has lower role and no fallback', async () => {
    const mockTenantUser = {
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'staff' as const,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(mockTenantUser);

    const { wrapper } = createWrapper();

    const { container } = render(
      <RoleGuard minRole="owner">
        <div>Owner Content</div>
      </RoleGuard>,
      { wrapper }
    );

    await waitFor(() => {
      expect(container.textContent).toBe('');
    });
  });

  it('should render nothing while loading', () => {
    vi.mocked(tenantUserService.getUserRole).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { wrapper } = createWrapper();

    const { container } = render(
      <RoleGuard minRole="admin">
        <div>Admin Content</div>
      </RoleGuard>,
      { wrapper }
    );

    expect(container.textContent).toBe('');
  });
});
