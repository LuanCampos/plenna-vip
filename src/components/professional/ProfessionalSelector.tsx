/**
 * ProfessionalSelector - Selector for choosing a professional.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveProfessionals } from '@/hooks/useProfessionals';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle, Check } from 'lucide-react';

interface ProfessionalSelectorProps {
  value: string | null;
  onChange: (professionalId: string | null) => void;
  serviceId?: string;
}

export const ProfessionalSelector = ({ value, onChange, serviceId: _serviceId }: ProfessionalSelectorProps) => {
  const { t } = useLanguage();
  const { data: professionals, isLoading } = useActiveProfessionals();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!professionals || professionals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        {t('noProfessionals')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {professionals.map(professional => {
        const isSelected = value === professional.id;
        return (
          <button
            key={professional.id}
            type="button"
            onClick={() => onChange(isSelected ? null : professional.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50 hover:bg-secondary/70'
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {professional.avatar_url ? (
                <img
                  src={professional.avatar_url}
                  alt={professional.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-foreground truncate">
                {professional.name}
              </p>
            </div>
            {isSelected && (
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
};
