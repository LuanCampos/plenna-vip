/**
 * Booking type definitions
 * Types for public booking flow
 */

import type { Service } from './service';

export type BookingStep = 'services' | 'professional' | 'datetime' | 'info' | 'confirm';

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

export interface SelectedService {
  service: Service;
  order: number;
}

export interface PublicBookingInput {
  tenant_id: string;
  professional_id: string;
  service_ids: string[];
  start_time: string; // ISO 8601
  client_name: string;
  client_phone: string;
  client_email?: string;
  notes?: string;
}

export interface BookingState {
  step: BookingStep;
  selectedServices: SelectedService[];
  professionalId: string | null;
  date: Date | null;
  time: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}

export interface BookingSummary {
  services: Array<{
    name: string;
    duration: number;
    price: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  professionalName: string;
  dateTime: Date;
}
