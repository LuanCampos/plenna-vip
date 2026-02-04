import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantProvider, useTenant } from './TenantContext';
import { MOCK_TENANT, MOCK_AUTH_CONTEXT, MOCK_AUTH_CONTEXT_UNAUTHENTICATED } from '@/test/mocks';

// Variable to control auth state in tests
let mockAuthContext: {
  user: typeof MOCK_AUTH_CONTEXT.user | null;
  session: typeof MOCK_AUTH_CONTEXT.session | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
} = { ...MOCK_AUTH_CONTEXT };

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock services
vi.mock('@/lib/services/tenantUserService', () => ({
  tenantUserService: {
    getUserTenants: vi.fn().mockResolvedValue([]),
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

// Mock secure storage
vi.mock('@/lib/storage/secureStorage', () => ({
  getSecureStorageItem: vi.fn().mockReturnValue(null),
  setSecureStorageItem: vi.fn(),
  removeSecureStorageItem: vi.fn(),
}));

const TenantConsumer = () => {
  const { currentTenant, setCurrentTenant, loading } = useTenant();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="tenant-name">{currentTenant?.name ?? 'none'}</span>
      <button onClick={() => setCurrentTenant(MOCK_TENANT)}>set</button>
      <button onClick={() => setCurrentTenant(null)}>clear</button>
    </div>
  );
};

describe('TenantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supports manual tenant override', async () => {
    const user = userEvent.setup();
    mockAuthContext = { ...MOCK_AUTH_CONTEXT };

    render(
      <TenantProvider>
        <TenantConsumer />
      </TenantProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    // Manual set with custom tenant
    await user.click(screen.getByText('set'));
    expect(screen.getByTestId('tenant-name')).toHaveTextContent(MOCK_TENANT.name);

    // Clear should work
    await user.click(screen.getByText('clear'));
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('none');
  });

  it('clears tenant when user is not authenticated', async () => {
    mockAuthContext = {
      ...MOCK_AUTH_CONTEXT_UNAUTHENTICATED,
    };

    render(
      <TenantProvider>
        <TenantConsumer />
      </TenantProvider>
    );

    // Should be ready
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
    
    // Should have no tenant when not authenticated
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('none');
  });

  it('throws when useTenant is used outside TenantProvider', () => {
    const Consumer = () => {
      useTenant();
      return null;
    };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow('useTenant must be used within a TenantProvider');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
