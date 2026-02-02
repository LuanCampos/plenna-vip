# Guia para Iniciantes — Plenna Vip

Bem-vindo! Este documento explica **o que é o Plenna Vip**, **como ele funciona por dentro** e **como você pode começar a contribuir**.

---

## 📑 Índice

**Parte 1: Entendendo o Projeto**
1. [O que é o Plenna Vip?](#-o-que-é-o-plenna-vip)
2. [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
3. [Arquitetura e Fluxo de Dados](#️-arquitetura-e-fluxo-de-dados)
4. [Estrutura de Pastas](#-estrutura-de-pastas)

**Parte 2: Começando a Desenvolver**
5. [Primeiros Passos](#-primeiros-passos)

**Parte 3: Padrões do Projeto**
6. [Padrões de Código](#-padrões-de-código)
7. [Testes e Qualidade](#-testes-e-qualidade)

**Parte 4: Referência**
8. [Troubleshooting](#-troubleshooting)
9. [Próximos Passos](#-próximos-passos)

---

# Parte 1: Entendendo o Projeto

## 🎯 O que é o Plenna Vip?

O **Plenna Vip** é um **sistema de agendamento online para esteticistas** — micro-SaaS multi-tenant. Permite que salões e profissionais de beleza:

- **Gerenciem agendas** com visualização de calendário
- **Cadastrem clientes** com histórico completo de atendimentos
- **Registrem serviços** com fotos de antes/depois
- **Publiquem página de agendamento online** — clientes agendam direto
- **Gerenciem múltiplos profissionais** por loja (multi-tenant)
- **Controlem serviços e preços** de forma organizada

---

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia | Para quê serve |
|------------|----------------|
| **React** | Biblioteca para criar interfaces de usuário |
| **TypeScript** | JavaScript com tipos — erros aparecem antes de rodar |
| **Tailwind CSS** | Estilização com classes utilitárias (`bg-blue-500`, `p-4`) |
| **shadcn/ui** | Componentes prontos e acessíveis (botões, modais, inputs) |

### Backend e Dados

| Tecnologia | Para quê serve |
|------------|----------------|
| **Supabase** | Banco de dados PostgreSQL, autenticação e storage (fotos) na nuvem |

### Ferramentas de Desenvolvimento

| Tecnologia | Para quê serve |
|------------|----------------|
| **Vite** | Servidor de dev + bundler (compila tudo para produção) |
| **Vitest** | Framework de testes |

### Como funciona: do código ao navegador

O navegador **só entende HTML, CSS e JavaScript**. Então o **Vite** transforma tudo que você escreve:

| Você escreve | Navegador recebe |
|--------------|------------------|
| TypeScript (`.ts`) | JavaScript (tipos removidos) |
| JSX (`<Button />`) | JavaScript (`React.createElement(...)`) |
| Tailwind (classes) | CSS puro (só as classes usadas) |
| Vários arquivos | Poucos arquivos otimizados |

```
  DESENVOLVIMENTO                              PRODUÇÃO
  (npm run dev)                              (npm run build)

+------------------+                        +------------------+
| Component.tsx    |                        | index.js         |
| hooks.ts         |  ---- Vite ---->       | vendor.js        |
| utils.ts         |                        | index.css        |
| *.css            |                        | index.html       |
+------------------+                        +------------------+
  Muitos arquivos                             Poucos arquivos
  Código legível                              Minificados
  Com tipos TS                                Só JS/CSS/HTML
```

**Em desenvolvimento:** Vite sobe um servidor em `localhost:8080` com Hot Reload — ao salvar, o navegador atualiza sozinho.

**Em produção:** Vite gera a pasta `dist/` com tudo otimizado. O React vira JavaScript, o TypeScript perde os tipos, o Tailwind vira CSS puro.

> **Por que Vite?** É mais rápido que Webpack porque usa ES Modules nativos do navegador.

---

## 🏛️ Arquitetura e Fluxo de Dados

### Visão geral

```
+---------------------------------------------------------------+
|                          NAVEGADOR                            |
+---------------------------------------------------------------+
|                                                               |
|   +-------------------------------------------------------+   |
|   |                  REACT + TypeScript                   |   |
|   |                                                       |   |
|   |   +-----------+   +-----------+   +---------------+   |   |
|   |   |   Pages   |   |Components |   |   Contexts    |   |   |
|   |   | (Dash,    |   | (Appoint  |   | (Auth, Tenant |   |   |
|   |   | Bookings, |   |  Client,  |   |  Theme, Lang) |   |   |
|   |   | Clients)  |   | Service)  |   |               |   |   |
|   |   +-----------+   +-----------+   +---------------+   |   |
|   |                         |                             |   |
|   |                         v                             |   |
|   |   +-----------------------------------------------+   |   |
|   |   |                    HOOKS                      |   |   |
|   |   |   (useAppointments, useClients, etc.)         |   |   |
|   |   +-----------------------------------------------+   |   |
|   |                         |                             |   |
|   |                         v                             |   |
|   |   +-----------------------------------------------+   |   |
|   |   |                  SERVICES                     |   |   |
|   |   |      (appointmentService, clientService)      |   |   |
|   |   +-----------------------------------------------+   |   |
|   +-------------------------------------------------------+   |
|                              |                                |
|                              v                                |
|                    +------------------+                       |
|                    |    SUPABASE      |                       |
|                    | (PostgreSQL +    |                       |
|                    |  Auth + Storage) |                       |
|                    +------------------+                       |
+---------------------------------------------------------------+
```

### Fluxo de dados (regra de ouro)

O fluxo **sempre** segue essa ordem — nunca viole:

```
+-----------+     +------+     +-------------------+
| Componente| --> | Hook | --> |     Service       |
|   (UI)    |     |      |     |   (Supabase)      |
+-----------+     +------+     +-------------------+
    React          Lógica           Backend
```

### Camadas do projeto

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| **Pages** | `src/pages/` | Páginas principais (Dashboard, Bookings, Clients) |
| **Components** | `src/components/` | Peças visuais organizadas por domínio |
| **Hooks** | `src/hooks/` | Lógica de negócio (useAppointments, useClients) |
| **Contexts** | `src/contexts/` | Estado global (Auth, Tenant, Theme, Language) |
| **Services** | `src/lib/services/` | Chamadas diretas ao Supabase |

> ⚠️ **Regra de ouro:** Componentes NUNCA chamam Supabase diretamente. Sempre passam pelo hook → service.

### Exemplo: O que acontece ao criar um agendamento?

1. Usuário clica em "+" → abre `AppointmentFormDialog`
2. Seleciona cliente, serviço, profissional, data/hora
3. Clica "Salvar" → hook `useAppointments` é chamado
4. Hook chama `appointmentService.create(data)`
5. Service faz chamada ao Supabase → cria registro no PostgreSQL
6. Toast de sucesso → `toast.success(t('appointmentCreated'))`
7. Calendário atualiza automaticamente com novo agendamento

---

## 📁 Estrutura de Pastas

```
src/
├── pages/          → Páginas da aplicação (Dashboard, Bookings, Clients)
├── components/     → Componentes visuais
│   ├── common/     → Genéricos (ConfirmDialog, Calendar)
│   ├── appointment/→ Tudo sobre agendamentos
│   ├── client/     → Tudo sobre clientes
│   ├── service/    → Tudo sobre serviços
│   ├── professional/ → Tudo sobre profissionais
│   └── ui/         → Componentes shadcn/ui (NÃO edite)
│
├── hooks/          → Lógica reutilizável (useAppointments, useClients)
├── contexts/       → Estado global (Auth, Tenant, Theme, Language)
├── lib/            → Utilitários e conexão com banco
│   ├── services/   → Chamadas ao Supabase
│   ├── utils/      → Formatação, validação, etc.
│   └── storage/    → Acesso seguro ao localStorage
├── i18n/           → Traduções (pt.ts, en.ts)
└── types/          → Definições TypeScript
```

### Convenção de nomenclatura de componentes

| Sufixo | O que faz | Exemplo |
|--------|-----------|---------|
| `*FormFields` | Campos de form reutilizáveis | `ClientFormFields` |
| `*FormDialog` | Modal para criar/editar | `AppointmentFormDialog` |
| `*ListDialog` | Modal com lista + ações | `ServiceListDialog` |
| `*SettingsDialog` | Modal complexo com tabs | `TenantSettingsDialog` |
| `*ViewDialog` | Modal somente leitura | `AppointmentDetailsDialog` |
| `*Card` | Exibe informações resumidas | `AppointmentCard` |
| `*List` | Lista de itens | `ClientList` |
| `*Section` | Seção dentro de página | `ProfileSection` |
| `*Panel` | Componente autônomo complexo | `CalendarPanel` |
| `*Calendar` | Visualização de calendário | `WeekCalendar` |
| `*Chart` | Visualização gráfica | `RevenueChart` |
| `*Selector` | Picker inline | `ProfessionalSelector` |
| `*Input` | Input especializado | `PhoneInput`, `TimeInput` |
| `*Progress` | Indicador de progresso | `BookingProgress` |

> ⚠️ Para confirmações de exclusão, use sempre `ConfirmDialog` de `@/components/common`.

### Configurações Centralizadas

Valores que podem mudar (moeda, timezone, limites) ficam em `src/lib/config/`:

```typescript
// src/lib/config/currency.ts
export const CURRENCY_SYMBOL = 'R$';
export const CURRENCY_CODE = 'BRL';

// src/lib/config/business.ts
export const BOOKING_SLOT_DURATION = 30; // minutos
export const BUSINESS_HOURS = { start: '08:00', end: '20:00' };
```

**Nunca hardcode valores de negócio** — facilita mudanças futuras e internacionalização.

---

# Parte 2: Começando a Desenvolver

## 🚀 Primeiros Passos

### 1. Clone e instale

```bash
git clone <url-do-repositorio>
cd plenna-vip
npm install
```

### 2. Configure o Supabase

Crie um projeto gratuito em [supabase.com](https://supabase.com) e copie as chaves.

Crie o arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> ⚠️ **Nunca commite o `.env.local`** — ele já está no `.gitignore`.

### 3. Rode o projeto

```bash
npm run dev
```

Abra `http://localhost:8080` no navegador.

### 4. Instale as extensões recomendadas do VS Code

O projeto inclui configurações para VS Code em `.vscode/`. Ao abrir o projeto, instale as extensões recomendadas:

- **Tailwind CSS IntelliSense** — Autocomplete de classes e elimina erros falsos no CSS
- **ESLint** — Verifica erros de código em tempo real
- **Prettier** — Formatação automática

> 💡 O VS Code mostra um popup "Extensões recomendadas" ao abrir o projeto. Clique em "Instalar Todas".

### 5. Comandos úteis

```bash
npm run dev       # Inicia servidor de desenvolvimento
npx tsc --noEmit  # Verifica tipos TypeScript
npm run lint      # Verifica erros de código
npm run test:run  # Roda todos os testes
npm run test      # Roda testes em modo watch
npm run build     # Gera versão de produção
```

### 6. Antes de enviar código (PR)

Sempre rode os **quatro comandos** abaixo — todos devem passar:

```bash
npx tsc --noEmit  # 1. Tipos TypeScript OK
npm run test:run  # 2. Testes passando
npm run lint      # 3. Zero warnings
npm run build     # 4. Build sem erros
```

> 💡 **Dica:** Rode `npx tsc --noEmit` frequentemente durante o desenvolvimento (a cada 2-3 arquivos alterados).

---

# Parte 3: Padrões do Projeto

## 📐 Padrões de Código

### Estilo visual: Use tokens, não cores fixas

```tsx
// ❌ Errado
<div className="bg-gray-100 text-gray-600">

// ✅ Certo
<div className="bg-secondary/50 text-muted-foreground">
```

**Tokens mais usados:**
| Token | Uso |
|-------|-----|
| `bg-card` | Fundo de cards/modais |
| `bg-secondary/50` | Fundo de inputs |
| `text-foreground` | Texto principal |
| `text-muted-foreground` | Texto secundário |
| `border-border` | Todas as bordas |

### Inputs sempre assim

```tsx
<Input className="h-10 bg-secondary/50 border-border" />
```

### Nunca use console.log

```tsx
// ❌ Errado
console.log('dados:', data);

// ✅ Certo
import { logger } from '@/lib/logger';
logger.debug('appointment.created', { appointmentId, clientId });
```

### Nunca use localStorage diretamente

```tsx
// ❌ Errado
localStorage.getItem('key');

// ✅ Certo
import { getSecureStorageItem } from '@/lib/storage/secureStorage';
getSecureStorageItem('key');
```

### Sempre use named exports

```tsx
// ❌ Errado
export default MeuComponente;

// ✅ Certo
export const MeuComponente = () => { ... };
```

### Internacionalização (i18n)

Todos os textos devem ser traduzíveis:

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();
<Button>{t('save')}</Button>  // "Salvar" ou "Save"
<h1>{t('bookings.title')}</h1>  // "Agendamentos" ou "Bookings"
```

Adicione as chaves em `src/i18n/translations/pt.ts` e `en.ts` (mesma chave, mesma ordem).

### Mensagens de sucesso/erro

```tsx
import { toast } from 'sonner';

toast.success(t('saved'));
toast.error(t('errorSaving'));
```

### Acessibilidade

Botões com apenas ícone precisam de `aria-label`:

```tsx
<Button variant="ghost" size="icon" aria-label={t('edit')}>
  <Pencil className="h-4 w-4" />
</Button>
```

---

## 🧪 Testes e Qualidade

O projeto usa **Vitest**. Arquivos de teste ficam junto do código:

```
src/hooks/
  ├── useAppointments.ts       # Código
  └── useAppointments.test.ts  # Teste
```

### Comandos

```bash
npm run test:run  # Roda uma vez
npm run test      # Modo watch (re-executa ao salvar)
```

### Como debugar

**Chrome DevTools (F12):**
| Aba | Para quê |
|-----|----------|
| Console | Logs e erros |
| Network | Requisições ao Supabase |
| Application | IndexedDB, Service Worker |

**React DevTools:** Instale a extensão no Chrome para inspecionar componentes, props e state.

---

# Parte 4: Referência

## 🔧 Troubleshooting

### "Port 8080 is already in use"

```bash
# Windows: encontrar e matar o processo
netstat -ano | findstr :8080
taskkill /PID <numero> /F

# Ou use outra porta
npm run dev -- --port 3000
```

### "Supabase connection failed"

- Verifique se `.env.local` existe na raiz
- Confirme se as chaves estão corretas (sem espaços)
- Verifique se o projeto Supabase está ativo

### "Module not found"

```bash
rm -rf node_modules
npm install
```

### Build falha mas dev funciona

- Rode `npm run lint` para ver erros de TypeScript
- Verifique imports não utilizados
- Confirme que não há `any` implícito

---

## 📚 Próximos Passos

1. **Rode o projeto:** `npm run dev`
2. **Explore:** Crie conta, crie agendamentos, cadastre clientes
3. **Leia um componente:** Comece por `src/components/appointment/AppointmentCard.tsx`
4. **Faça uma alteração:** Mude uma cor ou texto
5. **Valide:** `npm run lint && npm run test:run && npm run build`
6. **Aprofunde:** Leia o `CONTRIBUTING.md` quando for criar algo novo

### Resumo rápido: onde encontrar cada coisa

| Conceito | Arquivo |
|----------|---------|
| Bundler/dev server | `vite.config.ts` |
| Configuração TS | `tsconfig.json` |
| Estilos | `tailwind.config.ts` |
| Componentes UI | `src/components/ui/` |
| Banco de dados | `src/lib/supabase.ts` |
| Testes | `vitest.config.ts` |

---

*Boa sorte! Se tiver dúvidas, pergunte. 🚀*
