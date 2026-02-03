/**
 * ProfessionalCard - Display card for a professional.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { UserCircle, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import type { Professional, ProfessionalWithServices } from '@/types/professional';

interface ProfessionalCardProps {
  professional: Professional | ProfessionalWithServices;
  onEdit: (professional: Professional | ProfessionalWithServices) => void;
  onDelete: (professional: Professional | ProfessionalWithServices) => void;
}

export const ProfessionalCard = ({ professional, onEdit, onDelete }: ProfessionalCardProps) => {
  const { t } = useLanguage();
  const withServices = professional as ProfessionalWithServices;

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg gap-3 hover:bg-secondary/70 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
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
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">
              {professional.name}
            </p>
            {!professional.active && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Inativo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {professional.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {professional.phone}
              </span>
            )}
            {professional.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3" />
                {professional.email}
              </span>
            )}
          </div>
          {withServices.services && withServices.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {withServices.services.slice(0, 3).map(service => (
                <span
                  key={service.id}
                  className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary"
                >
                  {service.name}
                </span>
              ))}
              {withServices.services.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  +{withServices.services.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(professional)}
          aria-label={t('edit')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(professional)}
          aria-label={t('delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
