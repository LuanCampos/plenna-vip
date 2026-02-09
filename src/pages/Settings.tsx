/**
 * Settings page with tabs for store configuration.
 */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import {
  useTenantDetails,
  useUpdateTenant,
  useUpdateBusinessHours,
  useUpdateTenantSettings,
  useCheckSlugAvailability,
} from '@/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Store,
  Clock,
  Sliders,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { logger } from '@/lib/logger';
import type { BusinessHours, TenantSettings, DayHours, DaySchedule } from '@/types/tenant';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const SLOT_DURATION_OPTIONS = [15, 30, 45, 60];

// Helper to normalize DaySchedule to DayHours format
const normalizeDaySchedule = (schedule: DaySchedule | undefined): DayHours => {
  if (!schedule) {
    return { start: '09:00', end: '18:00', enabled: true };
  }
  if (Array.isArray(schedule)) {
    // Legacy format: convert first range to single DayHours
    if (schedule.length === 0) {
      return { start: '', end: '', enabled: false };
    }
    const first = schedule[0];
    return { start: first?.start ?? '09:00', end: first?.end ?? '18:00', enabled: true };
  }
  return schedule;
};

export const Settings = () => {
  const { t } = useLanguage();
  const { currentTenant } = useTenant();
  const { data: tenant, isLoading } = useTenantDetails();
  const updateTenantMutation = useUpdateTenant();
  const updateBusinessHoursMutation = useUpdateBusinessHours();
  const updateSettingsMutation = useUpdateTenantSettings();
  const checkSlugMutation = useCheckSlugAvailability();

  // Store info state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  // Business hours state (normalized to DayHours format)
  const [businessHours, setBusinessHours] = useState<Record<string, DayHours>>({});

  // Settings state
  const [settings, setSettings] = useState<TenantSettings>({
    slotDuration: 30,
    maxPhotosPerAppointment: 5,
    allowMultipleSameService: false,
    requirePhoneForBooking: true,
    showPricesPublicly: true,
  });

  // Initialize form state when tenant loads
  useEffect(() => {
    if (tenant) {
      setStoreName(tenant.name || '');
      setStoreSlug(tenant.slug || '');
      // Normalize business hours to DayHours format
      const normalized: Record<string, DayHours> = {};
      DAYS_OF_WEEK.forEach((day) => {
        normalized[day] = normalizeDaySchedule(tenant.business_hours?.[day]);
      });
      setBusinessHours(normalized);
      setSettings({
        slotDuration: tenant.settings?.slotDuration ?? 30,
        maxPhotosPerAppointment: tenant.settings?.maxPhotosPerAppointment ?? 5,
        allowMultipleSameService: tenant.settings?.allowMultipleSameService ?? false,
        requirePhoneForBooking: tenant.settings?.requirePhoneForBooking ?? true,
        showPricesPublicly: tenant.settings?.showPricesPublicly ?? true,
      });
    }
  }, [tenant]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!storeSlug || storeSlug === tenant?.slug) {
      setSlugStatus('idle');
      return;
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(storeSlug)) {
      setSlugStatus('unavailable');
      return;
    }

    setSlugStatus('checking');
    const timeout = setTimeout(async () => {
      try {
        const isAvailable = await checkSlugMutation.mutateAsync(storeSlug);
        setSlugStatus(isAvailable ? 'available' : 'unavailable');
      } catch {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [storeSlug, tenant?.slug, checkSlugMutation]);

  const handleSaveStoreInfo = async () => {
    if (!currentTenant?.id) return;

    try {
      await updateTenantMutation.mutateAsync({
        name: storeName,
        slug: storeSlug !== tenant?.slug ? storeSlug : undefined,
      });
    } catch (error) {
      logger.error('settings.store.save.failed', { error });
    }
  };

  const handleSaveBusinessHours = async () => {
    if (!currentTenant?.id) return;

    try {
      // Convert to BusinessHours format for API
      await updateBusinessHoursMutation.mutateAsync(businessHours as BusinessHours);
    } catch (error) {
      logger.error('settings.businessHours.save.failed', { error });
    }
  };

  const handleSaveSettings = async () => {
    if (!currentTenant?.id) return;

    try {
      await updateSettingsMutation.mutateAsync(settings);
    } catch (error) {
      logger.error('settings.preferences.save.failed', { error });
    }
  };

  const updateDayHours = (
    day: string,
    field: 'start' | 'end' | 'enabled',
    value: string | boolean
  ) => {
    setBusinessHours((prev) => {
      const current = prev[day] || { start: '09:00', end: '18:00', enabled: true };
      return {
        ...prev,
        [day]: {
          ...current,
          [field]: value,
          ...(field === 'enabled' && value === false ? { start: '', end: '' } : {}),
        },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('settings')}</h1>
      </div>
      <p className="text-muted-foreground">{t('settingsDescription')}</p>

      {/* Tabs */}
      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            {t('storeInfo')}
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            {t('businessHours')}
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Sliders className="h-4 w-4" />
            {t('bookingSettings')}
          </TabsTrigger>
        </TabsList>

        {/* Store Info Tab */}
        <TabsContent value="store">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                {t('storeInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium">
                  {t('storeName')}
                </Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-10 bg-secondary/50 border-border"
                  placeholder={t('storeName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeSlug" className="text-sm font-medium">
                  {t('storeSlug')}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="storeSlug"
                      value={storeSlug}
                      onChange={(e) => setStoreSlug(e.target.value.toLowerCase())}
                      className="h-10 bg-secondary/50 border-border pr-10"
                      placeholder="minha-loja"
                    />
                    {slugStatus !== 'idle' && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {slugStatus === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {slugStatus === 'available' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {slugStatus === 'unavailable' && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('storeSlugHelp')}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleSaveStoreInfo}
                  disabled={
                    updateTenantMutation.isPending ||
                    slugStatus === 'unavailable' ||
                    slugStatus === 'checking'
                  }
                >
                  {updateTenantMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('businessHours')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_OF_WEEK.map((day) => {
                const dayHours: DayHours = businessHours[day] || { start: '09:00', end: '18:00', enabled: true };
                const isEnabled = dayHours.enabled !== false;

                return (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="w-28">
                      <span className="font-medium text-foreground capitalize">
                        {t(day)}
                      </span>
                    </div>

                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        updateDayHours(day, 'enabled', checked)
                      }
                      aria-label={`${t(day)} ${t('enabled')}`}
                    />

                    {isEnabled ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Select
                          value={dayHours.start || '09:00'}
                          onValueChange={(value) => updateDayHours(day, 'start', value)}
                        >
                          <SelectTrigger className="w-24 h-9 bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">-</span>

                        <Select
                          value={dayHours.end || '18:00'}
                          onValueChange={(value) => updateDayHours(day, 'end', value)}
                        >
                          <SelectTrigger className="w-24 h-9 bg-secondary/50 border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {t('closed')}
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleSaveBusinessHours}
                  disabled={updateBusinessHoursMutation.isPending}
                >
                  {updateBusinessHoursMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings Tab */}
        <TabsContent value="booking">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                {t('bookingSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slot Duration */}
              <div className="space-y-2">
                <Label htmlFor="slotDuration" className="text-sm font-medium">
                  {t('slotDuration')}
                </Label>
                <Select
                  value={String(settings.slotDuration)}
                  onValueChange={(value) =>
                    setSettings((prev) => ({ ...prev, slotDuration: Number(value) }))
                  }
                >
                  <SelectTrigger className="w-40 h-10 bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {SLOT_DURATION_OPTIONS.map((duration) => (
                      <SelectItem key={duration} value={String(duration)}>
                        {duration} {t('minutes')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Photos */}
              <div className="space-y-2">
                <Label htmlFor="maxPhotos" className="text-sm font-medium">
                  {t('maxPhotosPerAppointment')}
                </Label>
                <Input
                  id="maxPhotos"
                  type="number"
                  min={0}
                  max={20}
                  value={settings.maxPhotosPerAppointment}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxPhotosPerAppointment: Number(e.target.value),
                    }))
                  }
                  className="w-24 h-10 bg-secondary/50 border-border"
                />
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">
                      {t('allowMultipleSameService')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('allowMultipleSameServiceHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMultipleSameService}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowMultipleSameService: checked,
                      }))
                    }
                    aria-label={t('allowMultipleSameService')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">
                      {t('requirePhoneForBooking')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('requirePhoneForBookingHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.requirePhoneForBooking}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        requirePhoneForBooking: checked,
                      }))
                    }
                    aria-label={t('requirePhoneForBooking')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="font-medium text-foreground">
                      {t('showPricesPublicly')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('showPricesPubliclyHelp')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPricesPublicly}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        showPricesPublicly: checked,
                      }))
                    }
                    aria-label={t('showPricesPublicly')}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
