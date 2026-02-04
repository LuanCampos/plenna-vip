/**
 * TeamMemberList - List of team members.
 */
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenantUsers, useDeleteTenantUser } from '@/hooks/useTenantUsers';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMemberFormDialog } from './TeamMemberFormDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Users } from 'lucide-react';
import type { TenantUserWithProfile } from '@/types/user';

export const TeamMemberList = () => {
  const { t } = useLanguage();
  const { data: members, isLoading } = useTenantUsers();
  const deleteMutation = useDeleteTenantUser();

  const [selectedMember, setSelectedMember] = useState<TenantUserWithProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TenantUserWithProfile | null>(null);

  const handleEdit = (member: TenantUserWithProfile) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleRemove = (member: TenantUserWithProfile) => {
    setMemberToDelete(member);
  };

  const handleConfirmRemove = async () => {
    if (memberToDelete) {
      await deleteMutation.mutateAsync(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!members || members.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">{t('teamMembers')}</h2>
          <RoleGuard minRole="admin">
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('addMember')}
            </Button>
          </RoleGuard>
        </div>
        <EmptyState
          icon={Users}
          title={t('noTeamMembers')}
          description={t('addFirstMember')}
        />
        <InviteMemberDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          {t('teamMembers')} ({members.length})
        </h2>
        <RoleGuard minRole="admin">
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('addMember')}
          </Button>
        </RoleGuard>
      </div>

      {/* Member list */}
      <div className="space-y-3">
        {members.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onEdit={handleEdit}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Edit dialog */}
      <TeamMemberFormDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEdit}
        member={selectedMember}
      />

      {/* Invite dialog */}
      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
        onConfirm={handleConfirmRemove}
        title={t('removeMember')}
        description={t('confirmRemoveMember')}
        confirmText={t('remove')}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
