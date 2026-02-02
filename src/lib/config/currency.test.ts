import { describe, it, expect } from 'vitest';
import {
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
  CURRENCY_LOCALE,
  formatCurrency,
  parseCurrency,
} from './currency';

describe('currency config', () => {
  describe('constants', () => {
    it('should have correct currency symbol', () => {
      expect(CURRENCY_SYMBOL).toBe('R$');
    });

    it('should have correct currency code', () => {
      expect(CURRENCY_CODE).toBe('BRL');
    });

    it('should have correct locale', () => {
      expect(CURRENCY_LOCALE).toBe('pt-BR');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      const result = formatCurrency(1234.56);
      // Brazilian format: R$ 1.234,56
      expect(result).toContain('R$');
      expect(result).toContain('1.234,56');
    });

    it('should format zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('R$');
      expect(result).toContain('0,00');
    });

    it('should format negative numbers', () => {
      const result = formatCurrency(-100);
      expect(result).toContain('R$');
      expect(result).toContain('100,00');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(99.9);
      expect(result).toContain('99,90');
    });

    it('should handle large numbers', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1.000.000,00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency string with symbol', () => {
      const result = parseCurrency('R$ 1.234,56');
      expect(result).toBe(1234.56);
    });

    it('should parse currency string without symbol', () => {
      const result = parseCurrency('1.234,56');
      expect(result).toBe(1234.56);
    });

    it('should parse simple decimal', () => {
      const result = parseCurrency('99,90');
      expect(result).toBe(99.9);
    });

    it('should parse integer', () => {
      const result = parseCurrency('100');
      expect(result).toBe(100);
    });

    it('should return 0 for invalid input', () => {
      const result = parseCurrency('abc');
      expect(result).toBe(0);
    });

    it('should return 0 for empty string', () => {
      const result = parseCurrency('');
      expect(result).toBe(0);
    });

    it('should handle spaces', () => {
      const result = parseCurrency('R$  1.000,00');
      expect(result).toBe(1000);
    });

    it('should handle value with only symbol', () => {
      const result = parseCurrency('R$');
      expect(result).toBe(0);
    });
  });
});
