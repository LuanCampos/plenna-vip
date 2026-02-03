import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  optionalPhoneSchema,
  emailSchema,
  optionalEmailSchema,
  nameSchema,
  uuidSchema,
  priceSchema,
  durationSchema,
  dateTimeSchema,
  dateSchema,
  timeSchema,
  sanitizedTextSchema,
} from './commonSchemas';
import { MOCK_TENANT_ID, INVALID_UUID } from '@/test/mocks';

describe('commonSchemas', () => {
  describe('phoneSchema', () => {
    it('should accept valid 10-digit phone', () => {
      expect(phoneSchema.parse('1199999999')).toBe('1199999999');
    });

    it('should accept valid 11-digit phone', () => {
      expect(phoneSchema.parse('11999999999')).toBe('11999999999');
    });

    it('should reject empty phone', () => {
      expect(() => phoneSchema.parse('')).toThrow();
    });

    it('should reject phone with less than 10 digits', () => {
      expect(() => phoneSchema.parse('123456789')).toThrow();
    });

    it('should reject phone with more than 11 digits', () => {
      expect(() => phoneSchema.parse('123456789012')).toThrow();
    });

    it('should reject phone with letters', () => {
      expect(() => phoneSchema.parse('119999999a')).toThrow();
    });

    it('should reject phone with special characters', () => {
      expect(() => phoneSchema.parse('(11)99999-9999')).toThrow();
    });
  });

  describe('optionalPhoneSchema', () => {
    it('should accept valid phone', () => {
      expect(optionalPhoneSchema.parse('11999999999')).toBe('11999999999');
    });

    it('should accept undefined', () => {
      expect(optionalPhoneSchema.parse(undefined)).toBeUndefined();
    });

    it('should accept empty string', () => {
      expect(optionalPhoneSchema.parse('')).toBe('');
    });

    it('should reject invalid phone format', () => {
      expect(() => optionalPhoneSchema.parse('123')).toThrow();
    });
  });

  describe('emailSchema', () => {
    it('should accept valid email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should accept email with subdomain', () => {
      expect(emailSchema.parse('user@mail.example.com')).toBe('user@mail.example.com');
    });

    it('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
    });

    it('should reject email without @', () => {
      expect(() => emailSchema.parse('testexample.com')).toThrow();
    });

    it('should reject email without domain', () => {
      expect(() => emailSchema.parse('test@')).toThrow();
    });
  });

  describe('optionalEmailSchema', () => {
    it('should accept valid email', () => {
      expect(optionalEmailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should accept undefined', () => {
      expect(optionalEmailSchema.parse(undefined)).toBeUndefined();
    });

    it('should accept empty string', () => {
      expect(optionalEmailSchema.parse('')).toBe('');
    });
  });

  describe('nameSchema', () => {
    it('should accept valid name', () => {
      expect(nameSchema.parse('John Doe')).toBe('John Doe');
    });

    it('should accept 2 character name', () => {
      expect(nameSchema.parse('Jo')).toBe('Jo');
    });

    it('should accept 100 character name', () => {
      const longName = 'a'.repeat(100);
      expect(nameSchema.parse(longName)).toBe(longName);
    });

    it('should reject empty name', () => {
      expect(() => nameSchema.parse('')).toThrow();
    });

    it('should reject single character name', () => {
      expect(() => nameSchema.parse('J')).toThrow();
    });

    it('should reject name over 100 characters', () => {
      const tooLongName = 'a'.repeat(101);
      expect(() => nameSchema.parse(tooLongName)).toThrow();
    });
  });

  describe('uuidSchema', () => {
    it('should accept valid UUID', () => {
      expect(uuidSchema.parse(MOCK_TENANT_ID)).toBe(MOCK_TENANT_ID);
    });

    it('should reject invalid UUID', () => {
      expect(() => uuidSchema.parse(INVALID_UUID)).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => uuidSchema.parse('')).toThrow();
    });
  });

  describe('priceSchema', () => {
    it('should accept zero', () => {
      expect(priceSchema.parse(0)).toBe(0);
    });

    it('should accept positive number', () => {
      expect(priceSchema.parse(99.99)).toBe(99.99);
    });

    it('should accept integer', () => {
      expect(priceSchema.parse(100)).toBe(100);
    });

    it('should reject negative number', () => {
      expect(() => priceSchema.parse(-1)).toThrow();
    });
  });

  describe('durationSchema', () => {
    it('should accept positive integer', () => {
      expect(durationSchema.parse(30)).toBe(30);
    });

    it('should accept 1', () => {
      expect(durationSchema.parse(1)).toBe(1);
    });

    it('should reject zero', () => {
      expect(() => durationSchema.parse(0)).toThrow();
    });

    it('should reject negative number', () => {
      expect(() => durationSchema.parse(-30)).toThrow();
    });

    it('should reject float', () => {
      expect(() => durationSchema.parse(30.5)).toThrow();
    });
  });

  describe('dateTimeSchema', () => {
    it('should accept valid ISO 8601 datetime', () => {
      const dateTime = '2026-02-02T10:00:00Z';
      expect(dateTimeSchema.parse(dateTime)).toBe(dateTime);
    });

    it('should accept datetime with timezone offset', () => {
      const dateTime = '2026-02-02T10:00:00-03:00';
      expect(dateTimeSchema.parse(dateTime)).toBe(dateTime);
    });

    it('should reject invalid datetime', () => {
      expect(() => dateTimeSchema.parse('invalid-date')).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => dateTimeSchema.parse('')).toThrow();
    });
  });

  describe('dateSchema', () => {
    it('should accept valid date format', () => {
      expect(dateSchema.parse('2026-02-02')).toBe('2026-02-02');
    });

    it('should reject datetime format', () => {
      expect(() => dateSchema.parse('2026-02-02T10:00:00Z')).toThrow();
    });

    it('should reject invalid date format', () => {
      expect(() => dateSchema.parse('02/02/2026')).toThrow();
    });
  });

  describe('timeSchema', () => {
    it('should accept valid time format', () => {
      expect(timeSchema.parse('09:00')).toBe('09:00');
    });

    it('should accept midnight', () => {
      expect(timeSchema.parse('00:00')).toBe('00:00');
    });

    it('should accept 23:59', () => {
      expect(timeSchema.parse('23:59')).toBe('23:59');
    });

    it('should reject 24:00', () => {
      expect(() => timeSchema.parse('24:00')).toThrow();
    });

    it('should reject invalid minutes', () => {
      expect(() => timeSchema.parse('12:60')).toThrow();
    });

    it('should reject time without leading zero', () => {
      expect(() => timeSchema.parse('9:00')).toThrow();
    });
  });

  describe('sanitizedTextSchema', () => {
    it('should accept normal text', () => {
      expect(sanitizedTextSchema.parse('Hello World')).toBe('Hello World');
    });

    it('should escape HTML tags', () => {
      expect(sanitizedTextSchema.parse('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });

    it('should escape angle brackets in text', () => {
      expect(sanitizedTextSchema.parse('a < b > c')).toBe('a &lt; b &gt; c');
    });

    it('should reject text over 500 characters', () => {
      const longText = 'a'.repeat(501);
      expect(() => sanitizedTextSchema.parse(longText)).toThrow();
    });

    it('should accept 500 character text', () => {
      const text = 'a'.repeat(500);
      expect(sanitizedTextSchema.parse(text)).toBe(text);
    });

    // XSS attack vectors
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '<body onload=alert(1)>',
    ];

    it.each(xssPayloads)('should neutralize XSS payload: %s', (payload) => {
      const result = sanitizedTextSchema.parse(payload);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });
});
