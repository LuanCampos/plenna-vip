import { logger } from '@/lib/logger';

const STORAGE_PREFIX = 'plenna_';

/**
 * Sanitizes a value before storing to prevent XSS attacks
 */
const sanitizeValue = (value: string): string => {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Desanitizes a value when retrieving from storage
 */
const desanitizeValue = (value: string): string => {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
};

/**
 * Validates a storage key to prevent injection attacks
 */
const validateKey = (key: string): boolean => {
  const validKeyPattern = /^[a-zA-Z0-9_-]+$/;
  return validKeyPattern.test(key);
};

/**
 * Gets an item from localStorage with security measures
 */
export const getSecureStorageItem = (key: string): string | null => {
  if (!validateKey(key)) {
    logger.warn('storage.invalidKey', { key });
    return null;
  }

  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const value = localStorage.getItem(prefixedKey);
    
    if (value === null) {
      return null;
    }

    return desanitizeValue(value);
  } catch (error) {
    logger.error('storage.get.failed', { key, error: String(error) });
    return null;
  }
};

/**
 * Sets an item in localStorage with security measures
 */
export const setSecureStorageItem = (key: string, value: string): boolean => {
  if (!validateKey(key)) {
    logger.warn('storage.invalidKey', { key });
    return false;
  }

  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    const sanitizedValue = sanitizeValue(value);
    localStorage.setItem(prefixedKey, sanitizedValue);
    return true;
  } catch (error) {
    logger.error('storage.set.failed', { key, error: String(error) });
    return false;
  }
};

/**
 * Removes an item from localStorage
 */
export const removeSecureStorageItem = (key: string): boolean => {
  if (!validateKey(key)) {
    logger.warn('storage.invalidKey', { key });
    return false;
  }

  try {
    const prefixedKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    logger.error('storage.remove.failed', { key, error: String(error) });
    return false;
  }
};

/**
 * Clears all Plenna-related items from localStorage
 */
export const clearSecureStorage = (): boolean => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    logger.debug('storage.cleared', { count: keysToRemove.length });
    return true;
  } catch (error) {
    logger.error('storage.clear.failed', { error: String(error) });
    return false;
  }
};
