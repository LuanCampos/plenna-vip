import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from './PublicLayout';
import { MOCK_LANGUAGE_CONTEXT } from '@/test/mocks';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => MOCK_LANGUAGE_CONTEXT,
}));

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
