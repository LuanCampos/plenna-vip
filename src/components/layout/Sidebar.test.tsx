import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('Sidebar', () => {
  it('toggles mobile menu and renders navigation links', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: 'menu' });
    await user.click(toggle);

    const sidebar = document.querySelector('aside');
    expect(sidebar?.className.includes('-translate-x-full')).toBe(false);
    expect(screen.getByText('dashboard')).toBeInTheDocument();
    expect(screen.getByText('clients')).toBeInTheDocument();
  });

  it('highlights settings link when on /settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Sidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('settings')).toBeInTheDocument();
  });
});
