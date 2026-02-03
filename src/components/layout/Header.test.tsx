import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';

const setLanguage = vi.fn();
const setTheme = vi.fn();
const useThemeMock = vi.hoisted(() => vi.fn());

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage,
  }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => useThemeMock(),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ currentTenant: { name: 'Tenant X' } }),
}));

describe('Header', () => {
  beforeEach(() => {
    useThemeMock.mockReturnValue({
      theme: 'light' as const,
      setTheme,
      resolvedTheme: 'light' as const,
    });
  });

  it('renders tenant name and toggles language/theme', async () => {
    const user = userEvent.setup();

    render(<Header />);

    expect(screen.getByText('Tenant X')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'changeLanguage' }));
    expect(setLanguage).toHaveBeenCalledWith('en');

    await user.click(screen.getByRole('button', { name: 'changeTheme' }));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('renders Sun icon when theme is dark', () => {
    useThemeMock.mockReturnValue({
      theme: 'dark' as const,
      setTheme,
      resolvedTheme: 'dark' as const,
    });

    render(<Header />);
    expect(screen.getByRole('button', { name: 'changeTheme' })).toBeInTheDocument();
  });
});
