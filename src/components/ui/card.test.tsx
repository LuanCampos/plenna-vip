import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './card';

describe('Card UI component', () => {
  it('renders card structure with provided children', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('border', 'bg-card');
    expect(screen.getByText('Title')).toHaveClass('text-2xl');
    expect(screen.getByText('Description')).toHaveClass('text-sm');
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
