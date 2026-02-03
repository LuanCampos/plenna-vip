/**
 * ClientFormFields - Reusable form fields for client creation/editing.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClientCreate, ClientUpdate } from '@/types/client';

interface ClientFormFieldsProps {
  data: Partial<ClientCreate | ClientUpdate>;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
}

export const ClientFormFields = ({ data, onChange, errors }: ClientFormFieldsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name" className="text-sm font-medium">
          {t('clientName')} *
        </Label>
        <Input
          id="client-name"
          value={data.name ?? ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder={t('yourName')}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-phone" className="text-sm font-medium">
          {t('clientPhone')} *
        </Label>
        <Input
          id="client-phone"
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

      <div className="space-y-2">
        <Label htmlFor="client-email" className="text-sm font-medium">
          {t('clientEmail')}
        </Label>
        <Input
          id="client-email"
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
        <Label htmlFor="client-notes" className="text-sm font-medium">
          {t('clientNotes')}
        </Label>
        <Input
          id="client-notes"
          value={data.notes ?? ''}
          onChange={(e) => onChange('notes', e.target.value)}
          className="h-10 bg-secondary/50 border-border"
          placeholder={t('clientNotes')}
        />
        {errors?.notes && (
          <p className="text-sm text-destructive">{errors.notes}</p>
        )}
      </div>
    </div>
  );
};
