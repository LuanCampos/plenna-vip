/**
 * Centralized mock exports for tests.
 * 
 * Usage:
 * ```ts
 * import { 
 *   MOCK_TENANT_ID,
 *   MOCK_VALID_CLIENT,
 *   XSS_HTML_PAYLOADS,
 *   setupConsoleMocks,
 * } from '@/test/mocks';
 * ```
 */

// IDs
export * from './ids';

// Entity mocks
export * from './entities';

// Security payloads
export * from './security';

// Browser mocks
export * from './browser';

// Context mocks
export * from './contexts';
