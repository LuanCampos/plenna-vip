/**
 * Tests for ServiceList component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiceList } from './ServiceList';
import { 
  MOCK_SERVICE_ENTITY, 
  MOCK_SERVICE_ENTITY_2,
  MOCK_TENANT_CONTEXT,
  MOCK_LANGUAGE_CONTEXT,
} from '@/test/mocks';
import type { Service } from '@/types/service';

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

// Mock useServices and useDeleteService hooks
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/useServices', () => ({
  useServices: vi.fn(),
  useDeleteService: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useServices } from '@/hooks/useServices';

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

describe('ServiceList', () => {
  const mockOnEdit = vi.fn();
  const mockServices: Service[] = [
    { ...MOCK_SERVICE_ENTITY } as unknown as Service,
    { ...MOCK_SERVICE_ENTITY_2 } as unknown as Service,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loading skeletons', () => {
      vi.mocked(useServices).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useServices>);

      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Should render skeleton items
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('should render error message', () => {
      vi.mocked(useServices).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as ReturnType<typeof useServices>);

      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('errorLoading')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when no services', () => {
      vi.mocked(useServices).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useServices>);

      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('noServices')).toBeInTheDocument();
    });
  });

  describe('with services', () => {
    beforeEach(() => {
      vi.mocked(useServices).mockReturnValue({
        data: mockServices,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useServices>);
    });

    it('should render service list', () => {
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('Corte Masculino')).toBeInTheDocument();
      expect(screen.getByText('Barba')).toBeInTheDocument();
    });

    it('should display service price', () => {
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Price is formatted with comma and split across elements
      const priceElements = screen.getAllByText((_content, element) => {
        return element?.textContent?.includes('R$ 50,00') ?? false;
      });
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should display service duration', () => {
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('30 min')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const editButtons = screen.getAllByRole('button', { name: 'edit' });
      await user.click(editButtons[0]!);

      expect(mockOnEdit).toHaveBeenCalledWith(mockServices[0]);
    });

    it('should open delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // ConfirmDialog should be open
      expect(screen.getByText('deleteTitle')).toBeInTheDocument();
    });

    it('should close delete confirmation without confirming', async () => {
      const user = userEvent.setup();
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);
      expect(screen.getByText('deleteTitle')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'cancel' }));
      expect(screen.queryByText('deleteTitle')).not.toBeInTheDocument();
    });

    it('should call delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: 'confirm' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockServices[0]!.id);
      });
    });

    it('should show inactive badge for inactive service', () => {
      const inactiveService = { ...MOCK_SERVICE_ENTITY, active: false } as unknown as Service;
      vi.mocked(useServices).mockReturnValue({
        data: [inactiveService],
        isLoading: false,
        error: null,
      } as ReturnType<typeof useServices>);

      render(<ServiceList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });
  });
});
