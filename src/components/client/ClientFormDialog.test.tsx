import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientFormDialog } from './ClientFormDialog';
import type { Client } from '@/types/client';
import {
  MOCK_TENANT_ID,
  MOCK_CLIENT_ID,
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

vi.mock('@/hooks/useClients', () => ({
  useCreateClient: () => ({ mutateAsync: mockCreate, isPending: false }),
  useUpdateClient: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

const mockLoggerError = vi.fn();
vi.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) },
}));

describe('ClientFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: MOCK_CLIENT_ID });
    mockUpdate.mockResolvedValue({ id: MOCK_CLIENT_ID });
  });

  it('creates a new client when form is valid', async () => {
    const user = userEvent.setup();

    render(
      <ClientFormDialog open onOpenChange={vi.fn()} />
    );

    // Type in the form fields
    const nameInput = screen.getByLabelText('clientName *');
    const phoneInput = screen.getByLabelText('clientPhone *');
    const emailInput = screen.getByLabelText('clientEmail');
    
    await user.type(nameInput, 'Ana');
    await user.type(phoneInput, '11999999999');
    await user.type(emailInput, 'ana@example.com');
    
    // Verify the values are set before clicking save
    expect(nameInput).toHaveValue('Ana');
    expect(phoneInput).toHaveValue('11999999999');
    expect(emailInput).toHaveValue('ana@example.com');

    // Click save button
    const saveButton = screen.getByRole('button', { name: 'save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        tenant_id: MOCK_TENANT_ID,
        name: 'Ana',
        phone: '11999999999',
        email: 'ana@example.com',
        notes: undefined,
      });
    }, { timeout: 3000 });
  });

  it('updates an existing client', async () => {
    const user = userEvent.setup();
    const client: Client = {
      id: MOCK_CLIENT_ID,
      tenant_id: MOCK_TENANT_ID,
      name: 'Original',
      phone: '11999999999',
      email: 'old@example.com',
      notes: '',
      created_at: '',
      updated_at: '',
      deleted_at: undefined,
    };

    render(
      <ClientFormDialog open client={client} onOpenChange={vi.fn()} />
    );

    const nameInput = screen.getByLabelText('clientName *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated');

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        clientId: MOCK_CLIENT_ID,
        data: {
          name: 'Updated',
          phone: '11999999999',
          email: 'old@example.com',
          notes: undefined,
        },
      });
    });
  });

  it('clears field error when user types in that field', async () => {
    const user = userEvent.setup();

    render(<ClientFormDialog open onOpenChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(screen.getByText('nameTooShort')).toBeInTheDocument());

    await user.type(screen.getByLabelText('clientName *'), 'Ana');
    await waitFor(() => expect(screen.queryByText('nameTooShort')).not.toBeInTheDocument());
  });

  it('calls logger.error when create fails with non-Zod error', async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValue(new Error('Network error'));

    render(<ClientFormDialog open onOpenChange={vi.fn()} />);
    await user.type(screen.getByLabelText('clientName *'), 'Ana');
    await user.type(screen.getByLabelText('clientPhone *'), '11999999999');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith('ClientFormDialog.submit.failed', expect.any(Object));
    });
  });

  it('shows validation errors from schema', async () => {
    const user = userEvent.setup();

    render(
      <ClientFormDialog open onOpenChange={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(screen.getByText('nameTooShort')).toBeInTheDocument();
      expect(screen.getByText('invalidPhone')).toBeInTheDocument();
    });
  });
});
