import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonList } from './skeleton';

describe('Skeleton components', () => {
  it('renders base skeleton with custom class', () => {
    render(<Skeleton data-testid="skeleton" className="h-6" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton.className).toContain('h-6');
  });

  it('renders skeleton card pattern', () => {
    render(<SkeletonCard />);

    const items = document.querySelectorAll('.animate-pulse');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('renders list with provided count', () => {
    render(<SkeletonList count={2} />);

    const items = document.querySelectorAll('.animate-pulse');
    expect(items).toHaveLength(2);
  });
});
