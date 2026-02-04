/**
 * User type definitions
 * UserProfile - authenticated user profile
 * TenantUser - staff relationship with tenant
 */

export type UserRole = 'owner' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type UserProfileCreate = Omit<UserProfile, 'created_at' | 'updated_at'>;
export type UserProfileUpdate = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type TenantUserCreate = Omit<TenantUser, 'id' | 'created_at' | 'updated_at'>;
export type TenantUserUpdate = Pick<TenantUser, 'role'>;

export interface TenantUserWithProfile extends TenantUser {
  user_profile: UserProfile;
}
