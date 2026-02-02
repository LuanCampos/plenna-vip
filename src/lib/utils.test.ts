import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (class name merger)', () => {
  it('should merge simple class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base active');
  });

  it('should merge Tailwind classes and resolve conflicts', () => {
    // twMerge should keep the last conflicting class
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle object syntax', () => {
    const result = cn('base', { active: true, disabled: false });
    expect(result).toBe('base active');
  });

  it('should handle array syntax', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'extra');
    expect(result).toBe('base extra');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should resolve complex Tailwind conflicts', () => {
    // bg-red-500 should be replaced by bg-blue-500
    const result = cn('bg-red-500 p-2', 'bg-blue-500');
    expect(result).toBe('p-2 bg-blue-500');
  });

  it('should preserve non-conflicting classes', () => {
    const result = cn('text-sm font-bold', 'text-center');
    expect(result).toBe('text-sm font-bold text-center');
  });
});
