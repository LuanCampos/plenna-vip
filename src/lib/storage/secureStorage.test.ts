import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSecureStorageItem,
  setSecureStorageItem,
  removeSecureStorageItem,
  clearSecureStorage,
} from './secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setSecureStorageItem', () => {
    it('should store a value with prefix', () => {
      const result = setSecureStorageItem('test-key', 'test-value');
      expect(result).toBe(true);
      expect(localStorage.getItem('plenna_test-key')).toBe('test-value');
    });

    it('should reject invalid keys with special characters', () => {
      const result = setSecureStorageItem('invalid<key>', 'value');
      expect(result).toBe(false);
    });

    it('should sanitize HTML in values', () => {
      setSecureStorageItem('html-key', '<script>alert("xss")</script>');
      const stored = localStorage.getItem('plenna_html-key');
      expect(stored).not.toContain('<script>');
      expect(stored).toContain('&lt;script&gt;');
    });
  });

  describe('getSecureStorageItem', () => {
    it('should retrieve a stored value', () => {
      localStorage.setItem('plenna_my-key', 'my-value');
      const result = getSecureStorageItem('my-key');
      expect(result).toBe('my-value');
    });

    it('should return null for non-existent key', () => {
      const result = getSecureStorageItem('non-existent');
      expect(result).toBeNull();
    });

    it('should reject invalid keys', () => {
      const result = getSecureStorageItem('invalid/key');
      expect(result).toBeNull();
    });

    it('should desanitize stored values', () => {
      localStorage.setItem('plenna_sanitized', '&lt;div&gt;');
      const result = getSecureStorageItem('sanitized');
      expect(result).toBe('<div>');
    });
  });

  describe('removeSecureStorageItem', () => {
    it('should remove a stored value', () => {
      localStorage.setItem('plenna_to-remove', 'value');
      const result = removeSecureStorageItem('to-remove');
      expect(result).toBe(true);
      expect(localStorage.getItem('plenna_to-remove')).toBeNull();
    });

    it('should reject invalid keys', () => {
      const result = removeSecureStorageItem('invalid!key');
      expect(result).toBe(false);
    });
  });

  describe('clearSecureStorage', () => {
    it('should remove all plenna-prefixed items', () => {
      localStorage.setItem('plenna_key1', 'value1');
      localStorage.setItem('plenna_key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      const result = clearSecureStorage();

      expect(result).toBe(true);
      expect(localStorage.getItem('plenna_key1')).toBeNull();
      expect(localStorage.getItem('plenna_key2')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });
  });

  describe('XSS protection', () => {
    // HTML-based XSS payloads - prevented by escaping < and >
    const htmlXssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>',
      '"><script>alert("xss")</script>',
      '<iframe src="javascript:alert(1)">',
      '<div style="background:url(javascript:alert(1))">',
      '<body onload=alert("xss")>',
      '<input onfocus=alert("xss") autofocus>',
    ];

    it.each(htmlXssPayloads)(
      'should escape HTML tags in payload: %s',
      (payload) => {
        setSecureStorageItem('xss-test', payload);
        const stored = localStorage.getItem('plenna_xss-test');
        // Verify < and > are escaped - this prevents HTML injection
        expect(stored).not.toContain('<');
        expect(stored).not.toContain('>');
        expect(stored).toContain('&lt;');
        expect(stored).toContain('&gt;');
      }
    );

    it('should properly escape and unescape values (roundtrip)', () => {
      const original = '<script>alert("xss")</script>';
      setSecureStorageItem('roundtrip', original);
      const retrieved = getSecureStorageItem('roundtrip');
      // Value should be restored exactly for legitimate use
      expect(retrieved).toBe(original);
    });

    it('should escape quotes to prevent attribute injection', () => {
      const payload = '" onclick="alert(1)" data-x="';
      setSecureStorageItem('quotes', payload);
      const stored = localStorage.getItem('plenna_quotes');
      expect(stored).not.toContain('"');
      expect(stored).toContain('&quot;');
    });

    it('should escape single quotes', () => {
      const payload = "' onclick='alert(1)' data-x='";
      setSecureStorageItem('single-quotes', payload);
      const stored = localStorage.getItem('plenna_single-quotes');
      expect(stored).not.toContain("'");
      expect(stored).toContain('&#x27;');
    });

    it('should escape forward slashes to prevent closing tags', () => {
      const payload = '</script><script>alert(1)</script>';
      setSecureStorageItem('slashes', payload);
      const stored = localStorage.getItem('plenna_slashes');
      expect(stored).toContain('&#x2F;');
    });
  });

  describe('error handling', () => {
    it('should handle localStorage.getItem throwing an error', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = getSecureStorageItem('test-key');
      expect(result).toBeNull();

      spy.mockRestore();
    });

    it('should handle localStorage.setItem throwing an error', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = setSecureStorageItem('test-key', 'value');
      expect(result).toBe(false);

      spy.mockRestore();
    });

    it('should handle localStorage.removeItem throwing an error', () => {
      const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = removeSecureStorageItem('test-key');
      expect(result).toBe(false);

      spy.mockRestore();
    });

    it('should handle localStorage errors during clearSecureStorage', () => {
      // First add some items using the real setItem
      localStorage.setItem('plenna_key1', 'value1');
      
      // Then mock removeItem to throw
      const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = clearSecureStorage();
      expect(result).toBe(false);

      spy.mockRestore();
      localStorage.clear();
    });
  });
});
