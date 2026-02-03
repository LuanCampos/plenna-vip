import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantProvider, useTenant } from './TenantContext';
import { MOCK_TENANT } from '@/test/mocks';

const TenantConsumer = () => {
  const { currentTenant, setCurrentTenant, loading } = useTenant();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="tenant-name">{currentTenant?.name ?? 'none'}</span>
      <button onClick={() => setCurrentTenant(MOCK_TENANT)}>set</button>
      <button onClick={() => setCurrentTenant(null)}>clear</button>
    </div>
  );
};

describe('TenantContext', () => {
  it('auto-sets dev tenant in development mode and supports manual override', async () => {
    const user = userEvent.setup();

    render(
      <TenantProvider>
        <TenantConsumer />
      </TenantProvider>
    );

    // In dev mode, it auto-sets the dev tenant
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
    
    // Should have dev tenant auto-set (Salão Demo)
    await waitFor(() => {
      expect(screen.getByTestId('tenant-name')).toHaveTextContent('Salão Demo');
    });

    // Manual override with custom tenant
    await user.click(screen.getByText('set'));
    expect(screen.getByTestId('tenant-name')).toHaveTextContent(MOCK_TENANT.name);

    // Clear should work
    await user.click(screen.getByText('clear'));
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('none');
  });

  it('throws when useTenant is used outside TenantProvider', () => {
    const Consumer = () => {
      useTenant();
      return null;
    };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Consumer />)).toThrow('useTenant must be used within a TenantProvider');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
