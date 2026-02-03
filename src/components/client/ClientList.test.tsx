/**
 * Tests for ClientList component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientList } from './ClientList';
import { 
  MOCK_CLIENT_ENTITY, 
  MOCK_CLIENT_ENTITY_2,
  MOCK_TENANT_CONTEXT,
  MOCK_LANGUAGE_CONTEXT,
} from '@/test/mocks';
import type { Client } from '@/types/client';

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

// Mock useClients and useDeleteClient hooks
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/useClients', () => ({
  useClients: vi.fn(),
  useDeleteClient: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useClients } from '@/hooks/useClients';

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ClientList', () => {
  const mockOnEdit = vi.fn();
  const mockOnView = vi.fn();
  const mockClients: Client[] = [
    { ...MOCK_CLIENT_ENTITY } as unknown as Client,
    { ...MOCK_CLIENT_ENTITY_2 } as unknown as Client,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loading skeletons', () => {
      vi.mocked(useClients).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useClients>);

      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Should render 3 skeleton items
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('should render error message', () => {
      vi.mocked(useClients).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as ReturnType<typeof useClients>);

      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('errorLoading')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when no clients', () => {
      vi.mocked(useClients).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useClients>);

      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('noClients')).toBeInTheDocument();
    });
  });

  describe('with clients', () => {
    beforeEach(() => {
      vi.mocked(useClients).mockReturnValue({
        data: mockClients,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useClients>);
    });

    it('should render client list', () => {
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('search');
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter clients by name', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('search');
      await user.type(searchInput, 'Maria');

      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.queryByText('João Santos')).not.toBeInTheDocument();
    });

    it('should filter clients by phone', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('search');
      await user.type(searchInput, '888888');

      expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument();
      expect(screen.getByText('João Santos')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const editButtons = screen.getAllByRole('button', { name: 'edit' });
      await user.click(editButtons[0]!);

      expect(mockOnEdit).toHaveBeenCalledWith(mockClients[0]);
    });

    it('should call onView when client row is clicked (if onView provided)', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} onView={mockOnView} />, { wrapper: createWrapper() });

      const clientButton = screen.getByText('Maria Silva').closest('button');
      await user.click(clientButton!);

      expect(mockOnView).toHaveBeenCalledWith(mockClients[0]);
    });

    it('should call onEdit when client row is clicked (if onView not provided)', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const clientButton = screen.getByText('Maria Silva').closest('button');
      await user.click(clientButton!);

      expect(mockOnEdit).toHaveBeenCalledWith(mockClients[0]);
    });

    it('should open delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // ConfirmDialog should be open
      expect(screen.getByText('deleteTitle')).toBeInTheDocument();
    });

    it('should call delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: 'confirm' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockClients[0]!.id);
      });
    });

    it('should display client email when available', () => {
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    });

    it('should display client phone', () => {
      render(<ClientList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('11999999999')).toBeInTheDocument();
    });
  });
});
