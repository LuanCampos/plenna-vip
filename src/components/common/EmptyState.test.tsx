import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';
import type { PropsWithChildren } from 'react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/lib/motion', () => ({
  motionFadeInUp: {},
}));

describe('EmptyState', () => {
  it('renders icon, text, and optional action', () => {
    const onAction = vi.fn();

    render(
      <EmptyState
        icon={Inbox}
        title="No data"
        description="Nothing to see here"
        actionLabel="Add"
        onAction={onAction}
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Nothing to see here')).toBeInTheDocument();
    const actionButton = screen.getByRole('button', { name: 'Add' });
    expect(actionButton).toBeInTheDocument();

    actionButton.click();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
