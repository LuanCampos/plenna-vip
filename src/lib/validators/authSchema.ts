/**
 * Authentication validation schemas
 */
import { z } from 'zod';
import { emailSchema, nameSchema } from './commonSchemas';

/**
 * Minimum password length for security
 */
const MIN_PASSWORD_LENGTH = 6;

/**
 * Password schema with minimum length validation
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, 'passwordTooShort');

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Register form validation schema
 */
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDoNotMatch',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
