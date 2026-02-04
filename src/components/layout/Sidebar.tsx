import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  UserCircle,
  Users2,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { routePreload } from '@/lib/routePreload';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
  { to: '/bookings', icon: Calendar, labelKey: 'bookings' },
  { to: '/clients', icon: Users, labelKey: 'clients' },
  { to: '/services', icon: Scissors, labelKey: 'services' },
  { to: '/professionals', icon: UserCircle, labelKey: 'professionals' },
  { to: '/team', icon: Users2, labelKey: 'team' },
] as const;

export const Sidebar = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm border border-border shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('menu')}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 transform transition-transform duration-300 ease-out lg:translate-x-0 shadow-xl shadow-black/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-accent-warm/10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent-warm/10 rounded-full blur-xl" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-accent-warm flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-white/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent-warm bg-clip-text text-transparent leading-tight tracking-tight">
                Plenna
              </h1>
              <span className="text-[10px] font-bold tracking-[0.25em] text-primary/70 uppercase">
                VIP
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onMouseEnter={() => routePreload[item.to]?.()}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm border border-primary/20" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-0.5"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{t(item.labelKey)}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="p-4 border-t border-border/50">
          <NavLink
            to="/settings"
            onMouseEnter={() => routePreload['/settings']?.()}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => cn(
              "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm border border-primary/20" 
                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-0.5"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary" 
                    : "bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Settings className="h-4 w-4" />
                </div>
                <span>{t('settings')}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
