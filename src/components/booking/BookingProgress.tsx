/**
 * BookingProgress component
 * Shows the current step in the booking wizard
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BookingStep } from '@/types/booking';
import type { TranslationKey } from '@/i18n/translations/pt';

interface BookingProgressProps {
  currentStep: BookingStep;
}

const STEPS: BookingStep[] = ['services', 'professional', 'datetime', 'info', 'confirm'];

const STEP_LABELS: Record<BookingStep, TranslationKey> = {
  services: 'stepServices',
  professional: 'stepProfessional',
  datetime: 'stepDateTime',
  info: 'stepInfo',
  confirm: 'stepConfirm',
};

export const BookingProgress = ({ currentStep }: BookingProgressProps) => {
  const { t } = useLanguage();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <li key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isPending && 'bg-secondary text-muted-foreground'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground',
                    isCompleted && 'text-foreground'
                  )}
                >
                  {t(STEP_LABELS[step])}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentIndex ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
