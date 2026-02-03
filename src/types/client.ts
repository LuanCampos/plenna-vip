/**
 * Client type definition
 */
export interface Client {
  id: string;
  tenant_id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export type ClientCreate = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type ClientUpdate = Partial<Omit<ClientCreate, 'tenant_id'>>;

export interface ClientWithHistory extends Client {
  total_appointments: number;
  last_appointment?: string;
}
