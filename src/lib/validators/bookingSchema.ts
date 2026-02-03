/**
 * Public booking validation schema
 */
import { z } from 'zod';
import {
  uuidSchema,
  nameSchema,
  phoneSchema,
  optionalEmailSchema,
  optionalSanitizedTextSchema,
  dateTimeSchema,
} from './commonSchemas';

export const publicBookingSchema = z.object({
  tenant_id: uuidSchema,
  professional_id: uuidSchema,
  service_ids: z
    .array(uuidSchema)
    .min(1, 'atLeastOneService'),
  start_time: dateTimeSchema,
  client_name: nameSchema,
  client_phone: phoneSchema,
  client_email: optionalEmailSchema,
  notes: optionalSanitizedTextSchema,
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

// Step validations for the booking wizard
export const bookingServicesStepSchema = z.object({
  service_ids: z
    .array(uuidSchema)
    .min(1, 'atLeastOneService'),
});

export const bookingProfessionalStepSchema = z.object({
  professional_id: uuidSchema,
});

export const bookingDateTimeStepSchema = z.object({
  start_time: dateTimeSchema,
});

export const bookingClientInfoStepSchema = z.object({
  client_name: nameSchema,
  client_phone: phoneSchema,
  client_email: optionalEmailSchema,
  notes: optionalSanitizedTextSchema,
});
