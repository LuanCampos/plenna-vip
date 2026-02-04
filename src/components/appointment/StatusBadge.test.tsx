/**
 * Tests for StatusBadge component.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { APPOINTMENT_STATUSES } from '@/test/mocks';

// Mock LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

describe('StatusBadge', () => {
  it.each(APPOINTMENT_STATUSES)('should render badge for status: %s', (status) => {
    render(<StatusBadge status={status} />);

    // Should show translated status key
    const expectedKey = {
      scheduled: 'statusScheduled',
      confirmed: 'statusConfirmed',
      completed: 'statusCompleted',
      cancelled: 'statusCancelled',
      no_show: 'statusNoShow',
    }[status];

    expect(screen.getByText(expectedKey)).toBeInTheDocument();
  });

  it('should apply correct colors for scheduled status', () => {
    const { container } = render(<StatusBadge status="scheduled" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('bg-blue');
    expect(badge.className).toContain('text-blue');
  });

  it('should apply correct colors for confirmed status', () => {
    const { container } = render(<StatusBadge status="confirmed" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('bg-green');
    expect(badge.className).toContain('text-green');
  });

  it('should apply correct colors for cancelled status', () => {
    const { container } = render(<StatusBadge status="cancelled" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('bg-red');
    expect(badge.className).toContain('text-red');
  });

  it('should render small size', () => {
    const { container } = render(<StatusBadge status="scheduled" size="sm" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('text-xs');
    expect(badge.className).toContain('px-1.5');
  });

  it('should render large size', () => {
    const { container } = render(<StatusBadge status="scheduled" size="lg" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('text-sm');
    expect(badge.className).toContain('px-3');
  });

  it('should apply custom className', () => {
    const { container } = render(<StatusBadge status="scheduled" className="my-custom-class" />);
    const badge = container.firstChild as HTMLElement;

    expect(badge.className).toContain('my-custom-class');
  });
});
