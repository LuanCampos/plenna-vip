/**
 * ClientInfoForm component for booking
 * Form for client name and phone (minimal fields for booking)
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TranslationKey } from '@/i18n/translations/pt';

interface ClientInfoFormProps {
  name: string;
  phone: string;
  email: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  errors?: {
    name?: TranslationKey;
    phone?: TranslationKey;
    email?: TranslationKey;
  };
}

export const ClientInfoForm = ({
  name,
  phone,
  email,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  errors,
}: ClientInfoFormProps) => {
  const { t } = useLanguage();

  const formatPhone = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    const limited = digits.slice(0, 11);
    
    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else if (limited.length <= 10) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    onChangePhone(formatted);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client-name" className="text-sm font-medium">
          {t('name')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="client-name"
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder={t('yourName')}
          className={`h-12 bg-secondary/50 border-border text-base ${errors?.name ? 'border-destructive' : ''}`}
          autoComplete="name"
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{t(errors.name)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-phone" className="text-sm font-medium">
          {t('clientPhone')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="client-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(11) 99999-9999"
          className={`h-12 bg-secondary/50 border-border text-base ${errors?.phone ? 'border-destructive' : ''}`}
          autoComplete="tel"
        />
        {errors?.phone && (
          <p className="text-sm text-destructive">{t(errors.phone)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-email" className="text-sm font-medium">
          {t('email')} <span className="text-muted-foreground text-xs">({t('optional')})</span>
        </Label>
        <Input
          id="client-email"
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="seu@email.com"
          className={`h-12 bg-secondary/50 border-border text-base ${errors?.email ? 'border-destructive' : ''}`}
          autoComplete="email"
        />
        {errors?.email && (
          <p className="text-sm text-destructive">{t(errors.email)}</p>
        )}
      </div>
    </div>
  );
};
