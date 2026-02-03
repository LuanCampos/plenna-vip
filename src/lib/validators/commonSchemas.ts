/**
 * Common validation schemas reused across the application
 */
import { z } from 'zod';

// Phone validation - Brazilian format (10-11 digits)
export const phoneSchema = z
  .string()
  .min(1, 'requiredField')
  .regex(/^\d{10,11}$/, 'invalidPhone');

// Optional phone
export const optionalPhoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, 'invalidPhone')
  .optional()
  .or(z.literal(''));

// Email validation
export const emailSchema = z
  .string()
  .email('invalidEmail');

// Optional email
export const optionalEmailSchema = z
  .string()
  .email('invalidEmail')
  .optional()
  .or(z.literal(''));

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'nameTooShort')
  .max(100, 'nameTooLong');

// UUID validation
export const uuidSchema = z.string().uuid();

// Price validation (positive number)
export const priceSchema = z
  .number()
  .min(0, 'priceMustBePositive');

// Duration validation (positive integer, minutes)
export const durationSchema = z
  .number()
  .int('durationMustBeInteger')
  .min(1, 'durationMustBePositive');

// ISO 8601 datetime string
export const dateTimeSchema = z
  .string()
  .refine(
    (val) => !isNaN(Date.parse(val)),
    'invalidDateTime'
  );

// Date string (YYYY-MM-DD)
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'invalidDateFormat');

// Time string (HH:mm)
export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'invalidTimeFormat');

// Notes/description with XSS prevention
export const sanitizedTextSchema = z
  .string()
  .max(500, 'textTooLong')
  .transform((val) => val
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  );

// Optional sanitized text
export const optionalSanitizedTextSchema = sanitizedTextSchema
  .optional()
  .or(z.literal(''));
