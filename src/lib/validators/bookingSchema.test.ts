import { describe, it, expect } from 'vitest';
import {
  publicBookingSchema,
  bookingServicesStepSchema,
  bookingProfessionalStepSchema,
  bookingDateTimeStepSchema,
  bookingClientInfoStepSchema,
} from './bookingSchema';
import {
  MOCK_SERVICE_ID,
  MOCK_SERVICE_ID_2,
  MOCK_PROFESSIONAL_ID,
  MOCK_VALID_PUBLIC_BOOKING,
  MOCK_MINIMAL_PUBLIC_BOOKING,
  MOCK_MULTI_SERVICE_BOOKING,
  MOCK_SERVICES_STEP,
  MOCK_PROFESSIONAL_STEP,
  MOCK_DATETIME_STEP,
  MOCK_CLIENT_INFO_STEP,
  MOCK_MINIMAL_CLIENT_INFO_STEP,
} from '@/test/mocks';

describe('publicBookingSchema', () => {
  it('should accept valid booking data', () => {
    const result = publicBookingSchema.parse(MOCK_VALID_PUBLIC_BOOKING);
    expect(result.client_name).toBe('Maria Silva');
    expect(result.client_phone).toBe('11999999999');
  });

  it('should accept booking without optional fields', () => {
    const result = publicBookingSchema.parse(MOCK_MINIMAL_PUBLIC_BOOKING);
    expect(result.client_name).toBe('João');
  });

  it('should accept booking with multiple services', () => {
    const result = publicBookingSchema.parse(MOCK_MULTI_SERVICE_BOOKING);
    expect(result.service_ids).toHaveLength(2);
  });

  it('should reject empty service_ids', () => {
    expect(() => publicBookingSchema.parse({ ...MOCK_VALID_PUBLIC_BOOKING, service_ids: [] })).toThrow();
  });

  it('should reject missing tenant_id', () => {
    const { tenant_id: _tenant_id, ...noTenant } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noTenant)).toThrow();
  });

  it('should reject missing professional_id', () => {
    const { professional_id: _professional_id, ...noProfessional } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noProfessional)).toThrow();
  });

  it('should reject missing service_ids', () => {
    const { service_ids: _service_ids, ...noServices } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noServices)).toThrow();
  });

  it('should reject missing start_time', () => {
    const { start_time: _start_time, ...noStartTime } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noStartTime)).toThrow();
  });

  it('should reject missing client_name', () => {
    const { client_name: _client_name, ...noName } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noName)).toThrow();
  });

  it('should reject missing client_phone', () => {
    const { client_phone: _client_phone, ...noPhone } = MOCK_VALID_PUBLIC_BOOKING;
    expect(() => publicBookingSchema.parse(noPhone)).toThrow();
  });

  it('should reject invalid phone', () => {
    expect(() => publicBookingSchema.parse({ ...MOCK_VALID_PUBLIC_BOOKING, client_phone: '123' })).toThrow();
  });

  it('should reject invalid email', () => {
    expect(() => publicBookingSchema.parse({ ...MOCK_VALID_PUBLIC_BOOKING, client_email: 'invalid' })).toThrow();
  });

  it('should reject short name', () => {
    expect(() => publicBookingSchema.parse({ ...MOCK_VALID_PUBLIC_BOOKING, client_name: 'M' })).toThrow();
  });

  it('should sanitize XSS in notes', () => {
    const result = publicBookingSchema.parse({
      ...MOCK_VALID_PUBLIC_BOOKING,
      notes: '<script>alert(1)</script>',
    });
    expect(result.notes).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

describe('bookingServicesStepSchema', () => {
  it('should accept valid service selection', () => {
    const result = bookingServicesStepSchema.parse(MOCK_SERVICES_STEP);
    expect(result.service_ids).toHaveLength(1);
  });

  it('should accept multiple services', () => {
    const result = bookingServicesStepSchema.parse({
      service_ids: [MOCK_SERVICE_ID, MOCK_SERVICE_ID_2],
    });
    expect(result.service_ids).toHaveLength(2);
  });

  it('should reject empty array', () => {
    expect(() => bookingServicesStepSchema.parse({ service_ids: [] })).toThrow();
  });

  it('should reject missing service_ids', () => {
    expect(() => bookingServicesStepSchema.parse({})).toThrow();
  });
});

describe('bookingProfessionalStepSchema', () => {
  it('should accept valid professional selection', () => {
    const result = bookingProfessionalStepSchema.parse(MOCK_PROFESSIONAL_STEP);
    expect(result.professional_id).toBe(MOCK_PROFESSIONAL_ID);
  });

  it('should reject missing professional_id', () => {
    expect(() => bookingProfessionalStepSchema.parse({})).toThrow();
  });

  it('should reject invalid UUID', () => {
    expect(() => bookingProfessionalStepSchema.parse({ professional_id: 'invalid' })).toThrow();
  });
});

describe('bookingDateTimeStepSchema', () => {
  it('should accept valid datetime', () => {
    const result = bookingDateTimeStepSchema.parse(MOCK_DATETIME_STEP);
    expect(result.start_time).toBe('2026-02-02T10:00:00Z');
  });

  it('should reject missing start_time', () => {
    expect(() => bookingDateTimeStepSchema.parse({})).toThrow();
  });

  it('should reject invalid datetime', () => {
    expect(() => bookingDateTimeStepSchema.parse({ start_time: 'invalid' })).toThrow();
  });
});

describe('bookingClientInfoStepSchema', () => {
  it('should accept valid client info', () => {
    const result = bookingClientInfoStepSchema.parse({
      ...MOCK_CLIENT_INFO_STEP,
      notes: 'Notas opcionais',
    });
    expect(result.client_name).toBe('Maria Silva');
  });

  it('should accept without optional fields', () => {
    const result = bookingClientInfoStepSchema.parse(MOCK_MINIMAL_CLIENT_INFO_STEP);
    expect(result.client_name).toBe('João');
  });

  it('should reject missing client_name', () => {
    expect(() => bookingClientInfoStepSchema.parse({
      client_phone: '11999999999',
    })).toThrow();
  });

  it('should reject missing client_phone', () => {
    expect(() => bookingClientInfoStepSchema.parse({
      client_name: 'Test',
    })).toThrow();
  });
});
