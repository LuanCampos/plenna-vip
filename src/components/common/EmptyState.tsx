import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { motionFadeInUp } from '@/lib/motion';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main title text */
  title: string;
  /** Descriptive text */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button callback */
  onAction?: () => void;
}

/**
 * Empty state component with icon, text, and optional action button.
 * Use when a list or section has no content to display.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <motion.div
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
    {...motionFadeInUp}
  >
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </motion.div>
);
