import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from './PublicLayout';

describe('PublicLayout', () => {
  it('wraps children inside container', () => {
    render(
      <PublicLayout>
        <p>child</p>
      </PublicLayout>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByText('child').closest('main')).toBeInTheDocument();
  });
});
