/**
 * User profile validation schemas
 */
import { z } from 'zod';
import { nameSchema, optionalPhoneSchema } from './commonSchemas';

/**
 * Optional URL validation for avatar
 */
const optionalUrlSchema = z
  .string()
  .url('invalidUrl')
  .optional()
  .nullable()
  .or(z.literal(''));

/**
 * User profile update schema
 * Used when editing the logged-in user's profile
 */
export const userProfileUpdateSchema = z.object({
  name: nameSchema,
  phone: optionalPhoneSchema.nullable(),
  avatar_url: optionalUrlSchema,
});

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
