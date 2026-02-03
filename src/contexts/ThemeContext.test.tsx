import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';

// Use vi.hoisted to ensure mocks are defined before vi.mock hoisting
const { setSecureStorageItem, getSecureStorageItem } = vi.hoisted(() => ({
  setSecureStorageItem: vi.fn(),
  getSecureStorageItem: vi.fn(),
}));

vi.mock('@/lib/storage/secureStorage', () => ({
  setSecureStorageItem,
  getSecureStorageItem,
}));

const ThemeConsumer = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('dark')}>dark</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    getSecureStorageItem.mockReturnValue('system');
    document.documentElement.className = '';
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      media: '(prefers-color-scheme: dark)',
      onchange: null,
    });
    vi.clearAllMocks();
  });

  it('uses system preference when stored theme is system', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('persists and applies selected theme', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByText('light'));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(setSecureStorageItem).toHaveBeenCalledWith('plenna-theme', 'light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('uses dark theme when stored value is dark', () => {
    getSecureStorageItem.mockReturnValue('dark');
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      media: '(prefers-color-scheme: dark)',
      onchange: null,
    });

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const Consumer = () => {
      useTheme();
      return null;
    };
    expect(() => render(<Consumer />)).toThrow('useTheme must be used within a ThemeProvider');
  });
});
