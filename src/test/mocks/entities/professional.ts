/**
 * Mock professional data for tests.
 * Import from '@/test/mocks' in test files.
 */
import {
  MOCK_TENANT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_PROFESSIONAL_ID_2,
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
  MOCK_USER_ID,
} from '../ids';

/**
 * Valid professional input for creation tests.
 */
export const MOCK_VALID_PROFESSIONAL = {
  tenant_id: MOCK_TENANT_ID,
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  avatar_url: 'https://example.com/avatar.jpg',
  active: true,
} as const;

/**
 * Minimal valid professional (only required fields).
 */
export const MOCK_MINIMAL_PROFESSIONAL = {
  tenant_id: MOCK_TENANT_ID,
  name: 'Maria',
} as const;

/**
 * Professional with service associations.
 */
export const MOCK_PROFESSIONAL_WITH_SERVICES = {
  ...MOCK_VALID_PROFESSIONAL,
  service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2],
} as const;

/**
 * Professional with user linkage.
 */
export const MOCK_PROFESSIONAL_WITH_USER = {
  ...MOCK_VALID_PROFESSIONAL,
  user_id: MOCK_USER_ID,
} as const;

/**
 * Professional entity as returned from database.
 */
export const MOCK_PROFESSIONAL_ENTITY = {
  id: MOCK_PROFESSIONAL_ID,
  tenant_id: MOCK_TENANT_ID,
  user_id: undefined,
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '11999999999',
  avatar_url: 'https://example.com/avatar.jpg',
  active: true,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
} as const;

/**
 * Second professional entity for list tests.
 */
export const MOCK_PROFESSIONAL_ENTITY_2 = {
  id: MOCK_PROFESSIONAL_ID_2,
  tenant_id: MOCK_TENANT_ID,
  user_id: MOCK_USER_ID,
  name: 'Ana Santos',
  email: 'ana@example.com',
  phone: '11888888888',
  avatar_url: null,
  active: true,
  created_at: '2026-01-02T10:00:00Z',
  updated_at: '2026-01-02T10:00:00Z',
} as const;

/**
 * Array of professional entities for list tests.
 */
export const MOCK_PROFESSIONALS_LIST = [
  MOCK_PROFESSIONAL_ENTITY,
  MOCK_PROFESSIONAL_ENTITY_2,
] as const;

/**
 * Factory function to create professional with custom overrides.
 */
export function createMockProfessional(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_VALID_PROFESSIONAL,
    ...overrides,
  };
}
