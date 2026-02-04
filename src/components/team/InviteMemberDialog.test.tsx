/**
 * Tests for InviteMemberDialog component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InviteMemberDialog } from './InviteMemberDialog';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { userProfileService } from '@/lib/services/userProfileService';
import { MOCK_TENANT_CONTEXT, MOCK_AUTH_CONTEXT, MOCK_TENANT_ID } from '@/test/mocks';
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

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    create: vi.fn(),
    getUserRole: vi.fn(),
  },
}));

vi.mock('@/lib/services/userProfileService', () => ({
  userProfileService: {
    getByEmail: vi.fn(),
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

const MOCK_USER_PROFILE = {
  id: 'user-new',
  name: 'New User',
  phone: '11999999999',
  avatar_url: undefined,
  email: 'newuser@example.com',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('InviteMemberDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', async () => {
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('inviteMember')).toBeInTheDocument();
    });
  });

  it('should not render when closed', () => {
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={false} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    expect(screen.queryByText('inviteMember')).not.toBeInTheDocument();
  });

  it('should show email and role fields', async () => {
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText('email')).toBeInTheDocument();
      expect(screen.getByText('selectRole')).toBeInTheDocument();
    });
  });

  it('should disable add button when email is empty', async () => {
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: 'addMember' });
      expect(addButton).toBeDisabled();
    });
  });

  it('should enable add button when email is entered', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByLabelText('email')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('email'), 'test@example.com');

    const addButton = screen.getByRole('button', { name: 'addMember' });
    expect(addButton).not.toBeDisabled();
  });

  it('should show error when user not found', async () => {
    const user = userEvent.setup();
    vi.mocked(userProfileService.getByEmail).mockResolvedValue(null);

    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await user.type(screen.getByLabelText('email'), 'notfound@example.com');
    await user.click(screen.getByRole('button', { name: 'addMember' }));

    await waitFor(() => {
      expect(screen.getByText('userNotFound')).toBeInTheDocument();
    });
  });

  it('should create tenant user when user is found', async () => {
    const user = userEvent.setup();
    vi.mocked(userProfileService.getByEmail).mockResolvedValue(MOCK_USER_PROFILE);
    vi.mocked(tenantUserService.create).mockResolvedValue({
      id: 'new-tenant-user',
      tenant_id: MOCK_TENANT_ID,
      user_id: MOCK_USER_PROFILE.id,
      role: 'staff',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });

    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await user.type(screen.getByLabelText('email'), 'newuser@example.com');
    await user.click(screen.getByRole('button', { name: 'addMember' }));

    await waitFor(() => {
      expect(tenantUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: MOCK_TENANT_ID,
          user_id: MOCK_USER_PROFILE.id,
          role: 'staff',
        })
      );
    });
  });

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <InviteMemberDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('cancel'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
