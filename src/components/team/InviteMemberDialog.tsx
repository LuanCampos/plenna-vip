/**
 * InviteMemberDialog - Dialog for inviting a new team member.
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { useCreateTenantUser } from '@/hooks/useTenantUsers';
import { userProfileService } from '@/lib/services/userProfileService';
import { tenantUserCreateSchema } from '@/lib/validators/tenantUserSchema';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import type { ZodError } from 'zod';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AssignableRole = 'admin' | 'staff';

export const InviteMemberDialog = ({ open, onOpenChange }: InviteMemberDialogProps) => {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const createMutation = useCreateTenantUser();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AssignableRole>('staff');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);

  const isPending = createMutation.isPending || isSearching;

  const resetForm = useCallback(() => {
    setEmail('');
    setRole('staff');
    setErrors({});
    setIsSearching(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isPending) {
      onOpenChange(false);
      resetForm();
    }
  }, [isPending, onOpenChange, resetForm]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  }, [errors.email]);

  const handleSubmit = useCallback(async () => {
    if (!currentTenant) return;

    try {
      setErrors({});
      setIsSearching(true);

      // Validate with Zod
      tenantUserCreateSchema.parse({
        tenant_id: currentTenant.id,
        email,
        role,
      });

      // Search for user by email
      const userProfile = await userProfileService.getByEmail(email);

      if (!userProfile) {
        // User not found
        setErrors({ email: t('userNotFound') });
        toast.error(t('userNotFound'));
        setIsSearching(false);
        return;
      }

      // Create tenant_user (tenant_id is added by the hook)
      await createMutation.mutateAsync({
        user_id: userProfile.id,
        role,
      });

      handleClose();
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            // Map validation error messages to i18n keys
            const message = err.message;
            if (message.includes('email') || message === 'invalidEmail') {
              fieldErrors[field] = t('invalidEmail');
            } else {
              fieldErrors[field] = message;
            }
          }
        });
        setErrors(fieldErrors);
      } else if ((error as Error).message?.includes('already')) {
        setErrors({ email: t('userAlreadyMember') });
        toast.error(t('userAlreadyMember'));
      } else {
        logger.error('InviteMemberDialog.submit.failed', { error });
        toast.error(t('memberAddError'));
      }
    } finally {
      setIsSearching(false);
    }
  }, [currentTenant, email, role, createMutation, handleClose, t]);

  // Reset form when dialog opens
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, resetForm]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5 text-primary" />
            {t('inviteMember')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="invite-email">{t('email')}</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder="usuario@email.com"
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Role select */}
            <div className="space-y-2">
              <Label htmlFor="invite-role">{t('selectRole')}</Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as AssignableRole)}
                disabled={isPending}
              >
                <SelectTrigger id="invite-role" className="h-10 bg-secondary/50 border-border">
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
            disabled={isPending || !email}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('addMember')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
