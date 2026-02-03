import { describe, it, expect } from 'vitest';
import { clientSchema, clientUpdateSchema, clientPublicSchema } from './clientSchema';
import { MOCK_TENANT_ID, MOCK_VALID_CLIENT, MOCK_MINIMAL_CLIENT, MOCK_PUBLIC_CLIENT } from '@/test/mocks';

describe('clientSchema', () => {
  it('should accept valid client data', () => {
    const result = clientSchema.parse(MOCK_VALID_CLIENT);
    expect(result.name).toBe('Maria Silva');
    expect(result.phone).toBe('11999999999');
  });

  it('should accept client without optional fields', () => {
    const result = clientSchema.parse(MOCK_MINIMAL_CLIENT);
    expect(result.name).toBe('João');
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenant } = MOCK_VALID_CLIENT;
    expect(() => clientSchema.parse(noTenant)).toThrow();
  });

  it('should reject missing name', () => {
    const { name: _name, ...noName } = MOCK_VALID_CLIENT;
    expect(() => clientSchema.parse(noName)).toThrow();
  });

  it('should reject missing phone', () => {
    const { phone: _phone, ...noPhone } = MOCK_VALID_CLIENT;
    expect(() => clientSchema.parse(noPhone)).toThrow();
  });

  it('should reject name too short', () => {
    expect(() => clientSchema.parse({ ...MOCK_VALID_CLIENT, name: 'M' })).toThrow();
  });

  it('should reject invalid phone', () => {
    expect(() => clientSchema.parse({ ...MOCK_VALID_CLIENT, phone: '123' })).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => clientSchema.parse({ ...MOCK_VALID_CLIENT, email: 'invalid' })).toThrow();
  });

  it('should sanitize XSS in notes', () => {
    const result = clientSchema.parse({
      ...MOCK_VALID_CLIENT,
      notes: '<script>alert("xss")</script>',
    });
    expect(result.notes).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
  });

  it('should accept empty email', () => {
    const result = clientSchema.parse({ ...MOCK_VALID_CLIENT, email: '' });
    expect(result.email).toBe('');
  });
});

describe('clientUpdateSchema', () => {
  it('should accept partial updates', () => {
    const result = clientUpdateSchema.parse({ name: 'Novo Nome' });
    expect(result.name).toBe('Novo Nome');
  });

  it('should reject tenant_id in update', () => {
    const result = clientUpdateSchema.parse({ 
      tenant_id: MOCK_TENANT_ID,
      name: 'Test' 
    });
    expect(result).not.toHaveProperty('tenant_id');
  });

  it('should accept empty object', () => {
    const result = clientUpdateSchema.parse({});
    expect(result).toEqual({});
  });
});

describe('clientPublicSchema', () => {
  it('should accept valid public client data', () => {
    const result = clientPublicSchema.parse(MOCK_PUBLIC_CLIENT);
    expect(result.name).toBe('Cliente Público');
  });

  it('should accept without email', () => {
    const result = clientPublicSchema.parse({
      name: 'Cliente',
      phone: '11999999999',
    });
    expect(result.name).toBe('Cliente');
  });

  it('should reject missing name', () => {
    expect(() => clientPublicSchema.parse({ phone: '11999999999' })).toThrow();
  });

  it('should reject missing phone', () => {
    expect(() => clientPublicSchema.parse({ name: 'Test' })).toThrow();
  });
});
