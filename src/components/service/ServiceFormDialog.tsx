/**
 * ServiceFormDialog - Dialog for creating/editing services.
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
import { ServiceFormFields } from './ServiceFormFields';
import { useCreateService, useUpdateService } from '@/hooks/useServices';
import { serviceSchema, serviceUpdateSchema } from '@/lib/validators/serviceSchema';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { Scissors, Loader2 } from 'lucide-react';
import type { Service, ServiceCreate, ServiceUpdate } from '@/types/service';
import type { ZodError } from 'zod';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
}

export const ServiceFormDialog = ({ open, onOpenChange, service }: ServiceFormDialogProps) => {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();

  const [formData, setFormData] = useState<Partial<ServiceCreate>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!service;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog opens/closes or service changes
  useEffect(() => {
    if (open) {
      if (service) {
        setFormData({
          name: service.name,
          description: service.description ?? '',
          price: service.price,
          duration: service.duration,
          active: service.active,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          duration: 30,
          active: true,
        });
      }
      setErrors({});
    }
  }, [open, service]);

  const handleChange = useCallback((field: string, value: string | number | boolean) => {
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

      if (isEditing && service) {
        // Validate update data
        const updateData: ServiceUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          duration: formData.duration,
          active: formData.active,
        };
        serviceUpdateSchema.parse(updateData);

        await updateMutation.mutateAsync({
          serviceId: service.id,
          data: updateData,
        });
      } else {
        // Validate create data
        const createData: ServiceCreate = {
          tenant_id: currentTenant.id,
          name: formData.name ?? '',
          description: formData.description || undefined,
          price: formData.price ?? 0,
          duration: formData.duration ?? 30,
          active: formData.active ?? true,
        };
        serviceSchema.parse(createData);

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
            fieldErrors[field] = t(err.message as 'nameTooShort' | 'priceMustBePositive' | 'durationMustBePositive');
          }
        });
        setErrors(fieldErrors);
      } else {
        logger.error('ServiceFormDialog.submit.failed', { error });
      }
    }
  }, [
    currentTenant,
    formData,
    isEditing,
    service,
    createMutation,
    updateMutation,
    handleClose,
    t,
  ]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden" aria-describedby={undefined}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Scissors className="h-5 w-5 text-primary" />
            {isEditing ? t('editService') : t('newService')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <ServiceFormFields
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
