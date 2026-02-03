/**
 * Context mocks for testing components that use React contexts.
 * Import from '@/test/mocks' in test files.
 */
import { MOCK_TENANT_ID, MOCK_USER_ID } from './ids';
import type { Tenant, BusinessHours, TenantSettings } from '@/types/tenant';

const MOCK_BUSINESS_HOURS: BusinessHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '09:00', end: '14:00' }],
  sunday: [],
};

const MOCK_TENANT_SETTINGS: TenantSettings = {
  max_photos_per_appointment: 10,
  booking_slot_duration: 30,
  allow_multiple_same_service: false,
  require_phone_for_booking: true,
  show_prices_publicly: true,
};

/**
 * Mock tenant for TenantContext.
 */
export const MOCK_TENANT: Tenant = {
  id: MOCK_TENANT_ID,
  name: 'Salão Teste',
  slug: 'salao-teste',
  owner_id: MOCK_USER_ID,
  timezone: 'America/Sao_Paulo',
  business_hours: MOCK_BUSINESS_HOURS,
  settings: MOCK_TENANT_SETTINGS,
  active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/**
 * Mock user for AuthContext (Supabase User shape).
 */
export const MOCK_USER = {
  id: MOCK_USER_ID,
  email: 'user@example.com',
  user_metadata: {
    name: 'Test User',
  },
} as const;

/**
 * Mock session for AuthContext (getSession / onAuthStateChange).
 * Use with: getSession.mockResolvedValue({ data: { session: MOCK_SESSION } }).
 */
export const MOCK_SESSION = {
  user: MOCK_USER,
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  expires_in: 3600,
  token_type: 'bearer',
} as const;

/**
 * Mock TenantContext value.
 */
export const MOCK_TENANT_CONTEXT = {
  currentTenant: MOCK_TENANT,
  loading: false,
  error: null,
  setCurrentTenant: () => {},
} as const;

/**
 * Mock TenantContext value (loading state).
 */
export const MOCK_TENANT_CONTEXT_LOADING = {
  currentTenant: null,
  loading: true,
  error: null,
  setCurrentTenant: () => {},
} as const;

/**
 * Mock AuthContext value.
 */
export const MOCK_AUTH_CONTEXT = {
  user: MOCK_USER,
  session: { access_token: 'mock-token' },
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
} as const;

/**
 * Mock AuthContext value (not authenticated).
 */
export const MOCK_AUTH_CONTEXT_UNAUTHENTICATED = {
  user: null,
  session: null,
  loading: false,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
} as const;

/**
 * Mock LanguageContext value.
 */
export const MOCK_LANGUAGE_CONTEXT = {
  language: 'pt' as const,
  setLanguage: () => {},
  t: (key: string) => key,
} as const;

/**
 * Mock ThemeContext value (includes resolvedTheme for consumers).
 */
export const MOCK_THEME_CONTEXT = {
  theme: 'light' as const,
  setTheme: () => {},
  resolvedTheme: 'light' as const,
} as const;

/**
 * Factory to create translation function mock.
 * Returns the key by default, or a custom translation map.
 */
export function createMockT(translations: Record<string, string> = {}) {
  return (key: string) => translations[key] ?? key;
}
