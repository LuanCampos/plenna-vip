import { describe, it, expect } from 'vitest';
import {
  MAX_APPOINTMENTS_PER_DAY,
  MAX_PHOTOS_PER_SERVICE,
  MIN_BOOKING_NOTICE_HOURS,
  MAX_BOOKING_ADVANCE_DAYS,
  MAX_SERVICES_PER_PROFESSIONAL,
  MAX_PROFESSIONALS_PER_TENANT,
} from './limits';

describe('limits config', () => {
  describe('MAX_APPOINTMENTS_PER_DAY', () => {
    it('should be a positive number', () => {
      expect(MAX_APPOINTMENTS_PER_DAY).toBeGreaterThan(0);
    });

    it('should be 20 by default', () => {
      expect(MAX_APPOINTMENTS_PER_DAY).toBe(20);
    });
  });

  describe('MAX_PHOTOS_PER_SERVICE', () => {
    it('should be a positive number', () => {
      expect(MAX_PHOTOS_PER_SERVICE).toBeGreaterThan(0);
    });

    it('should be 10 by default', () => {
      expect(MAX_PHOTOS_PER_SERVICE).toBe(10);
    });
  });

  describe('MIN_BOOKING_NOTICE_HOURS', () => {
    it('should be a positive number', () => {
      expect(MIN_BOOKING_NOTICE_HOURS).toBeGreaterThan(0);
    });

    it('should be 2 hours by default', () => {
      expect(MIN_BOOKING_NOTICE_HOURS).toBe(2);
    });
  });

  describe('MAX_BOOKING_ADVANCE_DAYS', () => {
    it('should be a positive number', () => {
      expect(MAX_BOOKING_ADVANCE_DAYS).toBeGreaterThan(0);
    });

    it('should be 90 days by default', () => {
      expect(MAX_BOOKING_ADVANCE_DAYS).toBe(90);
    });
  });

  describe('MAX_SERVICES_PER_PROFESSIONAL', () => {
    it('should be a positive number', () => {
      expect(MAX_SERVICES_PER_PROFESSIONAL).toBeGreaterThan(0);
    });

    it('should be 50 by default', () => {
      expect(MAX_SERVICES_PER_PROFESSIONAL).toBe(50);
    });
  });

  describe('MAX_PROFESSIONALS_PER_TENANT', () => {
    it('should be a positive number', () => {
      expect(MAX_PROFESSIONALS_PER_TENANT).toBeGreaterThan(0);
    });

    it('should be 20 by default', () => {
      expect(MAX_PROFESSIONALS_PER_TENANT).toBe(20);
    });
  });
});
