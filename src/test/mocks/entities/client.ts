/**
 * Mock client data for tests.
 * Import from '@/test/mocks' in test files.
 */
import { MOCK_TENANT_ID, MOCK_CLIENT_ID, MOCK_CLIENT_ID_2 } from '../ids';

/**
 * Valid client input for creation tests.
 */
export const MOCK_VALID_CLIENT = {
  tenant_id: MOCK_TENANT_ID,
  name: 'Maria Silva',
  phone: '11999999999',
  email: 'maria@example.com',
  notes: 'Cliente VIP',
} as const;

/**
 * Minimal valid client (only required fields).
 */
export const MOCK_MINIMAL_CLIENT = {
  tenant_id: MOCK_TENANT_ID,
  name: 'João',
  phone: '11999999999',
} as const;

/**
 * Public client data (for public booking flow).
 */
export const MOCK_PUBLIC_CLIENT = {
  name: 'Cliente Público',
  phone: '11999999999',
  email: 'cliente@example.com',
} as const;

/**
 * Client entity as returned from database (with id and timestamps).
 */
export const MOCK_CLIENT_ENTITY = {
  id: MOCK_CLIENT_ID,
  tenant_id: MOCK_TENANT_ID,
  name: 'Maria Silva',
  phone: '11999999999',
  email: 'maria@example.com',
  notes: 'Cliente VIP',
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
} as const;

/**
 * Second client entity for list tests.
 */
export const MOCK_CLIENT_ENTITY_2 = {
  id: MOCK_CLIENT_ID_2,
  tenant_id: MOCK_TENANT_ID,
  name: 'João Santos',
  phone: '11888888888',
  email: 'joao@example.com',
  notes: null,
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-01-02T10:00:00Z',
} as const;

/**
 * Array of client entities for list tests.
 */
export const MOCK_CLIENTS_LIST = [MOCK_CLIENT_ENTITY, MOCK_CLIENT_ENTITY_2] as const;

/**
 * Factory function to create client entity with custom overrides.
 * Returns a complete Client entity suitable for type-safe tests.
 */
export function createMockClient(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_CLIENT_ENTITY,
    ...overrides,
  };
}
