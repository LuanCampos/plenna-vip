/**
 * Portuguese translations for Plenna Vip
 * Keep keys in sync with en.ts
 */
export const pt = {
  // App
  appName: 'Plenna Vip',
  loading: 'Carregando...',
  
  // Common actions
  save: 'Salvar',
  cancel: 'Cancelar',
  edit: 'Editar',
  delete: 'Excluir',
  add: 'Adicionar',
  close: 'Fechar',
  confirm: 'Confirmar',
  search: 'Buscar',
  filter: 'Filtrar',
  clear: 'Limpar',
  back: 'Voltar',
  next: 'Próximo',
  previous: 'Anterior',
  
  // Common status
  saved: 'Salvo com sucesso',
  deleted: 'Excluído com sucesso',
  errorSaving: 'Erro ao salvar',
  errorDeleting: 'Erro ao excluir',
  errorLoading: 'Erro ao carregar',
  
  // Navigation
  dashboard: 'Dashboard',
  bookings: 'Agendamentos',
  clients: 'Clientes',
  services: 'Serviços',
  professionals: 'Profissionais',
  settings: 'Configurações',
  
  // Dashboard
  welcomeMessage: 'Bem-vindo ao Plenna Vip',
  todayAppointments: 'Agendamentos de Hoje',
  upcomingAppointments: 'Próximos Agendamentos',
  noAppointmentsToday: 'Nenhum agendamento para hoje',
  
  // Appointments
  newAppointment: 'Novo Agendamento',
  editAppointment: 'Editar Agendamento',
  appointmentCreated: 'Agendamento criado com sucesso',
  appointmentUpdated: 'Agendamento atualizado com sucesso',
  appointmentDeleted: 'Agendamento excluído com sucesso',
  selectClient: 'Selecione o cliente',
  selectService: 'Selecione o serviço',
  selectProfessional: 'Selecione o profissional',
  selectDate: 'Selecione a data',
  selectTime: 'Selecione o horário',
  
  // Appointment status
  statusScheduled: 'Agendado',
  statusConfirmed: 'Confirmado',
  statusCompleted: 'Concluído',
  statusCancelled: 'Cancelado',
  statusNoShow: 'Não compareceu',
  
  // Clients
  newClient: 'Novo Cliente',
  editClient: 'Editar Cliente',
  clientName: 'Nome do Cliente',
  clientPhone: 'Telefone',
  clientEmail: 'Email',
  clientNotes: 'Observações',
  noClients: 'Nenhum cliente cadastrado',
  
  // Services
  newService: 'Novo Serviço',
  editService: 'Editar Serviço',
  serviceName: 'Nome do Serviço',
  servicePrice: 'Preço',
  serviceDuration: 'Duração (minutos)',
  serviceDescription: 'Descrição',
  noServices: 'Nenhum serviço cadastrado',
  
  // Professionals
  newProfessional: 'Novo Profissional',
  editProfessional: 'Editar Profissional',
  professionalName: 'Nome do Profissional',
  noProfessionals: 'Nenhum profissional cadastrado',
  
  // Delete confirmation
  deleteTitle: 'Confirmar Exclusão',
  deleteDescription: 'Esta ação não pode ser desfeita. Deseja continuar?',
  deleteWarning: 'Você tem certeza que deseja excluir este item?',
  
  // Auth
  signIn: 'Entrar',
  signOut: 'Sair',
  signUp: 'Criar conta',
  email: 'Email',
  password: 'Senha',
  forgotPassword: 'Esqueceu a senha?',
  
  // Errors
  requiredField: 'Campo obrigatório',
  invalidEmail: 'Email inválido',
  invalidPhone: 'Telefone inválido',
  minLength: 'Mínimo de {min} caracteres',
  maxLength: 'Máximo de {max} caracteres',
} as const;

export type TranslationKey = keyof typeof pt;
