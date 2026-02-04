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
  service_ids: [MOCK_SERVICE_ID] as string[],
  notes: 'Cliente preferencial',
};

/**
 * Walk-in appointment (no client).
 */
export const MOCK_WALKIN_APPOINTMENT = {
  ...MOCK_VALID_APPOINTMENT,
  client_id: null,
  notes: 'Walk-in client',
};

/**
 * Appointment with multiple services.
 */
export const MOCK_MULTI_SERVICE_APPOINTMENT = {
  ...MOCK_VALID_APPOINTMENT,
  service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2] as string[],
};

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
  total_duration: 30,
  total_price: 50.00,
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
 * Mock appointment service (N:N relationship).
 */
export const MOCK_APPOINTMENT_SERVICE = {
  id: 'as0e8400-e29b-41d4-a716-446655440001',
  tenant_id: MOCK_TENANT_ID,
  appointment_id: MOCK_APPOINTMENT_ID,
  service_id: MOCK_SERVICE_ID,
  service_name_at_booking: 'Corte Masculino',
  price_at_booking: 50.00,
  duration_at_booking: 30,
  order_index: 0,
  created_at: '2026-01-15T10:00:00Z',
} as const;

/**
 * Second appointment service for multi-service tests.
 */
export const MOCK_APPOINTMENT_SERVICE_2 = {
  id: 'as0e8400-e29b-41d4-a716-446655440002',
  tenant_id: MOCK_TENANT_ID,
  appointment_id: MOCK_APPOINTMENT_ID,
  service_id: MOCK_SERVICE_ID_2,
  service_name_at_booking: 'Barba',
  price_at_booking: 30.00,
  duration_at_booking: 20,
  order_index: 1,
  created_at: '2026-01-15T10:00:00Z',
} as const;

/**
 * Appointment with details (client, professional, services).
 */
export const MOCK_APPOINTMENT_WITH_DETAILS = {
  ...MOCK_APPOINTMENT_ENTITY,
  client: {
    id: MOCK_CLIENT_ID,
    name: 'Maria Silva',
    phone: '11999999999',
  },
  professional: {
    id: MOCK_PROFESSIONAL_ID,
    name: 'João Barbeiro',
    avatar_url: undefined as string | undefined,
  },
  services: [MOCK_APPOINTMENT_SERVICE],
};

/**
 * Appointment with multiple services.
 */
export const MOCK_APPOINTMENT_WITH_MULTI_SERVICES = {
  ...MOCK_APPOINTMENT_ENTITY,
  total_duration: 50,
  total_price: 80.00,
  end_time: '2026-02-02T10:50:00Z',
  client: {
    id: MOCK_CLIENT_ID,
    name: 'Maria Silva',
    phone: '11999999999',
  },
  professional: {
    id: MOCK_PROFESSIONAL_ID,
    name: 'João Barbeiro',
    avatar_url: undefined as string | undefined,
  },
  services: [MOCK_APPOINTMENT_SERVICE, MOCK_APPOINTMENT_SERVICE_2],
};

/**
 * Factory function to create appointment with custom overrides.
 */
export function createMockAppointment(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_VALID_APPOINTMENT,
    ...overrides,
  };
}

/**
 * Factory function to create appointment entity with custom overrides.
 */
export function createMockAppointmentEntity(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_APPOINTMENT_ENTITY,
    ...overrides,
  };
}

/**
 * Factory function to create appointment with details.
 */
export function createMockAppointmentWithDetails(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_APPOINTMENT_WITH_DETAILS,
    ...overrides,
  };
}
