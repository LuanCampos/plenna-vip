import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function');
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('should log debug messages in development', () => {
    logger.debug('test.event', { key: 'value' });
    // In development mode, console.debug should be called
    if (import.meta.env.DEV) {
      expect(console.debug).toHaveBeenCalled();
    }
  });

  it('should log info messages', () => {
    logger.info('test.info', { data: 'info data' });
    if (import.meta.env.DEV) {
      expect(console.info).toHaveBeenCalled();
    }
  });

  it('should log warn messages', () => {
    logger.warn('test.warn', { warning: 'warning data' });
    if (import.meta.env.DEV) {
      expect(console.warn).toHaveBeenCalled();
    }
  });

  it('should log error messages with data', () => {
    logger.error('test.error', { error: 'Something went wrong' });
    if (import.meta.env.DEV) {
      expect(console.error).toHaveBeenCalled();
    }
  });
});
