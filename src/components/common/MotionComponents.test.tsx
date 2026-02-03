import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from './GlassCard';
import { MotionDiv } from './MotionDiv';
import { MotionList, MotionListItem } from './MotionList';

// Mock framer-motion to expose motion props as data attributes for assertions
vi.mock('framer-motion', () => {
  const MotionDivMock = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
    ({ children, transition, initial, animate, variants, ...domProps }, ref) => {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          data-initial={initial !== undefined ? String(initial) : ''}
          data-animate={animate !== undefined ? String(animate) : ''}
          data-variants={variants ? 'variants' : ''}
          data-delay={typeof transition === 'object' && transition && 'delay' in transition ? String(transition.delay) : ''}
          {...domProps}
        >
          {children as React.ReactNode}
        </div>
      );
    }
  );

  return {
    motion: {
      div: MotionDivMock,
    },
  };
});

vi.mock('@/lib/motion', () => ({
  motionFadeInUp: { initial: 'hidden', animate: 'visible' },
  staggerContainer: {},
  listItem: {},
}));

describe('Motion components', () => {
  it('GlassCard renders content and hover state by default', () => {
    render(<GlassCard>content</GlassCard>);

    const card = screen.getByText('content');
    expect(card).toHaveClass('glass');
    expect(card.className).toContain('hover-lift');
  });

  it('GlassCard can disable hover effect', () => {
    render(<GlassCard hover={false}>no-hover</GlassCard>);

    const card = screen.getByText('no-hover');
    expect(card.className).not.toContain('hover-lift');
  });

  it('MotionDiv applies delay and animation props', () => {
    render(<MotionDiv delay={0.3}>animated</MotionDiv>);

    const element = screen.getByText('animated');
    expect(element.getAttribute('data-delay')).toBe('0.3');
    expect(element.getAttribute('data-initial')).toBe('hidden');
    expect(element.getAttribute('data-animate')).toBe('visible');
  });

  it('MotionList and MotionListItem render content correctly', () => {
    render(
      <MotionList data-testid="motion-list">
        <MotionListItem data-testid="motion-item">item</MotionListItem>
      </MotionList>
    );

    // Verify content is rendered
    expect(screen.getByText('item')).toBeInTheDocument();
    expect(screen.getByTestId('motion-list')).toBeInTheDocument();
    expect(screen.getByTestId('motion-item')).toBeInTheDocument();
  });
});
