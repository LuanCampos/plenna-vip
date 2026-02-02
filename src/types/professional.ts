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
  created_at: string;
  updated_at: string;
}

export type ProfessionalCreate = Omit<Professional, 'id' | 'created_at' | 'updated_at'>;
export type ProfessionalUpdate = Partial<ProfessionalCreate>;
