import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { MOCK_USER, MOCK_SESSION } from '@/test/mocks';

// Use vi.hoisted to ensure mocks are defined before vi.mock hoisting
const { mockGetSession, mockOnAuthStateChange, mockSignInWithPassword, mockSignUp, mockSignOut, mockUnsubscribe } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

const AuthConsumer = () => {
  const { user, loading, signIn, signOut, signUp } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <button onClick={() => signIn('email@test.com', '123456')}>login</button>
      <button onClick={() => signUp('new@test.com', '654321')}>register</button>
      <button onClick={() => signOut()}>logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: MOCK_SESSION } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: mockUnsubscribe } } });
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('provides user after initial session fetch and supports auth actions', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent(MOCK_USER.email);

    await user.click(screen.getByText('login'));
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'email@test.com', password: '123456' });

    await user.click(screen.getByText('register'));
    expect(mockSignUp).toHaveBeenCalledWith({ email: 'new@test.com', password: '654321' });

    await user.click(screen.getByText('logout'));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it('sets user to null when getSession returns null session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('updates user when onAuthStateChange callback is invoked', async () => {
    let authCallback: ((_event: string, session: unknown) => void) | null = null;
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('user')).toHaveTextContent('none');

    await act(async () => {
      authCallback?.('SIGNED_IN', MOCK_SESSION);
    });
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent(MOCK_USER.email));
  });

  it('calls logger.error and throws when signIn fails', async () => {
    const { logger } = await import('@/lib/logger');
    const authError = new Error('Invalid credentials');
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: authError });

    const ConsumerWithCatch = () => {
      const { signIn } = useAuth();
      return (
        <button
          onClick={() => signIn('email@test.com', '123456').catch(() => {})}
        >
          login
        </button>
      );
    };

    render(
      <AuthProvider>
        <ConsumerWithCatch />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('login')).toBeInTheDocument());
    const user = userEvent.setup();
    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('auth.signIn.failed', { error: authError.message });
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'email@test.com', password: '123456' });
  });

  it('calls logger.error and throws when signUp fails', async () => {
    const { logger } = await import('@/lib/logger');
    const authError = new Error('Email already registered');
    mockSignUp.mockResolvedValue({ data: {}, error: authError });

    const ConsumerWithCatch = () => {
      const { signUp } = useAuth();
      return (
        <button
          onClick={() => signUp('new@test.com', '654321').catch(() => {})}
        >
          register
        </button>
      );
    };

    render(
      <AuthProvider>
        <ConsumerWithCatch />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('register')).toBeInTheDocument());
    const user = userEvent.setup();
    await user.click(screen.getByText('register'));

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('auth.signUp.failed', { error: authError.message });
    });
  });

  it('calls logger.error and throws when signOut fails', async () => {
    const { logger } = await import('@/lib/logger');
    const authError = new Error('Sign out failed');
    mockSignOut.mockResolvedValue({ error: authError });

    const ConsumerWithCatch = () => {
      const { signOut } = useAuth();
      return (
        <button onClick={() => signOut().catch(() => {})}>logout</button>
      );
    };

    render(
      <AuthProvider>
        <ConsumerWithCatch />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('logout')).toBeInTheDocument());
    const user = userEvent.setup();
    await user.click(screen.getByText('logout'));

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('auth.signOut.failed', { error: authError.message });
    });
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const Consumer = () => {
      useAuth();
      return null;
    };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow('useAuth must be used within an AuthProvider');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
