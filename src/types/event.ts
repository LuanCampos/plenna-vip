/**
 * AppointmentEvent type definition
 * Events logged for audit and future notifications
 */

export type EventType = 'created' | 'updated' | 'cancelled' | 'status_changed';
export type ActorType = 'staff' | 'client' | 'system';

export interface AppointmentEvent {
  id: string;
  tenant_id: string;
  appointment_id: string;
  event_type: EventType;
  actor_type: ActorType;
  actor_id: string | null;
  payload?: Record<string, unknown>;
  notified: boolean;
  created_at: string;
}

export type AppointmentEventCreate = Omit<AppointmentEvent, 'id' | 'created_at' | 'notified'>;

export interface StatusChangePayload {
  from: string;
  to: string;
}

export interface UpdatePayload {
  changes: Record<string, { old: unknown; new: unknown }>;
}
