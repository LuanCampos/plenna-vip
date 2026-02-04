/**
 * Tests for tenantUserSchema
 */
import { describe, it, expect } from 'vitest';
import { 
  tenantUserCreateSchema, 
  tenantUserUpdateSchema,
  assignableRoleSchema,
  fullRoleSchema,
} from './tenantUserSchema';
import { MOCK_TENANT_ID, INVALID_UUID } from '@/test/mocks';

describe('tenantUserCreateSchema', () => {
  const validCreate = {
    tenant_id: MOCK_TENANT_ID,
    email: 'member@example.com',
    role: 'staff' as const,
  };

  it('should accept valid create data with staff role', () => {
    const result = tenantUserCreateSchema.parse(validCreate);
    expect(result.tenant_id).toBe(MOCK_TENANT_ID);
    expect(result.email).toBe('member@example.com');
    expect(result.role).toBe('staff');
  });

  it('should accept valid create data with admin role', () => {
    const result = tenantUserCreateSchema.parse({ ...validCreate, role: 'admin' });
    expect(result.role).toBe('admin');
  });

  it('should reject owner role', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, role: 'owner' })).toThrow();
  });

  it('should reject invalid role', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, role: 'superuser' })).toThrow();
  });

  it('should reject invalid tenant_id', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, tenant_id: INVALID_UUID })).toThrow();
  });

  it('should reject empty tenant_id', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, tenant_id: '' })).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, email: 'invalid' })).toThrow();
  });

  it('should reject empty email', () => {
    expect(() => tenantUserCreateSchema.parse({ ...validCreate, email: '' })).toThrow();
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenantId } = validCreate;
    expect(() => tenantUserCreateSchema.parse(noTenantId)).toThrow();
  });

  it('should reject missing email', () => {
    const { email: _email, ...noEmail } = validCreate;
    expect(() => tenantUserCreateSchema.parse(noEmail)).toThrow();
  });

  it('should reject missing role', () => {
    const { role: _role, ...noRole } = validCreate;
    expect(() => tenantUserCreateSchema.parse(noRole)).toThrow();
  });
});

describe('tenantUserUpdateSchema', () => {
  it('should accept valid update with staff role', () => {
    const result = tenantUserUpdateSchema.parse({ role: 'staff' });
    expect(result.role).toBe('staff');
  });

  it('should accept valid update with admin role', () => {
    const result = tenantUserUpdateSchema.parse({ role: 'admin' });
    expect(result.role).toBe('admin');
  });

  it('should reject owner role in update', () => {
    expect(() => tenantUserUpdateSchema.parse({ role: 'owner' })).toThrow();
  });

  it('should reject invalid role', () => {
    expect(() => tenantUserUpdateSchema.parse({ role: 'manager' })).toThrow();
  });

  it('should reject empty role', () => {
    expect(() => tenantUserUpdateSchema.parse({ role: '' })).toThrow();
  });

  it('should reject missing role', () => {
    expect(() => tenantUserUpdateSchema.parse({})).toThrow();
  });
});

describe('assignableRoleSchema', () => {
  it('should accept staff', () => {
    expect(assignableRoleSchema.parse('staff')).toBe('staff');
  });

  it('should accept admin', () => {
    expect(assignableRoleSchema.parse('admin')).toBe('admin');
  });

  it('should reject owner', () => {
    expect(() => assignableRoleSchema.parse('owner')).toThrow();
  });
});

describe('fullRoleSchema', () => {
  it('should accept owner', () => {
    expect(fullRoleSchema.parse('owner')).toBe('owner');
  });

  it('should accept admin', () => {
    expect(fullRoleSchema.parse('admin')).toBe('admin');
  });

  it('should accept staff', () => {
    expect(fullRoleSchema.parse('staff')).toBe('staff');
  });

  it('should reject invalid role', () => {
    expect(() => fullRoleSchema.parse('superuser')).toThrow();
  });
});
