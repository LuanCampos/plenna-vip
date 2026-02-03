import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfessionalFormDialog } from './ProfessionalFormDialog';
import type { ProfessionalWithServices } from '@/types/professional';
import {
  MOCK_TENANT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_SERVICE_ID,
  MOCK_LANGUAGE_CONTEXT,
} from '@/test/mocks';

// Use vi.hoisted to ensure mocks are available when vi.mock is hoisted
const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { id: MOCK_TENANT_ID } }),
}));

vi.mock('@/hooks/useProfessionals', () => ({
  useCreateProfessional: () => ({ mutateAsync: mockCreate, isPending: false }),
  useUpdateProfessional: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

vi.mock('@/hooks/useServices', () => ({
  useActiveServices: () => ({ data: [{ id: MOCK_SERVICE_ID, name: 'Corte' }] }),
}));

const mockLoggerError = vi.fn();
vi.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) },
}));

describe('ProfessionalFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: MOCK_PROFESSIONAL_ID });
    mockUpdate.mockResolvedValue({ id: MOCK_PROFESSIONAL_ID });
  });

  it('creates a professional with selected services', async () => {
    const user = userEvent.setup();

    render(<ProfessionalFormDialog open onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText('professionalName *'), 'Joao');
    await user.type(screen.getByLabelText('email'), 'joao@example.com');
    await user.type(screen.getByLabelText('clientPhone'), '11999999999');
    await user.click(screen.getByText('Corte'));

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        tenant_id: MOCK_TENANT_ID,
        name: 'Joao',
        email: 'joao@example.com',
        phone: '11999999999',
        active: true,
        service_ids: [MOCK_SERVICE_ID],
      });
    });
  });

  it('updates a professional when editing', async () => {
    const user = userEvent.setup();
    const professional: ProfessionalWithServices = {
      id: MOCK_PROFESSIONAL_ID,
      tenant_id: MOCK_TENANT_ID,
      name: 'Maria',
      email: 'maria@example.com',
      phone: '11888888888',
      avatar_url: undefined,
      active: true,
      created_at: '',
      updated_at: '',
      services: [],
      service_ids: [MOCK_SERVICE_ID],
    };

    render(<ProfessionalFormDialog open professional={professional} onOpenChange={vi.fn()} />);

    const nameInput = screen.getByLabelText('professionalName *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Maria Silva');

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        professionalId: MOCK_PROFESSIONAL_ID,
        data: {
          name: 'Maria Silva',
          email: 'maria@example.com',
          phone: '11888888888',
          active: true,
          service_ids: [MOCK_SERVICE_ID],
        },
      });
    });
  });

  it('clears field error when user types in that field', async () => {
    const user = userEvent.setup();

    render(<ProfessionalFormDialog open onOpenChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(screen.getByText('nameTooShort')).toBeInTheDocument());

    await user.type(screen.getByLabelText('professionalName *'), 'Joao');
    await waitFor(() => expect(screen.queryByText('nameTooShort')).not.toBeInTheDocument());
  });

  it('calls logger.error when create fails with non-Zod error', async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValue(new Error('Network error'));

    render(<ProfessionalFormDialog open onOpenChange={vi.fn()} />);
    await user.type(screen.getByLabelText('professionalName *'), 'Joao');
    await user.type(screen.getByLabelText('email'), 'joao@example.com');
    await user.type(screen.getByLabelText('clientPhone'), '11999999999');
    await user.click(screen.getByText('Corte'));
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith('ProfessionalFormDialog.submit.failed', expect.any(Object));
    });
  });

  it('shows validation errors when data is invalid', async () => {
    const user = userEvent.setup();

    render(<ProfessionalFormDialog open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(screen.getByText('nameTooShort')).toBeInTheDocument();
    });
  });
});
