// Core entities
export type { 
  Tenant, 
  TenantCreate, 
  TenantUpdate, 
  TenantWithStats,
  TimeRange,
  BusinessHours,
  TenantSettings 
} from './tenant';

export type { 
  Appointment, 
  AppointmentCreate, 
  AppointmentUpdate, 
  AppointmentWithDetails,
  AppointmentCreateInput 
} from './appointment';

export type { 
  Client, 
  ClientCreate, 
  ClientUpdate,
  ClientWithHistory 
} from './client';

export type { 
  Service, 
  ServiceCreate, 
  ServiceUpdate,
  ServiceWithProfessionals 
} from './service';

export type { 
  Professional, 
  ProfessionalCreate, 
  ProfessionalUpdate,
  ProfessionalWithServices 
} from './professional';

// User and auth
export type { 
  UserProfile, 
  UserProfileCreate, 
  UserProfileUpdate,
  TenantUser,
  TenantUserCreate,
  TenantUserUpdate,
  TenantUserWithProfile,
  UserRole 
} from './user';

// Appointment related
export type { 
  AppointmentService, 
  AppointmentServiceCreate,
  AppointmentServiceWithService 
} from './appointmentService';

export type { 
  AppointmentPhoto, 
  AppointmentPhotoCreate,
  AppointmentPhotoWithUrl 
} from './photo';

export type { 
  AppointmentEvent, 
  AppointmentEventCreate,
  EventType,
  ActorType,
  StatusChangePayload,
  UpdatePayload 
} from './event';

// Booking
export type { 
  BookingStep,
  TimeSlot,
  SelectedService,
  PublicBookingInput,
  BookingState,
  BookingSummary 
} from './booking';

// Schedule
export type { 
  ProfessionalScheduleOverride,
  ProfessionalScheduleOverrideCreate,
  ProfessionalScheduleOverrideUpdate,
  OverrideType,
  OverrideReason 
} from './professionalSchedule';
