import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from 'lucide-react';

export const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">{t('bookingTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('bookingSubtitle')}</p>
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Booking page for: <span className="font-medium text-foreground">{slug}</span>
      </p>
    </div>
  );
};
