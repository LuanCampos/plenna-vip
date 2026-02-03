/**
 * ClientSearchInput - Search input for finding clients.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { useClientSearch } from '@/hooks/useClients';
import { Search, Loader2, User } from 'lucide-react';
import type { Client } from '@/types/client';

interface ClientSearchInputProps {
  onSelect: (client: Client) => void;
  placeholder?: string;
}

export const ClientSearchInput = ({ onSelect, placeholder }: ClientSearchInputProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { data: results, isLoading } = useClientSearch(query);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
  }, []);

  const handleSelect = useCallback((client: Client) => {
    onSelect(client);
    setQuery('');
    setIsOpen(false);
  }, [onSelect]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="h-10 pl-10 bg-secondary/50 border-border"
          placeholder={placeholder ?? t('search')}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && results && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => handleSelect(client)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {client.phone}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && !isLoading && (!results || results.length === 0) && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
          <p className="px-4 py-3 text-sm text-muted-foreground">
            {t('noClients')}
          </p>
        </div>
      )}
    </div>
  );
};
