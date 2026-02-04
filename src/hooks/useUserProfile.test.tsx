/**
 * Tests for useUserProfile hooks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { userProfileService } from '@/lib/services/userProfileService';
import { 
  MOCK_USER_ID,
  MOCK_AUTH_CONTEXT,
} from '@/test/mocks';
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

// Import hooks and mocks after mock setup
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  useUserProfile,
  useUserProfileById,
  useUpdateUserProfile,
  userProfileKeys,
} from './useUserProfile';

const MOCK_USER_PROFILE = {
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

describe('useUserProfile hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userProfileKeys', () => {
    it('should generate correct query keys', () => {
      expect(userProfileKeys.all).toEqual(['user-profile']);
      expect(userProfileKeys.detail('user-123')).toEqual(['user-profile', 'user-123']);
    });
  });

  describe('useUserProfile', () => {
    it('should fetch current user profile', async () => {
      vi.mocked(userProfileService.getById).mockResolvedValue(MOCK_USER_PROFILE);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfile(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_USER_PROFILE);
      expect(userProfileService.getById).toHaveBeenCalledWith(MOCK_USER_ID);
    });

    it('should handle null profile', async () => {
      vi.mocked(userProfileService.getById).mockResolvedValue(null);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfile(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should handle error', async () => {
      vi.mocked(userProfileService.getById).mockRejectedValue(new Error('Failed'));

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfile(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUserProfileById', () => {
    it('should fetch user profile by ID', async () => {
      vi.mocked(userProfileService.getById).mockResolvedValue(MOCK_USER_PROFILE);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfileById(MOCK_USER_ID), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(MOCK_USER_PROFILE);
      expect(userProfileService.getById).toHaveBeenCalledWith(MOCK_USER_ID);
    });

    it('should not fetch when userId is null', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfileById(null), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(userProfileService.getById).not.toHaveBeenCalled();
    });

    it('should not fetch when userId is empty string', () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUserProfileById(''), {
        wrapper,
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(userProfileService.getById).not.toHaveBeenCalled();
    });
  });

  describe('useUpdateUserProfile', () => {
    it('should update profile successfully', async () => {
      const updatedProfile = { ...MOCK_USER_PROFILE, name: 'Updated Name' };
      vi.mocked(userProfileService.update).mockResolvedValue(updatedProfile);

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateUserProfile(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Updated Name' });
      });

      expect(userProfileService.update).toHaveBeenCalledWith(MOCK_USER_ID, { name: 'Updated Name' });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: userProfileKeys.detail(MOCK_USER_ID),
      });
      expect(toast.success).toHaveBeenCalledWith('profileUpdated');
    });

    it('should handle update error', async () => {
      vi.mocked(userProfileService.update).mockRejectedValue(new Error('Update failed'));

      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateUserProfile(), {
        wrapper,
      });

      await expect(
        result.current.mutateAsync({ name: 'Error' }),
      ).rejects.toThrow('Update failed');

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('useUpdateUserProfile.failed', { error: expect.any(Error) });
      expect(toast.error).toHaveBeenCalledWith('profileUpdateError');
    });

    it('should update phone', async () => {
      const updatedProfile = { ...MOCK_USER_PROFILE, phone: '11888888888' };
      vi.mocked(userProfileService.update).mockResolvedValue(updatedProfile);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdateUserProfile(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ phone: '11888888888' });
      });

      expect(userProfileService.update).toHaveBeenCalledWith(MOCK_USER_ID, { phone: '11888888888' });
    });

    it('should update avatar_url', async () => {
      const updatedProfile = { ...MOCK_USER_PROFILE, avatar_url: 'https://new.com/avatar.jpg' };
      vi.mocked(userProfileService.update).mockResolvedValue(updatedProfile);

      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdateUserProfile(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ avatar_url: 'https://new.com/avatar.jpg' });
      });

      expect(userProfileService.update).toHaveBeenCalledWith(MOCK_USER_ID, { avatar_url: 'https://new.com/avatar.jpg' });
    });
  });
});
