/**
 * BookingConfirmation component
 * Shows booking summary before final confirmation
 */
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { formatCurrency } from '@/lib/config/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SelectedService } from '@/types/booking';
import type { Professional } from '@/types/professional';

interface BookingConfirmationProps {
  services: SelectedService[];
  professional: Professional | null;
  date: Date;
  time: string;
  clientName: string;
  clientPhone: string;
}

export const BookingConfirmation = ({
  services,
  professional,
  date,
  time,
  clientName,
  clientPhone,
}: BookingConfirmationProps) => {
  const { t, language } = useLanguage();
  const locale = language === 'pt' ? ptBR : enUS;

  const totalDuration = services.reduce((sum, s) => sum + s.service.duration, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.service.price, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t('bookingSummary')}</h3>

      <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
        {/* Services */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-primary/10 rounded-lg">
            <Scissors className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase">{t('services')}</p>
            <div className="space-y-1 mt-1">
              {services.map((s, i) => (
                <div key={`${s.service.id}-${i}`} className="flex justify-between text-sm">
                  <span className="text-foreground truncate">{s.service.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {formatCurrency(s.service.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Professional */}
        {professional && (
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 bg-primary/10 rounded-lg">
              <User className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase">{t('professional')}</p>
              <p className="text-sm text-foreground mt-1">{professional.name}</p>
            </div>
          </div>
        )}

        {/* Date and Time */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase">{t('dateAndTime')}</p>
            <p className="text-sm text-foreground mt-1">
              {format(date, "EEEE, d 'de' MMMM", { locale })}
            </p>
            <p className="text-sm text-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {time}
            </p>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-primary/10 rounded-lg">
            <User className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase">{t('yourInfo')}</p>
            <p className="text-sm text-foreground mt-1">{clientName}</p>
            <p className="text-sm text-muted-foreground">{clientPhone}</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div>
          <p className="text-sm font-medium text-foreground">{t('totalPrice')}</p>
          <p className="text-xs text-muted-foreground">
            {totalDuration} {t('minutesShort')}
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
      </div>
    </div>
  );
};
