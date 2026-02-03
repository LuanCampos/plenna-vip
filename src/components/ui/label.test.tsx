import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('forwards props and renders text', () => {
    render(<Label htmlFor="input-id" className="custom">Name</Label>);

    const label = screen.getByText('Name');
    expect(label).toHaveAttribute('for', 'input-id');
    expect(label.className).toContain('custom');
    expect(label.className).toContain('font-medium');
  });
});
