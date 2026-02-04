# 📋 Plano de Implementação — Autenticação e Controle de Usuários

> **Papel:** [Planejador]  
> **Data:** 03/02/2026  
> **Status:** 🟡 AGUARDANDO REVISÃO
> **Pré-requisito:** Script SQL do Supabase já executado ✅

---

## 1. Objetivo da Mudança

Implementar o sistema completo de autenticação e controle de usuários para o Plenna Vip, permitindo:

1. **Login e Registro** — Autenticação via email/senha com Supabase Auth
2. **Proteção de Rotas** — Rotas privadas acessíveis apenas para usuários autenticados
3. **Perfil de Usuário** — CRUD de `user_profiles` (nome, telefone, avatar)
4. **Gestão de Staff** — CRUD de `tenant_users` (owner/admin/staff)
5. **Integração Auth ↔ Tenant** — Carregamento automático do tenant após login
6. **Controle de Permissões** — Ações limitadas por role (owner > admin > staff)

---

## 2. Análise do Estado Atual

### 2.1 O que já existe

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/contexts/AuthContext.tsx` | ✅ Completo | Contexto com `signIn`, `signUp`, `signOut` |
| `src/contexts/AuthContext.test.tsx` | ✅ Completo | Testes do contexto |
| `src/types/user.ts` | ✅ Completo | `UserProfile`, `TenantUser`, `UserRole` |
| `src/pages/auth/Login.tsx` | ⚠️ UI apenas | Formulário sem integração |
| `src/pages/auth/Register.tsx` | ⚠️ UI apenas | Formulário sem integração |
| `src/lib/supabase.ts` | ✅ Completo | Cliente Supabase configurado |

### 2.2 O que falta implementar

| Categoria | Item | Prioridade |
|-----------|------|------------|
| **Páginas** | Integrar Login.tsx com AuthContext | CRÍTICA |
| **Páginas** | Integrar Register.tsx com AuthContext | CRÍTICA |
| **Rotas** | ProtectedRoute component | CRÍTICA |
| **Rotas** | Redirecionamento não autenticado → /login | CRÍTICA |
| **Services** | userProfileService (CRUD user_profiles) | ALTA |
| **Services** | tenantUserService (CRUD tenant_users) | ALTA |
| **Hooks** | useUserProfile | ALTA |
| **Hooks** | useTenantUsers | ALTA |
| **Componentes** | UserMenu (dropdown com logout) | ALTA |
| **Contexto** | TenantContext integração com Auth | ALTA |
| **Validators** | authSchema (login, register) | MÉDIA |
| **Componentes** | UserProfileFormDialog | MÉDIA |
| **Componentes** | TeamMemberList (gestão de staff) | MÉDIA |
| **Componentes** | TeamMemberFormDialog | MÉDIA |
| **Páginas** | Team.tsx (página de equipe) | MÉDIA |

### 2.3 Banco de Dados (já executado ✅)

```sql
-- Tabelas relevantes (já criadas):
-- ✅ user_profiles (id, name, phone, avatar_url)
-- ✅ tenant_users (id, tenant_id, user_id, role)
-- ✅ tenants (id, name, slug, owner_id, ...)

-- Triggers (já criados):
-- ✅ handle_new_user() — cria user_profile automaticamente
-- ✅ create_owner_tenant_user() — cria tenant_user (owner) quando tenant é criado

-- RLS (já configurado):
-- ✅ user_profiles: usuário vê apenas seu próprio perfil
-- ✅ tenant_users: staff vê membros do próprio tenant
-- ✅ Funções auxiliares: is_tenant_staff(), is_tenant_admin(), is_tenant_owner()
```

---

## 3. Arquivos a Criar/Alterar

### 3.1 Services

| Arquivo | Ação | Funções |
|---------|------|---------|
| `src/lib/services/userProfileService.ts` | **CRIAR** | `getById`, `update` |
| `src/lib/services/tenantUserService.ts` | **CRIAR** | `getByTenant`, `create`, `update`, `delete`, `getUserTenants` |
| `src/lib/services/index.ts` | ALTERAR | Exportar novos services |

### 3.2 Hooks

| Arquivo | Ação | Exports |
|---------|------|---------|
| `src/hooks/useUserProfile.ts` | **CRIAR** | `useUserProfile`, `useUpdateUserProfile` |
| `src/hooks/useTenantUsers.ts` | **CRIAR** | `useTenantUsers`, `useCreateTenantUser`, `useUpdateTenantUser`, `useDeleteTenantUser` |
| `src/hooks/useUserTenants.ts` | **CRIAR** | `useUserTenants` (lista tenants do usuário) |
| `src/hooks/index.ts` | ALTERAR | Exportar novos hooks |

### 3.3 Validators

| Arquivo | Ação | Schemas |
|---------|------|---------|
| `src/lib/validators/authSchema.ts` | **CRIAR** | `loginSchema`, `registerSchema` |
| `src/lib/validators/userProfileSchema.ts` | **CRIAR** | `userProfileUpdateSchema` |
| `src/lib/validators/tenantUserSchema.ts` | **CRIAR** | `tenantUserCreateSchema`, `tenantUserUpdateSchema` |

### 3.4 Componentes

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/components/auth/ProtectedRoute.tsx` | **CRIAR** | Wrapper para rotas protegidas |
| `src/components/auth/UserMenu.tsx` | **CRIAR** | Dropdown com perfil e logout |
| `src/components/auth/RoleGuard.tsx` | **CRIAR** | Renderiza children se user tem role mínimo |
| `src/components/user/UserProfileFormDialog.tsx` | **CRIAR** | Dialog para editar perfil |
| `src/components/team/TeamMemberList.tsx` | **CRIAR** | Lista de membros do tenant |
| `src/components/team/TeamMemberCard.tsx` | **CRIAR** | Card de membro |
| `src/components/team/TeamMemberFormDialog.tsx` | **CRIAR** | Dialog para adicionar/editar membro |
| `src/components/team/InviteMemberDialog.tsx` | **CRIAR** | Dialog para convidar por email |
| `src/components/layout/Header.tsx` | ALTERAR | Adicionar UserMenu |

### 3.5 Páginas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/auth/Login.tsx` | ALTERAR | Integrar com AuthContext + validação |
| `src/pages/auth/Register.tsx` | ALTERAR | Integrar com AuthContext + validação |
| `src/pages/Team.tsx` | **CRIAR** | Página de gestão de equipe |

### 3.6 Contextos

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/contexts/TenantContext.tsx` | ALTERAR | Integrar com Auth, carregar tenant real |

### 3.7 Rotas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/App.tsx` | ALTERAR | Usar ProtectedRoute, adicionar rota /team |

---

## 4. O Que Muda em Cada Arquivo (Detalhe)

### 4.1 Services

#### `src/lib/services/userProfileService.ts` (CRIAR)

```typescript
// Operações no user_profile do usuário logado
// - getById(userId): busca perfil pelo ID
// - update(userId, data): atualiza nome, telefone, avatar
// 
// Nota: user_profile é criado automaticamente pelo trigger handle_new_user()
// quando o usuário se registra no Supabase Auth
```

**Funções:**
- `getById(userId: string)` — Retorna `UserProfile | null`
- `update(userId: string, data: UserProfileUpdate)` — Retorna `UserProfile`

#### `src/lib/services/tenantUserService.ts` (CRIAR)

```typescript
// Gestão de membros do tenant (staff)
// - getByTenant(tenantId): lista todos os membros com perfil
// - create(data): adiciona novo membro (convite)
// - update(id, data): altera role
// - delete(id): remove membro
// - getUserTenants(userId): lista tenants que o usuário tem acesso
```

**Funções:**
- `getByTenant(tenantId: string)` — Retorna `TenantUserWithProfile[]`
- `create(data: TenantUserCreate)` — Retorna `TenantUser`
- `update(id: string, data: TenantUserUpdate)` — Retorna `TenantUser`
- `delete(id: string)` — Retorna `void`
- `getUserTenants(userId: string)` — Retorna `Tenant[]` (para seletor de tenant)

### 4.2 Hooks

#### `src/hooks/useUserProfile.ts` (CRIAR)

```typescript
// Hook para gerenciar perfil do usuário logado
// - useUserProfile(): query do perfil atual
// - useUpdateUserProfile(): mutation para atualizar

// Query key: ['user-profile', userId]
// Depende de auth.uid() do AuthContext
```

#### `src/hooks/useTenantUsers.ts` (CRIAR)

```typescript
// Hook para gerenciar membros do tenant
// - useTenantUsers(tenantId): lista membros
// - useCreateTenantUser(): adiciona membro
// - useUpdateTenantUser(): altera role
// - useDeleteTenantUser(): remove membro

// Query key: ['tenant-users', tenantId]
// Invalidação automática após mutations
```

#### `src/hooks/useUserTenants.ts` (CRIAR)

```typescript
// Hook para listar tenants do usuário
// - useUserTenants(): lista tenants que o usuário tem acesso
// 
// Usado para:
// - Seletor de tenant (se usuário tiver múltiplos)
// - Redirecionamento após login
```

### 4.3 Validators

#### `src/lib/validators/authSchema.ts` (CRIAR)

```typescript
// Validação de formulários de autenticação

const loginSchema = z.object({
  email: z.string().email('invalidEmail'),
  password: z.string().min(6, 'passwordTooShort'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'nameTooShort').max(100),
  email: z.string().email('invalidEmail'),
  password: z.string().min(6, 'passwordTooShort'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDoNotMatch',
  path: ['confirmPassword'],
});
```

#### `src/lib/validators/userProfileSchema.ts` (CRIAR)

```typescript
const userProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\d{10,11}$/).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});
```

#### `src/lib/validators/tenantUserSchema.ts` (CRIAR)

```typescript
const tenantUserCreateSchema = z.object({
  tenant_id: z.string().uuid(),
  email: z.string().email(), // Para buscar/convidar usuário
  role: z.enum(['admin', 'staff']), // Não pode criar owner via UI
});

const tenantUserUpdateSchema = z.object({
  role: z.enum(['admin', 'staff']), // Owner não pode ser alterado
});
```

### 4.4 Componentes

#### `src/components/auth/ProtectedRoute.tsx` (CRIAR)

```typescript
// Wrapper para rotas que requerem autenticação
// 
// Comportamento:
// 1. Se loading → mostrar Skeleton/Spinner
// 2. Se não autenticado → redirecionar para /login
// 3. Se autenticado → renderizar children
// 
// Props:
// - children: ReactNode
// - requiredRole?: UserRole (opcional, para role mínimo)

// Uso em App.tsx:
// <Route path="/dashboard" element={
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
// } />
```

#### `src/components/auth/UserMenu.tsx` (CRIAR)

```typescript
// Dropdown com informações do usuário e ações
// 
// Exibe:
// - Avatar (ou iniciais)
// - Nome do usuário
// - Email
// - Role no tenant atual
// 
// Ações:
// - Meu Perfil (abre UserProfileFormDialog)
// - Sair (chama signOut)
// 
// Usa:
// - DropdownMenu do shadcn/ui
// - useAuth() para dados e signOut
// - useUserProfile() para perfil
```

#### `src/components/auth/RoleGuard.tsx` (CRIAR)

```typescript
// Renderiza children apenas se usuário tem role suficiente
// 
// Props:
// - minRole: UserRole ('owner' | 'admin' | 'staff')
// - children: ReactNode
// - fallback?: ReactNode (opcional)
// 
// Hierarquia: owner > admin > staff
// owner pode ver tudo, staff só pode ver se minRole='staff'

// Uso:
// <RoleGuard minRole="admin">
//   <DeleteButton />
// </RoleGuard>
```

#### `src/components/user/UserProfileFormDialog.tsx` (CRIAR)

```typescript
// Dialog para editar perfil do usuário
// 
// Campos:
// - Nome (obrigatório)
// - Telefone (opcional)
// - Avatar (upload futuro, por enquanto URL)
// 
// Validação: userProfileUpdateSchema
// Mutation: useUpdateUserProfile()
```

#### `src/components/team/TeamMemberList.tsx` (CRIAR)

```typescript
// Lista de membros do tenant
// 
// Exibe:
// - Lista de TeamMemberCard
// - Botão "Adicionar membro" (RoleGuard: admin+)
// - Empty state se vazio
// 
// Usa: useTenantUsers(tenantId)
```

#### `src/components/team/TeamMemberCard.tsx` (CRIAR)

```typescript
// Card de um membro
// 
// Exibe:
// - Avatar
// - Nome
// - Email
// - Badge do role
// - Botões: Editar (RoleGuard: owner), Remover (RoleGuard: owner)
// 
// Owner não pode ser editado/removido
```

#### `src/components/team/TeamMemberFormDialog.tsx` (CRIAR)

```typescript
// Dialog para editar role de membro
// 
// Campos:
// - Role (select: admin/staff)
// 
// Nota: Nome e email vêm do user_profile, não editável aqui
```

#### `src/components/team/InviteMemberDialog.tsx` (CRIAR)

```typescript
// Dialog para convidar novo membro
// 
// Campos:
// - Email (busca usuário existente)
// - Role (admin/staff)
// 
// Fluxo:
// 1. Digitar email
// 2. Buscar se usuário existe no sistema
// 3. Se existe → criar tenant_user
// 4. Se não existe → mostrar mensagem (convite por email = pós-MVP)
```

#### `src/components/layout/Header.tsx` (ALTERAR)

```typescript
// Adicionar UserMenu no canto direito
// 
// Atual: apenas título/logo
// Depois: título/logo + UserMenu
```

### 4.5 Páginas

#### `src/pages/auth/Login.tsx` (ALTERAR)

**Mudanças:**
1. Adicionar validação com `loginSchema` e `react-hook-form`
2. Integrar com `useAuth().signIn()`
3. Adicionar loading state no botão
4. Adicionar tratamento de erros com toast
5. Redirecionar para `/dashboard` após sucesso
6. Link para `/register`

```typescript
// Fluxo:
// 1. Usuário preenche email + senha
// 2. Validação com Zod
// 3. Chama signIn(email, password)
// 4. Sucesso → navigate('/dashboard')
// 5. Erro → toast.error(mensagem traduzida)
```

#### `src/pages/auth/Register.tsx` (ALTERAR)

**Mudanças:**
1. Adicionar validação com `registerSchema` e `react-hook-form`
2. Integrar com `useAuth().signUp()`
3. Passar `name` via metadata para o trigger criar perfil
4. Adicionar loading state
5. Tratamento de erros
6. Redirecionar para `/login` com mensagem de sucesso
7. Link para `/login`

```typescript
// Fluxo:
// 1. Usuário preenche nome + email + senha + confirmar senha
// 2. Validação com Zod
// 3. Chama signUp(email, password, { name })
// 4. Trigger handle_new_user() cria user_profile com name
// 5. Sucesso → navigate('/login') + toast.success
// 6. Erro → toast.error
```

#### `src/pages/Team.tsx` (CRIAR)

```typescript
// Página de gestão de equipe
// 
// Exibe:
// - Título "Equipe"
// - TeamMemberList
// 
// Permissão: qualquer staff pode ver, mas ações são limitadas por RoleGuard
```

### 4.6 Contextos

#### `src/contexts/TenantContext.tsx` (ALTERAR)

**Mudanças:**
1. Remover `DEV_TENANT` mock
2. Integrar com `useAuth()` para obter `user.id`
3. Buscar tenants do usuário via `tenantUserService.getUserTenants()`
4. Selecionar primeiro tenant automaticamente (ou último usado via localStorage)
5. Expor `setCurrentTenant` para seletor de tenant
6. Loading state enquanto carrega tenant

```typescript
// Fluxo após login:
// 1. AuthContext detecta sessão
// 2. TenantContext observa auth.user
// 3. Busca tenants do usuário
// 4. Se 1 tenant → seleciona automaticamente
// 5. Se múltiplos → mostra seletor (ou usa último)
// 6. Se 0 tenants → redireciona para criar tenant (pós-MVP)
```

### 4.7 Rotas

#### `src/App.tsx` (ALTERAR)

**Mudanças:**
1. Envolver rotas privadas com `ProtectedRoute`
2. Adicionar rota `/team`
3. Redirecionar `/` para `/dashboard` se autenticado, `/login` se não

```typescript
// Estrutura de rotas:

// Públicas (sem ProtectedRoute):
// - /login → Login
// - /register → Register
// - /:slug → PublicBooking

// Privadas (com ProtectedRoute):
// - /dashboard → Dashboard
// - /bookings → Bookings
// - /clients → Clients
// - /services → Services
// - /professionals → Professionals
// - /team → Team
// - /settings → Settings

// Redirect:
// - / → /dashboard (se autenticado) ou /login (se não)
```

---

## 5. Chaves de i18n a Adicionar

### pt.ts e en.ts (MESMAS CHAVES, MESMA ORDEM)

```typescript
// === Auth ===
login: 'Entrar' / 'Sign In',
register: 'Criar Conta' / 'Sign Up',
logout: 'Sair' / 'Sign Out',
email: 'Email' / 'Email',
password: 'Senha' / 'Password',
confirmPassword: 'Confirmar Senha' / 'Confirm Password',
forgotPassword: 'Esqueceu a senha?' / 'Forgot password?',
noAccount: 'Não tem conta?' / "Don't have an account?",
hasAccount: 'Já tem conta?' / 'Already have an account?',
loginSuccess: 'Login realizado com sucesso' / 'Successfully logged in',
registerSuccess: 'Conta criada com sucesso' / 'Account created successfully',
loginError: 'Erro ao fazer login' / 'Error signing in',
registerError: 'Erro ao criar conta' / 'Error creating account',
invalidCredentials: 'Email ou senha inválidos' / 'Invalid email or password',
emailInUse: 'Este email já está em uso' / 'This email is already in use',
passwordTooShort: 'Senha deve ter pelo menos 6 caracteres' / 'Password must be at least 6 characters',
passwordsDoNotMatch: 'As senhas não coincidem' / 'Passwords do not match',

// === User Profile ===
myProfile: 'Meu Perfil' / 'My Profile',
editProfile: 'Editar Perfil' / 'Edit Profile',
profileUpdated: 'Perfil atualizado' / 'Profile updated',
profileUpdateError: 'Erro ao atualizar perfil' / 'Error updating profile',
avatarUrl: 'URL do Avatar' / 'Avatar URL',

// === Team ===
team: 'Equipe' / 'Team',
teamMembers: 'Membros da Equipe' / 'Team Members',
addMember: 'Adicionar Membro' / 'Add Member',
editMember: 'Editar Membro' / 'Edit Member',
removeMember: 'Remover Membro' / 'Remove Member',
inviteMember: 'Convidar Membro' / 'Invite Member',
memberAdded: 'Membro adicionado' / 'Member added',
memberUpdated: 'Membro atualizado' / 'Member updated',
memberRemoved: 'Membro removido' / 'Member removed',
memberAddError: 'Erro ao adicionar membro' / 'Error adding member',
memberUpdateError: 'Erro ao atualizar membro' / 'Error updating member',
memberRemoveError: 'Erro ao remover membro' / 'Error removing member',
userNotFound: 'Usuário não encontrado' / 'User not found',
userAlreadyMember: 'Usuário já é membro' / 'User is already a member',
cannotRemoveOwner: 'Não é possível remover o proprietário' / 'Cannot remove owner',
cannotEditOwner: 'Não é possível editar o proprietário' / 'Cannot edit owner',

// === Roles ===
roleOwner: 'Proprietário' / 'Owner',
roleAdmin: 'Administrador' / 'Administrator',
roleStaff: 'Colaborador' / 'Staff',
selectRole: 'Selecione o cargo' / 'Select role',

// === Permissions ===
permissionDenied: 'Você não tem permissão para esta ação' / 'You do not have permission for this action',
adminOnly: 'Apenas administradores' / 'Administrators only',
ownerOnly: 'Apenas o proprietário' / 'Owner only',

// === Session ===
sessionExpired: 'Sua sessão expirou' / 'Your session has expired',
pleaseLoginAgain: 'Por favor, faça login novamente' / 'Please log in again',
```

---

## 6. Testes a Criar

### 6.1 Validators

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/lib/validators/authSchema.test.ts` | 100% | Email inválido, senha curta, senhas não coincidem, XSS em nome |
| `src/lib/validators/userProfileSchema.test.ts` | 100% | Nome curto, telefone inválido, URL malformada |
| `src/lib/validators/tenantUserSchema.test.ts` | 100% | Role inválido, email inválido |

### 6.2 Services

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/lib/services/userProfileService.test.ts` | 100% | Get, update, user não existe |
| `src/lib/services/tenantUserService.test.ts` | 100% | CRUD, getUserTenants, usuário já membro, remover owner |

### 6.3 Hooks

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/hooks/useUserProfile.test.ts` | 100% | Query, mutation, cache invalidation |
| `src/hooks/useTenantUsers.test.ts` | 100% | Lista, CRUD, permissões |
| `src/hooks/useUserTenants.test.ts` | 100% | Lista tenants, empty state |

### 6.4 Componentes

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/components/auth/ProtectedRoute.test.tsx` | 100% | Loading, redirect, render children, role check |
| `src/components/auth/UserMenu.test.tsx` | 100% | Render info, logout click |
| `src/components/auth/RoleGuard.test.tsx` | 100% | Show/hide por role, fallback |
| `src/components/team/TeamMemberList.test.tsx` | 100% | Lista, empty state, loading |
| `src/components/team/TeamMemberCard.test.tsx` | 100% | Exibe dados, botões por role |

### 6.5 Páginas

| Arquivo | Cobertura | Casos Obrigatórios |
|---------|-----------|-------------------|
| `src/pages/auth/Login.test.tsx` | 100% | Validação, submit, erro, sucesso, redirect |
| `src/pages/auth/Register.test.tsx` | 100% | Validação, submit, erro, sucesso, redirect |

---

## 7. Critérios de Conclusão

### 7.1 Funcionalidades

- [ ] **Login:** Usuário consegue fazer login com email/senha
- [ ] **Login:** Erro exibido para credenciais inválidas
- [ ] **Login:** Redirecionamento para /dashboard após sucesso
- [ ] **Register:** Usuário consegue criar conta
- [ ] **Register:** user_profile criado automaticamente (via trigger)
- [ ] **Register:** Redirecionamento para /login após sucesso
- [ ] **Logout:** Botão de logout funciona no UserMenu
- [ ] **Logout:** Redirecionamento para /login após logout
- [ ] **Rotas:** Rotas privadas redirecionam para /login se não autenticado
- [ ] **Rotas:** Rotas privadas acessíveis após login
- [ ] **Perfil:** Usuário consegue ver seu perfil
- [ ] **Perfil:** Usuário consegue editar nome/telefone
- [ ] **Equipe:** Lista de membros exibida corretamente
- [ ] **Equipe:** Admin pode adicionar novo membro
- [ ] **Equipe:** Owner pode alterar role de membro
- [ ] **Equipe:** Owner pode remover membro (exceto si mesmo)
- [ ] **Permissões:** Ações limitadas por role funcionam
- [ ] **Tenant:** Tenant carregado automaticamente após login

### 7.2 Qualidade de Código

- [ ] `npx tsc --noEmit` — zero erros
- [ ] `npm run test:run` — 100% dos testes passam
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — build sem erros
- [ ] Todas as chaves i18n em pt.ts E en.ts
- [ ] Zero `any`, zero `console.*`
- [ ] Named exports em todos os arquivos

---

## 8. Fluxos de Autenticação

### 8.1 Fluxo de Login

```
┌─────────────────────────────────────────────────────────────────┐
│                          /login                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Usuário acessa /login                                       │
│  2. Preenche email + senha                                      │
│  3. Validação Zod (frontend)                                    │
│  4. signIn(email, password) → Supabase Auth                     │
│  5. Supabase retorna session                                    │
│  6. AuthContext atualiza state (user, session)                  │
│  7. TenantContext detecta user, busca tenants                   │
│  8. Se 1+ tenant → seleciona primeiro (ou último usado)         │
│  9. Navigate para /dashboard                                    │
│ 10. ProtectedRoute verifica auth → renderiza Dashboard          │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Fluxo de Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                         /register                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Usuário acessa /register                                    │
│  2. Preenche nome + email + senha + confirmar                   │
│  3. Validação Zod (frontend)                                    │
│  4. signUp(email, password, { name }) → Supabase Auth           │
│  5. Supabase cria auth.user com metadata.name                   │
│  6. Trigger handle_new_user() cria user_profile                 │
│  7. Toast de sucesso                                            │
│  8. Navigate para /login                                        │
│  9. Usuário faz login normalmente                               │
│                                                                 │
│  Nota: Novo usuário NÃO tem tenant. Precisa ser convidado       │
│  ou criar tenant (criar tenant = pós-MVP).                      │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Fluxo de Proteção de Rota

```
┌─────────────────────────────────────────────────────────────────┐
│                    ProtectedRoute                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Componente monta                                            │
│  2. Checa AuthContext.loading                                   │
│     - Se true → mostrar Skeleton                                │
│  3. Checa AuthContext.user                                      │
│     - Se null → Navigate para /login                            │
│  4. Checa props.requiredRole (se fornecido)                     │
│     - Se user.role < requiredRole → mostrar "Sem permissão"     │
│  5. Renderiza children                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Fluxo de Convite de Membro

```
┌─────────────────────────────────────────────────────────────────┐
│                    InviteMemberDialog                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Admin/Owner abre dialog                                     │
│  2. Digita email do usuário                                     │
│  3. Sistema busca user por email (via user_profiles ou auth)    │
│  4. Se encontrado:                                              │
│     a. Verificar se já é membro do tenant                       │
│     b. Se não → criar tenant_user com role selecionado          │
│     c. Toast de sucesso                                         │
│  5. Se não encontrado:                                          │
│     a. Mostrar mensagem "Usuário não encontrado"                │
│     b. (Pós-MVP: enviar convite por email)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Matriz de Permissões

| Ação | staff | admin | owner |
|------|-------|-------|-------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Ver agenda | ✅ | ✅ | ✅ |
| Criar agendamento | ✅ | ✅ | ✅ |
| Editar agendamento | ✅ | ✅ | ✅ |
| Deletar agendamento | ❌ | ✅ | ✅ |
| Ver clientes | ✅ | ✅ | ✅ |
| CRUD clientes | ✅ | ✅ | ✅ |
| Ver serviços | ✅ | ✅ | ✅ |
| CRUD serviços | ❌ | ✅ | ✅ |
| Ver profissionais | ✅ | ✅ | ✅ |
| CRUD profissionais | ❌ | ✅ | ✅ |
| Ver equipe | ✅ | ✅ | ✅ |
| Adicionar membro | ❌ | ✅ | ✅ |
| Editar membro | ❌ | ❌ | ✅ |
| Remover membro | ❌ | staff | admin/staff |
| Configurações loja | ❌ | ❌ | ✅ |
| Upload fotos | ✅ | ✅ | ✅ |

**Legenda:**
- ✅ = Permitido
- ❌ = Negado
- "staff" = Pode remover apenas staff
- "admin/staff" = Pode remover admin e staff

---

## 10. Ordem de Implementação

> Cada passo deve terminar com: `tsc ✓ test ✓ lint ✓ build ✓`

### Passo 1: Validators + Testes
1. `authSchema.ts` + teste
2. `userProfileSchema.ts` + teste
3. `tenantUserSchema.ts` + teste

### Passo 2: Services + Testes
1. `userProfileService.ts` + teste
2. `tenantUserService.ts` + teste
3. Atualizar `index.ts`

### Passo 3: Hooks + Testes
1. `useUserProfile.ts` + teste
2. `useTenantUsers.ts` + teste
3. `useUserTenants.ts` + teste
4. Atualizar `index.ts`

### Passo 4: Componentes de Auth
1. `ProtectedRoute.tsx` + teste
2. `RoleGuard.tsx` + teste
3. `UserMenu.tsx` + teste

### Passo 5: Integração de Páginas
1. Alterar `Login.tsx` + teste
2. Alterar `Register.tsx` + teste
3. Alterar `App.tsx` (rotas protegidas)

### Passo 6: TenantContext
1. Alterar `TenantContext.tsx` (integração com Auth)
2. Testar fluxo completo login → tenant

### Passo 7: Componentes de Perfil
1. `UserProfileFormDialog.tsx` + teste
2. Alterar `Header.tsx` (adicionar UserMenu)

### Passo 8: Componentes de Equipe
1. `TeamMemberCard.tsx` + teste
2. `TeamMemberList.tsx` + teste
3. `TeamMemberFormDialog.tsx` + teste
4. `InviteMemberDialog.tsx` + teste

### Passo 9: Página de Equipe
1. `Team.tsx`
2. Adicionar rota em `App.tsx`
3. Adicionar link no Sidebar

### Passo 10: i18n
1. Adicionar todas as chaves em `pt.ts`
2. Adicionar todas as chaves em `en.ts`

### Passo 11: Validação Final
1. `npx tsc --noEmit`
2. `npm run test:run`
3. `npm run lint`
4. `npm run build`
5. Teste manual do fluxo completo

---

## 11. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Token expirado sem refresh | Usuário deslogado inesperadamente | Supabase gerencia refresh automático; detectar e redirecionar |
| Race condition Auth ↔ Tenant | Tenant não carrega | Aguardar auth.loading antes de buscar tenant |
| Usuário sem tenant | Tela em branco | Mostrar mensagem + opção de criar ou aguardar convite |
| RLS bloqueia query | Erro 403 | Logs claros, tratamento de erro específico |
| Convite para email não registrado | UX ruim | Mensagem clara, preparar para convite por email (pós-MVP) |

---

## 12. Próximos Passos

1. **Revisar este plano** — Ajustar se necessário
2. **Aprovar** — Marcar como APROVADO
3. **Executar** — Seguir ordem de implementação
4. **Validar** — `tsc ✓ test ✓ lint ✓ build ✓` em cada passo
