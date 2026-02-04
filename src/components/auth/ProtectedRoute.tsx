/**
 * ProtectedRoute - Wrapper for routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Loading skeleton for protected route.
 */
const ProtectedRouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="space-y-4 w-full max-w-md p-8">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
      <div className="space-y-2 mt-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

/**
 * Protects routes from unauthenticated access.
 * 
 * Behavior:
 * 1. If loading → show skeleton
 * 2. If not authenticated → redirect to /login
 * 3. If authenticated → render children
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return <ProtectedRouteLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};
