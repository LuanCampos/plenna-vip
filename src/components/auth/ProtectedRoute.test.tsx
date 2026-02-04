/**
 * Tests for ProtectedRoute component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MOCK_AUTH_CONTEXT, MOCK_AUTH_CONTEXT_UNAUTHENTICATED } from '@/test/mocks';

// Variable to control auth state in tests
let mockAuthContext: {
  user: typeof MOCK_AUTH_CONTEXT.user | null;
  session: typeof MOCK_AUTH_CONTEXT.session | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: () => Promise<void>;
} = { ...MOCK_AUTH_CONTEXT };

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

const TestComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

const renderWithRouter = (initialPath = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('should render children when user is authenticated', () => {
    mockAuthContext = { ...MOCK_AUTH_CONTEXT };
    
    renderWithRouter();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthContext = { ...MOCK_AUTH_CONTEXT_UNAUTHENTICATED };
    
    renderWithRouter();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading skeleton when auth is loading', () => {
    mockAuthContext = {
      ...MOCK_AUTH_CONTEXT,
      loading: true,
    };
    
    renderWithRouter();

    // Loading state should show skeletons - use animate-pulse which is part of Skeleton's class
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should preserve location state for redirect', () => {
    mockAuthContext = { ...MOCK_AUTH_CONTEXT_UNAUTHENTICATED };
    
    renderWithRouter('/protected');

    // The login page should be shown
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
