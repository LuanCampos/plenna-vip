/**
 * Mock appointment data for tests.
 * Import from '@/test/mocks' in test files.
 */
import {
  MOCK_TENANT_ID,
  MOCK_APPOINTMENT_ID,
  MOCK_APPOINTMENT_ID_2,
  MOCK_CLIENT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
} from '../ids';

/**
 * Valid appointment input for creation tests.
 */
export const MOCK_VALID_APPOINTMENT = {
  tenant_id: MOCK_TENANT_ID,
  client_id: MOCK_CLIENT_ID,
  professional_id: MOCK_PROFESSIONAL_ID,
  start_time: '2026-02-02T10:00:00Z',
  service_ids: [MOCK_SERVICE_ID],
  notes: 'Cliente preferencial',
} as const;

/**
 * Walk-in appointment (no client).
 */
export const MOCK_WALKIN_APPOINTMENT = {
  ...MOCK_VALID_APPOINTMENT,
  client_id: null,
  notes: 'Walk-in client',
} as const;

/**
 * Appointment with multiple services.
 */
export const MOCK_MULTI_SERVICE_APPOINTMENT = {
  ...MOCK_VALID_APPOINTMENT,
  service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2],
} as const;

/**
 * Appointment entity as returned from database.
 */
export const MOCK_APPOINTMENT_ENTITY = {
  id: MOCK_APPOINTMENT_ID,
  tenant_id: MOCK_TENANT_ID,
  client_id: MOCK_CLIENT_ID,
  professional_id: MOCK_PROFESSIONAL_ID,
  start_time: '2026-02-02T10:00:00Z',
  end_time: '2026-02-02T10:30:00Z',
  status: 'scheduled' as const,
  notes: 'Cliente preferencial',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
} as const;

/**
 * Confirmed appointment entity.
 */
export const MOCK_CONFIRMED_APPOINTMENT = {
  ...MOCK_APPOINTMENT_ENTITY,
  id: MOCK_APPOINTMENT_ID_2,
  status: 'confirmed' as const,
  start_time: '2026-02-02T14:00:00Z',
  end_time: '2026-02-02T14:30:00Z',
} as const;

/**
 * All valid appointment statuses.
 */
export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
] as const;

/**
 * Array of appointment entities for list tests.
 */
export const MOCK_APPOINTMENTS_LIST = [
  MOCK_APPOINTMENT_ENTITY,
  MOCK_CONFIRMED_APPOINTMENT,
] as const;

/**
 * Reschedule input.
 */
export const MOCK_RESCHEDULE_INPUT = {
  start_time: '2026-02-03T14:00:00Z',
} as const;

/**
 * Reschedule with new professional.
 */
export const MOCK_RESCHEDULE_WITH_PROFESSIONAL = {
  start_time: '2026-02-03T14:00:00Z',
  professional_id: MOCK_PROFESSIONAL_ID,
} as const;

/**
 * Factory function to create appointment with custom overrides.
 */
export function createMockAppointment(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_VALID_APPOINTMENT,
    ...overrides,
  };
}
