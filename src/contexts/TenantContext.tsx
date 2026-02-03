import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Tenant, BusinessHours, TenantSettings } from '@/types/tenant';

// Development mock tenant for testing without backend
const DEV_BUSINESS_HOURS: BusinessHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '09:00', end: '14:00' }],
  sunday: [],
};

const DEV_TENANT_SETTINGS: TenantSettings = {
  max_photos_per_appointment: 10,
  booking_slot_duration: 30,
  allow_multiple_same_service: false,
  require_phone_for_booking: true,
  show_prices_publicly: true,
};

const DEV_TENANT: Tenant = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Salão Demo',
  slug: 'salao-demo',
  owner_id: 'aa0e8400-e29b-41d4-a716-446655440001',
  timezone: 'America/Sao_Paulo',
  business_hours: DEV_BUSINESS_HOURS,
  settings: DEV_TENANT_SETTINGS,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // In development mode, auto-set the dev tenant on first load only
  useEffect(() => {
    if (!initialized) {
      if (import.meta.env.DEV) {
        setCurrentTenant(DEV_TENANT);
      }
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  const value = useMemo(
    () => ({ currentTenant, setCurrentTenant, loading }),
    [currentTenant, loading]
  );

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
