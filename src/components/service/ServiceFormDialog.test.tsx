import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceFormDialog } from './ServiceFormDialog';
import type { Service } from '@/types/service';
import {
  MOCK_TENANT_ID,
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

vi.mock('@/hooks/useServices', () => ({
  useCreateService: () => ({ mutateAsync: mockCreate, isPending: false }),
  useUpdateService: () => ({ mutateAsync: mockUpdate, isPending: false }),
}));

const mockLoggerError = vi.fn();
vi.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => mockLoggerError(...args) },
}));

describe('ServiceFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ id: MOCK_SERVICE_ID });
    mockUpdate.mockResolvedValue({ id: MOCK_SERVICE_ID });
  });

  it('creates a service with valid data', async () => {
    const user = userEvent.setup();

    render(<ServiceFormDialog open onOpenChange={vi.fn()} />);

    await user.type(screen.getByLabelText('serviceName *'), 'Corte');
    
    // For price, we need to work with the controlled input behavior
    // The field shows formatted value (e.g., "0,00") and parses input
    // Just type additional digits to get a valid price (initial is 0)
    const priceInput = screen.getByLabelText('servicePrice *');
    await user.click(priceInput);
    // Type 50 which will be interpreted as adding to 0,00 -> results in 50.00
    await user.type(priceInput, '50');
    
    const durationInput = screen.getByLabelText('serviceDuration *');
    await user.click(durationInput);
    await user.type(durationInput, '0'); // Initial is 3, typing 0 makes 30

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: MOCK_TENANT_ID,
          name: 'Corte',
          active: true,
        })
      );
      // Verify price and duration are valid numbers
      const callArgs = mockCreate.mock.calls[0]?.[0];
      expect(callArgs?.price).toBeGreaterThan(0);
      expect(callArgs?.duration).toBeGreaterThan(0);
    });
  });

  it('updates an existing service', async () => {
    const user = userEvent.setup();
    const service: Service = {
      id: MOCK_SERVICE_ID,
      tenant_id: MOCK_TENANT_ID,
      name: 'Old',
      description: 'desc',
      price: 20,
      duration: 20,
      active: true,
      created_at: '',
      updated_at: '',
      deleted_at: undefined,
    };

    render(<ServiceFormDialog open service={service} onOpenChange={vi.fn()} />);

    await user.clear(screen.getByLabelText('serviceName *'));
    await user.type(screen.getByLabelText('serviceName *'), 'Novo');

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        serviceId: MOCK_SERVICE_ID,
        data: {
          name: 'Novo',
          description: 'desc',
          price: 20,
          duration: 20,
          active: true,
        },
      });
    });
  });

  it('clears field error when user types in that field', async () => {
    const user = userEvent.setup();

    render(<ServiceFormDialog open onOpenChange={vi.fn()} />);
    const durationInput = screen.getByLabelText('serviceDuration *');
    await user.clear(durationInput);
    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(screen.getByText('nameTooShort')).toBeInTheDocument());

    await user.type(screen.getByLabelText('serviceName *'), 'Corte');
    await waitFor(() => expect(screen.queryByText('nameTooShort')).not.toBeInTheDocument());
  });

  it('calls logger.error when create fails with non-Zod error', async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValue(new Error('Network error'));

    render(<ServiceFormDialog open onOpenChange={vi.fn()} />);
    await user.type(screen.getByLabelText('serviceName *'), 'Corte');
    const priceInput = screen.getByLabelText('servicePrice *');
    await user.click(priceInput);
    await user.type(priceInput, '50');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mockLoggerError).toHaveBeenCalledWith('ServiceFormDialog.submit.failed', expect.any(Object));
    });
  });

  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup();

    render(<ServiceFormDialog open onOpenChange={vi.fn()} />);

    // Clear duration to trigger validation error (price 0 is valid, duration needs >= 1)
    const durationInput = screen.getByLabelText('serviceDuration *');
    await user.clear(durationInput);

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(screen.getByText('nameTooShort')).toBeInTheDocument();
      expect(screen.getByText('durationMustBePositive')).toBeInTheDocument();
    });
  });
});
