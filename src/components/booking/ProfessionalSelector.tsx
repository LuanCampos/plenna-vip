/**
 * ProfessionalSelector component for booking
 * Allows selection of a professional
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Professional } from '@/types/professional';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessionalId: string | null;
  onSelectProfessional: (professionalId: string) => void;
  loading?: boolean;
}

export const ProfessionalSelector = ({
  professionals,
  selectedProfessionalId,
  onSelectProfessional,
  loading = false,
}: ProfessionalSelectorProps) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('noProfessionalsAvailable')}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {professionals.map((professional) => {
        const isSelected = professional.id === selectedProfessionalId;
        const initials = professional.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <button
            key={professional.id}
            type="button"
            onClick={() => onSelectProfessional(professional.id)}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left w-full',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50 hover:bg-secondary/30'
            )}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage
                src={professional.avatar_url}
                alt={professional.name}
              />
              <AvatarFallback className="bg-secondary text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {professional.name}
              </h3>
              {professional.email && (
                <p className="text-sm text-muted-foreground truncate">
                  {professional.email}
                </p>
              )}
            </div>
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all shrink-0',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30'
              )}
            >
              {isSelected && <Check className="h-4 w-4" aria-hidden="true" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};
