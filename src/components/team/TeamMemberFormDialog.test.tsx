/**
 * Tests for TeamMemberFormDialog component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamMemberFormDialog } from './TeamMemberFormDialog';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { MOCK_TENANT_CONTEXT, MOCK_AUTH_CONTEXT, MOCK_TENANT_ID } from '@/test/mocks';
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
    update: vi.fn(),
    getUserRole: vi.fn(),
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

const MOCK_MEMBER: TenantUserWithProfile = {
  id: 'tenant-user-1',
  tenant_id: MOCK_TENANT_ID,
  user_id: 'user-2',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  user_profile: {
    id: 'user-2',
    name: 'John Doe',
    phone: '11999999999',
    avatar_url: undefined,
    email: 'john@example.com',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
};

describe('TeamMemberFormDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tenantUserService.update).mockResolvedValue({
      ...MOCK_MEMBER,
      role: 'staff',
    });
  });

  it('should render dialog when open with member', async () => {
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={MOCK_MEMBER}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('editMember')).toBeInTheDocument();
    });
  });

  it('should not render when member is null', () => {
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={null}
      />,
      { wrapper }
    );

    expect(screen.queryByText('editMember')).not.toBeInTheDocument();
  });

  it('should display member name and email', async () => {
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={MOCK_MEMBER}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should show role selector with current role', async () => {
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={MOCK_MEMBER}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('selectRole')).toBeInTheDocument();
    });
  });

  it('should call update on submit', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={MOCK_MEMBER}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('save')).toBeInTheDocument();
    });

    await user.click(screen.getByText('save'));

    await waitFor(() => {
      expect(tenantUserService.update).toHaveBeenCalled();
    });
  });

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <TeamMemberFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        member={MOCK_MEMBER}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('cancel'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
