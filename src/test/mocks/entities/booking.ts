/**
 * Mock booking data for tests (public booking flow).
 * Import from '@/test/mocks' in test files.
 */
import {
  MOCK_TENANT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
} from '../ids';

/**
 * Valid public booking input.
 */
export const MOCK_VALID_PUBLIC_BOOKING = {
  tenant_id: MOCK_TENANT_ID,
  professional_id: MOCK_PROFESSIONAL_ID,
  service_ids: [MOCK_SERVICE_ID],
  start_time: '2026-02-02T10:00:00Z',
  client_name: 'Maria Silva',
  client_phone: '11999999999',
  client_email: 'maria@example.com',
  notes: 'Primeira vez no salão',
} as const;

/**
 * Minimal public booking (only required fields).
 */
export const MOCK_MINIMAL_PUBLIC_BOOKING = {
  tenant_id: MOCK_TENANT_ID,
  professional_id: MOCK_PROFESSIONAL_ID,
  service_ids: [MOCK_SERVICE_ID],
  start_time: '2026-02-02T10:00:00Z',
  client_name: 'João',
  client_phone: '11999999999',
} as const;

/**
 * Public booking with multiple services.
 */
export const MOCK_MULTI_SERVICE_BOOKING = {
  ...MOCK_VALID_PUBLIC_BOOKING,
  service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2],
} as const;

/**
 * Booking services step input.
 */
export const MOCK_SERVICES_STEP = {
  service_ids: [MOCK_SERVICE_ID],
} as const;

/**
 * Booking professional step input.
 */
export const MOCK_PROFESSIONAL_STEP = {
  professional_id: MOCK_PROFESSIONAL_ID,
} as const;

/**
 * Booking date/time step input.
 */
export const MOCK_DATETIME_STEP = {
  start_time: '2026-02-02T10:00:00Z',
} as const;

/**
 * Booking client info step input.
 */
export const MOCK_CLIENT_INFO_STEP = {
  client_name: 'Maria Silva',
  client_phone: '11999999999',
  client_email: 'maria@example.com',
} as const;

/**
 * Minimal client info step (no email).
 */
export const MOCK_MINIMAL_CLIENT_INFO_STEP = {
  client_name: 'João',
  client_phone: '11999999999',
} as const;

/**
 * Factory function to create booking with custom overrides.
 */
export function createMockPublicBooking(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_VALID_PUBLIC_BOOKING,
    ...overrides,
  };
}
