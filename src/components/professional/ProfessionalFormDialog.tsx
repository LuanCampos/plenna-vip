/**
 * ProfessionalFormDialog - Dialog for creating/editing professionals.
 */
import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProfessionalFormFields } from './ProfessionalFormFields';
import { useCreateProfessional, useUpdateProfessional } from '@/hooks/useProfessionals';
import { professionalSchema, professionalUpdateSchema } from '@/lib/validators/professionalSchema';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { UserCircle, Loader2 } from 'lucide-react';
import type { Professional, ProfessionalCreate, ProfessionalUpdate, ProfessionalWithServices } from '@/types/professional';
import type { ZodError } from 'zod';

interface ProfessionalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | ProfessionalWithServices | null;
}

export const ProfessionalFormDialog = ({ open, onOpenChange, professional }: ProfessionalFormDialogProps) => {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const createMutation = useCreateProfessional();
  const updateMutation = useUpdateProfessional();

  const [formData, setFormData] = useState<Partial<ProfessionalCreate> & { service_ids?: string[] }>({
    name: '',
    email: '',
    phone: '',
    active: true,
    service_ids: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!professional;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog opens/closes or professional changes
  useEffect(() => {
    if (open) {
      if (professional) {
        const withServices = professional as ProfessionalWithServices;
        setFormData({
          name: professional.name,
          email: professional.email ?? '',
          phone: professional.phone ?? '',
          active: professional.active,
          service_ids: withServices.service_ids ?? [],
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          active: true,
          service_ids: [],
        });
      }
      setErrors({});
    }
  }, [open, professional]);

  const handleChange = useCallback((field: string, value: string | string[] | boolean) => {
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
    if (!currentTenant) return;

    try {
      setErrors({});

      if (isEditing && professional) {
        // Validate update data
        const updateData: ProfessionalUpdate & { service_ids?: string[] } = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          active: formData.active,
          service_ids: formData.service_ids,
        };
        professionalUpdateSchema.parse(updateData);

        await updateMutation.mutateAsync({
          professionalId: professional.id,
          data: updateData,
        });
      } else {
        // Validate create data
        const createData: ProfessionalCreate & { service_ids?: string[] } = {
          tenant_id: currentTenant.id,
          name: formData.name ?? '',
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          active: formData.active ?? true,
          service_ids: formData.service_ids,
        };
        professionalSchema.parse(createData);

        await createMutation.mutateAsync(createData);
      }

      handleClose();
    } catch (error) {
      if ((error as ZodError).errors) {
        const zodError = error as ZodError;
        const fieldErrors: Record<string, string> = {};
        zodError.errors.forEach(err => {
          const field = err.path[0]?.toString();
          if (field) {
            fieldErrors[field] = t(err.message as 'nameTooShort' | 'invalidEmail' | 'invalidPhone');
          }
        });
        setErrors(fieldErrors);
      } else {
        logger.error('ProfessionalFormDialog.submit.failed', { error });
      }
    }
  }, [
    currentTenant,
    formData,
    isEditing,
    professional,
    createMutation,
    updateMutation,
    handleClose,
    t,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <UserCircle className="h-5 w-5 text-primary" />
            {isEditing ? t('editProfessional') : t('newProfessional')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <ProfessionalFormFields
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
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
