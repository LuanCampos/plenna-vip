import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('ConfirmDialog', () => {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes confirm and close handlers', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Delete"
        description="Confirm delete"
      />
    );

    await user.click(screen.getByRole('button', { name: 'confirm' }));
    expect(onConfirm).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prevents closing while loading', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open
        loading
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        title="Delete"
        description="Confirm delete"
      />
    );

    await user.click(screen.getByRole('button', { name: 'cancel' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
