/**
 * PublicBooking page
 * Multi-step wizard for public appointment booking
 */
import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookingProgress,
  ServiceSelector,
  ProfessionalSelector,
  DateTimeSelector,
  ClientInfoForm,
  BookingConfirmation,
  BookingSuccess,
} from '@/components/booking';

import {
  useTenantBySlug,
  usePublicServices,
  useProfessionalsForServices,
  useCreateBooking,
} from '@/hooks/useBooking';
import { useAvailableSlots } from '@/hooks/useAvailability';

import type { BookingStep, SelectedService, BookingSummary } from '@/types/booking';
import type { Service } from '@/types/service';
import type { TranslationKey } from '@/i18n/translations/pt';

interface FormErrors {
  name?: TranslationKey;
  phone?: TranslationKey;
  email?: TranslationKey;
}

export const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();

  // Booking state
  const [step, setStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [bookingSummary, setBookingSummary] = useState<BookingSummary | null>(null);

  // Query data
  const { data: tenant, isLoading: loadingTenant, error: tenantError } = useTenantBySlug(slug);
  const { data: services = [], isLoading: loadingServices } = usePublicServices(tenant?.id);

  const serviceIds = useMemo(
    () => selectedServices.map((s) => s.service.id),
    [selectedServices]
  );

  const { data: professionals = [], isLoading: loadingProfessionals } = useProfessionalsForServices(
    tenant?.id,
    serviceIds
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + s.service.duration, 0),
    [selectedServices]
  );

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const { data: timeSlots = [], isLoading: loadingSlots } = useAvailableSlots(
    selectedProfessionalId,
    dateString,
    totalDuration
  );

  const createBookingMutation = useCreateBooking();

  // Handlers
  const handleToggleService = useCallback((service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service.id === service.id);
      if (exists) {
        return prev.filter((s) => s.service.id !== service.id);
      }
      return [...prev, { service, order: prev.length }];
    });
  }, []);

  const handleSelectProfessional = useCallback((professionalId: string) => {
    setSelectedProfessionalId(professionalId);
    // Reset date/time when professional changes
    setSelectedDate(null);
    setSelectedTime(null);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  }, []);

  const handleSelectTime = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const validateClientInfo = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!clientName.trim() || clientName.trim().length < 2) {
      errors.name = 'nameTooShort';
    }

    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      errors.phone = 'invalidPhone';
    }

    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      errors.email = 'invalidEmail';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [clientName, clientPhone, clientEmail]);

  const handleNext = useCallback(() => {
    if (step === 'services' && selectedServices.length > 0) {
      setStep('professional');
    } else if (step === 'professional' && selectedProfessionalId) {
      setStep('datetime');
    } else if (step === 'datetime' && selectedDate && selectedTime) {
      setStep('info');
    } else if (step === 'info') {
      if (validateClientInfo()) {
        setStep('confirm');
      }
    }
  }, [step, selectedServices, selectedProfessionalId, selectedDate, selectedTime, validateClientInfo]);

  const handleBack = useCallback(() => {
    if (step === 'professional') {
      setStep('services');
    } else if (step === 'datetime') {
      setStep('professional');
    } else if (step === 'info') {
      setStep('datetime');
    } else if (step === 'confirm') {
      setStep('info');
    }
  }, [step]);

  const handleConfirmBooking = async () => {
    if (!tenant || !selectedProfessionalId || !selectedDate || !selectedTime) {
      return;
    }

    // Build ISO datetime
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startTime = new Date(`${dateStr}T${selectedTime}:00`);

    try {
      const result = await createBookingMutation.mutateAsync({
        tenant_id: tenant.id,
        professional_id: selectedProfessionalId,
        service_ids: serviceIds,
        start_time: startTime.toISOString(),
        client_name: clientName.trim(),
        client_phone: clientPhone.replace(/\D/g, ''),
        client_email: clientEmail || undefined,
      });

      setBookingSummary(result.summary);
      toast.success(t('bookingCreated'));
    } catch (error) {
      logger.error('publicBooking.confirm.failed', { error });
      toast.error(t('errorCreatingBooking'));
    }
  };

  const handleBookAnother = useCallback(() => {
    // Reset all state
    setStep('services');
    setSelectedServices([]);
    setSelectedProfessionalId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setFormErrors({});
    setBookingSummary(null);
  }, []);

  // Derived values
  const selectedProfessional = useMemo(
    () => professionals.find((p) => p.id === selectedProfessionalId) ?? null,
    [professionals, selectedProfessionalId]
  );

  const canContinue = useMemo(() => {
    switch (step) {
      case 'services':
        return selectedServices.length > 0;
      case 'professional':
        return selectedProfessionalId !== null;
      case 'datetime':
        return selectedDate !== null && selectedTime !== null;
      case 'info':
        return clientName.trim().length >= 2 && clientPhone.replace(/\D/g, '').length >= 10;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [step, selectedServices, selectedProfessionalId, selectedDate, selectedTime, clientName, clientPhone]);

  // Loading state
  if (loadingTenant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (tenantError || !tenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('storeNotFound')}</h1>
        <p className="text-muted-foreground">
          {t('errorLoading')}
        </p>
      </div>
    );
  }

  // Success state
  if (bookingSummary) {
    return <BookingSuccess summary={bookingSummary} onBookAnother={handleBookAnother} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">{tenant.name}</h1>
        <p className="text-muted-foreground mt-1">{t('bookingSubtitle')}</p>
      </div>

      {/* Progress */}
      <BookingProgress currentStep={step} />

      {/* Step Content */}
      <div className="mt-6">
        {step === 'services' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t('selectServices')}</h2>
            <ServiceSelector
              services={services}
              selectedServices={selectedServices}
              onToggleService={handleToggleService}
              loading={loadingServices}
            />
          </div>
        )}

        {step === 'professional' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t('selectProfessional')}</h2>
            <ProfessionalSelector
              professionals={professionals}
              selectedProfessionalId={selectedProfessionalId}
              onSelectProfessional={handleSelectProfessional}
              loading={loadingProfessionals}
            />
          </div>
        )}

        {step === 'datetime' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t('selectDateTime')}</h2>
            <DateTimeSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={handleSelectDate}
              onSelectTime={handleSelectTime}
              timeSlots={timeSlots}
              loadingSlots={loadingSlots}
            />
          </div>
        )}

        {step === 'info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{t('yourInfo')}</h2>
            <ClientInfoForm
              name={clientName}
              phone={clientPhone}
              email={clientEmail}
              onChangeName={setClientName}
              onChangePhone={setClientPhone}
              onChangeEmail={setClientEmail}
              errors={formErrors}
            />
          </div>
        )}

        {step === 'confirm' && selectedDate && selectedTime && (
          <BookingConfirmation
            services={selectedServices}
            professional={selectedProfessional}
            date={selectedDate}
            time={selectedTime}
            clientName={clientName}
            clientPhone={clientPhone}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {step !== 'services' && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
            disabled={createBookingMutation.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('back')}
          </Button>
        )}

        {step !== 'confirm' ? (
          <Button
            onClick={handleNext}
            disabled={!canContinue}
            className="flex-1"
          >
            {t('continueBooking')}
          </Button>
        ) : (
          <Button
            onClick={handleConfirmBooking}
            disabled={createBookingMutation.isPending}
            className="flex-1"
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                {t('loading')}
              </>
            ) : (
              t('confirmBooking')
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
