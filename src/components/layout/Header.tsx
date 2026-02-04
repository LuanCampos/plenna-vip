/**
 * Header component with user menu.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UserMenu } from '@/components/auth/UserMenu';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { currentTenant } = useTenant();
  const { user } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between">
      {/* Left side - Tenant name or spacer for mobile menu */}
      <div className="flex items-center gap-4 lg:gap-0">
        <div className="w-10 lg:hidden" /> {/* Spacer for mobile menu button */}
        {currentTenant && (
          <h2 className="text-lg font-semibold text-foreground hidden sm:block">
            {currentTenant.name}
          </h2>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          aria-label={t('changeLanguage')}
          className="text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={t('changeTheme')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* User Menu */}
        {user && <UserMenu />}
      </div>
    </header>
  );
};
