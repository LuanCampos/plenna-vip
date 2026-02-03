/**
 * Appointment validation schema
 */
import { z } from 'zod';
import {
  uuidSchema,
  dateTimeSchema,
  optionalSanitizedTextSchema,
} from './commonSchemas';
import { APPOINTMENT_STATUSES } from '@/lib/config/business';

const appointmentStatusSchema = z.enum(
  APPOINTMENT_STATUSES as unknown as [string, ...string[]]
);

export const appointmentSchema = z.object({
  tenant_id: uuidSchema,
  client_id: uuidSchema.nullable(),
  professional_id: uuidSchema,
  start_time: dateTimeSchema,
  service_ids: z
    .array(uuidSchema)
    .min(1, 'atLeastOneService'),
  notes: optionalSanitizedTextSchema,
  status: appointmentStatusSchema.optional().default('scheduled'),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const appointmentUpdateSchema = z.object({
  client_id: uuidSchema.nullable().optional(),
  professional_id: uuidSchema.optional(),
  start_time: dateTimeSchema.optional(),
  status: appointmentStatusSchema.optional(),
  notes: optionalSanitizedTextSchema,
});

export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;

// Schema for rescheduling
export const rescheduleSchema = z.object({
  start_time: dateTimeSchema,
  professional_id: uuidSchema.optional(),
});

export type RescheduleInput = z.infer<typeof rescheduleSchema>;
