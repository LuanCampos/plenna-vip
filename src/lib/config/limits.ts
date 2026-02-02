/**
 * Application limits configuration
 * Centralized to facilitate changes and prepare for plan-based limits
 */

/** Maximum appointments per professional per day */
export const MAX_APPOINTMENTS_PER_DAY = 20;

/** Maximum photos per service */
export const MAX_PHOTOS_PER_SERVICE = 10;

/** Minimum hours notice for booking */
export const MIN_BOOKING_NOTICE_HOURS = 2;

/** Maximum days in advance for booking */
export const MAX_BOOKING_ADVANCE_DAYS = 90;

/** Maximum services per professional */
export const MAX_SERVICES_PER_PROFESSIONAL = 50;

/** Maximum professionals per tenant */
export const MAX_PROFESSIONALS_PER_TENANT = 20;
