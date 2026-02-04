/**
 * TeamMemberFormDialog - Dialog for editing a team member's role.
 */
import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdateTenantUser } from '@/hooks/useTenantUsers';
import { tenantUserUpdateSchema } from '@/lib/validators/tenantUserSchema';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCog, Loader2 } from 'lucide-react';
import type { TenantUserWithProfile, UserRole } from '@/types/user';
import type { ZodError } from 'zod';

interface TeamMemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TenantUserWithProfile | null;
}

type AssignableRole = 'admin' | 'staff';

export const TeamMemberFormDialog = ({ open, onOpenChange, member }: TeamMemberFormDialogProps) => {
  const { t } = useLanguage();
  const updateMutation = useUpdateTenantUser();

  const [role, setRole] = useState<AssignableRole>('staff');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPending = updateMutation.isPending;

  // Reset form when dialog opens or member changes
  useEffect(() => {
    if (open && member) {
      // Only set role if it's assignable (not owner)
      const memberRole = member.role as UserRole;
      if (memberRole === 'admin' || memberRole === 'staff') {
        setRole(memberRole);
      } else {
        setRole('staff');
      }
      setErrors({});
    }
  }, [open, member]);

  const handleClose = useCallback(() => {
    if (!isPending) {
      onOpenChange(false);
    }
  }, [isPending, onOpenChange]);

  const handleSubmit = useCallback(async () => {
    if (!member) return;

    try {
      setErrors({});

      // Validate with Zod
      tenantUserUpdateSchema.parse({ role });

      await updateMutation.mutateAsync({
        tenantUserId: member.id,
        data: { role },
      });

      handleClose();
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            // Use the raw error message since role validation doesn't have i18n keys
            fieldErrors[field] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        logger.error('TeamMemberFormDialog.submit.failed', { error });
      }
    }
  }, [member, role, updateMutation, handleClose]);

  if (!member) return null;

  const memberName = member.user_profile?.name ?? t('unknown');
  const memberEmail = member.user_profile?.email ?? '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserCog className="h-5 w-5 text-primary" />
            {t('editMember')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Member info (read-only) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{memberName}</p>
              {memberEmail && (
                <p className="text-xs text-muted-foreground">{memberEmail}</p>
              )}
            </div>

            {/* Role select */}
            <div className="space-y-2">
              <Label htmlFor="member-role">{t('selectRole')}</Label>
              <Select value={role} onValueChange={(value) => setRole(value as AssignableRole)}>
                <SelectTrigger id="member-role" className="h-10 bg-secondary/50 border-border">
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('roleAdmin')}</SelectItem>
                  <SelectItem value="staff">{t('roleStaff')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
