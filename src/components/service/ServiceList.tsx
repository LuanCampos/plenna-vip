/**
 * ServiceList - List of services with actions.
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useServices, useDeleteService } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ServiceCard } from './ServiceCard';
import { Scissors } from 'lucide-react';
import type { Service } from '@/types/service';

interface ServiceListProps {
  onEdit: (service: Service) => void;
}

export const ServiceList = ({ onEdit }: ServiceListProps) => {
  const { t } = useLanguage();
  const { data: services, isLoading, error } = useServices();
  const deleteMutation = useDeleteService();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteMutation]);

  const handleRequestDelete = useCallback((service: Service) => {
    setDeleteId(service.id);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {t('errorLoading')}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title={t('noServices')}
        description={t('servicesDescription')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={onEdit}
            onDelete={handleRequestDelete}
          />
        ))}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
