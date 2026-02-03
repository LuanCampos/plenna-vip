/**
 * Tests for ProfessionalList component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfessionalList } from './ProfessionalList';
import { 
  MOCK_PROFESSIONAL_ENTITY, 
  MOCK_PROFESSIONAL_ENTITY_2,
  MOCK_TENANT_CONTEXT,
  MOCK_LANGUAGE_CONTEXT,
  MOCK_SERVICE_ENTITY,
} from '@/test/mocks';
import type { ProfessionalWithServices } from '@/types/professional';

// Mock contexts
vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => MOCK_TENANT_CONTEXT,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

// Mock useProfessionalsWithServices and useDeleteProfessional hooks
const mockMutateAsync = vi.fn();
vi.mock('@/hooks/useProfessionals', () => ({
  useProfessionalsWithServices: vi.fn(),
  useDeleteProfessional: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

import { useProfessionalsWithServices } from '@/hooks/useProfessionals';

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

describe('ProfessionalList', () => {
  const mockOnEdit = vi.fn();
  const mockProfessionals: ProfessionalWithServices[] = [
    { ...MOCK_PROFESSIONAL_ENTITY, services: [MOCK_SERVICE_ENTITY] } as unknown as ProfessionalWithServices,
    { ...MOCK_PROFESSIONAL_ENTITY_2, services: [] } as unknown as ProfessionalWithServices,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render loading skeletons', () => {
      vi.mocked(useProfessionalsWithServices).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as ReturnType<typeof useProfessionalsWithServices>);

      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Should render skeleton items
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('should render error message', () => {
      vi.mocked(useProfessionalsWithServices).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      } as ReturnType<typeof useProfessionalsWithServices>);

      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('errorLoading')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should render empty state when no professionals', () => {
      vi.mocked(useProfessionalsWithServices).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useProfessionalsWithServices>);

      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('noProfessionals')).toBeInTheDocument();
    });
  });

  describe('with professionals', () => {
    beforeEach(() => {
      vi.mocked(useProfessionalsWithServices).mockReturnValue({
        data: mockProfessionals,
        isLoading: false,
        error: null,
      } as ReturnType<typeof useProfessionalsWithServices>);
    });

    it('should render professional list', () => {
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Ana Santos')).toBeInTheDocument();
    });

    it('should display professional phone', () => {
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('11999999999')).toBeInTheDocument();
    });

    it('should display professional email', () => {
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const editButtons = screen.getAllByRole('button', { name: 'edit' });
      await user.click(editButtons[0]!);

      expect(mockOnEdit).toHaveBeenCalledWith(mockProfessionals[0]);
    });

    it('should open delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // ConfirmDialog should be open
      expect(screen.getByText('deleteTitle')).toBeInTheDocument();
    });

    it('should call delete mutation when confirmed', async () => {
      const user = userEvent.setup();
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
      await user.click(deleteButtons[0]!);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: 'confirm' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(mockProfessionals[0]!.id);
      });
    });

    it('should show inactive badge for inactive professional', () => {
      const inactiveProfessional = { 
        ...MOCK_PROFESSIONAL_ENTITY, 
        active: false, 
        services: [] 
      } as unknown as ProfessionalWithServices;
      
      vi.mocked(useProfessionalsWithServices).mockReturnValue({
        data: [inactiveProfessional],
        isLoading: false,
        error: null,
      } as ReturnType<typeof useProfessionalsWithServices>);

      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('should display associated services', () => {
      render(<ProfessionalList onEdit={mockOnEdit} />, { wrapper: createWrapper() });

      // First professional has 'Corte Masculino' service
      expect(screen.getByText('Corte Masculino')).toBeInTheDocument();
    });
  });
});
