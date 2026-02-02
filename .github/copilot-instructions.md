# GitHub Copilot Instructions — Plenna Vip

## Stack & Arquitetura

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase

**Fluxo de dados (NUNCA viole):**
```
Componente → Hook → Service (Supabase)
```

**Estrutura de arquivos:**
```
src/pages/                    → Páginas (Dashboard.tsx, Bookings.tsx, Clients.tsx)
src/components/{domain}/      → Componentes por domínio (appointment/, client/, service/, professional/)
src/components/common/        → Componentes compartilhados (ConfirmDialog, Calendar)
src/components/ui/            → Primitivos shadcn/ui (NÃO edite)
src/hooks/                    → Hooks de domínio (useAppointments.ts, useClients.ts)
src/lib/services/             → Chamadas Supabase (appointmentService.ts, clientService.ts)
src/contexts/                 → Estado global (Auth, Tenant, Theme, Language)
src/i18n/translations/        → pt.ts e en.ts (mesmas chaves, mesma ordem)
src/types/                    → Tipos TypeScript (appointment.ts, client.ts, service.ts)
```

---

## Antes de Implementar

**SEMPRE esclareça dúvidas ANTES de fazer alterações:**

1. **Entenda o problema primeiro** — Pergunte sobre sintomas específicos (cor, posição, timing, comportamento)
2. **Evite suposições** — Se o usuário relata um bug visual, pergunte: "É uma cor de fundo, borda, sombra ou outline?"
3. **Confirme o escopo** — "Isso afeta só este componente ou outros também?"
4. **Valide a solução** — Antes de implementar, descreva a abordagem: "Vou adicionar X ao Y. Está correto?"

> ⚠️ **Múltiplas iterações para resolver um problema simples indicam falta de clarificação inicial.**

---

## Regras Absolutas

```tsx
// ❌ PROIBIDO                          // ✅ OBRIGATÓRIO
export default Component                → export const Component
any                                     → unknown ou tipo específico
console.log()                           → logger.debug('event', { data })
localStorage.getItem()                  → getSecureStorageItem()
'R$'  // hardcoded                       → CURRENCY_SYMBOL de @/lib/config/currency
<DialogFooter>                          → <div className="...bg-secondary/30">
className="text-gray-500"               → className="text-muted-foreground"
className="bg-gray-100"                 → className="bg-secondary/50"
supabase.from('table')  // em componente → Use hook → service
```

---

## Templates de Código

### Dialog (FormDialog / ListDialog)

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">
    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
      <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="h-5 w-5 text-primary" />
        {t('title')}
      </DialogTitle>
    </DialogHeader>
    
    <div className="px-6 py-4 overflow-y-auto">
      <div className="space-y-4">
        {/* campos aqui */}
      </div>
    </div>
    
    <div className="px-6 py-4 border-t border-border bg-secondary/30 flex gap-2 justify-end">
      <Button variant="outline" onClick={handleClose}>{t('cancel')}</Button>
      <Button onClick={handleSave} disabled={saving}>{t('save')}</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Tamanhos:** `sm:max-w-sm` (confirm) | `sm:max-w-md` (form) | `sm:max-w-lg` (form complexo) | `sm:max-w-xl` (lista)

### Campo de Formulário

```tsx
<div className="space-y-2">
  <Label htmlFor="fieldId" className="text-sm font-medium">{t('label')}</Label>
  <Input id="fieldId" className="h-10 bg-secondary/50 border-border" />
</div>
```

### Input com Preço (Moeda)

```tsx
import { CURRENCY_SYMBOL } from '@/lib/config/currency';

<div className="space-y-2">
  <Label className="text-sm font-medium">{t('service.price')}</Label>
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
      {CURRENCY_SYMBOL}
    </span>
    <Input 
      type="text" 
      inputMode="decimal" 
      className="h-10 pl-10 bg-secondary/50 border-border" 
      placeholder="0,00"
    />
  </div>
</div>
```

### Select

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="h-10 bg-secondary/50 border-border">
    <SelectValue placeholder={t('select')} />
  </SelectTrigger>
  <SelectContent className="bg-card border-border">
    <SelectItem value="opt1">{t('option1')}</SelectItem>
  </SelectContent>
</Select>
```

### Item de Lista com Ações

```tsx
<div className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg gap-3">
  <div className="min-w-0 flex-1">
    <p className="text-sm text-foreground truncate">{name}</p>
  </div>
  <div className="flex items-center gap-1 flex-shrink-0">
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
      aria-label={t('edit')}
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      aria-label={t('delete')}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Confirmação de Exclusão

```tsx
import { ConfirmDialog } from '@/components/common';

<ConfirmDialog
  open={!!deleteId}
  onOpenChange={(open) => !open && setDeleteId(null)}
  onConfirm={() => handleDelete(deleteId)}
  title={t('deleteTitle')}
  description={t('deleteDescription')}
  variant="destructive"
  loading={deleting}
/>
```

### Imports Padrão

```tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { logger } from '@/lib/logger';
import { getSecureStorageItem } from '@/lib/storage/secureStorage';
import { appointmentService } from '@/lib/services/appointmentService';
```

---

## Nomenclatura

| Sufixo | Quando usar | Exemplo |
|--------|-------------|------|
| `*FormFields` | Campos de form reutilizáveis (sem dialog) | `ClientFormFields` |
| `*FormDialog` | Dialog para criar/editar UMA entidade | `AppointmentFormDialog` |
| `*ListDialog` | Dialog com lista + ações CRUD | `ServiceListDialog` |
| `*SettingsDialog` | Dialog complexo com tabs/seções | `TenantSettingsDialog` |
| `*ViewDialog` | Dialog somente leitura (detalhes) | `AppointmentDetailsDialog` |
| `*Card` | Exibição compacta de entidade | `AppointmentCard` |
| `*List` | Lista de itens (fora de dialog) | `ClientList` |
| `*Section` | Seção dentro de página ou dialog | `ProfileSection`, `GeneralSection` |
| `*Panel` | Seção autônoma complexa | `CalendarPanel` |
| `*Calendar` | Visualização de calendário | `WeekCalendar`, `MonthCalendar` |
| `*Selector` | Picker inline | `ProfessionalSelector`, `ServiceSelector` |
| `*Chart` | Visualização gráfica | `RevenueChart`, `AppointmentsChart` |
| `*Input` | Componente de input especializado | `PhoneInput`, `TimeInput` |
| `*Progress` | Indicador de progresso | `BookingProgress` |

**❌ Nunca use:** `*Manager`, `*Container`, `*Modal`, `*Form` (para dialogs), `*Wrapper`

---

## Tokens de Cor

| Contexto | Classe |
|----------|--------|
| Fundo de dialog/card | `bg-card` |
| Fundo de inputs | `bg-secondary/50` |
| Fundo de list items | `bg-secondary/50` |
| Footer de dialog | `bg-secondary/30` |
| Texto principal | `text-foreground` |
| Texto secundário | `text-muted-foreground` |
| Bordas | `border-border` |
| Ícone em título | `text-primary` |
| Ação destrutiva | `text-destructive` / `bg-destructive` |
| Hover editar | `hover:text-primary hover:bg-primary/10` |
| Hover deletar | `hover:text-destructive hover:bg-destructive/10` |

---

## Acessibilidade (a11y)

```tsx
// ✅ Botões de ícone SEMPRE com aria-label
<Button variant="ghost" size="icon" aria-label={t('edit')}>
  <Pencil className="h-4 w-4" />
</Button>

// ✅ Inputs pareados com Label
<Label htmlFor="name">{t('name')}</Label>
<Input id="name" ... />

// ✅ Imagens com alt
<img src={url} alt={t('description')} />
<img src={decorative} alt="" />  // Decorativa
```

---

## Tratamento de Erros

```tsx
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const handleSave = async () => {
  setLoading(true);
  try {
    await onSave(data);
    toast.success(t('saved'));
    onClose();
  } catch (error) {
    logger.error('entity.save.failed', { error });
    toast.error(t('errorSaving'));
  } finally {
    setLoading(false);
  }
};
```

| Situação | Ação |
|----------|------|
| Sucesso | `toast.success(t('mensagem'))` |
| Erro de usuário | `toast.error(t('erro'))` + `logger.error()` |
| Aviso | `toast.warning(t('aviso'))` |

---

## 🛠️ Configurações

**Valores de negócio e configurações NUNCA devem ser hardcoded.**

Crie arquivos em `src/lib/config/` para centralizar:

```typescript
// src/lib/config/currency.ts
export const CURRENCY_SYMBOL = 'R$';
export const CURRENCY_CODE = 'BRL';

// src/lib/config/business.ts
export const BOOKING_SLOT_DURATION = 30; // minutos
export const BUSINESS_HOURS = {
  start: '08:00',
  end: '20:00',
};

// src/lib/config/limits.ts
export const MAX_APPOINTMENTS_PER_DAY = 20;
export const MAX_PHOTOS_PER_SERVICE = 10;
```

**Vantagens:**
- Facilita mudanças futuras
- Prepara para multi-moeda/multi-timezone
- Documenta valores de negócio
- Evita "magic numbers" espalhados

---

## Validação com Zod

**Todos os inputs de usuário DEVEM ser validados com Zod antes de enviar ao backend.**

### Estrutura de Arquivos

```
src/lib/validators/
├── appointmentSchema.ts   → Schema de agendamento
├── clientSchema.ts        → Schema de cliente
├── serviceSchema.ts       → Schema de serviço
└── commonSchemas.ts       → Schemas reutilizáveis (email, phone, etc.)
```

### Padrão de Schema

```typescript
// src/lib/validators/clientSchema.ts
import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  notes: z.string().max(500).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
```

### Uso em Componentes

```typescript
import { clientSchema, ClientInput } from '@/lib/validators/clientSchema';

const handleSave = async (data: ClientInput) => {
  const validated = clientSchema.parse(data); // Lança erro se inválido
  await clientService.create(validated);
};
```

---

## Estrutura de Types

**Types de domínio ficam em `src/types/` com convenção consistente.**

### Padrão de Arquivo de Type

```typescript
// src/types/appointment.ts

// Entidade do banco (o que vem do Supabase)
export interface Appointment {
  id: string;
  tenant_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string;  // ISO 8601
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Enums e unions
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Input para criação (sem campos gerados)
export type AppointmentCreate = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;

// Input para atualização (parcial)
export type AppointmentUpdate = Partial<AppointmentCreate>;

// Com relacionamentos expandidos (joins)
export interface AppointmentWithDetails extends Appointment {
  client: { id: string; name: string; phone: string };
  professional: { id: string; name: string };
  service: { id: string; name: string; duration: number; price: number };
}
```

### Convenções

| Sufixo | Uso |
|--------|-----|
| (sem sufixo) | Entidade base do banco |
| `*Create` | Input para criação |
| `*Update` | Input para atualização |
| `*WithDetails` | Com relacionamentos expandidos |
| `*Input` | Input validado (do Zod) |

---

## Gerenciamento de Estado com TanStack Query

**Use TanStack Query (React Query) para gerenciar estado de servidor.**

### Por que usar?

- ✅ Cache automático de requisições
- ✅ Invalidação inteligente
- ✅ Optimistic updates
- ✅ Retry automático em falhas
- ✅ Deduplicação de requisições

### Estrutura de Hooks

```typescript
// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/lib/services/appointmentService';
import { useTenant } from '@/contexts/TenantContext';

// Query keys centralizadas
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

export const useAppointments = (filters: AppointmentFilters) => {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentService.getAll(currentTenant.id, filters),
    enabled: !!currentTenant?.id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  
  return useMutation({
    mutationFn: (data: AppointmentCreate) => 
      appointmentService.create(currentTenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success(t('appointmentCreated'));
    },
    onError: (error) => {
      logger.error('appointment.create.failed', { error });
      toast.error(t('errorCreating'));
    },
  });
};
```

### Uso em Componentes

```typescript
export const AppointmentList = () => {
  const { data: appointments, isLoading, error } = useAppointments(filters);
  const createMutation = useCreateAppointment();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  
  return (
    <div>
      {appointments.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
    </div>
  );
};
```

---

## Performance

```tsx
// ✅ useMemo para cálculos pesados
const chartData = useMemo(() => 
  months.map(m => ({ label: m.label, value: m.total }))
, [months]);

// ✅ useCallback para funções passadas como props
const handleDelete = useCallback(async (id: string) => {
  await deleteItem(id);
}, [deleteItem]);
```

| Hook | Quando Usar |
|------|-------------|
| `useMemo` | Cálculos derivados de props/state |
| `useCallback` | Funções passadas para componentes filhos |
| Nenhum | Valores simples, funções locais |

---

## Testes

Arquivos de teste co-localizados com o código fonte.

### Filosofia de Testes

Testes não existem para "passar". Testes existem para:

1. **Especificar comportamento** — O teste é a documentação executável
2. **Prevenir regressões** — Garantir que mudanças não quebrem funcionalidades
3. **Forçar design** — Código testável tende a ser código melhor estruturado
4. **Dar confiança** — Permitir refatoração e evolução sem medo
5. **Revelar bugs** — Testes agressivos encontram problemas ANTES da produção

> **🚨 REGRA CRÍTICA:** Quando um teste falha, NUNCA ajuste o teste para passar sem antes investigar se o código está errado. Se o teste está correto, **corrija a aplicação**.

| Teste Fraco ❌ | Teste Forte ✅ |
|---------------|---------------|
| `expect(result).toBeDefined()` | `expect(result).toBe(expectedValue)` |
| `expect(result).toBeTruthy()` | `expect(result).toEqual({ ...exactShape })` |
| Testa implementação interna | Testa comportamento observável |
| Ignora edge cases | Cobre limites e casos extremos |
| Confia em inputs sempre válidos | Testa inputs maliciosos |
| Happy path only | Testa erros, timeouts, falhas |

### O que Testar (Prioridade)

| Tipo | Exemplo | Ação |
|------|---------|------|
| Novo utilitário em `src/lib/` | `dateFormatters.ts`, `timeSlots.ts` | ✅ Escrever teste |
| Novo validador/schema | `appointmentValidators.ts` | ✅ Escrever teste |
| Função de segurança | `secureStorage.ts` | ✅ Escrever teste com payloads maliciosos |
| Ataques de segurança | `security.test.ts` | ✅ XSS, SQL Injection, Prototype Pollution, etc. |
| Novo componente | `AppointmentCard.tsx` | ✅ Escrever teste de renderização e interação |
| Novo hook | `useAppointments.ts` | ✅ Escrever teste com mocks de contexto/API |

### Convenções de Teste

```typescript
// Arquivo: arquivo.test.ts (co-localizado com arquivo.ts)
import { describe, it, expect, beforeEach } from 'vitest';

describe('nomeDoModulo', () => {
  beforeEach(() => {
    // setup/cleanup
  });

  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Teste de Componente

```typescript
// Arquivo: ComponentName.test.tsx (co-localizado com ComponentName.tsx)
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock de contextos se necessário
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/contexts/TenantContext', () => ({
  useTenant: () => ({ 
    currentTenant: { id: 'tenant-1', name: 'Test Salon' },
    loading: false 
  }),
}));

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('expectedText')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();
    
    render(<ComponentName onClick={onClickMock} />);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
```

### Teste de Hook

```typescript
// Arquivo: useHookName.test.ts (co-localizado com useHookName.ts)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHookName } from './useHookName';

// Mock de dependências
vi.mock('@/lib/services/appointmentService', () => ({
  appointmentService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: '1' }),
  },
}));

describe('useHookName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useHookName());
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should update state after action', async () => {
    const { result } = renderHook(() => useHookName());
    
    await act(async () => {
      await result.current.addItem({ name: 'Test' });
    });
    
    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
    });
  });
});
```

---

## 🚨 Verificação Obrigatória (SEMPRE)

**TODA alteração DEVE passar pelos comandos abaixo:**

```bash
npx tsc --noEmit        # Verificar tipos ANTES de finalizar
npm run test:run        # Testes devem passar
npm run lint            # Zero warnings
npm run build           # Build sem erros
```

### Ordem de Execução

1. **Durante desenvolvimento:** Rode `npx tsc --noEmit` frequentemente (a cada 2-3 arquivos criados/alterados)
2. **Antes de finalizar:** Rode a sequência completa: `tsc → test → lint → build`
3. **NÃO avançar** se qualquer comando falhar — corrija antes de continuar

> ⚠️ **Alterações NÃO estão completas até que TODOS os comandos passem.**

---

## 🧪 Regras de Testes (OBRIGATÓRIO)

### Filosofia: Testes Revelam Bugs, Não Se Adaptam a Eles

> **🚨 REGRA DE OURO:** Quando um teste falha, a PRIMEIRA ação é investigar se o código está errado.
> **NUNCA ajuste o teste para passar sem antes confirmar que o comportamento atual está correto.**

| Situação | Ação Correta | Ação ERRADA |
|----------|--------------|-------------|
| Teste falha, código está errado | Corrigir o código | Ajustar o teste |
| Teste falha, teste está errado | Corrigir o teste | Deletar o teste |
| Teste falha, requisito mudou | Atualizar teste E código | Só ajustar teste |

### Testes Agressivos vs Testes Frágeis

```typescript
// ❌ TESTE FRÁGIL — Não testa comportamento real
it('should sanitize input', () => {
  const result = sanitize('<script>');
  expect(result).toBeDefined(); // Passa mesmo se não sanitizar
});

// ✅ TESTE AGRESSIVO — Especifica comportamento exato
it('should escape HTML tags to prevent XSS', () => {
  const result = sanitize('<script>alert("xss")</script>');
  expect(result).not.toContain('<');
  expect(result).not.toContain('>');
  expect(result).toContain('&lt;');
  expect(result).toContain('&gt;');
});

// ✅ TESTE DE SEGURANÇA — Testa vetores de ataque conhecidos
const xssPayloads = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)">',
];

it.each(xssPayloads)('should neutralize XSS payload: %s', (payload) => {
  const result = sanitize(payload);
  // Verifica que NENHUM vetor de ataque sobrevive
  expect(result).not.toMatch(/<[a-z]/i); // Nenhuma tag HTML
  expect(result).not.toContain('onerror');
  expect(result).not.toContain('onload');
  expect(result).not.toContain('javascript:');
});
```

### Cobertura de Testes

**Meta: 100% de cobertura** em todo o código.

```bash
npm run test:coverage   # Verificar cobertura
```

| Camada | Cobertura | Razão |
|--------|-----------|-------|
| `src/lib/` | **100%** | Validação, segurança, utilitários |
| `src/hooks/` | **100%** | Lógica de negócio |
| `src/components/` | **100%** | Comportamento e interações |
| `src/contexts/` | **100%** | Estado global |
| `src/pages/` | **100%** | Composição e renderização |

> ⚠️ **Todo código novo deve ter 100% de cobertura desde o primeiro commit.**

**Arquivos excluídos do coverage** (configurado em `vitest.config.ts`):
- `supabase.ts` — cliente externo, testado via integração
- `**/index.ts` — apenas re-exports
- `main.tsx` — entry point
- `App.tsx` — composição de providers

---

## Checklist Antes de Finalizar

### Verificação de Tipos (PRIMEIRO)
- [ ] `npx tsc --noEmit` — zero erros de TypeScript
- [ ] Nenhuma variável declarada mas não usada
- [ ] Nenhum `any` implícito ou explícito

### Código
- [ ] Um componente por arquivo
- [ ] Named export (`export const`)
- [ ] Sem `any` — usar `unknown` ou tipo específico
- [ ] Sem `console.*` — usar `logger.*`
- [ ] Sem cores hardcoded — usar tokens
- [ ] Textos com `t('chave')` + chaves em pt.ts e en.ts
- [ ] Dialog sem `<DialogFooter>` — usar div estilizada
- [ ] Inputs com `h-10 bg-secondary/50 border-border`
- [ ] Botões de ícone com `aria-label`
- [ ] Operações async com try/catch + toast
- [ ] Cálculos pesados com `useMemo`
- [ ] Testes para novos utilitários/validadores

### ✅ Verificação Final (OBRIGATÓRIO)
- [ ] `npm run test:run` — todos os testes passam
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — build completa sem erros

---

## Papéis de Execução da IA

Prompts iniciando com `[Planejador]`, `[Executor]` ou `[Revisor]` ativam o papel correspondente.

⚠️ Nenhum papel pode violar:
- Fluxo de dados (Component → Hook → Service)
- Regras Absolutas
- Checklist e Verificação Obrigatória (test/lint/build) quando houver mudanças de código

Se houver conflito entre o plano e estas regras, as regras vencem.

---

### [Planejador]

Objetivo: definir um plano completo e verificável, sem escrever código.

Saída obrigatória: `docs/plan-<nome-curto>.md` contendo:
1. Objetivo da mudança
2. Arquivos a criar/alterar/remover
3. O que muda em cada arquivo (o quê + por quê)
4. Tipos e contratos afetados
5. Chaves de i18n a adicionar (pt.ts e en.ts)
6. Testes a criar/alterar
7. Critérios de conclusão:
   - o que precisa estar verdadeiro para test ✓ lint ✓ build ✓

Regras:
- Considerar impacto em hooks, adapters, páginas e componentes.
- Sempre incluir testes e i18n quando houver texto/regra nova.
- Não escrever código de produção.

---

### [Executor]

Objetivo: implementar exatamente o que está no plano.

Entrada: Markdown gerado pelo Planejador.

Ordem obrigatória de execução:
1. Tipos
2. Services
3. Hooks
4. Componentes/Páginas
5. i18n (pt.ts e en.ts)
6. Testes

Deve:
- Alterar apenas os arquivos definidos no plano.
- Seguir Regras Absolutas, tokens de cor, a11y e padrões de erro.
- Criar/atualizar testes co-localizados conforme o plano.

Critério de conclusão obrigatório:
- Código compatível com:
  - `npm run test:run` passando
  - `npm run lint` sem warnings
  - `npm run build` sem erros

Saída:
- Código final dos arquivos modificados/criados
- Testes correspondentes
- Confirmação explícita: `test ✓ lint ✓ build ✓`

Proibido:
- Mudar arquitetura do plano
- Refatorar fora do escopo
- Usar `any`, `console.*` ou cores hardcoded

---

### [Revisor]

Objetivo: validar a implementação contra o plano e as regras do projeto.

Entrada: plano (`.md`), que deverá ser comparado com o código implementado.

Deve verificar:
- Fluxo arquitetural correto (sem Supabase direto em componente)
- Conformidade com Regras Absolutas e tokens de cor
- i18n completo em pt.ts e en.ts
- Testes cobrindo comportamento (incluindo casos de borda relevantes)
- Se a mudança permitiria passar: test ✓ lint ✓ build ✓

Saída obrigatória:
1. ✅ Itens corretos
2. ❌ Problemas encontrados (ação objetiva para corrigir)
3. 📌 Veredito final:
   - `APROVADO`
   - ou `REPROVADO` + lista mínima de ajustes

Proibido:
- Reimplementar a solução
- Sugerir melhorias fora do escopo do plano

Fluxo:
Se `REPROVADO`, este relatório pode ser usado como nova entrada para `[Planejador]`.