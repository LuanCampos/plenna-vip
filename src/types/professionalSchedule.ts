/**
 * ProfessionalScheduleOverride type definition
 * Exceptions to normal working hours (vacations, sick days, special hours)
 */

export type OverrideType = 'available' | 'unavailable';

export type OverrideReason = 
  | 'vacation'
  | 'sick_leave'
  | 'personal'
  | 'special_event'
  | 'client_request'
  | 'other';

export interface ProfessionalScheduleOverride {
  id: string;
  tenant_id: string;
  professional_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  override_type: OverrideType;
  start_time?: string; // HH:mm (required if available)
  end_time?: string; // HH:mm (required if available)
  reason?: OverrideReason | string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ProfessionalScheduleOverrideCreate = Omit<
  ProfessionalScheduleOverride,
  'id' | 'created_at' | 'updated_at'
>;

export type ProfessionalScheduleOverrideUpdate = Partial<ProfessionalScheduleOverrideCreate>;
