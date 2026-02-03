import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ClientList, ClientFormDialog } from '@/components/client';
import { Users, Plus } from 'lucide-react';
import type { Client } from '@/types/client';

export const Clients = () => {
  const { t } = useLanguage();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleNew = useCallback(() => {
    setEditingClient(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingClient(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t('clients')}</h1>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newClient')}
        </Button>
      </div>

      <ClientList onEdit={handleEdit} />

      <ClientFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        client={editingClient}
      />
    </div>
  );
};
