/**
 * ClientList - List of clients with search and actions.
 */
import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, Pencil, Trash2, User, Phone, Mail } from 'lucide-react';
import type { Client } from '@/types/client';

interface ClientListProps {
  onEdit: (client: Client) => void;
  onView?: (client: Client) => void;
}

export const ClientList = ({ onEdit, onView }: ClientListProps) => {
  const { t } = useLanguage();
  const { data: clients, isLoading, error } = useClients();
  const deleteMutation = useDeleteClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredClients = clients?.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  }) ?? [];

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteMutation]);

  const handleClientClick = useCallback((client: Client) => {
    if (onView) {
      onView(client);
    } else {
      onEdit(client);
    }
  }, [onEdit, onView]);

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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 pl-10 bg-secondary/50 border-border"
          placeholder={t('search')}
        />
      </div>

      {/* List */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={User}
          title={t('noClients')}
          description={t('clientsDescription')}
        />
      ) : (
        <div className="space-y-2">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg gap-3 hover:bg-secondary/70 transition-colors"
            >
              <button
                type="button"
                onClick={() => handleClientClick(client)}
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {client.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                    {client.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => onEdit(client)}
                  aria-label={t('edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(client.id)}
                  aria-label={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
