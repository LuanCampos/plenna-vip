/**
 * Appointment type definition
 * Updated to support multiple services (N:N relationship)
 */
import type { AppointmentStatus } from '@/lib/config/business';
import type { AppointmentService } from './appointmentService';

export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string | null;
  professional_id: string | null;
  start_time: string; // ISO 8601
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  total_duration: number; // sum of all services duration
  total_price: number; // sum of all services price
  created_at: string;
  updated_at: string;
}

export type AppointmentCreate = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentUpdate = Partial<Omit<AppointmentCreate, 'tenant_id'>>;

export interface AppointmentWithDetails extends Appointment {
  client?: {
    id: string;
    name: string;
    phone: string;
  };
  professional?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  services: AppointmentService[];
}

export interface AppointmentCreateInput {
  tenant_id: string;
  client_id: string | null;
  professional_id: string;
  start_time: string;
  service_ids: string[];
  notes?: string;
}
