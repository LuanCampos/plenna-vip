/**
 * Appointment type definition
 */
import { AppointmentStatus } from '@/lib/config/business';

export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string; // ISO 8601
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentCreate = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentUpdate = Partial<AppointmentCreate>;

export interface AppointmentWithDetails extends Appointment {
  client: {
    id: string;
    name: string;
    phone: string;
  };
  professional: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}
