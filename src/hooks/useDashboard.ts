/**
 * Custom hook for dashboard data.
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats, UpcomingAppointment } from '@/lib/services/dashboardService';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Query keys for dashboard data.
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (tenantId: string) => [...dashboardKeys.all, 'stats', tenantId] as const,
  upcoming: (tenantId: string) => [...dashboardKeys.all, 'upcoming', tenantId] as const,
  recent: (tenantId: string) => [...dashboardKeys.all, 'recent', tenantId] as const,
};

/**
 * Hook to fetch dashboard statistics.
 */
export const useDashboardStats = () => {
  const { currentTenant } = useTenant();

  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(currentTenant?.id ?? ''),
    queryFn: () => dashboardService.getStats(currentTenant!.id),
    enabled: !!currentTenant?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

/**
 * Hook to fetch upcoming appointments.
 */
export const useUpcomingAppointments = (limit: number = 5) => {
  const { currentTenant } = useTenant();

  return useQuery<UpcomingAppointment[]>({
    queryKey: [...dashboardKeys.upcoming(currentTenant?.id ?? ''), limit] as const,
    queryFn: () => dashboardService.getUpcomingAppointments(currentTenant!.id, limit),
    enabled: !!currentTenant?.id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};
