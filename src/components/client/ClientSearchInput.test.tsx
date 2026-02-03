import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientSearchInput } from './ClientSearchInput';
import type { Client } from '@/types/client';

const mockUseClientSearch = vi.fn();

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClientSearch: (query: string) => mockUseClientSearch(query),
}));

describe('ClientSearchInput', () => {
  const client: Client = {
    id: 'client-1',
    tenant_id: 'tenant-1',
    name: 'Ana',
    phone: '11999999999',
    email: 'ana@example.com',
    notes: '',
    created_at: '',
    updated_at: '',
    deleted_at: undefined,
  };

  beforeEach(() => {
    mockUseClientSearch.mockImplementation((query: string) => ({
      data: query.length >= 2 ? [client] : [],
      isLoading: false,
    }));
  });

  it('shows results dropdown and triggers onSelect', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(<ClientSearchInput onSelect={handleSelect} />);

    await user.type(screen.getByPlaceholderText('search'), 'an');

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByText('Ana'));

    expect(handleSelect).toHaveBeenCalledWith(client);
    expect((screen.getByPlaceholderText('search') as HTMLInputElement).value).toBe('');
  });

  it('shows loading indicator while fetching', async () => {
    const user = userEvent.setup();
    mockUseClientSearch.mockImplementation((query: string) => ({
      data: [],
      isLoading: query === 'lo',
    }));

    render(<ClientSearchInput onSelect={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('search'), 'lo');

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no clients found', async () => {
    const user = userEvent.setup();
    mockUseClientSearch.mockImplementation(() => ({ data: [], isLoading: false }));

    render(<ClientSearchInput onSelect={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('search'), 'zz');

    expect(await screen.findByText('noClients')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ClientSearchInput onSelect={vi.fn()} />
        <div data-testid="outside">Outside</div>
      </div>
    );
    await user.type(screen.getByPlaceholderText('search'), 'an');
    expect(await screen.findByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
  });
});
