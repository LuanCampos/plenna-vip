/**
 * ServiceSelector component for booking
 * Allows selection of multiple services with price/duration info
 */
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/config/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service } from '@/types/service';
import type { SelectedService } from '@/types/booking';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: SelectedService[];
  onToggleService: (service: Service) => void;
  loading?: boolean;
}

export const ServiceSelector = ({
  services,
  selectedServices,
  onToggleService,
  loading = false,
}: ServiceSelectorProps) => {
  const { t } = useLanguage();

  const isSelected = (serviceId: string) =>
    selectedServices.some((s) => s.service.id === serviceId);

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.service.duration,
    0
  );
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + s.service.price,
    0
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noServicesAvailable')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {services.map((service) => {
          const selected = isSelected(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggleService(service)}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 transition-all text-left w-full',
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/30'
              )}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {service.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {service.duration} {t('minutesShort')}
                  </span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  'ml-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {selected && <Check className="h-4 w-4" aria-hidden="true" />}
              </div>
            </button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">
              {selectedServices.length}{' '}
              {selectedServices.length === 1
                ? t('selectService')
                : t('selectedServices').toLowerCase()}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {totalDuration} {t('minutesShort')}
            </p>
          </div>
          <p className="text-lg font-semibold text-primary">
            {formatCurrency(totalPrice)}
          </p>
        </div>
      )}
    </div>
  );
};
