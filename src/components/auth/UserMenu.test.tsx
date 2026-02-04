/**
 * Tests for UserMenu component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { userProfileService } from '@/lib/services/userProfileService';
import { 
  MOCK_AUTH_CONTEXT, 
  MOCK_TENANT_CONTEXT,
  MOCK_USER_ID,
  MOCK_TENANT_ID,
} from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock signOut function
const mockSignOut = vi.fn().mockResolvedValue(undefined);

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getUserRole: vi.fn(),
  },
}));

vi.mock('@/lib/services/userProfileService', () => ({
  userProfileService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    ...MOCK_AUTH_CONTEXT,
    signOut: mockSignOut,
  }),
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

// Mock UserProfileFormDialog to simplify testing
vi.mock('@/components/user/UserProfileFormDialog', () => ({
  UserProfileFormDialog: ({ open }: { open: boolean }) => 
    open ? <div data-testid="profile-dialog">Profile Dialog</div> : null,
}));

const MOCK_PROFILE = {
  id: MOCK_USER_ID,
  name: 'Test User',
  phone: '11999999999',
  avatar_url: undefined,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const MOCK_TENANT_USER = {
  id: 'tenant-user-1',
  tenant_id: MOCK_TENANT_ID,
  user_id: MOCK_USER_ID,
  role: 'admin' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
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
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userProfileService.getById).mockResolvedValue(MOCK_PROFILE);
    vi.mocked(tenantUserService.getUserRole).mockResolvedValue(MOCK_TENANT_USER);
  });

  it('should render user avatar with initials', async () => {
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    await waitFor(() => {
      // Initials should be "TU" for "Test User"
      expect(screen.getByText('TU')).toBeInTheDocument();
    });
  });

  it('should show user name', async () => {
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    // Click the menu trigger using userEvent
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('myProfile')).toBeInTheDocument();
      expect(screen.getByText('signOut')).toBeInTheDocument();
    });
  });

  it('should show role badge', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    // Click to open dropdown using userEvent
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('roleAdmin')).toBeInTheDocument();
    });
  });

  it('should open profile dialog when clicking My Profile', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    // Click to open dropdown using userEvent
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('myProfile')).toBeInTheDocument();
    });

    // Click My Profile
    await user.click(screen.getByText('myProfile'));

    await waitFor(() => {
      expect(screen.getByTestId('profile-dialog')).toBeInTheDocument();
    });
  });

  it('should call signOut when clicking logout', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    // Click to open dropdown using userEvent
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('signOut')).toBeInTheDocument();
    });

    // Click Sign Out
    await user.click(screen.getByText('signOut'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should display email in dropdown', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(<UserMenu />, { wrapper });

    // Click to open dropdown using userEvent
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
  });
});
