/**
 * BookingSuccess component
 * Shown after successful booking creation
 */
import { CheckCircle, Calendar, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import type { BookingSummary } from '@/types/booking';

interface BookingSuccessProps {
  summary: BookingSummary;
  onBookAnother: () => void;
}

export const BookingSuccess = ({ summary, onBookAnother }: BookingSuccessProps) => {
  const { t, language } = useLanguage();
  const locale = language === 'pt' ? ptBR : enUS;

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="p-4 bg-green-500/10 rounded-full">
          <CheckCircle className="h-16 w-16 text-green-500" aria-hidden="true" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{t('bookingSuccess')}</h2>
        <p className="text-muted-foreground">{t('bookingSuccessMessage')}</p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-secondary/30 rounded-lg p-4 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm text-foreground font-medium">
              {format(summary.dateTime, "EEEE, d 'de' MMMM", { locale })}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {format(summary.dateTime, 'HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <p className="text-sm text-foreground">{summary.professionalName}</p>
        </div>

        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs text-muted-foreground uppercase mb-2">{t('services')}</p>
          {summary.services.map((service, i) => (
            <p key={i} className="text-sm text-foreground">
              {service.name}
            </p>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <Button onClick={onBookAnother} variant="outline" className="w-full">
        {t('bookNewAppointment')}
      </Button>
    </div>
  );
};
