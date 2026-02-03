import { describe, it, expect } from 'vitest';
import { serviceSchema, serviceUpdateSchema } from './serviceSchema';
import {
  MOCK_TENANT_ID,
  MOCK_VALID_SERVICE,
  MOCK_MINIMAL_SERVICE,
} from '@/test/mocks';

describe('serviceSchema', () => {
  it('should accept valid service data', () => {
    const result = serviceSchema.parse(MOCK_VALID_SERVICE);
    expect(result.name).toBe('Corte Masculino');
    expect(result.price).toBe(50.00);
    expect(result.duration).toBe(30);
  });

  it('should accept service without optional fields', () => {
    const result = serviceSchema.parse(MOCK_MINIMAL_SERVICE);
    expect(result.name).toBe('Barba');
    expect(result.active).toBe(true); // default value
  });

  it('should accept zero price', () => {
    const result = serviceSchema.parse({ ...MOCK_VALID_SERVICE, price: 0 });
    expect(result.price).toBe(0);
  });

  it('should reject negative price', () => {
    expect(() => serviceSchema.parse({ ...MOCK_VALID_SERVICE, price: -10 })).toThrow();
  });

  it('should reject zero duration', () => {
    expect(() => serviceSchema.parse({ ...MOCK_VALID_SERVICE, duration: 0 })).toThrow();
  });

  it('should reject negative duration', () => {
    expect(() => serviceSchema.parse({ ...MOCK_VALID_SERVICE, duration: -30 })).toThrow();
  });

  it('should reject float duration', () => {
    expect(() => serviceSchema.parse({ ...MOCK_VALID_SERVICE, duration: 30.5 })).toThrow();
  });

  it('should reject name too short', () => {
    expect(() => serviceSchema.parse({ ...MOCK_VALID_SERVICE, name: 'C' })).toThrow();
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenant } = MOCK_VALID_SERVICE;
    expect(() => serviceSchema.parse(noTenant)).toThrow();
  });

  it('should reject missing name', () => {
    const { name: _name, ...noName } = MOCK_VALID_SERVICE;
    expect(() => serviceSchema.parse(noName)).toThrow();
  });

  it('should reject missing price', () => {
    const { price: _price, ...noPrice } = MOCK_VALID_SERVICE;
    expect(() => serviceSchema.parse(noPrice)).toThrow();
  });

  it('should reject missing duration', () => {
    const { duration: _duration, ...noDuration } = MOCK_VALID_SERVICE;
    expect(() => serviceSchema.parse(noDuration)).toThrow();
  });

  it('should sanitize XSS in description', () => {
    const result = serviceSchema.parse({
      ...MOCK_VALID_SERVICE,
      description: '<img src=x onerror=alert(1)>',
    });
    expect(result.description).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('serviceUpdateSchema', () => {
  it('should accept partial updates', () => {
    const result = serviceUpdateSchema.parse({ price: 60 });
    expect(result.price).toBe(60);
  });

  it('should reject tenant_id in update', () => {
    const result = serviceUpdateSchema.parse({
      tenant_id: MOCK_TENANT_ID,
      price: 60,
    });
    expect(result).not.toHaveProperty('tenant_id');
  });

  it('should accept empty object', () => {
    const result = serviceUpdateSchema.parse({});
    expect(result).toEqual({});
  });

  it('should validate price when present', () => {
    expect(() => serviceUpdateSchema.parse({ price: -10 })).toThrow();
  });

  it('should validate duration when present', () => {
    expect(() => serviceUpdateSchema.parse({ duration: 0 })).toThrow();
  });
});
