/**
 * StatusBadge component for displaying appointment status.
 * Uses semantic colors based on status type.
 */
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppointmentStatus } from '@/lib/config/business';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES: Record<
  AppointmentStatus,
  { bgClass: string; textClass: string }
> = {
  scheduled: {
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  confirmed: {
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
  },
  completed: {
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-300',
  },
  cancelled: {
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
  },
  no_show: {
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const StatusBadge = ({ status, className, size = 'md' }: StatusBadgeProps) => {
  const { t } = useLanguage();
  const styles = STATUS_STYLES[status];

  // Map status to translation key
  const statusLabel = {
    scheduled: t('statusScheduled'),
    confirmed: t('statusConfirmed'),
    completed: t('statusCompleted'),
    cancelled: t('statusCancelled'),
    no_show: t('statusNoShow'),
  }[status];

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        styles.bgClass,
        styles.textClass,
        SIZE_CLASSES[size],
        className
      )}
    >
      {statusLabel}
    </span>
  );
};
