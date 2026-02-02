/**
 * Business configuration for the application
 * Centralized to facilitate changes and prepare for multi-tenant customization
 */

/** Duration of each booking slot in minutes */
export const BOOKING_SLOT_DURATION = 30;

/** Default business hours */
export const BUSINESS_HOURS = {
  start: '08:00',
  end: '20:00',
} as const;

/** Days of the week (Portuguese) */
export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

/** Short days of the week (Portuguese) */
export const DAYS_OF_WEEK_SHORT = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
] as const;

/** Default appointment statuses */
export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
