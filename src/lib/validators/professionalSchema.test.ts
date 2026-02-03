import { describe, it, expect } from 'vitest';
import { professionalSchema, professionalUpdateSchema } from './professionalSchema';
import {
  MOCK_TENANT_ID,
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
  MOCK_USER_ID,
  MOCK_VALID_PROFESSIONAL,
  MOCK_MINIMAL_PROFESSIONAL,
} from '@/test/mocks';

describe('professionalSchema', () => {
  it('should accept valid professional data', () => {
    const result = professionalSchema.parse(MOCK_VALID_PROFESSIONAL);
    expect(result.name).toBe('João Silva');
    expect(result.active).toBe(true);
  });

  it('should accept professional without optional fields', () => {
    const result = professionalSchema.parse(MOCK_MINIMAL_PROFESSIONAL);
    expect(result.name).toBe('Maria');
    expect(result.active).toBe(true); // default value
  });

  it('should accept professional with service_ids', () => {
    const withServices = {
      ...MOCK_VALID_PROFESSIONAL,
      service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2],
    };
    const result = professionalSchema.parse(withServices);
    expect(result.service_ids).toHaveLength(2);
  });

  it('should accept professional with user_id', () => {
    const withUser = {
      ...MOCK_VALID_PROFESSIONAL,
      user_id: MOCK_USER_ID,
    };
    const result = professionalSchema.parse(withUser);
    expect(result.user_id).toBe(MOCK_USER_ID);
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenant } = MOCK_VALID_PROFESSIONAL;
    expect(() => professionalSchema.parse(noTenant)).toThrow();
  });

  it('should reject missing name', () => {
    const { name: _name, ...noName } = MOCK_VALID_PROFESSIONAL;
    expect(() => professionalSchema.parse(noName)).toThrow();
  });

  it('should reject name too short', () => {
    expect(() => professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, name: 'J' })).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, email: 'invalid' })).toThrow();
  });

  it('should accept empty email', () => {
    const result = professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, email: '' });
    expect(result.email).toBe('');
  });

  it('should reject invalid phone', () => {
    expect(() => professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, phone: '123' })).toThrow();
  });

  it('should accept empty phone', () => {
    const result = professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, phone: '' });
    expect(result.phone).toBe('');
  });

  it('should reject invalid avatar_url', () => {
    expect(() => professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, avatar_url: 'not-a-url' })).toThrow();
  });

  it('should accept empty avatar_url', () => {
    const result = professionalSchema.parse({ ...MOCK_VALID_PROFESSIONAL, avatar_url: '' });
    expect(result.avatar_url).toBe('');
  });

  it('should reject invalid service_id in array', () => {
    expect(() => professionalSchema.parse({
      ...MOCK_VALID_PROFESSIONAL,
      service_ids: ['not-a-uuid'],
    })).toThrow();
  });
});

describe('professionalUpdateSchema', () => {
  it('should accept partial updates', () => {
    const result = professionalUpdateSchema.parse({ name: 'Novo Nome' });
    expect(result.name).toBe('Novo Nome');
  });

  it('should reject tenant_id in update', () => {
    const result = professionalUpdateSchema.parse({
      tenant_id: MOCK_TENANT_ID,
      name: 'Test',
    });
    expect(result).not.toHaveProperty('tenant_id');
  });

  it('should accept empty object', () => {
    const result = professionalUpdateSchema.parse({});
    expect(result).toEqual({});
  });

  it('should accept active status change', () => {
    const result = professionalUpdateSchema.parse({ active: false });
    expect(result.active).toBe(false);
  });
});
