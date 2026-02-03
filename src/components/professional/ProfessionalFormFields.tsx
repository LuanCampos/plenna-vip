/**
 * ProfessionalFormFields - Reusable form fields for professional creation/editing.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useActiveServices } from '@/hooks/useServices';
import { Check, X } from 'lucide-react';
import type { ProfessionalCreate, ProfessionalUpdate } from '@/types/professional';

interface ProfessionalFormFieldsProps {
  data: Partial<ProfessionalCreate | ProfessionalUpdate> & { service_ids?: string[] };
  onChange: (field: string, value: string | string[] | boolean) => void;
  errors?: Record<string, string>;
}

export const ProfessionalFormFields = ({ data, onChange, errors }: ProfessionalFormFieldsProps) => {
  const { t } = useLanguage();
  const { data: services } = useActiveServices();

  const toggleService = (serviceId: string) => {
    const currentIds = data.service_ids ?? [];
    const newIds = currentIds.includes(serviceId)
      ? currentIds.filter(id => id !== serviceId)
      : [...currentIds, serviceId];
    onChange('service_ids', newIds);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="professional-name" className="text-sm font-medium">
          {t('professionalName')} *
        </Label>
        <Input
          id="professional-name"
          value={data.name ?? ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder={t('professionalName')}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="professional-email" className="text-sm font-medium">
          {t('email')}
        </Label>
        <Input
          id="professional-email"
          type="email"
          value={data.email ?? ''}
          onChange={(e) => onChange('email', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder="email@exemplo.com"
        />
        {errors?.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="professional-phone" className="text-sm font-medium">
          {t('clientPhone')}
        </Label>
        <Input
          id="professional-phone"
          type="tel"
          inputMode="tel"
          value={data.phone ?? ''}
          onChange={(e) => onChange('phone', e.target.value.replace(/\D/g, ''))}
          className="h-10 bg-secondary/50 border-border"
          placeholder="11999999999"
        />
        {errors?.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Services */}
      {services && services.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('services')}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {services.map(service => {
              const isSelected = data.service_ids?.includes(service.id) ?? false;
              return (
                <Button
                  key={service.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start h-auto py-2 px-3"
                  onClick={() => toggleService(service.id)}
                >
                  {isSelected ? (
                    <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 mr-2 flex-shrink-0 opacity-0" />
                  )}
                  <span className="truncate">{service.name}</span>
                </Button>
              );
            })}
          </div>
          {errors?.service_ids && (
            <p className="text-sm text-destructive">{errors.service_ids}</p>
          )}
        </div>
      )}
    </div>
  );
};
