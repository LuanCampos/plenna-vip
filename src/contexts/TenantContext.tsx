/**
 * TenantContext - Manages current tenant selection.
 * Integrates with AuthContext to load user's tenants after login.
 */
import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { Tenant, BusinessHours, TenantSettings } from '@/types/tenant';
import { useAuth } from './AuthContext';
import { tenantUserService } from '@/lib/services/tenantUserService';
import { logger } from '@/lib/logger';
import { getSecureStorageItem, setSecureStorageItem, removeSecureStorageItem } from '@/lib/storage/secureStorage';

// Storage key for last selected tenant
const LAST_TENANT_KEY = 'plenna_last_tenant_id';

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
  tenants: Tenant[];
  setCurrentTenant: (tenant: Tenant | null) => void;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tenants when user changes
  useEffect(() => {
    const loadTenants = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If no user, clear tenant state
      if (!user) {
        setCurrentTenantState(null);
        setTenants([]);
        setLoading(false);
        setError(null);
        removeSecureStorageItem(LAST_TENANT_KEY);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In development mode without Supabase configured, use mock tenant
        if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
          logger.debug('TenantContext.dev.usingMockTenant');
          setTenants([DEV_TENANT]);
          setCurrentTenantState(DEV_TENANT);
          setLoading(false);
          return;
        }

        // Fetch user's tenants
        const userTenants = await tenantUserService.getUserTenants(user.id);
        setTenants(userTenants);

        if (userTenants.length === 0) {
          // User has no tenants - they need to be invited or create one
          logger.debug('TenantContext.noTenants', { userId: user.id });
          setCurrentTenantState(null);
          setLoading(false);
          return;
        }

        // Try to restore last selected tenant
        const lastTenantId = getSecureStorageItem(LAST_TENANT_KEY);
        const lastTenant = lastTenantId 
          ? userTenants.find(t => t.id === lastTenantId)
          : null;

        if (lastTenant) {
          setCurrentTenantState(lastTenant);
        } else {
          // Select first tenant
          const firstTenant = userTenants[0];
          if (firstTenant) {
            setCurrentTenantState(firstTenant);
            setSecureStorageItem(LAST_TENANT_KEY, firstTenant.id);
          }
        }

        setLoading(false);
      } catch (err) {
        logger.error('TenantContext.loadTenants.failed', { error: err });
        setError('errorLoading');
        setLoading(false);

        // In dev mode, fallback to mock tenant on error
        if (import.meta.env.DEV) {
          logger.debug('TenantContext.dev.fallbackToMock');
          setTenants([DEV_TENANT]);
          setCurrentTenantState(DEV_TENANT);
        }
      }
    };

    loadTenants();
  }, [user, authLoading]);

  // Setter that also persists to storage
  const setCurrentTenant = useCallback((tenant: Tenant | null) => {
    setCurrentTenantState(tenant);
    if (tenant) {
      setSecureStorageItem(LAST_TENANT_KEY, tenant.id);
    } else {
      removeSecureStorageItem(LAST_TENANT_KEY);
    }
  }, []);

  const value = useMemo(
    () => ({ currentTenant, tenants, setCurrentTenant, loading, error }),
    [currentTenant, tenants, setCurrentTenant, loading, error]
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
