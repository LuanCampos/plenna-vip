/**
 * ServiceFormFields - Reusable form fields for service creation/editing.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CURRENCY_SYMBOL } from '@/lib/config/currency';
import type { ServiceCreate, ServiceUpdate } from '@/types/service';

interface ServiceFormFieldsProps {
  data: Partial<ServiceCreate | ServiceUpdate>;
  onChange: (field: string, value: string | number | boolean) => void;
  errors?: Record<string, string>;
}

export const ServiceFormFields = ({ data, onChange, errors }: ServiceFormFieldsProps) => {
  const { t } = useLanguage();

  const handlePriceChange = (value: string) => {
    // Remove non-numeric characters except comma and dot
    const cleaned = value.replace(/[^\d.,]/g, '');
    // Replace comma with dot for parsing
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      onChange('price', parsed);
    } else if (cleaned === '' || cleaned === '0') {
      onChange('price', 0);
    }
  };

  const handleDurationChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange('duration', parsed);
    } else if (value === '') {
      onChange('duration', 0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service-name" className="text-sm font-medium">
          {t('serviceName')} *
        </Label>
        <Input
          id="service-name"
          value={data.name ?? ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder={t('serviceName')}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service-price" className="text-sm font-medium">
            {t('servicePrice')} *
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {CURRENCY_SYMBOL}
            </span>
            <Input
              id="service-price"
              type="text"
              inputMode="decimal"
              value={data.price !== undefined ? data.price.toFixed(2).replace('.', ',') : ''}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="h-10 pl-10 bg-secondary/50 border-border"
              placeholder="0,00"
            />
          </div>
          {errors?.price && (
            <p className="text-sm text-destructive">{errors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-duration" className="text-sm font-medium">
            {t('serviceDuration')} *
          </Label>
          <div className="relative">
            <Input
              id="service-duration"
              type="text"
              inputMode="numeric"
              value={data.duration ?? ''}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="h-10 pr-12 bg-secondary/50 border-border"
              placeholder="30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              min
            </span>
          </div>
          {errors?.duration && (
            <p className="text-sm text-destructive">{errors.duration}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description" className="text-sm font-medium">
          {t('serviceDescription')}
        </Label>
        <Input
          id="service-description"
          value={data.description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder={t('serviceDescription')}
        />
        {errors?.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>
    </div>
  );
};
