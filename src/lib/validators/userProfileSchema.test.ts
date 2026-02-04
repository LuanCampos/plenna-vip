/**
 * Tests for userProfileSchema
 */
import { describe, it, expect } from 'vitest';
import { userProfileUpdateSchema } from './userProfileSchema';

describe('userProfileUpdateSchema', () => {
  const validUpdate = {
    name: 'Maria Silva',
    phone: '11999999999',
    avatar_url: 'https://example.com/avatar.jpg',
  };

  it('should accept valid profile update data', () => {
    const result = userProfileUpdateSchema.parse(validUpdate);
    expect(result.name).toBe('Maria Silva');
    expect(result.phone).toBe('11999999999');
    expect(result.avatar_url).toBe('https://example.com/avatar.jpg');
  });

  it('should accept profile without optional fields', () => {
    const result = userProfileUpdateSchema.parse({ name: 'Maria' });
    expect(result.name).toBe('Maria');
    expect(result.phone).toBeUndefined();
    expect(result.avatar_url).toBeUndefined();
  });

  it('should accept null phone', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, phone: null });
    expect(result.phone).toBeNull();
  });

  it('should accept null avatar_url', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, avatar_url: null });
    expect(result.avatar_url).toBeNull();
  });

  it('should accept empty string phone', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, phone: '' });
    expect(result.phone).toBe('');
  });

  it('should accept empty string avatar_url', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, avatar_url: '' });
    expect(result.avatar_url).toBe('');
  });

  it('should reject name too short', () => {
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, name: 'M' })).toThrow();
  });

  it('should reject name too long', () => {
    const longName = 'A'.repeat(101);
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, name: longName })).toThrow();
  });

  it('should reject invalid phone format', () => {
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, phone: '123' })).toThrow();
  });

  it('should reject invalid phone with letters', () => {
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, phone: '11999abc999' })).toThrow();
  });

  it('should accept phone with 10 digits', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, phone: '1199999999' });
    expect(result.phone).toBe('1199999999');
  });

  it('should accept phone with 11 digits', () => {
    const result = userProfileUpdateSchema.parse({ ...validUpdate, phone: '11999999999' });
    expect(result.phone).toBe('11999999999');
  });

  it('should reject phone with more than 11 digits', () => {
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, phone: '119999999999' })).toThrow();
  });

  it('should reject invalid URL for avatar', () => {
    expect(() => userProfileUpdateSchema.parse({ ...validUpdate, avatar_url: 'not-a-url' })).toThrow();
  });

  it('should accept valid HTTPS URL for avatar', () => {
    const result = userProfileUpdateSchema.parse({ 
      ...validUpdate, 
      avatar_url: 'https://secure.example.com/avatar.png' 
    });
    expect(result.avatar_url).toBe('https://secure.example.com/avatar.png');
  });

  it('should accept valid HTTP URL for avatar', () => {
    const result = userProfileUpdateSchema.parse({ 
      ...validUpdate, 
      avatar_url: 'http://example.com/avatar.png' 
    });
    expect(result.avatar_url).toBe('http://example.com/avatar.png');
  });

  it('should reject missing name', () => {
    const { name: _name, ...noName } = validUpdate;
    expect(() => userProfileUpdateSchema.parse(noName)).toThrow();
  });

  it('should accept minimum valid name', () => {
    const result = userProfileUpdateSchema.parse({ name: 'Jo' });
    expect(result.name).toBe('Jo');
  });

  it('should accept maximum valid name', () => {
    const maxName = 'A'.repeat(100);
    const result = userProfileUpdateSchema.parse({ name: maxName });
    expect(result.name).toBe(maxName);
  });
});
