import { describe, it, expect } from 'vitest';
import {
  BOOKING_SLOT_DURATION,
  BUSINESS_HOURS,
  DAYS_OF_WEEK,
  DAYS_OF_WEEK_SHORT,
  APPOINTMENT_STATUSES,
} from './business';

describe('business config', () => {
  describe('BOOKING_SLOT_DURATION', () => {
    it('should be a positive number', () => {
      expect(BOOKING_SLOT_DURATION).toBeGreaterThan(0);
    });

    it('should be 30 minutes by default', () => {
      expect(BOOKING_SLOT_DURATION).toBe(30);
    });
  });

  describe('BUSINESS_HOURS', () => {
    it('should have start and end times', () => {
      expect(BUSINESS_HOURS).toHaveProperty('start');
      expect(BUSINESS_HOURS).toHaveProperty('end');
    });

    it('should have valid time format (HH:mm)', () => {
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(BUSINESS_HOURS.start).toMatch(timeRegex);
      expect(BUSINESS_HOURS.end).toMatch(timeRegex);
    });

    it('should have default hours 08:00-20:00', () => {
      expect(BUSINESS_HOURS.start).toBe('08:00');
      expect(BUSINESS_HOURS.end).toBe('20:00');
    });
  });

  describe('DAYS_OF_WEEK', () => {
    it('should have 7 days', () => {
      expect(DAYS_OF_WEEK).toHaveLength(7);
    });

    it('should start with Sunday (Domingo)', () => {
      expect(DAYS_OF_WEEK[0]).toBe('Domingo');
    });

    it('should end with Saturday (Sábado)', () => {
      expect(DAYS_OF_WEEK[6]).toBe('Sábado');
    });
  });

  describe('DAYS_OF_WEEK_SHORT', () => {
    it('should have 7 days', () => {
      expect(DAYS_OF_WEEK_SHORT).toHaveLength(7);
    });

    it('should have short versions (3 chars)', () => {
      expect(DAYS_OF_WEEK_SHORT[0]).toBe('Dom');
      expect(DAYS_OF_WEEK_SHORT[1]).toBe('Seg');
    });
  });

  describe('APPOINTMENT_STATUSES', () => {
    it('should have all expected statuses', () => {
      expect(APPOINTMENT_STATUSES).toContain('scheduled');
      expect(APPOINTMENT_STATUSES).toContain('confirmed');
      expect(APPOINTMENT_STATUSES).toContain('completed');
      expect(APPOINTMENT_STATUSES).toContain('cancelled');
      expect(APPOINTMENT_STATUSES).toContain('no_show');
    });

    it('should have exactly 5 statuses', () => {
      expect(APPOINTMENT_STATUSES).toHaveLength(5);
    });
  });
});
