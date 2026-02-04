/**
 * UserProfileFormDialog - Dialog for editing user profile.
 */
import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { userProfileUpdateSchema } from '@/lib/validators/userProfileSchema';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Loader2 } from 'lucide-react';
import type { UserProfileUpdate } from '@/types/user';
import type { ZodError } from 'zod';

interface UserProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileFormDialog = ({ open, onOpenChange }: UserProfileFormDialogProps) => {
  const { t } = useLanguage();
  const { data: profile } = useUserProfile();
  const updateMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState<Partial<UserProfileUpdate>>({
    name: '',
    phone: '',
    avatar_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPending = updateMutation.isPending;

  // Reset form when dialog opens or profile changes
  useEffect(() => {
    if (open && profile) {
      setFormData({
        name: profile.name ?? '',
        phone: profile.phone ?? '',
        avatar_url: profile.avatar_url ?? '',
      });
      setErrors({});
    }
  }, [open, profile]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleClose = useCallback(() => {
    if (!isPending) {
      onOpenChange(false);
    }
  }, [isPending, onOpenChange]);

  const handleSubmit = useCallback(async () => {
    try {
      setErrors({});

      const updateData: UserProfileUpdate = {
        name: formData.name,
        phone: formData.phone || undefined,
        avatar_url: formData.avatar_url || undefined,
      };

      // Validate with Zod
      userProfileUpdateSchema.parse(updateData);

      await updateMutation.mutateAsync(updateData);
      handleClose();
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            fieldErrors[field] = t(err.message as 'nameTooShort' | 'invalidPhone' | 'invalidUrl');
          }
        });
        setErrors(fieldErrors);
      } else {
        logger.error('UserProfileFormDialog.submit.failed', { error });
      }
    }
  }, [formData, updateMutation, handleClose, t]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-primary" />
            {t('editProfile')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="profile-name">{t('name')}</Label>
              <Input
                id="profile-name"
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder={t('yourName')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="profile-phone">{t('clientPhone')}</Label>
              <Input
                id="profile-phone"
                type="tel"
                value={formData.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                className="h-10 bg-secondary/50 border-border"
                placeholder="11999999999"
                maxLength={11}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="profile-avatar">{t('avatarUrl')}</Label>
              <Input
                id="profile-avatar"
                type="url"
                value={formData.avatar_url ?? ''}
                onChange={(e) => handleChange('avatar_url', e.target.value)}
                className="h-10 bg-secondary/50 border-border"
                placeholder="https://..."
              />
              {errors.avatar_url && (
                <p className="text-sm text-destructive">{errors.avatar_url}</p>
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
