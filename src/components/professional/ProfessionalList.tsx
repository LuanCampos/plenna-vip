/**
 * ProfessionalList - List of professionals with actions.
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfessionalsWithServices, useDeleteProfessional } from '@/hooks/useProfessionals';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ProfessionalCard } from './ProfessionalCard';
import { UserCircle } from 'lucide-react';
import type { Professional, ProfessionalWithServices } from '@/types/professional';

interface ProfessionalListProps {
  onEdit: (professional: Professional | ProfessionalWithServices) => void;
}

export const ProfessionalList = ({ onEdit }: ProfessionalListProps) => {
  const { t } = useLanguage();
  const { data: professionals, isLoading, error } = useProfessionalsWithServices();
  const deleteMutation = useDeleteProfessional();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteMutation]);

  const handleRequestDelete = useCallback((professional: Professional | ProfessionalWithServices) => {
    setDeleteId(professional.id);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
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

  if (!professionals || professionals.length === 0) {
    return (
      <EmptyState
        icon={UserCircle}
        title={t('noProfessionals')}
        description={t('professionalsDescription')}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {professionals.map(professional => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
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
