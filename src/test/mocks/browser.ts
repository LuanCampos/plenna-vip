/**
 * Browser API mock helpers for tests.
 * Provides utilities for mocking console, localStorage, and other browser APIs.
 */
import { vi, type MockInstance } from 'vitest';

/**
 * Console spies interface.
 */
export interface ConsoleMocks {
  debug: MockInstance;
  info: MockInstance;
  warn: MockInstance;
  error: MockInstance;
  log: MockInstance;
}

/**
 * Setup console mocks that suppress output during tests.
 * Call this in beforeEach and restore in afterEach.
 * 
 * @example
 * ```ts
 * let consoleMocks: ConsoleMocks;
 * 
 * beforeEach(() => {
 *   consoleMocks = setupConsoleMocks();
 * });
 * 
 * afterEach(() => {
 *   restoreConsoleMocks();
 * });
 * ```
 */
export function setupConsoleMocks(): ConsoleMocks {
  return {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  };
}

/**
 * Restore all console mocks.
 */
export function restoreConsoleMocks(): void {
  vi.restoreAllMocks();
}

/**
 * LocalStorage mock interface.
 */
export interface LocalStorageMocks {
  getItem: MockInstance;
  setItem: MockInstance;
  removeItem: MockInstance;
  clear: MockInstance;
}

/**
 * Setup localStorage mocks that throw errors.
 * Useful for testing error handling.
 * 
 * @param errorMessage - The error message to throw.
 */
export function setupLocalStorageErrorMocks(errorMessage = 'Storage access denied'): LocalStorageMocks {
  return {
    getItem: vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error(errorMessage);
    }),
    setItem: vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error(errorMessage);
    }),
    removeItem: vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error(errorMessage);
    }),
    clear: vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      throw new Error(errorMessage);
    }),
  };
}

/**
 * Setup localStorage quota exceeded mock.
 */
export function setupLocalStorageQuotaMock(): MockInstance {
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceededError');
  });
}

/**
 * Clear localStorage and mocks.
 */
export function clearLocalStorageMocks(): void {
  localStorage.clear();
  vi.restoreAllMocks();
}

/**
 * Setup window.matchMedia mock for responsive tests.
 */
export function setupMatchMediaMock(matches = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

/**
 * Setup ResizeObserver mock.
 */
export function setupResizeObserverMock(): void {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

/**
 * Setup IntersectionObserver mock.
 */
export function setupIntersectionObserverMock(): void {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn(),
  }));
}
