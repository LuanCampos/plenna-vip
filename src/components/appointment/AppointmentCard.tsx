/**
 * AppointmentCard component for displaying an appointment in the calendar.
 * Shows time, client name, services, and status.
 */
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/config/currency';
import { StatusBadge } from './StatusBadge';
import type { AppointmentWithDetails } from '@/types/appointment';

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Format time from ISO string to HH:MM.
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export const AppointmentCard = ({
  appointment,
  onClick,
  compact = false,
  className,
}: AppointmentCardProps) => {
  const { t } = useLanguage();

  const startTime = formatTime(appointment.start_time);
  const endTime = formatTime(appointment.end_time);
  const serviceNames = appointment.services
    ?.map((s) => s.service_name_at_booking)
    .join(', ') ?? '';

  // Determine background color based on status
  const statusBgClass = {
    scheduled: 'border-l-blue-500',
    confirmed: 'border-l-green-500',
    completed: 'border-l-gray-400',
    cancelled: 'border-l-red-500 opacity-60',
    no_show: 'border-l-amber-500 opacity-60',
  }[appointment.status];

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full text-left p-2 rounded-md border-l-4 bg-card hover:bg-secondary/50 transition-colors',
          statusBgClass,
          className
        )}
        aria-label={t('viewAppointment')}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground truncate">
            {appointment.client?.name ?? t('walkIn')}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {startTime}
          </span>
        </div>
        <div className="text-xs text-muted-foreground truncate mt-0.5">
          {serviceNames}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border border-border border-l-4 bg-card hover:bg-secondary/50 transition-colors shadow-sm',
        statusBgClass,
        className
      )}
      aria-label={t('viewAppointment')}
    >
      {/* Header: Time and Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {startTime} - {endTime}
          </span>
        </div>
        <StatusBadge status={appointment.status} size="sm" />
      </div>

      {/* Client Name */}
      <div className="flex items-center gap-2 mb-1">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground truncate">
          {appointment.client?.name ?? t('walkIn')}
        </span>
      </div>

      {/* Services */}
      <div className="text-sm text-muted-foreground truncate mb-2">
        {serviceNames}
      </div>

      {/* Professional and Price */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground truncate">
          {appointment.professional?.name}
        </span>
        <span className="font-medium text-foreground">
          {formatCurrency(appointment.total_price)}
        </span>
      </div>
    </button>
  );
};
