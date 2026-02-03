# 📋 Plano de Implementação — MVP Plenna Vip

> **Papel:** [Planejador]  
> **Data:** 02/02/2026  
> **Status:** ✅ APROVADO — Pronto para execução

---

## 1. Objetivo da Mudança

Implementar o MVP completo do sistema de agendamento para salões de beleza, permitindo:

1. **Gestão de Agenda** — visualização diária/semanal, criação e edição de agendamentos
2. **Cadastro de Clientes** — CRUD com busca por nome/telefone e histórico automático
3. **Cadastro de Serviços** — CRUD com nome, duração e preço
4. **Cadastro de Profissionais** — CRUD com associação a serviços
5. **Upload de Fotos** — 1-3 fotos por appointment (histórico visual)
6. **Página Pública de Agendamento** — booking online via `/{slug}`

O sistema deve ser **multi-tenant**, com isolamento total de dados por `tenant_id`.

---

## 2. Refinamentos Arquiteturais

### 2.1 Modelo de Usuários (Resposta à Pergunta)

**Pergunta:** É certo que um profissional tenha também login de cliente pelo mesmo email?

**Resposta Recomendada:** **Sim, mas com separação de papéis.**

```
┌─────────────────────────────────────────────────────────────┐
│                    auth.users (Supabase)                    │
│  Um único usuário identificado por email                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      user_profiles                          │
│  Dados básicos: name, phone, avatar_url                     │
│  Um por auth.user                                           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
      │ tenant_users│  │professionals│  │   clients   │
      │ (staff)     │  │ (per tenant)│  │ (per tenant)│
      │ role: owner │  │ user_id FK  │  │ user_id FK  │
      │ role: admin │  │ (opcional)  │  │ (opcional)  │
      │ role: staff │  └─────────────┘  └─────────────┘
      └─────────────┘
```

**Benefícios:**
- Um email = um login (UX simples)
- Usuário pode ser profissional em uma loja e cliente em outra
- Profissional pode agendar para si em outra loja (como cliente)
- Clientes da página pública podem criar conta depois
- Escalável para funcionalidades futuras (app do cliente, notificações)

### 2.2 Simplificações para MVP

| Funcionalidade | MVP | Pós-MVP |
|----------------|-----|---------|
| Login | Email/senha via Supabase Auth | OAuth (Google, Apple) |
| Notificações | Toast na UI + **evento preparado** | WhatsApp/SMS/Email |
| Pagamentos | Não incluso | Integração Stripe/Pix |
| Relatórios | Dashboard básico | Analytics avançado |
| Horário profissional | Herda da loja (estrutura pronta) | Config individual + férias |
| Múltiplos serviços | ✅ Suportado desde MVP | — |

### 2.3 Decisões Arquiteturais Confirmadas

| Decisão | Implementação | Preparação Futura |
|---------|---------------|-------------------|
| **Horário da loja** | Por dia da semana, com intervalos | Pós-MVP: horário individual por profissional |
| **Exceções de horário** | Tabela `schedule_overrides` unificada | Férias, folgas, sábados especiais |
| **Profissional edita bookings** | ✅ Pode editar/excluir | Evento registrado para notificação |
| **Booking automático** | ✅ Sem aprovação | Evento de criação para notificação |
| **Múltiplos serviços** | ✅ Tabela `appointment_services` | Mesmo serviço pode repetir |
| **Configurações** | ✅ `settings` JSONB no tenant | max_photos, slot_duration |
| **Soft delete** | ✅ `deleted_at` em clients | Histórico preservado |

### 2.4 Sistema de Eventos (Preparação para Notificações)

```typescript
// Eventos são salvos diretamente na tabela appointment_events
// Sem event emitter local - simplicidade > complexidade

// Tipos de evento:
type EventType = 'created' | 'updated' | 'cancelled' | 'status_changed';
type ActorType = 'staff' | 'client' | 'system';

// Cada ação no appointmentService também insere o evento
// Pós-MVP: Edge Function processa eventos com notified=false
```

### 2.3 Fluxo de Dados

```
┌──────────────┐     ┌─────────────┐     ┌───────────────┐
│  Componente  │ ──▶ │    Hook     │ ──▶ │   Service     │
│  (UI/UX)     │     │  (lógica)   │     │  (Supabase)   │
└──────────────┘     └─────────────┘     └───────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  TanStack   │
                    │   Query     │
                    │  (cache)    │
                    └─────────────┘
```

---

## 3. Schema do Banco de Dados (Supabase)

> ⚠️ **PRINCÍPIOS DE SEGURANÇA:**
> 1. **RLS em TODAS as tabelas** — sem exceção
> 2. **tenant_id em todas as tabelas de dados** — isolamento total
> 3. **Campos de auditoria em todas as tabelas** — created_at, updated_at
> 4. **Trigger automático para updated_at** — consistência garantida
> 5. **Políticas explícitas para cada operação** — SELECT, INSERT, UPDATE, DELETE
> 6. **Funções auxiliares para verificação de acesso** — performance e manutenibilidade

### 3.1 Funções Auxiliares de Segurança

```sql
-- ============================================
-- FUNÇÕES AUXILIARES (criar ANTES das tabelas)
-- ============================================

-- Verifica se o usuário atual é staff do tenant
CREATE OR REPLACE FUNCTION is_tenant_staff(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verifica se o usuário atual é owner ou admin do tenant
CREATE OR REPLACE FUNCTION is_tenant_admin(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verifica se o usuário atual é owner do tenant
CREATE OR REPLACE FUNCTION is_tenant_owner(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_users 
    WHERE tenant_id = p_tenant_id 
    AND user_id = auth.uid()
    AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Retorna os tenant_ids que o usuário tem acesso
CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY 
    SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger function para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Tabelas com Campos de Controle Completos

```sql
-- ============================================
-- EXTENSÕES NECESSÁRIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- para EXCLUDE constraints

-- ============================================
-- TABELA: tenants (lojas)
-- ============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  business_hours JSONB NOT NULL DEFAULT '{
    "monday": [{"start": "09:00", "end": "18:00"}],
    "tuesday": [{"start": "09:00", "end": "18:00"}],
    "wednesday": [{"start": "09:00", "end": "18:00"}],
    "thursday": [{"start": "09:00", "end": "18:00"}],
    "friday": [{"start": "09:00", "end": "18:00"}],
    "saturday": [],
    "sunday": []
  }',
  settings JSONB NOT NULL DEFAULT '{
    "max_photos_per_appointment": 3,
    "booking_slot_duration": 30,
    "allow_multiple_same_service": true,
    "require_phone_for_booking": true,
    "show_prices_publicly": true
  }',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: user_profiles (perfil do usuário autenticado)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: tenant_users (staff da loja)
-- ============================================
CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')) DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE TRIGGER tenant_users_updated_at
  BEFORE UPDATE ON tenant_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: professionals
-- ============================================
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- opcional
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: services
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  duration INTEGER NOT NULL CHECK (duration > 0), -- minutos
  active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: professional_services (N:N)
-- ============================================
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- ADICIONADO para RLS
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(professional_id, service_id)
);

-- ============================================
-- TABELA: clients
-- ============================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- opcional
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- SEM UNIQUE em phone! Mãe pode agendar para filha com mesmo telefone
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: appointments
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  total_duration INTEGER NOT NULL CHECK (total_duration > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Validação: end_time deve ser após start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: appointment_services (N:N)
-- ============================================
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- ADICIONADO para RLS
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name_at_booking TEXT NOT NULL,
  price_at_booking DECIMAL(10,2) NOT NULL CHECK (price_at_booking >= 0),
  duration_at_booking INTEGER NOT NULL CHECK (duration_at_booking > 0),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- SEM UNIQUE! Permite mesmo serviço 2x
);

-- ============================================
-- TABELA: professional_schedule_overrides
-- ============================================
CREATE TABLE professional_schedule_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- ADICIONADO para RLS
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('available', 'unavailable')),
  start_time TIME, -- null se unavailable
  end_time TIME,   -- null se unavailable
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Validação: end_date >= start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  -- Validação: se available, precisa ter horários
  CONSTRAINT valid_available_times CHECK (
    override_type = 'unavailable' OR (start_time IS NOT NULL AND end_time IS NOT NULL)
  ),
  -- Impedir sobreposição de datas para o mesmo profissional
  CONSTRAINT no_overlapping_overrides EXCLUDE USING gist (
    professional_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

CREATE TRIGGER professional_schedule_overrides_updated_at
  BEFORE UPDATE ON professional_schedule_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: appointment_events (log para notificações)
-- ============================================
CREATE TABLE appointment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- ADICIONADO para RLS
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'cancelled', 'status_changed')),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('staff', 'client', 'system')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABELA: appointment_photos
-- ============================================
CREATE TABLE appointment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- ADICIONADO para RLS
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- caminho no bucket, não URL pública
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.3 Índices para Performance

```sql
-- ============================================
-- ÍNDICES
-- ============================================

-- Tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenants_active ON tenants(id) WHERE active = true;

-- Tenant Users
CREATE INDEX idx_tenant_users_user ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_tenant ON tenant_users(tenant_id);

-- Professionals
CREATE INDEX idx_professionals_tenant ON professionals(tenant_id);
CREATE INDEX idx_professionals_active ON professionals(tenant_id) WHERE deleted_at IS NULL AND active = true;
CREATE INDEX idx_professionals_user ON professionals(user_id) WHERE user_id IS NOT NULL;

-- Services
CREATE INDEX idx_services_tenant ON services(tenant_id);
CREATE INDEX idx_services_active ON services(tenant_id) WHERE deleted_at IS NULL AND active = true;

-- Professional Services
CREATE INDEX idx_professional_services_tenant ON professional_services(tenant_id);
CREATE INDEX idx_professional_services_professional ON professional_services(professional_id);
CREATE INDEX idx_professional_services_service ON professional_services(service_id);

-- Clients
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_phone ON clients(tenant_id, phone);
CREATE INDEX idx_clients_active ON clients(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_user ON clients(user_id) WHERE user_id IS NOT NULL;

-- Appointments
CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_appointments_date ON appointments(tenant_id, DATE(start_time));
CREATE INDEX idx_appointments_status ON appointments(tenant_id, status);
CREATE INDEX idx_appointments_range ON appointments(tenant_id, start_time, end_time);

-- Appointment Services
CREATE INDEX idx_appointment_services_tenant ON appointment_services(tenant_id);
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);

-- Schedule Overrides
CREATE INDEX idx_schedule_overrides_tenant ON professional_schedule_overrides(tenant_id);
CREATE INDEX idx_schedule_overrides_professional ON professional_schedule_overrides(professional_id);
CREATE INDEX idx_schedule_overrides_dates ON professional_schedule_overrides(professional_id, start_date, end_date);

-- Appointment Events
CREATE INDEX idx_appointment_events_tenant ON appointment_events(tenant_id);
CREATE INDEX idx_appointment_events_appointment ON appointment_events(appointment_id);
CREATE INDEX idx_appointment_events_unnotified ON appointment_events(tenant_id) WHERE notified = false;

-- Appointment Photos
CREATE INDEX idx_appointment_photos_tenant ON appointment_photos(tenant_id);
CREATE INDEX idx_appointment_photos_appointment ON appointment_photos(appointment_id);
```

### 3.4 Row Level Security (RLS) Completo

```sql
-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_photos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: tenants
-- ============================================
-- SELECT: Staff vê apenas seus tenants
CREATE POLICY "tenants_select_staff" ON tenants
  FOR SELECT TO authenticated
  USING (id IN (SELECT get_user_tenant_ids()));

-- SELECT: Público pode ver tenants ativos (para página pública)
CREATE POLICY "tenants_select_public" ON tenants
  FOR SELECT TO anon
  USING (active = true);

-- INSERT: Qualquer usuário autenticado pode criar (será owner)
CREATE POLICY "tenants_insert" ON tenants
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- UPDATE: Apenas owner pode atualizar
CREATE POLICY "tenants_update" ON tenants
  FOR UPDATE TO authenticated
  USING (is_tenant_owner(id))
  WITH CHECK (is_tenant_owner(id));

-- DELETE: Apenas owner pode deletar
CREATE POLICY "tenants_delete" ON tenants
  FOR DELETE TO authenticated
  USING (is_tenant_owner(id));

-- ============================================
-- POLÍTICAS: user_profiles
-- ============================================
-- SELECT: Usuário vê apenas seu próprio perfil
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- INSERT: Usuário cria apenas seu próprio perfil
CREATE POLICY "user_profiles_insert" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- UPDATE: Usuário atualiza apenas seu próprio perfil
CREATE POLICY "user_profiles_update" ON user_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- POLÍTICAS: tenant_users
-- ============================================
-- SELECT: Staff vê membros do próprio tenant
CREATE POLICY "tenant_users_select" ON tenant_users
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: Apenas admin/owner pode adicionar membros
CREATE POLICY "tenant_users_insert" ON tenant_users
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_admin(tenant_id));

-- UPDATE: Apenas owner pode alterar roles
CREATE POLICY "tenant_users_update" ON tenant_users
  FOR UPDATE TO authenticated
  USING (is_tenant_owner(tenant_id))
  WITH CHECK (is_tenant_owner(tenant_id));

-- DELETE: Admin pode remover staff, owner pode remover admin
CREATE POLICY "tenant_users_delete" ON tenant_users
  FOR DELETE TO authenticated
  USING (
    -- Admin pode remover staff
    (is_tenant_admin(tenant_id) AND role = 'staff')
    OR
    -- Owner pode remover qualquer um (exceto a si mesmo)
    (is_tenant_owner(tenant_id) AND user_id != auth.uid())
  );

-- ============================================
-- POLÍTICAS: professionals
-- ============================================
-- SELECT: Staff vê profissionais do tenant
CREATE POLICY "professionals_select_staff" ON professionals
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- SELECT: Público vê apenas ativos e não deletados (para booking)
CREATE POLICY "professionals_select_public" ON professionals
  FOR SELECT TO anon
  USING (active = true AND deleted_at IS NULL);

-- INSERT: Apenas admin/owner pode criar
CREATE POLICY "professionals_insert" ON professionals
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_admin(tenant_id));

-- UPDATE: Staff pode atualizar
CREATE POLICY "professionals_update" ON professionals
  FOR UPDATE TO authenticated
  USING (is_tenant_staff(tenant_id))
  WITH CHECK (is_tenant_staff(tenant_id));

-- DELETE: Não permitido via SQL (usar soft delete)
-- Nenhuma política DELETE

-- ============================================
-- POLÍTICAS: services
-- ============================================
-- SELECT: Staff vê todos os serviços do tenant
CREATE POLICY "services_select_staff" ON services
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- SELECT: Público vê apenas ativos e não deletados
CREATE POLICY "services_select_public" ON services
  FOR SELECT TO anon
  USING (active = true AND deleted_at IS NULL);

-- INSERT: Apenas admin/owner pode criar
CREATE POLICY "services_insert" ON services
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_admin(tenant_id));

-- UPDATE: Admin pode atualizar
CREATE POLICY "services_update" ON services
  FOR UPDATE TO authenticated
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

-- ============================================
-- POLÍTICAS: professional_services
-- ============================================
-- SELECT: Staff vê associações do tenant
CREATE POLICY "professional_services_select_staff" ON professional_services
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- SELECT: Público vê (para saber quais profissionais fazem quais serviços)
CREATE POLICY "professional_services_select_public" ON professional_services
  FOR SELECT TO anon
  USING (true); -- Filtrar por professional/service ativo na query

-- INSERT: Admin pode criar
CREATE POLICY "professional_services_insert" ON professional_services
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_admin(tenant_id));

-- DELETE: Admin pode remover
CREATE POLICY "professional_services_delete" ON professional_services
  FOR DELETE TO authenticated
  USING (is_tenant_admin(tenant_id));

-- ============================================
-- POLÍTICAS: clients
-- ============================================
-- SELECT: Staff vê clientes do tenant (não deletados)
CREATE POLICY "clients_select_staff" ON clients
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: Staff pode criar clientes
CREATE POLICY "clients_insert_staff" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_staff(tenant_id));

-- INSERT: Anon pode criar (booking público cria cliente)
CREATE POLICY "clients_insert_public" ON clients
  FOR INSERT TO anon
  WITH CHECK (true); -- Validar tenant_id existe via FK

-- UPDATE: Staff pode atualizar
CREATE POLICY "clients_update" ON clients
  FOR UPDATE TO authenticated
  USING (is_tenant_staff(tenant_id))
  WITH CHECK (is_tenant_staff(tenant_id));

-- ============================================
-- POLÍTICAS: appointments
-- ============================================
-- SELECT: Staff vê agendamentos do tenant
CREATE POLICY "appointments_select_staff" ON appointments
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- SELECT: Cliente vê próprios agendamentos (se logado)
CREATE POLICY "appointments_select_client" ON appointments
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- INSERT: Staff pode criar
CREATE POLICY "appointments_insert_staff" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_staff(tenant_id));

-- INSERT: Anon pode criar (booking público)
CREATE POLICY "appointments_insert_public" ON appointments
  FOR INSERT TO anon
  WITH CHECK (true); -- Validar tenant_id via FK

-- UPDATE: Staff pode atualizar
CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE TO authenticated
  USING (is_tenant_staff(tenant_id))
  WITH CHECK (is_tenant_staff(tenant_id));

-- DELETE: Admin pode deletar
CREATE POLICY "appointments_delete" ON appointments
  FOR DELETE TO authenticated
  USING (is_tenant_admin(tenant_id));

-- ============================================
-- POLÍTICAS: appointment_services
-- ============================================
-- SELECT: Staff vê do tenant
CREATE POLICY "appointment_services_select_staff" ON appointment_services
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: Staff pode criar
CREATE POLICY "appointment_services_insert_staff" ON appointment_services
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_staff(tenant_id));

-- INSERT: Anon pode criar (booking público)
CREATE POLICY "appointment_services_insert_public" ON appointment_services
  FOR INSERT TO anon
  WITH CHECK (true);

-- DELETE: Staff pode remover
CREATE POLICY "appointment_services_delete" ON appointment_services
  FOR DELETE TO authenticated
  USING (is_tenant_staff(tenant_id));

-- ============================================
-- POLÍTICAS: professional_schedule_overrides
-- ============================================
-- SELECT: Staff vê do tenant
CREATE POLICY "schedule_overrides_select_staff" ON professional_schedule_overrides
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- SELECT: Público vê (para calcular disponibilidade)
CREATE POLICY "schedule_overrides_select_public" ON professional_schedule_overrides
  FOR SELECT TO anon
  USING (true);

-- INSERT: Admin pode criar
CREATE POLICY "schedule_overrides_insert" ON professional_schedule_overrides
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_admin(tenant_id));

-- UPDATE: Admin pode atualizar
CREATE POLICY "schedule_overrides_update" ON professional_schedule_overrides
  FOR UPDATE TO authenticated
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

-- DELETE: Admin pode remover
CREATE POLICY "schedule_overrides_delete" ON professional_schedule_overrides
  FOR DELETE TO authenticated
  USING (is_tenant_admin(tenant_id));

-- ============================================
-- POLÍTICAS: appointment_events
-- ============================================
-- SELECT: Staff vê do tenant
CREATE POLICY "appointment_events_select" ON appointment_events
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: Staff e sistema podem criar
CREATE POLICY "appointment_events_insert_staff" ON appointment_events
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_staff(tenant_id));

-- INSERT: Anon pode criar (booking público gera evento)
CREATE POLICY "appointment_events_insert_public" ON appointment_events
  FOR INSERT TO anon
  WITH CHECK (true);

-- ============================================
-- POLÍTICAS: appointment_photos
-- ============================================
-- SELECT: Staff vê do tenant
CREATE POLICY "appointment_photos_select" ON appointment_photos
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- INSERT: Staff pode fazer upload
CREATE POLICY "appointment_photos_insert" ON appointment_photos
  FOR INSERT TO authenticated
  WITH CHECK (is_tenant_staff(tenant_id));

-- DELETE: Staff pode remover
CREATE POLICY "appointment_photos_delete" ON appointment_photos
  FOR DELETE TO authenticated
  USING (is_tenant_staff(tenant_id));
```

### 3.5 Storage (Bucket para Fotos)

```sql
-- ============================================
-- STORAGE: Bucket para fotos de appointments
-- ============================================

-- Criar bucket (via Supabase Dashboard ou API)
-- Nome: appointment-photos
-- Public: false (acesso via signed URLs)

-- Políticas de Storage (executar no SQL Editor)

-- INSERT: Staff pode fazer upload na pasta do tenant
CREATE POLICY "storage_insert_staff" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'appointment-photos'
    AND is_tenant_staff((storage.foldername(name))[1]::uuid)
  );

-- SELECT: Staff pode ver fotos do tenant
CREATE POLICY "storage_select_staff" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'appointment-photos'
    AND is_tenant_staff((storage.foldername(name))[1]::uuid)
  );

-- DELETE: Staff pode remover fotos do tenant
CREATE POLICY "storage_delete_staff" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'appointment-photos'
    AND is_tenant_staff((storage.foldername(name))[1]::uuid)
  );

-- ESTRUTURA DO PATH:
-- appointment-photos/{tenant_id}/{appointment_id}/{filename}
-- Exemplo: appointment-photos/abc123/def456/photo1.jpg
```

### 3.6 Validações de Integridade (Triggers)

```sql
-- ============================================
-- TRIGGER: Validar que client pertence ao tenant
-- ============================================
CREATE OR REPLACE FUNCTION validate_appointment_tenant_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar client pertence ao tenant
  IF NEW.client_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM clients 
      WHERE id = NEW.client_id AND tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Client does not belong to this tenant';
    END IF;
  END IF;
  
  -- Validar professional pertence ao tenant
  IF NEW.professional_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM professionals 
      WHERE id = NEW.professional_id AND tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Professional does not belong to this tenant';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_validate_tenant
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION validate_appointment_tenant_consistency();

-- ============================================
-- TRIGGER: Validar professional_services tenant consistency
-- ============================================
CREATE OR REPLACE FUNCTION validate_professional_services_tenant()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_tenant UUID;
  v_service_tenant UUID;
BEGIN
  SELECT tenant_id INTO v_professional_tenant FROM professionals WHERE id = NEW.professional_id;
  SELECT tenant_id INTO v_service_tenant FROM services WHERE id = NEW.service_id;
  
  IF v_professional_tenant != v_service_tenant THEN
    RAISE EXCEPTION 'Professional and Service must belong to the same tenant';
  END IF;
  
  -- Garantir tenant_id correto
  NEW.tenant_id := v_professional_tenant;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professional_services_validate
  BEFORE INSERT OR UPDATE ON professional_services
  FOR EACH ROW EXECUTE FUNCTION validate_professional_services_tenant();

-- ============================================
-- TRIGGER: Criar tenant_user quando tenant é criado
-- ============================================
CREATE OR REPLACE FUNCTION create_owner_tenant_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO tenant_users (tenant_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tenants_create_owner
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION create_owner_tenant_user();

-- ============================================
-- TRIGGER: Criar user_profile quando usuário é criado
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.7 Resumo de Segurança

| Tabela | RLS | tenant_id | created_at | updated_at | Trigger |
|--------|-----|-----------|------------|------------|---------|
| tenants | ✅ | N/A | ✅ | ✅ | ✅ updated_at |
| user_profiles | ✅ | N/A | ✅ | ✅ | ✅ updated_at |
| tenant_users | ✅ | ✅ | ✅ | ✅ | ✅ updated_at |
| professionals | ✅ | ✅ | ✅ | ✅ | ✅ updated_at |
| services | ✅ | ✅ | ✅ | ✅ | ✅ updated_at |
| professional_services | ✅ | ✅ | ✅ | — | ✅ validate |
| clients | ✅ | ✅ | ✅ | ✅ | ✅ updated_at |
| appointments | ✅ | ✅ | ✅ | ✅ | ✅ both |
| appointment_services | ✅ | ✅ | ✅ | — | — |
| schedule_overrides | ✅ | ✅ | ✅ | ✅ | ✅ updated_at |
| appointment_events | ✅ | ✅ | ✅ | — | — |
| appointment_photos | ✅ | ✅ | ✅ | — | — |

**Permissões por Role:**

| Operação | anon | staff | admin | owner |
|----------|------|-------|-------|-------|
| Ver tenant (público) | ✅ | ✅ | ✅ | ✅ |
| Editar tenant | ❌ | ❌ | ❌ | ✅ |
| Ver profissionais/serviços | ✅* | ✅ | ✅ | ✅ |
| Criar profissionais | ❌ | ❌ | ✅ | ✅ |
| Editar profissionais | ❌ | ✅ | ✅ | ✅ |
| Criar agendamento | ✅** | ✅ | ✅ | ✅ |
| Editar agendamento | ❌ | ✅ | ✅ | ✅ |
| Deletar agendamento | ❌ | ❌ | ✅ | ✅ |
| Ver clientes | ❌ | ✅ | ✅ | ✅ |
| Upload fotos | ❌ | ✅ | ✅ | ✅ |
| Gerenciar staff | ❌ | ❌ | ✅ | ✅ |

\* Apenas ativos e não deletados  
\** Booking público

---

## 4. Arquivos a Criar/Alterar

### 4.1 Types (Novos/Alterações)

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/types/user.ts` | **CRIAR** | UserProfile, TenantUser, UserRole |
| `src/types/tenant.ts` | ALTERAR | Adicionar business_hours (por dia), settings |
| `src/types/appointment.ts` | ALTERAR | Remover service_id, adicionar total_duration, total_price |
| `src/types/appointmentService.ts` | **CRIAR** | AppointmentService (N:N com service_name_at_booking) |
| `src/types/photo.ts` | **CRIAR** | AppointmentPhoto |
| `src/types/professional.ts` | ALTERAR | Adicionar service_ids |
| `src/types/professionalSchedule.ts` | **CRIAR** | ProfessionalScheduleOverride (apenas overrides no MVP) |
| `src/types/booking.ts` | **CRIAR** | PublicBookingInput, TimeSlot, BookingStep |
| `src/types/event.ts` | **CRIAR** | AppointmentEvent (salvo no banco para notificações futuras) |

### 4.2 Services (Supabase)

| Arquivo | Ação | Funções |
|---------|------|---------|
| `src/lib/services/tenantService.ts` | **CRIAR** | getBySlug, getById, update |
| `src/lib/services/clientService.ts` | **CRIAR** | getAll, getById, create, update, delete, searchByPhone |
| `src/lib/services/serviceService.ts` | **CRIAR** | getAll, getById, create, update, delete, getActive |
| `src/lib/services/professionalService.ts` | **CRIAR** | getAll, getById, create, update, delete, getByService |
| `src/lib/services/appointmentService.ts` | **CRIAR** | getAll, getById, create, update, delete, getByDateRange, checkConflict, addServices, removeService |
| `src/lib/services/photoService.ts` | **CRIAR** | upload, getByAppointment, delete |
| `src/lib/services/availabilityService.ts` | **CRIAR** | getAvailableSlots (considera múltiplos serviços) |

### 4.3 Hooks (TanStack Query)

| Arquivo | Ação | Exports |
|---------|------|---------|
| `src/hooks/useClients.ts` | **CRIAR** | useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient |
| `src/hooks/useServices.ts` | **CRIAR** | useServices, useService, useCreateService, useUpdateService, useDeleteService |
| `src/hooks/useProfessionals.ts` | **CRIAR** | useProfessionals, useProfessional, useCreateProfessional... |
| `src/hooks/useAppointments.ts` | **CRIAR** | useAppointments, useAppointment, useCreateAppointment... |
| `src/hooks/useAvailability.ts` | **CRIAR** | useAvailableSlots |
| `src/hooks/usePhotos.ts` | **CRIAR** | usePhotos, useUploadPhoto, useDeletePhoto |

### 4.4 Validators (Zod)

| Arquivo | Ação | Schemas |
|---------|------|---------|
| `src/lib/validators/clientSchema.ts` | **CRIAR** | clientSchema |
| `src/lib/validators/serviceSchema.ts` | **CRIAR** | serviceSchema |
| `src/lib/validators/professionalSchema.ts` | **CRIAR** | professionalSchema |
| `src/lib/validators/appointmentSchema.ts` | **CRIAR** | appointmentSchema (com múltiplos serviços) |
| `src/lib/validators/bookingSchema.ts` | **CRIAR** | publicBookingSchema |

### 4.5 Componentes

#### 4.5.1 Layout e Navegação

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/layout/Sidebar.tsx` | **CRIAR** | Navegação lateral com links |
| `src/components/layout/Header.tsx` | **CRIAR** | Header com user menu |
| `src/components/layout/MainLayout.tsx` | **CRIAR** | Layout principal com sidebar |
| `src/components/layout/PublicLayout.tsx` | **CRIAR** | Layout para página pública |

#### 4.5.2 Agenda (Appointments)

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/appointment/DayCalendar.tsx` | **CRIAR** | Visualização diária |
| `src/components/appointment/WeekCalendar.tsx` | **CRIAR** | Visualização semanal |
| `src/components/appointment/AppointmentCard.tsx` | **CRIAR** | Card de agendamento na agenda |
| `src/components/appointment/AppointmentFormDialog.tsx` | **CRIAR** | Dialog criar/editar (múltiplos serviços) |
| `src/components/appointment/AppointmentDetailsDialog.tsx` | **CRIAR** | Dialog visualizar detalhes |
| `src/components/appointment/StatusBadge.tsx` | **CRIAR** | Badge de status colorido |
| `src/components/appointment/ProfessionalFilter.tsx` | **CRIAR** | Filtro por profissional |
| `src/components/appointment/PhotoUpload.tsx` | **CRIAR** | Upload de fotos |
| `src/components/appointment/PhotoGallery.tsx` | **CRIAR** | Galeria de fotos |

#### 4.5.3 Clientes

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/client/ClientList.tsx` | **CRIAR** | Lista com busca |
| `src/components/client/ClientFormDialog.tsx` | **CRIAR** | Dialog criar/editar |
| `src/components/client/ClientDetailsDialog.tsx` | **CRIAR** | Dialog com histórico |
| `src/components/client/ClientSearchInput.tsx` | **CRIAR** | Input de busca |

#### 4.5.4 Serviços

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/service/ServiceList.tsx` | **CRIAR** | Lista de serviços |
| `src/components/service/ServiceFormDialog.tsx` | **CRIAR** | Dialog criar/editar |
| `src/components/service/ServiceCard.tsx` | **CRIAR** | Card de serviço |

#### 4.5.5 Profissionais

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/professional/ProfessionalList.tsx` | **CRIAR** | Lista de profissionais |
| `src/components/professional/ProfessionalFormDialog.tsx` | **CRIAR** | Dialog criar/editar |
| `src/components/professional/ProfessionalCard.tsx` | **CRIAR** | Card de profissional |
| `src/components/professional/ProfessionalSelector.tsx` | **CRIAR** | Selector inline |

#### 4.5.6 Página Pública de Booking

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/booking/BookingProgress.tsx` | **CRIAR** | Steps do wizard |
| `src/components/booking/ProfessionalSelector.tsx` | **CRIAR** | Seleção de profissional |
| `src/components/booking/DateTimeSelector.tsx` | **CRIAR** | Calendário + horários |
| `src/components/booking/ClientInfoForm.tsx` | **CRIAR** | Form nome + telefone |
| `src/components/booking/BookingConfirmation.tsx` | **CRIAR** | Confirmação final |
| `src/components/booking/BookingSuccess.tsx` | **CRIAR** | Tela de sucesso |

#### 4.5.7 Componentes Compartilhados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/common/ServiceSelector.tsx` | **CRIAR** | Selector de múltiplos serviços (usado em booking E appointment) |

#### 4.5.8 UI Extras

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/ui/select.tsx` | **CRIAR** | shadcn/ui Select |
| `src/components/ui/calendar.tsx` | **CRIAR** | shadcn/ui Calendar |
| `src/components/ui/avatar.tsx` | **CRIAR** | shadcn/ui Avatar |
| `src/components/ui/badge.tsx` | **CRIAR** | shadcn/ui Badge |
| `src/components/ui/tabs.tsx` | **CRIAR** | shadcn/ui Tabs |
| `src/components/ui/skeleton.tsx` | **CRIAR** | shadcn/ui Skeleton |
| `src/components/ui/dropdown-menu.tsx` | **CRIAR** | shadcn/ui DropdownMenu |

### 4.6 Páginas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/Dashboard.tsx` | ALTERAR | Métricas reais |
| `src/pages/Bookings.tsx` | **CRIAR** | Página da agenda |
| `src/pages/Clients.tsx` | **CRIAR** | Página de clientes |
| `src/pages/Services.tsx` | **CRIAR** | Página de serviços |
| `src/pages/Professionals.tsx` | **CRIAR** | Página de profissionais |
| `src/pages/Settings.tsx` | **CRIAR** | Configurações da loja |
| `src/pages/public/PublicBooking.tsx` | **CRIAR** | Página pública /{slug} |
| `src/pages/auth/Login.tsx` | **CRIAR** | Página de login |
| `src/pages/auth/Register.tsx` | **CRIAR** | Página de cadastro |

### 4.7 Rotas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/App.tsx` | ALTERAR | Adicionar react-router-dom com rotas |

### 4.8 Configurações

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/config/business.ts` | ALTERAR | Adicionar configs de disponibilidade |
| `src/lib/config/storage.ts` | **CRIAR** | Configs do Supabase Storage |

---

## 5. O Que Muda em Cada Arquivo (Detalhe)

### 5.1 Types

#### `src/types/user.ts` (CRIAR)
```typescript
// UserProfile - perfil do usuário autenticado
// TenantUser - relação usuário<->loja com role
// UserRole = 'owner' | 'admin' | 'staff'
```

#### `src/types/tenant.ts` (ALTERAR)
- Expandir `business_hours` para estrutura por dia da semana com arrays de intervalos
- Adicionar `settings: { max_photos_per_appointment, booking_slot_duration, allow_multiple_same_service }`
- Manter compatibilidade com tipo existente

```typescript
interface BusinessHours {
  monday: TimeRange[];
  tuesday: TimeRange[];
  // ... etc
}
interface TimeRange { start: string; end: string; }
```

#### `src/types/appointment.ts` (ALTERAR)
- Remover `service_id` (agora é N:N via appointment_services)
- Adicionar `total_duration: number` (soma das durações)
- Adicionar `total_price: number` (soma dos preços)
- REMOVIDO: `created_by` — usar `appointment_events` para auditoria completa

#### `src/types/appointmentService.ts` (CRIAR)
```typescript
// AppointmentService - relação N:N appointment <-> services
// service_name_at_booking - nome congelado (histórico preservado se renomear)
// price_at_booking - preço congelado no momento do booking
// duration_at_booking - duração congelada
// order_index - ordem dos serviços
// SEM UNIQUE - permite mesmo serviço múltiplas vezes
```

#### `src/types/photo.ts` (CRIAR)
```typescript
// AppointmentPhoto - id, appointment_id, url, caption, created_at
```

#### `src/types/booking.ts` (CRIAR)
```typescript
// PublicBookingInput - para página pública (array de service_ids)
// TimeSlot - { time: string, available: boolean }
// BookingStep = 'services' | 'professional' | 'datetime' | 'info' | 'confirm'
// SelectedService - { service: Service, order: number }
```

#### `src/types/event.ts` (CRIAR)
```typescript
// AppointmentEvent - eventos para notificações futuras
// EventType = 'created' | 'updated' | 'cancelled' | 'status_changed'
// ActorType = 'staff' | 'client' | 'system'
```

### 5.2 Lógica de Disponibilidade (Múltiplos Serviços)

```typescript
// src/lib/services/availabilityService.ts

// Algoritmo SIMPLIFICADO para MVP:
// 1. Receber: professional_id, date, array de service_ids
// 2. Calcular duração total = soma das durações
// 3. Determinar horário de trabalho do dia:
//    a) Verificar se existe schedule_override cobrindo a data
//       - Se override_type='unavailable' → retornar slots vazios
//       - Se override_type='available' → usar horário do override
//    b) Se não existe override → usar business_hours do tenant para o dia da semana
// 4. Gerar slots possíveis considerando duração total
// 5. Buscar appointments existentes do profissional na data
// 6. Para cada slot:
//    - Verificar se slot + duração total não conflita com nenhum appointment
//    - Verificar se não ultrapassa horário de fechamento
// 7. Retornar slots com flag available: boolean

// NOTA: Horário semanal individual por profissional (professional_schedules)
// será adicionado pós-MVP quando necessário.

// Exemplo: Férias (2 semanas)
// - Override: { start: '2026-02-15', end: '2026-02-28', type: 'unavailable', reason: 'vacation' }
// - Qualquer data nesse range → slots vazios

// Exemplo: Sábado especial (1 dia)
// - Loja fechada no sábado (business_hours.saturday = [])
// - Override: { start: '2026-02-07', end: '2026-02-07', type: 'available', start_time: '10:00', end_time: '16:00' }
// - Sistema gera slots de 10:00 às 16:00 para esse sábado específico

// Exemplo: Folga pontual (1 dia)
// - Override: { start: '2026-02-09', end: '2026-02-09', type: 'unavailable', reason: 'personal' }
// - Sistema não gera slots para esse dia
```

### 5.3 Upload de Fotos

```typescript
// src/lib/services/photoService.ts

// upload(appointmentId, file):
// 1. Validar: tipo (image/*), tamanho (max 5MB)
// 2. Gerar path: {tenant_id}/{appointment_id}/{uuid}.{ext}
// 3. Upload para Supabase Storage bucket "appointment-photos"
// 4. Inserir registro em appointment_photos
// 5. Retornar URL pública

// Limit: 3 fotos por appointment (validar antes do upload)
```

### 5.4 Sistema de Eventos (Preparação para Notificações)

```typescript
// Eventos são APENAS salvos na tabela appointment_events
// NÃO usamos event emitter local - isso seria complexidade desnecessária

// Toda ação em appointments insere registro:
// - Criar: INSERT INTO appointment_events (type: 'created', actor_type, actor_id, payload)
// - Editar: INSERT INTO appointment_events (type: 'updated', payload: {changes})
// - Cancelar: INSERT INTO appointment_events (type: 'cancelled')
// - Status: INSERT INTO appointment_events (type: 'status_changed', payload: {from, to})

// MVP: eventos são apenas registrados no banco
// Pós-MVP: Supabase Edge Function ou cron processa eventos onde notified=false

// Vantagens:
// - Auditoria completa de quem fez o quê
// - Retry automático de notificações falhas
// - Sem complexidade de event bus no frontend
// - Histórico persistente
```

---

## 6. Chaves de i18n a Adicionar

### pt.ts e en.ts (MESMAS CHAVES, MESMA ORDEM)

```typescript
// === Booking (página pública) ===
bookingTitle: 'Agendar Horário' / 'Book Appointment',
bookingSubtitle: 'Escolha os serviços desejados' / 'Choose the desired services',
selectServices: 'Selecione os serviços' / 'Select services',
selectedServices: 'Serviços selecionados' / 'Selected services',
totalDuration: 'Duração total' / 'Total duration',
totalPrice: 'Valor total' / 'Total price',
selectProfessional: 'Selecione o profissional' / 'Select professional',
selectDateTime: 'Escolha data e horário' / 'Choose date and time',
yourInfo: 'Suas informações' / 'Your information',
confirmBooking: 'Confirmar agendamento' / 'Confirm booking',
bookingSuccess: 'Agendamento confirmado!' / 'Booking confirmed!',
bookingSuccessMessage: 'Você receberá uma confirmação em breve.' / 'You will receive a confirmation soon.',
addMoreServices: 'Adicionar mais serviços' / 'Add more services',
removeService: 'Remover serviço' / 'Remove service',

// === Availability ===
noAvailableSlots: 'Nenhum horário disponível' / 'No available slots',
availableSlots: 'Horários disponíveis' / 'Available slots',
selectSlot: 'Selecione um horário' / 'Select a time slot',

// === Photos ===
addPhoto: 'Adicionar foto' / 'Add photo',
photos: 'Fotos' / 'Photos',
maxPhotos: 'Máximo de 3 fotos' / 'Maximum 3 photos',
uploadPhoto: 'Enviar foto' / 'Upload photo',
deletePhoto: 'Excluir foto' / 'Delete photo',

// === Calendar ===
today: 'Hoje' / 'Today',
dayView: 'Dia' / 'Day',
weekView: 'Semana' / 'Week',
noAppointments: 'Nenhum agendamento' / 'No appointments',

// === Layout ===
menu: 'Menu' / 'Menu',
myAccount: 'Minha conta' / 'My account',
notifications: 'Notificações' / 'Notifications',

// === Errors ===
errorConflict: 'Horário já ocupado' / 'Time slot already booked',
errorNoSlots: 'Não há horários disponíveis' / 'No available time slots',
errorUpload: 'Erro ao enviar foto' / 'Error uploading photo',
storeNotFound: 'Loja não encontrada' / 'Store not found',

// === Validation ===
requiredField: 'Campo obrigatório' / 'Required field',
invalidPhone: 'Telefone inválido' / 'Invalid phone number',
invalidEmail: 'Email inválido' / 'Invalid email',
nameTooShort: 'Nome muito curto' / 'Name too short',

// === Settings ===
storeSettings: 'Configurações da Loja' / 'Store Settings',
businessHours: 'Horário de funcionamento' / 'Business Hours',
storeInfo: 'Informações da loja' / 'Store information',

// === Schedule Overrides (unificado: folgas, férias, dias especiais) ===
scheduleOverride: 'Exceção de horário' / 'Schedule override',
scheduleOverrides: 'Exceções de horário' / 'Schedule overrides',
addOverride: 'Adicionar exceção' / 'Add override',
editOverride: 'Editar exceção' / 'Edit override',
removeOverride: 'Remover exceção' / 'Remove override',
overrideType: 'Tipo' / 'Type',
workOnThisDay: 'Trabalhar neste período' / 'Work on this period',
dayOff: 'Folga/Ausência' / 'Day off/Absence',
overrideReason: 'Motivo' / 'Reason',
reasonVacation: 'Férias' / 'Vacation',
reasonSickLeave: 'Atestado médico' / 'Sick leave',
reasonPersonal: 'Motivo pessoal' / 'Personal reason',
reasonSpecialEvent: 'Evento especial' / 'Special event',
reasonClientRequest: 'Pedido de cliente' / 'Client request',
startDate: 'Data inicial' / 'Start date',
endDate: 'Data final' / 'End date',
singleDay: 'Apenas um dia' / 'Single day',
dateRange: 'Período' / 'Date range',
```

---

## 7. Testes a Criar

> ⚠️ **REGRA:** Testes são cidadãos de primeira classe. Todo código novo DEVE ter teste correspondente.
> Cobertura mínima: **100%** em novos arquivos.

### 7.1 Validators (Testes Agressivos)

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/lib/validators/clientSchema.test.ts` | 100% | Nome curto, telefone inválido, email malformado, XSS em notes |
| `src/lib/validators/serviceSchema.test.ts` | 100% | Preço negativo, duração zero, nome vazio |
| `src/lib/validators/appointmentSchema.test.ts` | 100% | Array vazio de serviços, datas inválidas, conflito de horário |
| `src/lib/validators/bookingSchema.test.ts` | 100% | Fluxo público completo, dados incompletos |

### 7.2 Services (Lógica de Negócio)

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/lib/services/availabilityService.test.ts` | 100% | Múltiplos serviços, conflitos, limite de horário, dia cheio, overrides |
| `src/lib/services/photoService.test.ts` | 100% | Tipo inválido, tamanho > max, limite configurável de fotos |
| `src/lib/services/appointmentService.test.ts` | 100% | CRUD, conflitos, cálculo de totais, inserção de eventos |

### 7.3 Hooks (com mocks de Supabase)

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/hooks/useClients.test.ts` | 100% | CRUD, busca, cache invalidation |
| `src/hooks/useAppointments.test.ts` | 100% | Filtros, múltiplos serviços, eventos disparados |
| `src/hooks/useAvailability.test.ts` | 100% | Slots corretos, edge cases |

### 7.4 Componentes (RTL + vitest)

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/components/appointment/StatusBadge.test.tsx` | 100% | Cores e labels corretos para cada status |
| `src/components/common/ServiceSelector.test.tsx` | 100% | Add/remove serviços, mesmo serviço 2x, cálculo de totais |
| `src/components/booking/BookingProgress.test.tsx` | 100% | Steps, navegação, estados |
| `src/components/client/ClientSearchInput.test.tsx` | 100% | Debounce, resultados, empty state |

### 7.5 Integração (E2E preparação)

| Cenário | Descrição |
|---------|-----------|
| Booking público completo | Serviços → Profissional → Data → Info → Confirmar |
| Conflito de horário | Tentar agendar horário já ocupado |
| Múltiplos serviços | Booking com 3 serviços, verificar duração total |

---

## 8. Critérios de Conclusão

### 8.1 Funcionalidades

- [ ] **Auth:** Login e registro funcionando
- [ ] **Dashboard:** Mostra métricas reais (agendamentos hoje, clientes, etc.)
- [ ] **Agenda:** Day view e week view com appointments
- [ ] **Agenda:** Criar, editar, cancelar appointments (com múltiplos serviços)
- [ ] **Agenda:** Filtro por profissional
- [ ] **Agenda:** Prevenção de conflito de horário
- [ ] **Agenda:** Profissional pode editar/excluir bookings
- [ ] **Clientes:** CRUD completo com busca
- [ ] **Clientes:** Histórico de appointments visível
- [ ] **Serviços:** CRUD completo
- [ ] **Profissionais:** CRUD completo
- [ ] **Profissionais:** Associação com serviços
- [ ] **Fotos:** Upload de 1-3 fotos por appointment
- [ ] **Fotos:** Visualização em galeria
- [ ] **Booking:** Página pública acessível via /{slug}
- [ ] **Booking:** Seleção de múltiplos serviços com soma de tempo/preço
- [ ] **Booking:** Fluxo: serviços → profissional → data/hora → info → confirmar
- [ ] **Booking:** Cria client (se não existir) e appointment
- [ ] **Eventos:** Toda ação registra evento no banco (preparação para notificações)
- [ ] **Multi-tenant:** Dados isolados por tenant_id
- [ ] **Soft delete:** Clientes usam deleted_at (histórico preservado)

### 8.2 Qualidade de Código

> ⚠️ **Estas regras são inegociáveis. Código que não passa não é mergeado.**

- [ ] `npx tsc --noEmit` — zero erros de TypeScript
- [ ] `npm run test:run` — **100% dos testes passam**
- [ ] `npm run lint` — **zero warnings** (não apenas zero errors)
- [ ] `npm run build` — build sem erros
- [ ] `npm run test:coverage` — **≥ 80% cobertura global, 100% em novos arquivos**
- [ ] Todas as chaves i18n em pt.ts E en.ts (mesma ordem)
- [ ] **Zero `any`** no código (usar `unknown` ou tipo específico)
- [ ] **Zero `console.*`** (usar `logger.*`)
- [ ] **Zero cores hardcoded** (usar tokens do tema)
- [ ] Acessibilidade: `aria-label` em todos os botões de ícone
- [ ] Cada componente em seu próprio arquivo
- [ ] Named exports (`export const`, nunca `export default`)

### 8.3 Performance

- [ ] Lazy loading nas rotas
- [ ] TanStack Query com cache apropriado
- [ ] Imagens otimizadas (max 5MB, resize no upload)

---

## 9. Fases de Implementação Sugeridas

> Cada fase deve terminar com: `tsc ✓ test ✓ lint ✓ build ✓`
> 
> ⚠️ **UI/UX Modern Vibrant:** Ver [plan-uiux-modern-vibrant.md](./plan-uiux-modern-vibrant.md) para detalhes de implementação visual.

### 9.0 Etapa de Refatoração (OBRIGATÓRIA após cada Fase)

Após implementar cada fase e validar com `tsc ✓ test ✓ lint ✓ build ✓`, **ANTES de avançar para a próxima fase**, execute uma análise de refatoração:

#### Checklist de Refatoração

1. **Duplicação de código**
   - [ ] Existem blocos de código repetidos que podem virar funções/componentes?
   - [ ] Existem padrões repetidos que podem virar hooks customizados?

2. **Organização de arquivos**
   - [ ] Arquivos grandes demais (>200 linhas) que podem ser divididos?
   - [ ] Componentes com responsabilidades múltiplas?
   - [ ] Exports faltando nos arquivos index.ts?

3. **Tipagem**
   - [ ] Types podem ser mais específicos ou reutilizados?
   - [ ] Existem `as` casts que podem ser evitados?

4. **Legibilidade**
   - [ ] Nomes de variáveis/funções são descritivos?
   - [ ] Funções longas podem ser quebradas em funções menores?
   - [ ] Comentários são necessários ou o código pode ser mais claro?

5. **Performance**
   - [ ] `useMemo`/`useCallback` estão sendo usados onde necessário?
   - [ ] Componentes podem ser otimizados com `React.memo`?

6. **Consistência**
   - [ ] Padrões de código estão consistentes entre arquivos?
   - [ ] Estilos (Tailwind classes) seguem o padrão do projeto?

#### Processo

```
1. Revisar código implementado na fase
2. Identificar oportunidades de melhoria
3. Aplicar refatorações (sem mudar comportamento)
4. Revalidar: tsc ✓ test ✓ lint ✓ build ✓
5. Documentar refatorações significativas (opcional)
6. Avançar para próxima fase
```

> 💡 **Regra de ouro:** Refatoração não muda comportamento externo, apenas melhora a estrutura interna.

---

### Fase 1: Infraestrutura + UI/UX Base (Prioridade: CRÍTICA)
1. Schema SQL no Supabase (todas as tabelas)
2. RLS policies completas
3. Types atualizados
4. Validators com testes
5. React Router setup
6. Layout components
7. **UI/UX Modern Vibrant:**
   - `npm install framer-motion`
   - Atualizar `index.css` com novas variáveis CSS (glassmorphism, gradientes)
   - Atualizar `tailwind.config.ts` com cores extras
   - Criar `src/lib/motion.ts` (variants Framer Motion)
   - Criar componentes: `MotionDiv`, `MotionList`, `GlassCard`, `EmptyState`, `Skeleton`
   - Atualizar `Button` com gradiente + motion

**Entregável:** Estrutura pronta + Design System moderno, zero funcionalidade visível, 100% testado

### Fase 2: CRUD Principal (Prioridade: ALTA)
1. Clientes (CRUD + busca + testes)
2. Serviços (CRUD + testes)
3. Profissionais (CRUD + associação serviços + testes)

**Entregável:** 3 páginas funcionais com CRUD completo

### Fase 3: Agenda (Prioridade: ALTA)
1. Day view
2. Week view
3. Criar/editar appointment (múltiplos serviços)
4. Filtro por profissional
5. Validação de conflito
6. Eventos disparados em cada ação

**Entregável:** Agenda funcional com prevenção de conflitos

### Fase 4: Fotos (Prioridade: MÉDIA)
1. Supabase Storage bucket
2. Upload component com validação
3. Gallery component
4. Testes de limite e tipos

**Entregável:** Upload funcional com galeria

### Fase 5: Página Pública (Prioridade: ALTA)
1. Rota /{slug}
2. Wizard de booking (múltiplos serviços)
3. Disponibilidade service (soma de durações)
4. Criação de client + appointment
5. Testes E2E do fluxo

**Entregável:** Booking público funcional

### Fase 6: Polish (Prioridade: MÉDIA)
1. Dashboard com métricas reais
2. Settings da loja
3. Testes de integração
4. Revisão de acessibilidade

**Entregável:** MVP completo e polido

---

## 10. Dependências NPM a Adicionar

```bash
# Routing
npm install react-router-dom

# Data fetching & cache
npm install @tanstack/react-query

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Date handling
npm install date-fns

# Animations (UI/UX Modern Vibrant)
npm install framer-motion

# UI extras (shadcn/ui - instalar via CLI)
npx shadcn@latest add select calendar avatar badge tabs skeleton dropdown-menu
```

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| RLS mal configurado | Vazamento de dados | Testar com múltiplos tenants antes de deploy |
| Conflito de horário não detectado | Double booking | Validação no service + constraint no banco + teste agressivo |
| Upload de fotos grandes | Lentidão | Limite de 5MB + resize client-side |
| Slug duplicado | Erro ao criar loja | Constraint UNIQUE + validação no form |
| Múltiplos serviços = cálculo errado | Tempo/preço incorreto | Testes com edge cases (0 serviços, 10 serviços) |
| Eventos perdidos | Notificações não enviadas (futuro) | Persistir em tabela antes de processar |
| Código sem testes | Regressões | Regra: PR sem teste = PR rejeitado |

---

## 12. Princípios de Desenvolvimento

> Estes princípios guiam TODA decisão de implementação.

### 12.1 Código Limpo

```
✅ Legibilidade > Brevidade
✅ Explícito > Implícito  
✅ Composição > Herança
✅ Imutabilidade > Mutação
✅ Funções puras > Efeitos colaterais
```

### 12.2 Testes Fortes

```
✅ Testes revelam bugs, não se adaptam a eles
✅ Teste o comportamento, não a implementação
✅ Edge cases são obrigatórios, não opcionais
✅ 100% cobertura em código novo
✅ Teste falhou? Investigue o código PRIMEIRO
```

### 12.3 Escalabilidade

```
✅ Multi-tenant desde o dia 1
✅ Eventos preparados para notificações
✅ Horário flexível (estrutura pronta para expansão)
✅ Múltiplos serviços desde o MVP
✅ Internacionalização completa (pt/en)
```

### 12.4 UI/UX — Simplicidade Acima de Tudo

> **Mantra:** Se precisa de tutorial, está errado.

```
✅ Simplicidade > Funcionalidades
✅ Óbvio > Inteligente
✅ Menos cliques > Mais opções
✅ Mobile-first > Desktop-first
✅ Consistência > Criatividade
```

#### Princípios de Interface

| Princípio | Aplicação |
|-----------|-----------|
| **1 ação principal por tela** | Botão primário destacado, resto secundário |
| **Hierarquia visual clara** | Títulos grandes, ações óbvias, espaço generoso |
| **Feedback imediato** | Loading states, toasts, animações sutis |
| **Zero jargão técnico** | "Agendar" não "Criar appointment" |
| **Ações destrutivas protegidas** | Confirmação apenas para delete, não para tudo |

#### Padrões Visuais

```
✅ Cores: máximo 3 (primary, muted, destructive)
✅ Tipografia: 2 tamanhos principais (título, corpo)
✅ Espaçamento: generoso (respira!)
✅ Bordas: sutis (border-border, não preto)
✅ Sombras: mínimas (cards elevados apenas quando necessário)
✅ Ícones: apenas quando agregam (não decorativos)
```

#### Mobile-First

```
✅ Touch targets: mínimo 44x44px
✅ Thumb-friendly: ações principais na parte inferior
✅ Swipe gestures: onde fizer sentido (ex: cards de agenda)
✅ Teclado numérico: para telefone e preço
✅ Formulários curtos: máximo 4-5 campos visíveis
```

#### Fluxo de Booking Público (Exemplo de Simplicidade)

```
┌─────────────────────────────────────────┐
│  Passo 1: O que você quer fazer?        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Corte   │ │ Barba   │ │ Combo   │    │  ← Cards grandes, tap-friendly
│  │  R$50   │ │  R$30   │ │  R$70   │    │
│  │  30min  │ │  20min  │ │  45min  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│  [Continuar →]                          │  ← 1 botão óbvio
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Passo 2: Com quem?                     │
│  ┌─────────────────────────────────┐    │
│  │ 👤 João  │  Disponível hoje     │    │  ← Avatar + disponibilidade
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 👤 Maria │  Próximo: Quinta     │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Passo 3: Quando?                       │
│  ┌───┬───┬───┬───┬───┬───┬───┐          │
│  │ D │ S │ T │ Q │ Q │ S │ S │          │  ← Calendário compacto
│  └───┴───┴───┴───┴───┴───┴───┘          │
│                                         │
│  Horários disponíveis:                  │
│  [09:00] [09:30] [10:00] [10:30]        │  ← Chips selecionáveis
│  [14:00] [14:30] [15:00]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Passo 4: Seus dados                    │
│  ┌─────────────────────────────────┐    │
│  │ Nome                            │    │  ← Apenas 2 campos!
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ WhatsApp (para confirmarmos)    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Confirmar Agendamento]                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           ✓ Agendado!                   │
│                                         │
│  Corte com João                         │
│  Quinta, 6 de fev às 10:00              │
│                                         │
│  Você receberá uma confirmação          │
│  no WhatsApp (11) 99999-9999            │
│                                         │
│  [Adicionar ao Calendário]              │  ← Opcional, não obrigatório
└─────────────────────────────────────────┘
```

#### Anti-Padrões (NUNCA fazer)

```
❌ Modais em cima de modais
❌ Formulários longos sem divisão
❌ Botões do mesmo tamanho/cor para ações diferentes
❌ Mensagens de erro genéricas ("Erro ao salvar")
❌ Loading sem feedback visual
❌ Scroll horizontal em mobile
❌ Campos obrigatórios sem indicação
❌ Ações importantes escondidas em menus
❌ Confirmação para toda ação (só para destrutivas)
❌ Texto pequeno demais (mínimo 14px mobile)
```

---

## 13. Próximos Passos

1. ~~Revisar este plano~~ ✅ APROVADO
2. **Criar schema SQL** — Executar no Supabase
3. **Iniciar Fase 1** — Infraestrutura base
4. **Iterar** — Uma fase por vez, validando com `tsc ✓ test ✓ lint ✓ build ✓`
