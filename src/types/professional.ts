/**
 * Professional type definition
 */
export interface Professional {
  id: string;
  tenant_id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  active: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export type ProfessionalCreate = Omit<Professional, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type ProfessionalUpdate = Partial<Omit<ProfessionalCreate, 'tenant_id'>>;

export interface ProfessionalWithServices extends Professional {
  service_ids: string[];
  services?: Array<{
    id: string;
    name: string;
  }>;
}
