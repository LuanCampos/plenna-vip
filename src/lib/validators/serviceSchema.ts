/**
 * Service validation schema
 */
import { z } from 'zod';
import {
  nameSchema,
  priceSchema,
  durationSchema,
  optionalSanitizedTextSchema,
  uuidSchema,
} from './commonSchemas';

export const serviceSchema = z.object({
  tenant_id: uuidSchema,
  name: nameSchema,
  description: optionalSanitizedTextSchema,
  price: priceSchema,
  duration: durationSchema,
  active: z.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceUpdateSchema = serviceSchema.partial().omit({ tenant_id: true });

export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
