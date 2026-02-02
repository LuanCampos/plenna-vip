import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = 'default',
  loading = false,
  confirmText,
  cancelText,
}: ConfirmDialogProps) => {
  const { t } = useLanguage();

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border sm:max-w-sm flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            {variant === 'destructive' && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 border-t border-border bg-secondary/30 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText ?? t('cancel')}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmText ?? t('confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
