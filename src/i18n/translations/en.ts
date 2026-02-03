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
  menu: 'Menu',
  
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
  login: 'Login',
  register: 'Register',
  loginTitle: 'Sign in to your account',
  registerTitle: 'Create your account',
  noAccount: "Don't have an account?",
  hasAccount: 'Already have an account?',
  name: 'Name',
  yourName: 'Your name',
  
  // Errors
  requiredField: 'Required field',
  invalidEmail: 'Invalid email',
  invalidPhone: 'Invalid phone',
  minLength: 'Minimum {min} characters',
  maxLength: 'Maximum {max} characters',
  nameTooShort: 'Name too short',
  nameTooLong: 'Name too long',
  textTooLong: 'Text too long',
  priceMustBePositive: 'Price must be positive',
  durationMustBeInteger: 'Duration must be an integer',
  durationMustBePositive: 'Duration must be positive',
  invalidDateTime: 'Invalid date/time',
  invalidDateFormat: 'Invalid date format',
  invalidTimeFormat: 'Invalid time format',
  invalidUrl: 'Invalid URL',
  atLeastOneService: 'Select at least one service',
  
  // Page descriptions
  bookingsDescription: 'Manage your bookings',
  clientsDescription: 'Manage your clients',
  servicesDescription: 'Manage your services',
  professionalsDescription: 'Manage your professionals',
  settingsDescription: 'Configure your store',
  
  // Header
  changeLanguage: 'Change language',
  changeTheme: 'Change theme',
  
  // Booking (public page)
  bookingTitle: 'Book Appointment',
  bookingSubtitle: 'Choose the desired services',
  selectServices: 'Select services',
  selectedServices: 'Selected services',
  totalDuration: 'Total duration',
  totalPrice: 'Total price',
  selectDateTime: 'Choose date and time',
  yourInfo: 'Your information',
  confirmBooking: 'Confirm booking',
  bookingSuccess: 'Booking confirmed!',
  bookingSuccessMessage: 'You will receive a confirmation soon.',
  addMoreServices: 'Add more services',
  removeService: 'Remove service',
  
  // Availability
  noAvailableSlots: 'No available slots',
  availableSlots: 'Available slots',
  selectSlot: 'Select a time slot',
  
  // Photos
  addPhoto: 'Add photo',
  photos: 'Photos',
  maxPhotos: 'Maximum 3 photos',
  uploadPhoto: 'Upload photo',
  deletePhoto: 'Delete photo',
  
  // Calendar
  today: 'Today',
  dayView: 'Day',
  weekView: 'Week',
  noAppointments: 'No appointments',
  
  // Layout
  myAccount: 'My account',
  notifications: 'Notifications',
  
  // Errors
  errorConflict: 'Time slot already booked',
  errorNoSlots: 'No available time slots',
  errorUpload: 'Error uploading photo',
  storeNotFound: 'Store not found',
  
  // Settings
  storeSettings: 'Store Settings',
  businessHours: 'Business Hours',
  storeInfo: 'Store information',
  
  // Schedule Overrides
  scheduleOverride: 'Schedule override',
  scheduleOverrides: 'Schedule overrides',
  addOverride: 'Add override',
  editOverride: 'Edit override',
  removeOverride: 'Remove override',
  overrideType: 'Type',
  workOnThisDay: 'Work on this period',
  dayOff: 'Day off/Absence',
  overrideReason: 'Reason',
  reasonVacation: 'Vacation',
  reasonSickLeave: 'Sick leave',
  reasonPersonal: 'Personal reason',
  reasonSpecialEvent: 'Special event',
  reasonClientRequest: 'Client request',
  startDate: 'Start date',
  endDate: 'End date',
  singleDay: 'Single day',
  dateRange: 'Date range',
} as const;

export type TranslationKey = keyof typeof en;
