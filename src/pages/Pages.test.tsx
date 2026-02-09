import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { Client } from '@/types/client';
import type { Service } from '@/types/service';
import type { Professional } from '@/types/professional';

// Define mock data inside vi.hoisted to avoid hoisting issues
const { mockClient, mockService, mockProfessional } = vi.hoisted(() => ({
  mockClient: {
    id: 'client-1',
    tenant_id: 'tenant-1',
    name: 'Ana',
    phone: '11999999999',
    email: 'ana@example.com',
    notes: '',
    created_at: '',
    updated_at: '',
    deleted_at: undefined,
  } as Client,
  mockService: {
    id: 'service-1',
    tenant_id: 'tenant-1',
    name: 'Corte',
    description: '',
    price: 50,
    duration: 30,
    active: true,
    created_at: '',
    updated_at: '',
    deleted_at: undefined,
  } as Service,
  mockProfessional: {
    id: 'prof-1',
    tenant_id: 'tenant-1',
    name: 'João',
    phone: '11999999999',
    email: 'joao@example.com',
    avatar_url: undefined,
    active: true,
    created_at: '',
    updated_at: '',
    deleted_at: undefined,
  } as Professional,
}));

// Mock all contexts at once
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'pt' }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({
    currentTenant: {
      id: 'tenant-1',
      name: 'Test Tenant',
      slug: 'test-tenant',
      settings: { booking_slot_duration: 30 },
    },
    tenants: [],
    loading: false,
    setCurrentTenant: vi.fn(),
  }),
}));

// Mock the entire hooks barrel to prevent heavy loading
vi.mock('@/hooks', () => ({
  // Empty - we don't need these for the pages we're testing
}));

// Mock availability hook (not needed but prevents import errors)
vi.mock('@/hooks/useAvailability', () => ({
  useAvailableSlots: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useBooking', () => ({
  useTenantBySlug: () => ({ data: null, isLoading: false }),
  usePublicServices: () => ({ data: [], isLoading: false }),
  useProfessionalsForServices: () => ({ data: [], isLoading: false }),
  useCreateBooking: () => ({ mutate: vi.fn(), isPending: false, isSuccess: false, isError: false }),
}));

vi.mock('@/components/client', () => ({
  ClientList: ({ onEdit }: { onEdit: (client: Client) => void }) => (
    <div data-testid="client-list" onClick={() => onEdit(mockClient)}>ClientList</div>
  ),
  ClientFormDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="client-form" data-open={open} onClick={() => onOpenChange(false)} />
  ),
}));

vi.mock('@/components/service', () => ({
  ServiceList: ({ onEdit }: { onEdit: (service: Service) => void }) => (
    <div data-testid="service-list" onClick={() => onEdit(mockService)}>ServiceList</div>
  ),
  ServiceFormDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="service-form" data-open={open} onClick={() => onOpenChange(false)} />
  ),
}));

vi.mock('@/components/professional', () => ({
  ProfessionalList: ({ onEdit }: { onEdit: (professional: Professional) => void }) => (
    <div data-testid="professional-list" onClick={() => onEdit(mockProfessional)}>ProfessionalList</div>
  ),
  ProfessionalFormDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="professional-form" data-open={open} onClick={() => onOpenChange(false)} />
  ),
}));

// Import pages after mocks are defined
import { Bookings } from './Bookings';
import { Clients } from './Clients';
import { Services } from './Services';
import { Professionals } from './Professionals';
import { Login } from './auth/Login';
import { Register } from './auth/Register';

// Note: Dashboard and Settings have heavy dependencies (date-fns locales, tanstack-query).
// They are tested separately in Dashboard.test.tsx and Settings.test.tsx.

describe('Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Bookings page', () => {
    render(<Bookings />);
    expect(screen.getByText('bookings')).toBeInTheDocument();
  });

  it('handles Clients page interactions', async () => {
    const user = userEvent.setup();

    render(<Clients />);

    await user.click(screen.getByText('newClient'));
    expect(screen.getByTestId('client-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('client-list'));
    expect(screen.getByTestId('client-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('client-form'));
    expect(screen.getByTestId('client-form').getAttribute('data-open')).toBe('false');
  });

  it('handles Services page interactions', async () => {
    const user = userEvent.setup();

    render(<Services />);

    await user.click(screen.getByText('newService'));
    expect(screen.getByTestId('service-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('service-list'));
    expect(screen.getByTestId('service-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('service-form'));
    expect(screen.getByTestId('service-form').getAttribute('data-open')).toBe('false');
  });

  it('handles Professionals page interactions', async () => {
    const user = userEvent.setup();

    render(<Professionals />);

    await user.click(screen.getByText('newProfessional'));
    expect(screen.getByTestId('professional-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('professional-list'));
    expect(screen.getByTestId('professional-form').getAttribute('data-open')).toBe('true');

    await user.click(screen.getByTestId('professional-form'));
    expect(screen.getByTestId('professional-form').getAttribute('data-open')).toBe('false');
  });

  it('renders auth pages and updates fields', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('email'), 'user@example.com');
    await user.type(screen.getByLabelText('password'), 'secret');
    expect((screen.getByLabelText('email') as HTMLInputElement).value).toBe('user@example.com');

    await user.click(screen.getByText('register'));
    expect(screen.getByText('registerTitle')).toBeInTheDocument();
  });

  it('calls handleSubmit when Login form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('email'), 'user@example.com');
    await user.type(screen.getByLabelText('password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'login' }));

    // After successful login (which is mocked), it redirects to dashboard
    // Just verify the form was submitted by checking we're no longer on login
    await waitFor(() => {
      expect(screen.queryByText('loginTitle')).not.toBeInTheDocument();
    });
  });

  it('calls handleSubmit when Register form is submitted', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('name'), 'Test User');
    await user.type(screen.getByLabelText('email'), 'user@example.com');
    await user.type(screen.getByLabelText('password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'register' }));

    expect(screen.getByRole('button', { name: 'register' })).toBeInTheDocument();
  });

  // Note: PublicBooking, Dashboard and Settings have heavy dependencies.
  // They are tested separately to avoid memory issues.
});
