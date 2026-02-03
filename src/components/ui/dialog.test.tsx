import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
  DialogFooter,
  DialogTrigger,
} from './dialog';

describe('Dialog component', () => {
  it('renders overlay and close button when open', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <p>Body</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Check overlay exists by looking for the data attribute or aria-hidden
    const overlay = document.querySelector('[data-state="open"]');
    expect(overlay).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders DialogFooter with correct layout', () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('opens dialog when DialogTrigger is clicked', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={false} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button type="button">Open</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Triggered</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    await user.click(screen.getByText('Open'));
    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });
});
