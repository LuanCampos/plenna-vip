/**
 * Tenant type definition
 * Represents a salon/business in the multi-tenant system
 */

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface BusinessHours {
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
  sunday: TimeRange[];
}

export interface TenantSettings {
  max_photos_per_appointment: number;
  booking_slot_duration: number;
  allow_multiple_same_service: boolean;
  require_phone_for_booking: boolean;
  show_prices_publicly: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone: string;
  business_hours: BusinessHours;
  settings: TenantSettings;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type TenantCreate = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
export type TenantUpdate = Partial<Omit<TenantCreate, 'owner_id'>>;

export interface TenantWithStats extends Tenant {
  appointments_today: number;
  total_clients: number;
  total_professionals: number;
}
