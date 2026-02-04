/**
 * Availability service for calculating available time slots.
 * Handles business hours, schedule overrides, and existing appointments.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { BOOKING_SLOT_DURATION } from '@/lib/config/business';
import type { TimeSlot } from '@/types/booking';
import type { Appointment } from '@/types/appointment';

const SCHEDULE_OVERRIDES_TABLE = 'professional_schedule_overrides';

/** Day names as stored in business_hours JSONB */
const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

type DayName = (typeof DAY_NAMES)[number];

interface TimeRange {
  start: string;
  end: string;
}

interface BusinessHours {
  sunday: TimeRange[];
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
}

interface ScheduleOverride {
  id: string;
  professional_id: string;
  start_date: string;
  end_date: string;
  override_type: 'available' | 'unavailable';
  start_time: string | null;
  end_time: string | null;
  reason?: string;
}


/**
 * Parse time string (HH:MM) to minutes from midnight.
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/**
 * Format minutes from midnight to HH:MM string.
 */
function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if a slot conflicts with any existing appointment.
 */
function hasConflict(
  slotStart: number,
  slotEnd: number,
  appointments: Appointment[],
  dateStr: string
): boolean {
  for (const apt of appointments) {
    // Get appointment times as minutes from midnight on the same date
    const aptStart = new Date(apt.start_time);
    const aptEnd = new Date(apt.end_time);

    // Only check appointments on the same date
    const aptDateStr = aptStart.toISOString().split('T')[0];
    if (aptDateStr !== dateStr) continue;

    // Use UTC hours/minutes since our ISO strings are in UTC
    const aptStartMinutes = aptStart.getUTCHours() * 60 + aptStart.getUTCMinutes();
    const aptEndMinutes = aptEnd.getUTCHours() * 60 + aptEnd.getUTCMinutes();

    // Check for overlap: slot starts before apt ends AND slot ends after apt starts
    if (slotStart < aptEndMinutes && slotEnd > aptStartMinutes) {
      return true;
    }
  }
  return false;
}

/**
 * Generate time slots from a time range.
 */
function generateSlotsFromRange(
  range: TimeRange,
  slotDuration: number,
  totalDuration: number,
  appointments: Appointment[],
  dateStr: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const rangeStart = parseTimeToMinutes(range.start);
  const rangeEnd = parseTimeToMinutes(range.end);

  // Slot must end before range end
  const lastPossibleStart = rangeEnd - totalDuration;

  for (let slotStart = rangeStart; slotStart <= lastPossibleStart; slotStart += slotDuration) {
    const slotEnd = slotStart + totalDuration;
    const time = formatMinutesToTime(slotStart);
    const available = !hasConflict(slotStart, slotEnd, appointments, dateStr);

    slots.push({ time, available });
  }

  return slots;
}

export const availabilityService = {
  /**
   * Get available time slots for a professional on a specific date.
   *
   * Algorithm:
   * 1. Get schedule override for the date (if any)
   *    - If unavailable override exists → return empty
   *    - If available override exists → use its time range
   * 2. If no override → use tenant business hours for the day of week
   * 3. Get existing appointments for the professional on that date
   * 4. Generate slots considering total duration of selected services
   * 5. Mark slots as available/unavailable based on conflicts
   */
  async getAvailableSlots(
    tenantId: string,
    professionalId: string,
    date: string, // YYYY-MM-DD
    totalDuration: number, // Total duration of selected services in minutes
    slotDuration: number = BOOKING_SLOT_DURATION
  ): Promise<TimeSlot[]> {
    try {
      // 1. Get tenant business hours
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, business_hours')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        logger.error('availabilityService.getAvailableSlots.tenantNotFound', { tenantId, error: tenantError });
        return [];
      }

      const businessHours = tenant.business_hours as BusinessHours;

      // 2. Get schedule override for the date
      const { data: overrides, error: overrideError } = await supabase
        .from(SCHEDULE_OVERRIDES_TABLE)
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .lte('start_date', date)
        .gte('end_date', date);

      if (overrideError) {
        logger.error('availabilityService.getAvailableSlots.overrideError', { error: overrideError });
      }

      const override = overrides?.[0] as ScheduleOverride | undefined;

      // 3. Determine working hours for this date
      let workingRanges: TimeRange[] = [];

      if (override) {
        if (override.override_type === 'unavailable') {
          // Professional is unavailable on this date
          return [];
        }
        // Use override hours
        if (override.start_time && override.end_time) {
          workingRanges = [{ start: override.start_time, end: override.end_time }];
        }
      } else {
        // Use tenant business hours for the day of week
        const dateObj = new Date(date + 'T00:00:00');
        const dayIndex = dateObj.getDay();
        const dayName = DAY_NAMES[dayIndex] as DayName;
        workingRanges = businessHours[dayName] ?? [];
      }

      // If no working hours, return empty
      if (workingRanges.length === 0) {
        return [];
      }

      // 4. Get existing appointments for the professional on this date
      const dateStart = `${date}T00:00:00`;
      const dateEnd = `${date}T23:59:59`;

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .gte('start_time', dateStart)
        .lte('start_time', dateEnd);

      if (appointmentsError) {
        logger.error('availabilityService.getAvailableSlots.appointmentsError', { error: appointmentsError });
        return [];
      }

      // 5. Generate slots for each working range
      const allSlots: TimeSlot[] = [];

      for (const range of workingRanges) {
        const slots = generateSlotsFromRange(
          range,
          slotDuration,
          totalDuration,
          (appointments ?? []) as Appointment[],
          date
        );
        allSlots.push(...slots);
      }

      return allSlots;
    } catch (error) {
      logger.error('availabilityService.getAvailableSlots.failed', { tenantId, professionalId, date, error });
      return [];
    }
  },

  /**
   * Check if a specific time slot is available.
   */
  async isSlotAvailable(
    tenantId: string,
    professionalId: string,
    startTime: string, // ISO 8601
    totalDuration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + totalDuration * 60000);

      // Check for schedule override (unavailable)
      const dateStr = startDate.toISOString().split('T')[0];

      const { data: overrides } = await supabase
        .from(SCHEDULE_OVERRIDES_TABLE)
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .eq('override_type', 'unavailable')
        .lte('start_date', dateStr)
        .gte('end_date', dateStr);

      if (overrides && overrides.length > 0) {
        return false;
      }

      // Check for conflicting appointments
      let query = supabase
        .from('appointments')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .lt('start_time', endDate.toISOString())
        .gt('end_time', startTime);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: conflicts, error } = await query;

      if (error) {
        logger.error('availabilityService.isSlotAvailable.error', { error });
        return false;
      }

      return (conflicts?.length ?? 0) === 0;
    } catch (error) {
      logger.error('availabilityService.isSlotAvailable.failed', { tenantId, professionalId, startTime, error });
      return false;
    }
  },

  /**
   * Get next available date for a professional.
   */
  async getNextAvailableDate(
    tenantId: string,
    professionalId: string,
    totalDuration: number,
    startFrom: string = new Date().toISOString().split('T')[0] ?? ''
  ): Promise<string | null> {
    // Check up to 30 days ahead
    const maxDays = 30;

    for (let i = 0; i < maxDays; i++) {
      const date = new Date(startFrom);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0] ?? '';

      const slots = await this.getAvailableSlots(tenantId, professionalId, dateStr, totalDuration);
      const availableSlots = slots.filter((s) => s.available);

      if (availableSlots.length > 0) {
        return dateStr;
      }
    }

    return null;
  },
};
