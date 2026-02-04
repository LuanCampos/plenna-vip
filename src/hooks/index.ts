/**
 * Hooks barrel export.
 */
export {
  clientKeys,
  useClients,
  useClient,
  useClientWithHistory,
  useClientSearch,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useFindClientByPhone,
} from './useClients';

export {
  serviceKeys,
  useServices,
  useActiveServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleServiceActive,
} from './useServices';

export {
  professionalKeys,
  useProfessionals,
  useActiveProfessionals,
  useProfessionalsWithServices,
  useProfessional,
  useProfessionalWithServices,
  useProfessionalsByService,
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
  useToggleProfessionalActive,
} from './useProfessionals';

export {
  appointmentKeys,
  useAppointments,
  useAppointmentsByDateRange,
  useAppointment,
  useAppointmentsByClient,
  useAppointmentsByProfessional,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useDeleteAppointment,
  useCheckConflict,
} from './useAppointments';

export {
  availabilityKeys,
  useAvailableSlots,
  useOnlyAvailableSlots,
  useIsSlotAvailable,
  useNextAvailableDate,
} from './useAvailability';

export {
  userProfileKeys,
  useUserProfile,
  useUserProfileById,
  useUpdateUserProfile,
} from './useUserProfile';

export {
  tenantUserKeys,
  useTenantUsers,
  useTenantUser,
  useCreateTenantUser,
  useUpdateTenantUser,
  useDeleteTenantUser,
} from './useTenantUsers';

export {
  userTenantsKeys,
  useUserTenants,
  useHasAnyTenant,
} from './useUserTenants';
