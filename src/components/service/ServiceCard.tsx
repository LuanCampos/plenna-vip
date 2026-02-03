/**
 * ServiceCard - Display card for a service.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { CURRENCY_SYMBOL } from '@/lib/config/currency';
import { Scissors, Pencil, Trash2, Clock } from 'lucide-react';
import type { Service } from '@/types/service';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServiceCard = ({ service, onEdit, onDelete }: ServiceCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg gap-3 hover:bg-secondary/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Scissors className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {service.name}
            </p>
            {!service.active && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Inativo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {CURRENCY_SYMBOL} {service.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {service.duration} min
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(service)}
          aria-label={t('edit')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(service)}
          aria-label={t('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
