import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const Dashboard = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t('welcomeMessage')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de agendamento online para esteticistas
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Today's Appointments Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t('todayAppointments')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                {t('noAppointmentsToday')}
              </p>
            </CardContent>
          </Card>

          {/* Clients Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t('clients')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                {t('noClients')}
              </p>
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {t('services')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                {t('noServices')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
