/**
 * React Query hooks for public booking operations.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingService, CreateBookingResult } from '@/lib/services/bookingService';
import type { Tenant } from '@/types/tenant';
import type { Service } from '@/types/service';
import type { ProfessionalWithServices } from '@/types/professional';
import type { PublicBookingInput } from '@/types/booking';

// Query keys
export const bookingKeys = {
  all: ['booking'] as const,
  tenant: () => [...bookingKeys.all, 'tenant'] as const,
  tenantBySlug: (slug: string) => [...bookingKeys.tenant(), slug] as const,
  services: () => [...bookingKeys.all, 'services'] as const,
  servicesByTenant: (tenantId: string) => [...bookingKeys.services(), tenantId] as const,
  professionals: () => [...bookingKeys.all, 'professionals'] as const,
  professionalsForServices: (tenantId: string, serviceIds: string[]) =>
    [...bookingKeys.professionals(), tenantId, ...serviceIds] as const,
};

/**
 * Get tenant by slug (for public booking page).
 */
export const useTenantBySlug = (slug: string | undefined) => {
  return useQuery<Tenant | null>({
    queryKey: bookingKeys.tenantBySlug(slug ?? ''),
    queryFn: () => bookingService.getTenantBySlug(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get active services for a tenant.
 */
export const usePublicServices = (tenantId: string | undefined) => {
  return useQuery<Service[]>({
    queryKey: bookingKeys.servicesByTenant(tenantId ?? ''),
    queryFn: () => bookingService.getActiveServices(tenantId!),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get professionals that can perform specific services.
 */
export const useProfessionalsForServices = (
  tenantId: string | undefined,
  serviceIds: string[]
) => {
  return useQuery<ProfessionalWithServices[]>({
    queryKey: bookingKeys.professionalsForServices(tenantId ?? '', serviceIds),
    queryFn: () => bookingService.getProfessionalsForServices(tenantId!, serviceIds),
    enabled: !!tenantId && serviceIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Create a public booking.
 */
export const useCreateBooking = () => {
  return useMutation<CreateBookingResult, Error, PublicBookingInput>({
    mutationFn: (input) => bookingService.createBooking(input),
  });
};
