/**
 * Tests for TeamMemberList component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamMemberList } from './TeamMemberList';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { MOCK_TENANT_CONTEXT, MOCK_AUTH_CONTEXT, MOCK_TENANT_ID, MOCK_USER_ID } from '@/test/mocks';
import type { TenantUserWithProfile } from '@/types/user';
import type { ReactNode } from 'react';

// Mock contexts
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
}));

// Mock tenantUserService
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getByTenant: vi.fn(),
    getUserRole: vi.fn(),
    delete: vi.fn(),
  },
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
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
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

const MOCK_MEMBERS: TenantUserWithProfile[] = [
  {
    id: 'tenant-user-1',
    tenant_id: MOCK_TENANT_ID,
    user_id: MOCK_USER_ID,
    role: 'owner',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    user_profile: {
      id: MOCK_USER_ID,
      name: 'Owner User',
      phone: '11888888888',
      avatar_url: undefined,
      email: 'owner@example.com',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    id: 'tenant-user-2',
    tenant_id: MOCK_TENANT_ID,
    user_id: 'user-2',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    user_profile: {
      id: 'user-2',
      name: 'Admin User',
      phone: '11999999999',
      avatar_url: undefined,
      email: 'admin@example.com',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
];

describe('TeamMemberList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current user as owner
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue({
      id: 'tenant-user-1',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_ID,
      role: 'owner',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
  });

  it('should show loading state', () => {
    vi.mocked(tenantUserService.getByTenant).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    // Should show skeletons
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no members', async () => {
    vi.mocked(tenantUserService.getByTenant).mockResolvedValue([]);

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('noTeamMembers')).toBeInTheDocument();
    });
  });

  it('should render list of members', async () => {
    vi.mocked(tenantUserService.getByTenant).mockResolvedValue(MOCK_MEMBERS);

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Owner User')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
  });

  it('should show member count in header', async () => {
    vi.mocked(tenantUserService.getByTenant).mockResolvedValue(MOCK_MEMBERS);

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('teamMembers (2)')).toBeInTheDocument();
    });
  });

  it('should show add member button', async () => {
    vi.mocked(tenantUserService.getByTenant).mockResolvedValue(MOCK_MEMBERS);

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('addMember')).toBeInTheDocument();
    });
  });

  it('should open invite dialog when add member is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(tenantUserService.getByTenant).mockResolvedValue(MOCK_MEMBERS);

    const { wrapper } = createWrapper();

    render(<TeamMemberList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('addMember')).toBeInTheDocument();
    });

    await user.click(screen.getByText('addMember'));

    await waitFor(() => {
      expect(screen.getByText('inviteMember')).toBeInTheDocument();
    });
  });
});
