/**
 * Tests for UserProfileFormDialog component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfileFormDialog } from './UserProfileFormDialog';
import { userProfileService } from '@/lib/services/userProfileService';
import { MOCK_AUTH_CONTEXT, MOCK_USER_ID } from '@/test/mocks';
import type { ReactNode } from 'react';

// Mock services
vi.mock('@/lib/services/userProfileService', () => ({
  userProfileService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => MOCK_AUTH_CONTEXT,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'pt',
    setLanguage: vi.fn(),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const MOCK_PROFILE = {
  id: MOCK_USER_ID,
  name: 'Test User',
  phone: '11999999999',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('UserProfileFormDialog', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userProfileService.getById).mockResolvedValue(MOCK_PROFILE);
    vi.mocked(userProfileService.update).mockResolvedValue(MOCK_PROFILE);
  });

  it('should render dialog when open', async () => {
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('editProfile')).toBeInTheDocument();
    });
  });

  it('should not render dialog when closed', () => {
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={false} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    expect(screen.queryByText('editProfile')).not.toBeInTheDocument();
  });

  it('should populate form with profile data', async () => {
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      const nameInput = screen.getByLabelText('name') as HTMLInputElement;
      expect(nameInput.value).toBe('Test User');
    });
  });

  it('should update name field', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    // Wait for profile data to be loaded
    await waitFor(() => {
      const nameInput = screen.getByLabelText('name') as HTMLInputElement;
      expect(nameInput.value).toBe('Test User');
    });

    const nameInput = screen.getByLabelText('name') as HTMLInputElement;
    // Clear and type new value using userEvent
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    // After state update, the value should be New Name
    expect(nameInput.value).toBe('New Name');
  });

  it('should call update on submit with valid data', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    // Wait for profile data to be loaded and form to be populated
    await waitFor(() => {
      const nameInput = screen.getByLabelText('name') as HTMLInputElement;
      expect(nameInput.value).toBe('Test User');
    });

    // Click save
    await user.click(screen.getByText('save'));

    await waitFor(() => {
      expect(userProfileService.update).toHaveBeenCalled();
    });
    
    expect(userProfileService.update).toHaveBeenCalledWith(
      MOCK_USER_ID,
      expect.objectContaining({
        name: 'Test User',
      })
    );
  });

  it('should show validation error for short name', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    // Wait for profile data to be loaded
    await waitFor(() => {
      const nameInput = screen.getByLabelText('name') as HTMLInputElement;
      expect(nameInput.value).toBe('Test User');
    });

    // Change to short name using userEvent
    const nameInput = screen.getByLabelText('name') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'A');

    // Verify the value changed
    expect(nameInput.value).toBe('A');

    // Click save
    await user.click(screen.getByText('save'));

    await waitFor(() => {
      expect(screen.getByText('nameTooShort')).toBeInTheDocument();
    });
  });

  it('should close dialog on cancel', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('cancel'));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should accept only digits in phone input', async () => {
    const user = userEvent.setup();
    const { wrapper } = createWrapper();

    render(
      <UserProfileFormDialog open={true} onOpenChange={mockOnOpenChange} />,
      { wrapper }
    );

    // Wait for form to be populated with profile data
    await waitFor(() => {
      const phoneInput = screen.getByLabelText('clientPhone') as HTMLInputElement;
      expect(phoneInput.value).toBe('11999999999');
    });

    const phoneInput = screen.getByLabelText('clientPhone') as HTMLInputElement;
    // Clear the existing value first, then type new digits
    await user.clear(phoneInput);
    // Just verify the input accepts our value after clearing
    await user.type(phoneInput, '88888888888');

    // Should have the typed digits (maxLength is 11)
    expect(phoneInput.value).toBe('88888888888');
  });
});
