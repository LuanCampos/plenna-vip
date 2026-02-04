/**
 * User profile service for Supabase operations.
 * Manages the authenticated user's profile data.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { UserProfile, UserProfileUpdate } from '@/types/user';

const TABLE_NAME = 'user_profiles';

export const userProfileService = {
  /**
   * Get user profile by ID.
   * Note: user_profile is created automatically by trigger handle_new_user()
   * when user signs up via Supabase Auth.
   */
  async getById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('userProfileService.getById.failed', { userId, error });
      throw error;
    }

    return data;
  },

  /**
   * Update user profile.
   * Only the user can update their own profile (enforced by RLS).
   */
  async update(userId: string, data: UserProfileUpdate): Promise<UserProfile> {
    const { data: profile, error } = await supabase
      .from(TABLE_NAME)
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('userProfileService.update.failed', { userId, data, error });
      throw error;
    }

    return profile;
  },

  /**
   * Get user profile by email.
   * Used for inviting members - checks if user exists in the system.
   * Note: For MVP, this returns null as we need a server-side function
   * to look up users by email in auth.users safely.
   */
  async getByEmail(email: string): Promise<UserProfile | null> {
    // First, we need to find the user by email in auth.users
    // Since we can't query auth.users directly from client, 
    // we use the user_profiles table with a join or RPC
    // For now, we'll use the admin approach or a custom RPC
    // Note: This might need a Supabase Edge Function or RPC
    
    // Alternative: Query using the email from user metadata if stored
    const { error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .limit(1);

    if (error) {
      logger.error('userProfileService.getByEmail.failed', { email, error });
      throw error;
    }

    // Note: For MVP, we might need to implement this via a database function
    // that can access auth.users safely
    return null;
  },
};
