import { describe, it, expect } from 'vitest';
import { en } from './en';
import { pt } from './pt';

describe('translations', () => {
  it('keeps pt and en keys in sync', () => {
    const enKeys = Object.keys(en).sort();
    const ptKeys = Object.keys(pt).sort();
    expect(enKeys).toEqual(ptKeys);
  });

  it('contains non-empty string values for every key', () => {
    const allEntries = Object.entries({ en, pt });

    allEntries.forEach(([lang, translations]) => {
      Object.entries(translations).forEach(([key, value]) => {
        expect(typeof value, `${lang}:${key} should be a string`).toBe('string');
        expect(value.length, `${lang}:${key} should not be empty`).toBeGreaterThan(0);
      });
    });
  });
});
