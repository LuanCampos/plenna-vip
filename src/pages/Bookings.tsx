import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from 'lucide-react';

export const Bookings = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('bookings')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('bookingsDescription')}
      </p>
    </div>
  );
};
