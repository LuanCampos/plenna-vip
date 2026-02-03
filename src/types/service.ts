/**
 * Service type definition
 */
export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export type ServiceCreate = Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type ServiceUpdate = Partial<Omit<ServiceCreate, 'tenant_id'>>;

export interface ServiceWithProfessionals extends Service {
  professional_ids: string[];
}
