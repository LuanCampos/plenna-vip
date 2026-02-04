/**
 * React Query hooks for availability operations.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { availabilityService } from '@/lib/services/availabilityService';
import { useTenant } from '@/contexts/TenantContext';
import { BOOKING_SLOT_DURATION } from '@/lib/config/business';
import type { TimeSlot } from '@/types/booking';

// Query keys
export const availabilityKeys = {
  all: ['availability'] as const,
  slots: () => [...availabilityKeys.all, 'slots'] as const,
  slotsForDate: (
    tenantId: string,
    professionalId: string,
    date: string,
    totalDuration: number
  ) => [...availabilityKeys.slots(), tenantId, professionalId, date, totalDuration] as const,
  nextAvailable: () => [...availabilityKeys.all, 'next'] as const,
  nextAvailableForProfessional: (
    tenantId: string,
    professionalId: string,
    totalDuration: number
  ) => [...availabilityKeys.nextAvailable(), tenantId, professionalId, totalDuration] as const,
};

/**
 * Get available slots for a professional on a specific date.
 */
export const useAvailableSlots = (
  professionalId: string | null,
  date: string | null,
  totalDuration: number,
  slotDuration: number = BOOKING_SLOT_DURATION
) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: availabilityKeys.slotsForDate(
      tenantId ?? '',
      professionalId ?? '',
      date ?? '',
      totalDuration
    ),
    queryFn: () =>
      availabilityService.getAvailableSlots(
        tenantId!,
        professionalId!,
        date!,
        totalDuration,
        slotDuration
      ),
    enabled: !!tenantId && !!professionalId && !!date && totalDuration > 0,
    staleTime: 30000, // 30 seconds - slots can change quickly
  });
};

/**
 * Get only available (not blocked) slots.
 */
export const useOnlyAvailableSlots = (
  professionalId: string | null,
  date: string | null,
  totalDuration: number,
  slotDuration: number = BOOKING_SLOT_DURATION
) => {
  const query = useAvailableSlots(professionalId, date, totalDuration, slotDuration);

  return {
    ...query,
    data: query.data?.filter((slot) => slot.available) ?? [],
  };
};

/**
 * Check if a specific slot is available.
 */
export const useIsSlotAvailable = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({
      professionalId,
      startTime,
      totalDuration,
      excludeAppointmentId,
    }: {
      professionalId: string;
      startTime: string;
      totalDuration: number;
      excludeAppointmentId?: string;
    }) =>
      availabilityService.isSlotAvailable(
        tenantId!,
        professionalId,
        startTime,
        totalDuration,
        excludeAppointmentId
      ),
  });
};

/**
 * Get next available date for a professional.
 */
export const useNextAvailableDate = (
  professionalId: string | null,
  totalDuration: number,
  startFrom?: string
) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: availabilityKeys.nextAvailableForProfessional(
      tenantId ?? '',
      professionalId ?? '',
      totalDuration
    ),
    queryFn: () =>
      availabilityService.getNextAvailableDate(tenantId!, professionalId!, totalDuration, startFrom),
    enabled: !!tenantId && !!professionalId && totalDuration > 0,
    staleTime: 60000, // 1 minute
  });
};

// Type exports for convenience
export type { TimeSlot };
