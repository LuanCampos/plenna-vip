import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ProfessionalList, ProfessionalFormDialog } from '@/components/professional';
import { UserCircle, Plus } from 'lucide-react';
import type { Professional, ProfessionalWithServices } from '@/types/professional';

export const Professionals = () => {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | ProfessionalWithServices | null>(null);

  const handleNew = useCallback(() => {
    setEditingProfessional(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((professional: Professional | ProfessionalWithServices) => {
    setEditingProfessional(professional);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingProfessional(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t('professionals')}</h1>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newProfessional')}
        </Button>
      </div>

      <ProfessionalList onEdit={handleEdit} />

      <ProfessionalFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        professional={editingProfessional}
      />
    </div>
  );
};
