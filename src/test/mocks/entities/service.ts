/**
 * Mock service data for tests.
 * Import from '@/test/mocks' in test files.
 */
import { MOCK_TENANT_ID, MOCK_SERVICE_ID, MOCK_SERVICE_ID_2, MOCK_SERVICE_ID_3 } from '../ids';

/**
 * Valid service input for creation tests.
 */
export const MOCK_VALID_SERVICE = {
  tenant_id: MOCK_TENANT_ID,
  name: 'Corte Masculino',
  description: 'Corte tradicional',
  price: 50.00,
  duration: 30,
  active: true,
} as const;

/**
 * Minimal valid service (only required fields).
 */
export const MOCK_MINIMAL_SERVICE = {
  tenant_id: MOCK_TENANT_ID,
  name: 'Barba',
  price: 30,
  duration: 20,
} as const;

/**
 * Service entity as returned from database.
 */
export const MOCK_SERVICE_ENTITY = {
  id: MOCK_SERVICE_ID,
  tenant_id: MOCK_TENANT_ID,
  name: 'Corte Masculino',
  description: 'Corte tradicional',
  price: 50.00,
  duration: 30,
  active: true,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
} as const;

/**
 * Second service entity for list tests.
 */
export const MOCK_SERVICE_ENTITY_2 = {
  id: MOCK_SERVICE_ID_2,
  tenant_id: MOCK_TENANT_ID,
  name: 'Barba',
  description: 'Barba tradicional com navalha',
  price: 30.00,
  duration: 20,
  active: true,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
} as const;

/**
 * Third service entity.
 */
export const MOCK_SERVICE_ENTITY_3 = {
  id: MOCK_SERVICE_ID_3,
  tenant_id: MOCK_TENANT_ID,
  name: 'Corte + Barba',
  description: 'Combo corte e barba',
  price: 70.00,
  duration: 45,
  active: true,
  created_at: '2026-01-01T10:00:00Z',
  updated_at: '2026-01-01T10:00:00Z',
} as const;

/**
 * Array of service entities for list tests.
 */
export const MOCK_SERVICES_LIST = [
  MOCK_SERVICE_ENTITY,
  MOCK_SERVICE_ENTITY_2,
  MOCK_SERVICE_ENTITY_3,
] as const;

/**
 * Factory function to create service with custom overrides.
 */
export function createMockService(overrides: Record<string, unknown> = {}) {
  return {
    ...MOCK_VALID_SERVICE,
    ...overrides,
  };
}
