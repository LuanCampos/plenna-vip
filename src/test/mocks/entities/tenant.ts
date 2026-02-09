/**
 * Mock tenant data for tests.
 * Import from '@/test/mocks' in test files.
 */
import { MOCK_TENANT_ID, MOCK_USER_ID } from '../ids';
import type { Tenant, TenantSettings, BusinessHours } from '@/types/tenant';

/**
 * Default business hours (Mon-Fri 9-18, Sat 9-13, Sun closed).
 */
export const MOCK_BUSINESS_HOURS: BusinessHours = {
  monday: [{ start: '09:00', end: '18:00' }],
  tuesday: [{ start: '09:00', end: '18:00' }],
  wednesday: [{ start: '09:00', end: '18:00' }],
  thursday: [{ start: '09:00', end: '18:00' }],
  friday: [{ start: '09:00', end: '18:00' }],
  saturday: [{ start: '09:00', end: '13:00' }],
  sunday: [],
};

/**
 * Default tenant settings.
 */
export const MOCK_TENANT_SETTINGS: TenantSettings = {
  max_photos_per_appointment: 10,
  booking_slot_duration: 30,
  allow_multiple_same_service: false,
  require_phone_for_booking: true,
  show_prices_publicly: true,
};

/**
 * Valid tenant for creation tests (without generated fields).
 */
export const MOCK_VALID_TENANT_INPUT = {
  name: 'Salão Teste',
  slug: 'salao-teste',
  owner_id: MOCK_USER_ID,
  timezone: 'America/Sao_Paulo',
  business_hours: MOCK_BUSINESS_HOURS,
  settings: MOCK_TENANT_SETTINGS,
  active: true,
} as const;

/**
 * Complete tenant entity as returned from database.
 */
export const MOCK_TENANT_ENTITY: Tenant = {
  id: MOCK_TENANT_ID,
  name: 'Salão Teste',
  slug: 'salao-teste',
  owner_id: MOCK_USER_ID,
  logo_url: 'https://example.com/logo.png',
  phone: '11999999999',
  email: 'contato@salaoteste.com',
  address: 'Rua Exemplo, 123',
  timezone: 'America/Sao_Paulo',
  business_hours: MOCK_BUSINESS_HOURS,
  settings: MOCK_TENANT_SETTINGS,
  active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/**
 * Alias for backward compatibility.
 */
export const MOCK_VALID_TENANT = MOCK_TENANT_ENTITY;

/**
 * Factory function to create tenant entity with custom overrides.
 */
export function createMockTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    ...MOCK_TENANT_ENTITY,
    ...overrides,
  };
}
