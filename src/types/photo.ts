/**
 * AppointmentPhoto type definition
 * Photos attached to appointments for visual history
 */

export interface AppointmentPhoto {
  id: string;
  tenant_id: string;
  appointment_id: string;
  storage_path: string;
  caption?: string;
  created_at: string;
}

export type AppointmentPhotoCreate = Omit<AppointmentPhoto, 'id' | 'created_at'>;

export interface AppointmentPhotoWithUrl extends AppointmentPhoto {
  url: string;
}
