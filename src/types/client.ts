/**
 * Client type definition
 */
export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ClientCreate = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type ClientUpdate = Partial<ClientCreate>;
