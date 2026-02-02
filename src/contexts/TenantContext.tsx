import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Tenant } from '@/types/tenant';

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
  const [loading] = useState(false);

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
