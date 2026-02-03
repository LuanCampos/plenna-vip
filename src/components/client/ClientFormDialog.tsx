/**
 * ClientFormDialog - Dialog for creating/editing clients.
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
import { ClientFormFields } from './ClientFormFields';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';
import { clientSchema, clientUpdateSchema } from '@/lib/validators/clientSchema';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { User, Loader2 } from 'lucide-react';
import type { Client, ClientCreate, ClientUpdate } from '@/types/client';
import type { ZodError } from 'zod';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export const ClientFormDialog = ({ open, onOpenChange, client }: ClientFormDialogProps) => {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  
  const [formData, setFormData] = useState<Partial<ClientCreate>>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!client;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form when dialog opens/closes or client changes
  useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name,
          phone: client.phone,
          email: client.email ?? '',
          notes: client.notes ?? '',
        });
      } else {
        setFormData({
          name: '',
          phone: '',
          email: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [open, client]);

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
    if (!currentTenant) return;

    try {
      setErrors({});

      if (isEditing && client) {
        // Validate update data
        const updateData: ClientUpdate = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          notes: formData.notes || undefined,
        };
        clientUpdateSchema.parse(updateData);
        
        await updateMutation.mutateAsync({
          clientId: client.id,
          data: updateData,
        });
      } else {
        // Validate create data
        const createData: ClientCreate = {
          tenant_id: currentTenant.id,
          name: formData.name ?? '',
          phone: formData.phone ?? '',
          email: formData.email || undefined,
          notes: formData.notes || undefined,
        };
        clientSchema.parse(createData);
        
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
            fieldErrors[field] = t(err.message as 'nameTooShort' | 'invalidPhone' | 'invalidEmail');
          }
        });
        setErrors(fieldErrors);
      } else {
        logger.error('ClientFormDialog.submit.failed', { error });
      }
    }
  }, [
    currentTenant,
    formData,
    isEditing,
    client,
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
            <User className="h-5 w-5 text-primary" />
            {isEditing ? t('editClient') : t('newClient')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <ClientFormFields
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
