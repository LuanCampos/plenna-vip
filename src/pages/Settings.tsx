import { useLanguage } from '@/contexts/LanguageContext';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('settingsDescription')}
      </p>
    </div>
  );
};
