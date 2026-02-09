import type { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground">
          {t('appName')} © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};
