import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import type { ReactNode } from 'react';

const setLanguage = vi.fn();
const setTheme = vi.fn();
const useThemeMock = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage,
  }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => useThemeMock(),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Tenant X' } }),
}));

// Mock AuthContext for UserMenu
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'user@example.com' },
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Mock hooks used by UserMenu
vi.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    data: { id: 'user-1', name: 'Test User', phone: null, avatar_url: null },
    isLoading: false,
  }),
}));

// Mock RoleGuard hook
vi.mock('@/components/auth/RoleGuard', () => ({
  useCurrentUserRole: () => ({
    data: { role: 'admin' },
    isLoading: false,
  }),
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  hasMinimumRole: () => true,
}));

// Mock UserProfileFormDialog
vi.mock('@/components/user/UserProfileFormDialog', () => ({
  UserProfileFormDialog: () => null,
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

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Wrapper with required providers
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

  return wrapper;
};

describe('Header', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({
      theme: 'light' as const,
      setTheme,
      resolvedTheme: 'light' as const,
    });
  });

  it('renders tenant name and toggles language/theme', async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();

    render(<Header />, { wrapper });

    expect(screen.getByText('Tenant X')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'changeLanguage' }));
    expect(setLanguage).toHaveBeenCalledWith('en');

    await user.click(screen.getByRole('button', { name: 'changeTheme' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('renders Sun icon when theme is dark', () => {
    useThemeMock.mockReturnValue({
      theme: 'dark' as const,
      setTheme,
      resolvedTheme: 'dark' as const,
    });
    const wrapper = createWrapper();

    render(<Header />, { wrapper });
    expect(screen.getByRole('button', { name: 'changeTheme' })).toBeInTheDocument();
  });
});
