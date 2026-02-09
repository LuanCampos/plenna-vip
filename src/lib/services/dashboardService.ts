/**
 * Dashboard service for fetching metrics and statistics.
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { AppointmentWithDetails } from '@/types/appointment';

export interface DashboardStats {
  appointmentsToday: number;
  appointmentsThisWeek: number;
  totalClients: number;
  totalProfessionals: number;
  totalServices: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
}

export interface UpcomingAppointment {
  id: string;
  start_time: string;
  client_name: string;
  professional_name: string;
  services: string[];
  total_price: number;
  status: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics for a tenant.
   */
  async getStats(tenantId: string): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Fetch all data in parallel
    const [
      appointmentsTodayResult,
      appointmentsWeekResult,
      clientsResult,
      professionalsResult,
      servicesResult,
      revenueTodayResult,
      revenueWeekResult,
      revenueMonthResult,
    ] = await Promise.all([
      // Appointments today (not cancelled)
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .neq('status', 'cancelled'),

      // Appointments this week
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfWeek.toISOString())
        .lt('start_time', endOfWeek.toISOString())
        .neq('status', 'cancelled'),

      // Total clients (not deleted)
      supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .is('deleted_at', null),

      // Total professionals (active, not deleted)
      supabase
        .from('professionals')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .is('deleted_at', null),

      // Total services (active, not deleted)
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .is('deleted_at', null),

      // Revenue today
      supabase
        .from('appointments')
        .select('total_price')
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .in('status', ['completed', 'confirmed', 'scheduled']),

      // Revenue this week
      supabase
        .from('appointments')
        .select('total_price')
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfWeek.toISOString())
        .lt('start_time', endOfWeek.toISOString())
        .in('status', ['completed', 'confirmed', 'scheduled']),

      // Revenue this month
      supabase
        .from('appointments')
        .select('total_price')
        .eq('tenant_id', tenantId)
        .gte('start_time', startOfMonth.toISOString())
        .lt('start_time', endOfMonth.toISOString())
        .in('status', ['completed', 'confirmed', 'scheduled']),
    ]);

    // Log errors if any
    if (appointmentsTodayResult.error) {
      logger.error('dashboardService.getStats.appointmentsToday.failed', { error: appointmentsTodayResult.error });
    }
    if (appointmentsWeekResult.error) {
      logger.error('dashboardService.getStats.appointmentsWeek.failed', { error: appointmentsWeekResult.error });
    }
    if (clientsResult.error) {
      logger.error('dashboardService.getStats.clients.failed', { error: clientsResult.error });
    }
    if (professionalsResult.error) {
      logger.error('dashboardService.getStats.professionals.failed', { error: professionalsResult.error });
    }
    if (servicesResult.error) {
      logger.error('dashboardService.getStats.services.failed', { error: servicesResult.error });
    }

    // Calculate revenue sums
    const sumRevenue = (data: { total_price: number }[] | null): number => {
      return (data ?? []).reduce((sum, item) => sum + (item.total_price || 0), 0);
    };

    return {
      appointmentsToday: appointmentsTodayResult.count ?? 0,
      appointmentsThisWeek: appointmentsWeekResult.count ?? 0,
      totalClients: clientsResult.count ?? 0,
      totalProfessionals: professionalsResult.count ?? 0,
      totalServices: servicesResult.count ?? 0,
      revenueToday: sumRevenue(revenueTodayResult.data),
      revenueThisWeek: sumRevenue(revenueWeekResult.data),
      revenueThisMonth: sumRevenue(revenueMonthResult.data),
    };
  },

  /**
   * Get upcoming appointments for today.
   */
  async getUpcomingAppointments(
    tenantId: string,
    limit: number = 5
  ): Promise<UpcomingAppointment[]> {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        total_price,
        client:clients(name),
        professional:professionals(name),
        appointment_services(
          service:services(name)
        )
      `)
      .eq('tenant_id', tenantId)
      .gte('start_time', now.toISOString())
      .lt('start_time', endOfDay.toISOString())
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) {
      logger.error('dashboardService.getUpcomingAppointments.failed', { tenantId, error });
      throw error;
    }

    return (data ?? []).map((apt) => ({
      id: apt.id,
      start_time: apt.start_time,
      status: apt.status,
      total_price: apt.total_price,
      client_name: (apt.client as unknown as { name: string } | null)?.name ?? 'Cliente',
      professional_name: (apt.professional as unknown as { name: string } | null)?.name ?? 'Profissional',
      services: (apt.appointment_services as unknown as { service: { name: string } | null }[])
        ?.map((as) => as.service?.name)
        .filter(Boolean) as string[] ?? [],
    }));
  },

  /**
   * Get recent appointments (last 5 completed).
   */
  async getRecentAppointments(
    tenantId: string,
    limit: number = 5
  ): Promise<AppointmentWithDetails[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        professional:professionals(*),
        appointment_services(
          service:services(*)
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('dashboardService.getRecentAppointments.failed', { tenantId, error });
      throw error;
    }

    return (data ?? []).map((apt) => ({
      ...apt,
      services: (apt.appointment_services as { service: unknown }[])?.map((as) => as.service) ?? [],
    })) as AppointmentWithDetails[];
  },
};
