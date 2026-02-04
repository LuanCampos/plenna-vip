/**
 * React Query hooks for user profile operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userProfileService } from '@/lib/services/userProfileService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type { UserProfile, UserProfileUpdate } from '@/types/user';

// Query keys
export const userProfileKeys = {
  all: ['user-profile'] as const,
  detail: (userId: string) => [...userProfileKeys.all, userId] as const,
};

/**
 * Get the current user's profile.
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: userProfileKeys.detail(userId ?? ''),
    queryFn: () => userProfileService.getById(userId!),
    enabled: !!userId,
  });
};

/**
 * Get a user profile by ID.
 */
export const useUserProfileById = (userId: string | null) => {
  return useQuery({
    queryKey: userProfileKeys.detail(userId ?? ''),
    queryFn: () => userProfileService.getById(userId!),
    enabled: !!userId,
  });
};

/**
 * Update the current user's profile.
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const userId = user?.id;

  return useMutation({
    mutationFn: (data: UserProfileUpdate) =>
      userProfileService.update(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userProfileKeys.detail(userId!) });
      toast.success(t('profileUpdated'));
    },
    onError: (error) => {
      logger.error('useUpdateUserProfile.failed', { error });
      toast.error(t('profileUpdateError'));
    },
  });
};

// Type exports for convenience
export type { UserProfile, UserProfileUpdate };
