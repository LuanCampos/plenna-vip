/**
 * Professional validation schema
 */
import { z } from 'zod';
import {
  nameSchema,
  optionalPhoneSchema,
  optionalEmailSchema,
  uuidSchema,
} from './commonSchemas';

export const professionalSchema = z.object({
  tenant_id: uuidSchema,
  name: nameSchema,
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  avatar_url: z.string().url('invalidUrl').optional().or(z.literal('')),
  active: z.boolean().default(true),
  user_id: uuidSchema.optional(),
  service_ids: z.array(uuidSchema).optional(),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;

export const professionalUpdateSchema = professionalSchema.partial().omit({ tenant_id: true });

export type ProfessionalUpdateInput = z.infer<typeof professionalUpdateSchema>;
