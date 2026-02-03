/**
 * AppointmentService type definition
 * N:N relationship between appointments and services
 * Stores frozen values at booking time for historical accuracy
 */

export interface AppointmentService {
  id: string;
  tenant_id: string;
  appointment_id: string;
  service_id: string | null;
  service_name_at_booking: string;
  price_at_booking: number;
  duration_at_booking: number;
  order_index: number;
  created_at: string;
}

export type AppointmentServiceCreate = Omit<AppointmentService, 'id' | 'created_at'>;

export interface AppointmentServiceWithService extends AppointmentService {
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
    active: boolean;
  };
}
