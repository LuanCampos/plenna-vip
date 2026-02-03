import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';

// Lazy loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Bookings = lazy(() => import('@/pages/Bookings').then(m => ({ default: m.Bookings })));
const Clients = lazy(() => import('@/pages/Clients').then(m => ({ default: m.Clients })));
const Services = lazy(() => import('@/pages/Services').then(m => ({ default: m.Services })));
const Professionals = lazy(() => import('@/pages/Professionals').then(m => ({ default: m.Professionals })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })));
const PublicBooking = lazy(() => import('@/pages/public/PublicBooking').then(m => ({ default: m.PublicBooking })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TenantProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Public booking route */}
                    <Route path="/:slug" element={
                      <PublicLayout>
                        <PublicBooking />
                      </PublicLayout>
                    } />

                    {/* Protected routes with MainLayout */}
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="bookings" element={<Bookings />} />
                      <Route path="clients" element={<Clients />} />
                      <Route path="services" element={<Services />} />
                      <Route path="professionals" element={<Professionals />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
              <Toaster position="top-right" richColors />
            </TenantProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
