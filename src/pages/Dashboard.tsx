/**
 * Dashboard page with real metrics.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboardStats, useUpcomingAppointments } from '@/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/config/currency';
import {
  Calendar,
  Users,
  Scissors,
  TrendingUp,
  Clock,
  Plus,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { t, language } = useLanguage();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: upcomingAppointments, isLoading: appointmentsLoading } = useUpcomingAppointments(5);

  const dateLocale = language === 'pt' ? ptBR : enUS;

  const formatTime = (isoString: string) => {
    return format(new Date(isoString), 'HH:mm', { locale: dateLocale });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('welcomeMessage')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboardDescription')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Appointments */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('todayAppointments')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.appointmentsToday ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.appointmentsThisWeek ?? 0} {t('appointmentsThisWeek').toLowerCase()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Clients */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('clients')}
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalClients ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalProfessionals ?? 0} {t('professionals').toLowerCase()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('services')}
            </CardTitle>
            <Scissors className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalServices ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('active').toLowerCase()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('revenueThisMonth')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.revenueThisMonth ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats?.revenueToday ?? 0)} {t('today').toLowerCase()}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {t('upcomingAppointments')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookings" className="text-primary">
                {t('viewAllAppointments')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {apt.client_name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {apt.services.join(', ')} • {apt.professional_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatTime(apt.start_time)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(apt.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t('noUpcomingAppointments')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {t('quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              asChild
            >
              <Link to="/bookings">
                <Plus className="h-5 w-5 text-primary" />
                {t('newAppointment')}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              asChild
            >
              <Link to="/clients">
                <UserPlus className="h-5 w-5 text-primary" />
                {t('newClient')}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              asChild
            >
              <Link to="/services">
                <Scissors className="h-5 w-5 text-primary" />
                {t('services')}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              asChild
            >
              <Link to="/professionals">
                <Users className="h-5 w-5 text-primary" />
                {t('professionals')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
