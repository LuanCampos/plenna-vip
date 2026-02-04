/**
 * TeamMemberCard - Card displaying a team member.
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import type { TenantUserWithProfile, UserRole } from '@/types/user';

interface TeamMemberCardProps {
  member: TenantUserWithProfile;
  onEdit?: (member: TenantUserWithProfile) => void;
  onRemove?: (member: TenantUserWithProfile) => void;
}

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

export const TeamMemberCard = ({ member, onEdit, onRemove }: TeamMemberCardProps) => {
  const { t } = useLanguage();
  
  const profile = member.user_profile;
  const name = profile?.name ?? t('unknown');
  const email = profile?.email ?? '';
  const avatarUrl = profile?.avatar_url;
  const initials = getInitials(name);
  const isOwner = member.role === 'owner';
  const roleBadgeConfig = ROLE_BADGE_CONFIG[member.role];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {name}
              </p>
              <Badge variant={roleBadgeConfig.variant} className="shrink-0">
                {t(roleBadgeConfig.labelKey)}
              </Badge>
            </div>
            {email && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {email}
              </p>
            )}
          </div>

          {/* Actions - only for non-owner members, and only owner can edit/remove */}
          {!isOwner && (
            <div className="flex items-center gap-1">
              {/* Edit - only owner can edit roles */}
              <RoleGuard minRole="owner">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit?.(member)}
                  aria-label={t('editMember')}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </RoleGuard>

              {/* Remove - only owner can remove */}
              <RoleGuard minRole="owner">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove?.(member)}
                  aria-label={t('removeMember')}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </RoleGuard>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
