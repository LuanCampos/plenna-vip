/**
 * Client validation schema
 */
import { z } from 'zod';
import {
  nameSchema,
  phoneSchema,
  optionalEmailSchema,
  optionalSanitizedTextSchema,
  uuidSchema,
} from './commonSchemas';

export const clientSchema = z.object({
  tenant_id: uuidSchema,
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  notes: optionalSanitizedTextSchema,
  user_id: uuidSchema.optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const clientUpdateSchema = clientSchema.partial().omit({ tenant_id: true });

export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

// Schema for public booking (minimal info)
export const clientPublicSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
});

export type ClientPublicInput = z.infer<typeof clientPublicSchema>;
