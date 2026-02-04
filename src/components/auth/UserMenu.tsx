/**
 * UserMenu - Dropdown menu with user info and actions.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCurrentUserRole } from './RoleGuard';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserProfileFormDialog } from '@/components/user/UserProfileFormDialog';
import type { UserRole } from '@/types/user';

/**
 * Get initials from a name.
 */
const getInitials = (name: string | undefined): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? '') : '';
  
  if (!first) return '?';
  if (!last) return first.charAt(0).toUpperCase();
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
};

/**
 * Role badge configuration.
 */
const ROLE_BADGE_CONFIG: Record<UserRole, { labelKey: 'roleOwner' | 'roleAdmin' | 'roleStaff'; variant: 'default' | 'secondary' | 'outline' }> = {
  owner: { labelKey: 'roleOwner', variant: 'default' },
  admin: { labelKey: 'roleAdmin', variant: 'secondary' },
  staff: { labelKey: 'roleStaff', variant: 'outline' },
};

export const UserMenu = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: tenantUser } = useCurrentUserRole();
  const navigate = useNavigate();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      logger.error('UserMenu.logout.failed', { error });
      toast.error(t('errorLoading'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = profile?.name ?? user?.user_metadata?.name as string | undefined ?? user?.email;
  const displayEmail = user?.email ?? '';
  const avatarUrl = profile?.avatar_url;
  const initials = getInitials(displayName);
  const roleBadgeConfig = tenantUser?.role ? ROLE_BADGE_CONFIG[tenantUser.role] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-2 h-10"
            aria-label={t('myAccount')}
          >
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
              {roleBadgeConfig && (
                <Badge variant={roleBadgeConfig.variant} className="w-fit mt-1">
                  {t(roleBadgeConfig.labelKey)}
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsProfileDialogOpen(true)}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            {t('myProfile')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileFormDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </>
  );
};
