/**
 * DateTimeSelector component for booking
 * Calendar for date selection and time slot picker
 */
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { TimeSlot } from '@/types/booking';

interface DateTimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  timeSlots: TimeSlot[];
  loadingSlots?: boolean;
}

export const DateTimeSelector = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  timeSlots,
  loadingSlots = false,
}: DateTimeSelectorProps) => {
  const { t, language } = useLanguage();
  const [weekOffset, setWeekOffset] = useState(0);
  const locale = language === 'pt' ? ptBR : enUS;

  // Generate 7 days starting from today + weekOffset
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    const startDay = addDays(today, weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  }, [weekOffset]);

  const availableSlots = timeSlots.filter((slot) => slot.available);

  const handlePreviousWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset((prev) => prev - 1);
    }
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => prev + 1);
  };

  const isPastDay = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">{t('chooseDate')}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousWeek}
              disabled={weekOffset === 0}
              aria-label={t('previous')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              aria-label={t('next')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const isPast = isPastDay(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => !isPast && onSelectDate(day)}
                disabled={isPast}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                  isPast && 'opacity-40 cursor-not-allowed',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary/50',
                  isTodayDate && !isSelected && 'ring-1 ring-primary'
                )}
              >
                <span className="text-xs uppercase">
                  {format(day, 'EEE', { locale }).slice(0, 3)}
                </span>
                <span className="text-lg font-semibold">{format(day, 'd')}</span>
                <span className="text-xs text-inherit opacity-70">
                  {format(day, 'MMM', { locale })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {t('chooseTime')}
          </h3>

          {loadingSlots ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground bg-secondary/30 rounded-lg">
              {t('noAvailableSlots')}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => slot.available && onSelectTime(slot.time)}
                  disabled={!slot.available}
                  className={cn(
                    'py-2 px-3 text-sm font-medium rounded-lg transition-all',
                    !slot.available && 'opacity-40 cursor-not-allowed line-through',
                    slot.time === selectedTime
                      ? 'bg-primary text-primary-foreground'
                      : slot.available
                        ? 'bg-secondary/50 hover:bg-secondary hover:text-foreground'
                        : 'bg-secondary/30 text-muted-foreground'
                  )}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
