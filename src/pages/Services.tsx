import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ServiceList, ServiceFormDialog } from '@/components/service';
import { Scissors, Plus } from 'lucide-react';
import type { Service } from '@/types/service';

export const Services = () => {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleNew = useCallback(() => {
    setEditingService(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((service: Service) => {
    setEditingService(service);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingService(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scissors className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t('services')}</h1>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newService')}
        </Button>
      </div>

      <ServiceList onEdit={handleEdit} />

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        service={editingService}
      />
    </div>
  );
};
