/**
 * Tests for userProfileService.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userProfileService } from './userProfileService';
import { supabase } from '@/lib/supabase';
import { MOCK_USER_ID } from '@/test/mocks';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
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

const MOCK_USER_PROFILE = {
  id: MOCK_USER_ID,
  name: 'Test User',
  phone: '11999999999',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('userProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should return user profile by ID', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_USER_PROFILE, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.getById(MOCK_USER_ID);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', MOCK_USER_ID);
      expect(result).toEqual(MOCK_USER_PROFILE);
    });

    it('should return null when user profile not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.getById(MOCK_USER_ID);

      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(userProfileService.getById(MOCK_USER_ID)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const updateData = { name: 'Updated Name', phone: '11888888888' };
      const updatedProfile = { ...MOCK_USER_PROFILE, ...updateData };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.update(MOCK_USER_ID, updateData);

      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(mockChain.eq).toHaveBeenCalledWith('id', MOCK_USER_ID);
      expect(result.name).toBe('Updated Name');
      expect(result.phone).toBe('11888888888');
    });

    it('should update only name', async () => {
      const updateData = { name: 'New Name' };
      const updatedProfile = { ...MOCK_USER_PROFILE, ...updateData };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.update(MOCK_USER_ID, updateData);

      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(result.name).toBe('New Name');
    });

    it('should throw on update error', async () => {
      const mockError = { message: 'Update failed', code: '500' };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(userProfileService.update(MOCK_USER_ID, { name: 'Test' })).rejects.toEqual(mockError);
    });

    it('should update avatar_url', async () => {
      const updateData = { avatar_url: 'https://new-avatar.com/img.jpg' };
      const updatedProfile = { ...MOCK_USER_PROFILE, ...updateData };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.update(MOCK_USER_ID, updateData);

      expect(result.avatar_url).toBe('https://new-avatar.com/img.jpg');
    });

    it('should clear phone with null', async () => {
      const updateData = { phone: undefined };
      const updatedProfile = { ...MOCK_USER_PROFILE, phone: undefined };
      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.update(MOCK_USER_ID, updateData);

      expect(result.phone).toBeUndefined();
    });
  });

  describe('getByEmail', () => {
    it('should return null for now (MVP limitation)', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      const result = await userProfileService.getByEmail('test@example.com');

      // For MVP, this returns null as we need a server-side function
      // to look up users by email in auth.users
      expect(result).toBeNull();
    });

    it('should throw on database error', async () => {
      const mockError = { message: 'Database error', code: '500' };
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockChain as unknown as ReturnType<typeof supabase.from>);

      await expect(userProfileService.getByEmail('test@example.com')).rejects.toEqual(mockError);
    });
  });
});
