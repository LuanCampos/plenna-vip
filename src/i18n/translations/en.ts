/**
 * English translations for Plenna Vip
 * Keep keys in sync with pt.ts
 */
export const en = {
  // App
  appName: 'Plenna Vip',
  loading: 'Loading...',
  
  // Common actions
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  close: 'Close',
  confirm: 'Confirm',
  search: 'Search',
  filter: 'Filter',
  clear: 'Clear',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  
  // Common status
  saved: 'Saved successfully',
  deleted: 'Deleted successfully',
  errorSaving: 'Error saving',
  errorDeleting: 'Error deleting',
  errorLoading: 'Error loading',
  
  // Navigation
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  clients: 'Clients',
  services: 'Services',
  professionals: 'Professionals',
  settings: 'Settings',
  
  // Dashboard
  welcomeMessage: 'Welcome to Plenna Vip',
  todayAppointments: "Today's Appointments",
  upcomingAppointments: 'Upcoming Appointments',
  noAppointmentsToday: 'No appointments for today',
  
  // Appointments
  newAppointment: 'New Appointment',
  editAppointment: 'Edit Appointment',
  appointmentCreated: 'Appointment created successfully',
  appointmentUpdated: 'Appointment updated successfully',
  appointmentDeleted: 'Appointment deleted successfully',
  selectClient: 'Select client',
  selectService: 'Select service',
  selectProfessional: 'Select professional',
  selectDate: 'Select date',
  selectTime: 'Select time',
  
  // Appointment status
  statusScheduled: 'Scheduled',
  statusConfirmed: 'Confirmed',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  statusNoShow: 'No Show',
  
  // Clients
  newClient: 'New Client',
  editClient: 'Edit Client',
  clientName: 'Client Name',
  clientPhone: 'Phone',
  clientEmail: 'Email',
  clientNotes: 'Notes',
  noClients: 'No clients registered',
  
  // Services
  newService: 'New Service',
  editService: 'Edit Service',
  serviceName: 'Service Name',
  servicePrice: 'Price',
  serviceDuration: 'Duration (minutes)',
  serviceDescription: 'Description',
  noServices: 'No services registered',
  
  // Professionals
  newProfessional: 'New Professional',
  editProfessional: 'Edit Professional',
  professionalName: 'Professional Name',
  noProfessionals: 'No professionals registered',
  
  // Delete confirmation
  deleteTitle: 'Confirm Deletion',
  deleteDescription: 'This action cannot be undone. Do you want to continue?',
  deleteWarning: 'Are you sure you want to delete this item?',
  
  // Auth
  signIn: 'Sign In',
  signOut: 'Sign Out',
  signUp: 'Sign Up',
  email: 'Email',
  password: 'Password',
  forgotPassword: 'Forgot password?',
  
  // Errors
  requiredField: 'Required field',
  invalidEmail: 'Invalid email',
  invalidPhone: 'Invalid phone',
  minLength: 'Minimum {min} characters',
  maxLength: 'Maximum {max} characters',
} as const;

export type TranslationKey = keyof typeof en;
