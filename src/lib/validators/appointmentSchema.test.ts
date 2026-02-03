import { describe, it, expect } from 'vitest';
import { appointmentSchema, appointmentUpdateSchema, rescheduleSchema } from './appointmentSchema';
import {
  MOCK_CLIENT_ID,
  MOCK_PROFESSIONAL_ID,
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
  MOCK_SERVICE_ID_3,
  MOCK_VALID_APPOINTMENT,
  MOCK_WALKIN_APPOINTMENT,
} from '@/test/mocks';

describe('appointmentSchema', () => {
  it('should accept valid appointment data', () => {
    const result = appointmentSchema.parse(MOCK_VALID_APPOINTMENT);
    expect(result.professional_id).toBe(MOCK_PROFESSIONAL_ID);
    expect(result.status).toBe('scheduled'); // default
  });

  it('should accept appointment with null client_id (walk-in)', () => {
    const result = appointmentSchema.parse(MOCK_WALKIN_APPOINTMENT);
    expect(result.client_id).toBeNull();
  });

  it('should accept appointment with multiple services', () => {
    const multiService = {
      ...MOCK_VALID_APPOINTMENT,
      service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2, MOCK_SERVICE_ID_3],
    };
    const result = appointmentSchema.parse(multiService);
    expect(result.service_ids).toHaveLength(3);
  });

  it('should reject empty service_ids array', () => {
    expect(() => appointmentSchema.parse({ ...MOCK_VALID_APPOINTMENT, service_ids: [] })).toThrow();
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenant } = MOCK_VALID_APPOINTMENT;
    expect(() => appointmentSchema.parse(noTenant)).toThrow();
  });

  it('should reject missing professional_id', () => {
    const { professional_id: _professional_id, ...noProfessional } = MOCK_VALID_APPOINTMENT;
    expect(() => appointmentSchema.parse(noProfessional)).toThrow();
  });

  it('should reject missing start_time', () => {
    const { start_time: _start_time, ...noStartTime } = MOCK_VALID_APPOINTMENT;
    expect(() => appointmentSchema.parse(noStartTime)).toThrow();
  });

  it('should reject missing service_ids', () => {
    const { service_ids: _service_ids, ...noServices } = MOCK_VALID_APPOINTMENT;
    expect(() => appointmentSchema.parse(noServices)).toThrow();
  });

  it('should reject invalid start_time format', () => {
    expect(() => appointmentSchema.parse({ ...MOCK_VALID_APPOINTMENT, start_time: 'invalid' })).toThrow();
  });

  it('should accept valid status values', () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
    for (const status of statuses) {
      const result = appointmentSchema.parse({ ...MOCK_VALID_APPOINTMENT, status });
      expect(result.status).toBe(status);
    }
  });

  it('should reject invalid status', () => {
    expect(() => appointmentSchema.parse({ ...MOCK_VALID_APPOINTMENT, status: 'invalid' })).toThrow();
  });

  it('should sanitize XSS in notes', () => {
    const result = appointmentSchema.parse({
      ...MOCK_VALID_APPOINTMENT,
      notes: '<script>alert(1)</script>',
    });
    expect(result.notes).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('should reject invalid UUID in service_ids', () => {
    expect(() => appointmentSchema.parse({
      ...MOCK_VALID_APPOINTMENT,
      service_ids: ['not-a-uuid'],
    })).toThrow();
  });
});

describe('appointmentUpdateSchema', () => {
  it('should accept partial updates', () => {
    const result = appointmentUpdateSchema.parse({ status: 'confirmed' });
    expect(result.status).toBe('confirmed');
  });

  it('should accept empty object', () => {
    const result = appointmentUpdateSchema.parse({});
    expect(result).toEqual({});
  });

  it('should validate status when present', () => {
    expect(() => appointmentUpdateSchema.parse({ status: 'invalid' })).toThrow();
  });

  it('should accept client_id update', () => {
    const result = appointmentUpdateSchema.parse({
      client_id: MOCK_CLIENT_ID,
    });
    expect(result.client_id).toBe(MOCK_CLIENT_ID);
  });

  it('should accept null client_id', () => {
    const result = appointmentUpdateSchema.parse({ client_id: null });
    expect(result.client_id).toBeNull();
  });
});

describe('rescheduleSchema', () => {
  it('should accept valid reschedule data', () => {
    const result = rescheduleSchema.parse({
      start_time: '2026-02-03T14:00:00Z',
    });
    expect(result.start_time).toBe('2026-02-03T14:00:00Z');
  });

  it('should accept reschedule with new professional', () => {
    const result = rescheduleSchema.parse({
      start_time: '2026-02-03T14:00:00Z',
      professional_id: MOCK_PROFESSIONAL_ID,
    });
    expect(result.professional_id).toBe(MOCK_PROFESSIONAL_ID);
  });

  it('should reject missing start_time', () => {
    expect(() => rescheduleSchema.parse({})).toThrow();
  });

  it('should reject invalid start_time', () => {
    expect(() => rescheduleSchema.parse({ start_time: 'invalid' })).toThrow();
  });
});
