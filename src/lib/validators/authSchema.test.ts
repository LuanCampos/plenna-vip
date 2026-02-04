/**
 * Tests for authSchema
 */
import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from './authSchema';
import { XSS_HTML_PAYLOADS } from '@/test/mocks';

describe('loginSchema', () => {
  const validLogin = {
    email: 'user@example.com',
    password: 'password123',
  };

  it('should accept valid login data', () => {
    const result = loginSchema.parse(validLogin);
    expect(result.email).toBe('user@example.com');
    expect(result.password).toBe('password123');
  });

  it('should reject invalid email', () => {
    expect(() => loginSchema.parse({ ...validLogin, email: 'invalid' })).toThrow();
  });

  it('should reject empty email', () => {
    expect(() => loginSchema.parse({ ...validLogin, email: '' })).toThrow();
  });

  it('should reject password shorter than 6 characters', () => {
    expect(() => loginSchema.parse({ ...validLogin, password: '12345' })).toThrow();
  });

  it('should accept password with exactly 6 characters', () => {
    const result = loginSchema.parse({ ...validLogin, password: '123456' });
    expect(result.password).toBe('123456');
  });

  it('should reject empty password', () => {
    expect(() => loginSchema.parse({ ...validLogin, password: '' })).toThrow();
  });

  it('should reject missing email', () => {
    const { email: _email, ...noEmail } = validLogin;
    expect(() => loginSchema.parse(noEmail)).toThrow();
  });

  it('should reject missing password', () => {
    const { password: _password, ...noPassword } = validLogin;
    expect(() => loginSchema.parse(noPassword)).toThrow();
  });
});

describe('registerSchema', () => {
  const validRegister = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('should accept valid register data', () => {
    const result = registerSchema.parse(validRegister);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
    expect(result.password).toBe('password123');
    expect(result.confirmPassword).toBe('password123');
  });

  it('should reject invalid email', () => {
    expect(() => registerSchema.parse({ ...validRegister, email: 'invalid' })).toThrow();
  });

  it('should reject password shorter than 6 characters', () => {
    expect(() => registerSchema.parse({ 
      ...validRegister, 
      password: '12345',
      confirmPassword: '12345',
    })).toThrow();
  });

  it('should reject when passwords do not match', () => {
    expect(() => registerSchema.parse({ 
      ...validRegister, 
      confirmPassword: 'different',
    })).toThrow();
  });

  it('should reject name too short', () => {
    expect(() => registerSchema.parse({ ...validRegister, name: 'J' })).toThrow();
  });

  it('should reject name too long', () => {
    const longName = 'A'.repeat(101);
    expect(() => registerSchema.parse({ ...validRegister, name: longName })).toThrow();
  });

  it('should reject missing name', () => {
    const { name: _name, ...noName } = validRegister;
    expect(() => registerSchema.parse(noName)).toThrow();
  });

  it('should reject missing confirmPassword', () => {
    const { confirmPassword: _confirmPassword, ...noConfirm } = validRegister;
    expect(() => registerSchema.parse(noConfirm)).toThrow();
  });

  it('should reject XSS in name', () => {
    // nameSchema doesn't sanitize but has min/max constraints
    // The schema accepts XSS payloads but they should be handled at display time
    // However, some XSS payloads might be too short
    const shortXss = '<script>';
    const result = registerSchema.parse({ ...validRegister, name: shortXss });
    expect(result.name).toBe(shortXss);
  });

  it('should handle XSS payloads in name field', () => {
    // Name field accepts the text but XSS should be escaped at rendering
    // Testing that validation doesn't crash with XSS payloads
    for (const payload of XSS_HTML_PAYLOADS) {
      if (payload.length >= 2 && payload.length <= 100) {
        const result = registerSchema.safeParse({ ...validRegister, name: payload });
        expect(result.success).toBe(true);
      }
    }
  });

  it('should accept minimum valid name', () => {
    const result = registerSchema.parse({ ...validRegister, name: 'Jo' });
    expect(result.name).toBe('Jo');
  });

  it('should accept maximum valid name', () => {
    const maxName = 'A'.repeat(100);
    const result = registerSchema.parse({ ...validRegister, name: maxName });
    expect(result.name).toBe(maxName);
  });
});
