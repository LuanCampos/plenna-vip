/**
 * React Query hooks for appointment operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { appointmentService } from '@/lib/services/appointmentService';
import { serviceService } from '@/lib/services/serviceService';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import type {
  Appointment,
  AppointmentUpdate,
  AppointmentWithDetails,
  AppointmentCreateInput,
} from '@/types/appointment';
import type { ActorType } from '@/types/event';
import type { AppointmentStatus } from '@/lib/config/business';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (tenantId: string) => [...appointmentKeys.lists(), tenantId] as const,
  dateRange: (tenantId: string, startDate: string, endDate: string, professionalId?: string) =>
    [...appointmentKeys.lists(), tenantId, startDate, endDate, professionalId ?? 'all'] as const,
  byClient: (tenantId: string, clientId: string) =>
    [...appointmentKeys.lists(), tenantId, 'client', clientId] as const,
  byProfessional: (tenantId: string, professionalId: string, startDate: string, endDate: string) =>
    [...appointmentKeys.lists(), tenantId, 'professional', professionalId, startDate, endDate] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (tenantId: string, appointmentId: string) =>
    [...appointmentKeys.details(), tenantId, appointmentId] as const,
};

/**
 * Get all appointments for the current tenant.
 */
export const useAppointments = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: appointmentKeys.list(tenantId ?? ''),
    queryFn: () => appointmentService.getAll(tenantId!),
    enabled: !!tenantId,
  });
};

/**
 * Get appointments for a date range.
 */
export const useAppointmentsByDateRange = (
  startDate: string,
  endDate: string,
  professionalId?: string
) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: appointmentKeys.dateRange(tenantId ?? '', startDate, endDate, professionalId),
    queryFn: () => appointmentService.getByDateRange(tenantId!, startDate, endDate, professionalId),
    enabled: !!tenantId && !!startDate && !!endDate,
  });
};

/**
 * Get a single appointment by ID.
 */
export const useAppointment = (appointmentId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: appointmentKeys.detail(tenantId ?? '', appointmentId ?? ''),
    queryFn: () => appointmentService.getById(tenantId!, appointmentId!),
    enabled: !!tenantId && !!appointmentId,
  });
};

/**
 * Get appointments for a client (history).
 */
export const useAppointmentsByClient = (clientId: string | null) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: appointmentKeys.byClient(tenantId ?? '', clientId ?? ''),
    queryFn: () => appointmentService.getByClient(tenantId!, clientId!),
    enabled: !!tenantId && !!clientId,
  });
};

/**
 * Get appointments for a professional in date range.
 */
export const useAppointmentsByProfessional = (
  professionalId: string | null,
  startDate: string,
  endDate: string
) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useQuery({
    queryKey: appointmentKeys.byProfessional(
      tenantId ?? '',
      professionalId ?? '',
      startDate,
      endDate
    ),
    queryFn: () =>
      appointmentService.getByProfessional(tenantId!, professionalId!, startDate, endDate),
    enabled: !!tenantId && !!professionalId && !!startDate && !!endDate,
  });
};

/**
 * Create a new appointment.
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: async ({
      input,
      actorType = 'staff',
    }: {
      input: Omit<AppointmentCreateInput, 'tenant_id'>;
      actorType?: ActorType;
    }) => {
      // Get services to calculate totals
      const services = await serviceService.getByIds(tenantId!, input.service_ids);
      return appointmentService.create(
        { ...input, tenant_id: tenantId! },
        services,
        actorType,
        user?.id ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success(t('appointmentCreated'));
    },
    onError: (error) => {
      logger.error('useCreateAppointment.failed', { error });
      toast.error(t('errorCreatingAppointment'));
    },
  });
};

/**
 * Update an existing appointment.
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
      actorType = 'staff',
    }: {
      appointmentId: string;
      data: AppointmentUpdate;
      actorType?: ActorType;
    }) => appointmentService.update(tenantId!, appointmentId, data, actorType, user?.id ?? null),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(tenantId!, appointmentId),
      });
      toast.success(t('saved'));
    },
    onError: (error) => {
      logger.error('useUpdateAppointment.failed', { error });
      toast.error(t('errorSaving'));
    },
  });
};

/**
 * Update appointment status.
 */
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
      actorType = 'staff',
    }: {
      appointmentId: string;
      status: AppointmentStatus;
      actorType?: ActorType;
    }) =>
      appointmentService.updateStatus(tenantId!, appointmentId, status, actorType, user?.id ?? null),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(tenantId!, appointmentId),
      });
      toast.success(t('statusUpdated'));
    },
    onError: (error) => {
      logger.error('useUpdateAppointmentStatus.failed', { error });
      toast.error(t('errorUpdatingStatus'));
    },
  });
};

/**
 * Cancel an appointment.
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({
      appointmentId,
      actorType = 'staff',
    }: {
      appointmentId: string;
      actorType?: ActorType;
    }) => appointmentService.cancel(tenantId!, appointmentId, actorType, user?.id ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success(t('appointmentCancelled'));
    },
    onError: (error) => {
      logger.error('useCancelAppointment.failed', { error });
      toast.error(t('errorCancellingAppointment'));
    },
  });
};

/**
 * Delete an appointment (admin only).
 */
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  const { t } = useLanguage();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: (appointmentId: string) => appointmentService.delete(tenantId!, appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error) => {
      logger.error('useDeleteAppointment.failed', { error });
      toast.error(t('errorDeleting'));
    },
  });
};

/**
 * Check for conflicting appointments.
 */
export const useCheckConflict = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id;

  return useMutation({
    mutationFn: ({
      professionalId,
      startTime,
      endTime,
      excludeAppointmentId,
    }: {
      professionalId: string;
      startTime: string;
      endTime: string;
      excludeAppointmentId?: string;
    }) =>
      appointmentService.checkConflict(
        tenantId!,
        professionalId,
        startTime,
        endTime,
        excludeAppointmentId
      ),
  });
};

// Type exports for convenience
export type { Appointment, AppointmentUpdate, AppointmentWithDetails, AppointmentCreateInput };
