# Guia do Desenvolvedor — Plenna Vip

> **⚠️ LEIA ANTES DE QUALQUER ALTERAÇÃO**

---

## � Verificação Obrigatória (SEMPRE)

**TODA alteração de código DEVE passar pelos comandos abaixo:**

```bash
npx tsc --noEmit        # 1. Verificar tipos ANTES de finalizar
npm run test:run        # 2. Testes devem passar
npm run lint            # 3. Zero warnings
npm run build           # 4. Build deve completar sem erros
```

### Ordem de Execução

1. **Durante desenvolvimento:** Rode `npx tsc --noEmit` frequentemente (a cada 2-3 arquivos criados/alterados)
2. **Antes de finalizar:** Rode a sequência completa: `tsc → test → lint → build`
3. **NÃO avançar** se qualquer comando falhar — corrija antes de continuar

> ⚠️ **Nenhum PR será aceito se qualquer um desses comandos falhar.**

---

## 📋 Checklist de PR

Antes de abrir um PR, verifique:

### Verificação de Tipos (PRIMEIRO)
- [ ] `npx tsc --noEmit` — zero erros de TypeScript
- [ ] Nenhuma variável declarada mas não usada
- [ ] Nenhum `any` implícito ou explícito

### Código
- [ ] `npm run test:run` passa sem falhas
- [ ] `npm run lint` passa com **zero warnings**
- [ ] `npm run build` passa sem erros
- [ ] Sem `console.*` — use `logger` de `@/lib/logger`
- [ ] Sem credenciais hardcoded — use `import.meta.env.*`
- [ ] Arquivos nomeados conforme [Nomenclatura de Componentes](#-nomenclatura-de-componentes)
- [ ] Um componente por arquivo (named export)
- [ ] Tipos explícitos — sem `any` (use `unknown` ou tipo específico)
- [ ] Textos traduzidos em PT e EN (mesma chave, mesma ordem)

---

## 🏗️ Arquitetura

**Stack**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui + Supabase

### Fluxo de Dados (IMPORTANTE)
```
Componente → Hook → Service (Supabase)
```

**Componentes NUNCA chamam Supabase diretamente.** Sempre use hooks que acessam services.

| Camada | Path | Responsabilidade |
|--------|------|------------------|
| Pages | `src/pages/` | Layout, composição, roteamento |
| Components | `src/components/{domain}/` | UI organizada por domínio (appointment, client, service, professional) |
| Hooks | `src/hooks/` | Estado, lógica de negócio, side effects |
| Services | `src/lib/services/` | Wrappers Supabase (appointmentService, clientService) |
| Contexts | `src/contexts/` | Estado global (Auth, Tenant, Theme, Language) |
| Types | `src/types/` | Definições TypeScript (appointment.ts, client.ts, service.ts) |

---

## 📁 Nomenclatura de Componentes

### Sufixos Obrigatórios

| Sufixo | Quando Usar | Exemplo |
|--------|-------------|---------|
| `*FormFields` | Campos de formulário reutilizáveis (sem Dialog) | `ClientFormFields.tsx` |
| `*FormDialog` | Dialog para criar/editar UMA entidade | `AppointmentFormDialog.tsx` |
| `*ListDialog` | Dialog com lista + ações CRUD (abre FormDialog interno) | `ServiceListDialog.tsx` |
| `*SettingsDialog` | Dialog complexo com múltiplas tabs/seções | `TenantSettingsDialog.tsx` |
| `*ViewDialog` | Dialog somente leitura (detalhes) | `AppointmentDetailsDialog.tsx` |
| `*Card` | Exibição compacta de uma entidade | `AppointmentCard.tsx` |
| `*List` | Lista de itens (NÃO em dialog) | `ClientList.tsx` |
| `*Section` | Seção dentro de uma página ou dialog | `ProfileSection.tsx` |
| `*Panel` | Componente autônomo e complexo | `CalendarPanel.tsx` |
| `*Chart` | Visualização gráfica | `RevenueChart.tsx`, `AppointmentsChart.tsx` |
| `*Selector` | Picker inline (não dialog) | `ProfessionalSelector.tsx`, `ServiceSelector.tsx` |
| `*Input` | Componente de input especializado | `PhoneInput.tsx`, `TimeInput.tsx` |
| `*Progress` | Indicador de progresso | `BookingProgress.tsx` |
| `*Calendar` | Visualização de calendário | `WeekCalendar.tsx`, `MonthCalendar.tsx` |

### Confirmações de Exclusão

**Use sempre `ConfirmDialog`** de `@/components/common`:

```tsx
import { ConfirmDialog } from '@/components/common';

<ConfirmDialog
  open={!!deleteId}
  onOpenChange={(open) => !open && setDeleteId(null)}
  onConfirm={() => handleDelete(deleteId)}
  title={t('deleteTitle')}
  description={t('deleteWarning')}
  variant="destructive"
  loading={deleting}
/>
```

**❌ Nunca crie** `Delete*ConfirmDialog`, `*DeleteDialog`, ou similares.

### ❌ Sufixos Proibidos

`*Manager`, `*Container`, `*Wrapper`, `*Form` (para dialogs), `*Modal`, `*Component`

### Outros Arquivos

| Tipo | Padrão | Local |
|------|--------|-------|
| Domain hooks | `use{Domain}.ts` (camelCase) | `src/hooks/` |
| UI hooks | `use-{name}.ts` (kebab-case) | `src/hooks/ui/` |
| Services | `{domain}Service.ts` | `src/lib/services/` |
| Utilitários | `{name}Utils.ts` | `src/lib/utils/` |

---

## 🪟 Padrão de Dialog (OBRIGATÓRIO)

### Estrutura Base

```tsx
<Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="bg-card border-border sm:max-w-md flex flex-col gap-0 p-0 max-h-[90vh] overflow-hidden">
    {/* Header */}
    <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
      <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="h-5 w-5 text-primary" />
        {t('title')}
      </DialogTitle>
    </DialogHeader>
    
    {/* Content - scrollável */}
    <div className="px-6 py-4 overflow-y-auto">
      <div className="space-y-4">{/* Campos */}</div>
    </div>
    
    {/* Footer - fixo */}
    <div className="px-6 py-4 border-t border-border bg-secondary/30 flex gap-2 justify-end">
      <Button variant="outline" onClick={handleClose}>{t('cancel')}</Button>
      <Button onClick={handleSave} disabled={saving}>{t('save')}</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Regras de Dialog

| ✅ Correto | ❌ Errado |
|-----------|----------|
| `<div className="... bg-secondary/30">` no footer | `<DialogFooter>` |
| `<AlertDialogFooter>` em AlertDialogs | `<DialogFooter>` em Dialogs normais |
| `bg-card` no DialogContent | `bg-background` |
| `overflow-hidden` no DialogContent | Sem controle de overflow |

### Tamanhos de Dialog

| Uso | Classe | Quando Usar |
|-----|--------|-------------|
| Confirmações | `sm:max-w-sm` | `ConfirmDialog`, AlertDialogs simples |
| **Padrão** | `sm:max-w-md` | Maioria dos FormDialogs |
| Forms complexos | `sm:max-w-lg` | ListDialogs, forms com muitos campos |
| Listas extensas | `sm:max-w-xl` | ServiceListDialog |
| Settings | `sm:max-w-2xl` | SettingsDialogs com tabs |

---

## 🎨 Tokens de Cor (OBRIGATÓRIO)

**NUNCA use cores hardcoded** como `text-gray-500`, `bg-slate-100`. Use apenas tokens semânticos:

| Uso | Token | Exemplo de Aplicação |
|-----|-------|---------------------|
| Fundo página | `bg-background` | Elemento raiz da página |
| Fundo cards/modais | `bg-card` | `DialogContent`, `Card` |
| Fundo inputs | `bg-secondary/50` | Todos os `Input`, `Select`, `Textarea` |
| Fundo list items | `bg-secondary/50` | Items em listas com hover |
| Hover em listas | `hover:bg-secondary/50` | Botões de ação subtle |
| Texto principal | `text-foreground` | Títulos, labels |
| Texto secundário | `text-muted-foreground` | Descrições, placeholders |
| Bordas | `border-border` | Todas as bordas |
| Ações destructive | `text-destructive` / `bg-destructive` | Botões de deletar |
| Ações primárias | `text-primary` / `bg-primary` | Ícones de título, botões principais |

---

## 📝 Padrão de Formulário

### Campo Básico
```tsx
<div className="space-y-2">
  <Label htmlFor="fieldId" className="text-sm font-medium">{t('label')}</Label>
  <Input 
    id="fieldId"
    className="h-10 bg-secondary/50 border-border" 
    placeholder={t('placeholder')}
  />
</div>
```

### Input com Símbolo de Moeda
```tsx
// Define em src/lib/config/currency.ts
export const CURRENCY_SYMBOL = 'R$'; // ou use context se precisar multi-moeda

// No componente:
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
    <SelectItem value="option1">{t('option1')}</SelectItem>
  </SelectContent>
</Select>
```

---

## 📋 Padrão de Lista

### Item de Lista com Ações

```tsx
<div className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg gap-3 group">
  <div className="min-w-0 flex-1">
    <p className="text-sm text-foreground truncate">{name}</p>
  </div>
  <div className="flex items-center gap-1 flex-shrink-0">
    <span className="text-foreground text-sm font-semibold tabular-nums mr-1">{value}</span>
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => openEditForm(item)}
      className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
      aria-label={t('edit')}
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setDeleteId(item.id)}
      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      aria-label={t('delete')}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>
```

**Observações:**
- Use `aria-label` em botões de ícone para acessibilidade
- Use `truncate` em textos que podem ser longos
- Use `tabular-nums` para valores numéricos alinhados

---

## 🔘 Botões

| Ação | Variant |
|------|---------|
| Principal/Salvar | `default` |
| Cancelar | `outline` |
| Deletar | `destructive` |
| Ícone sutil | `ghost` |

**Com loading:**
```tsx
<Button disabled={loading}>
  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
  {loading ? t('saving') : t('save')}
</Button>
```

---

## 🔤 Ícones (Lucide React)

| Contexto | Tamanho |
|----------|---------|
| Botões | `h-4 w-4` |
| Títulos modal | `h-5 w-5 text-primary` |
| Empty states | `h-6 w-6` |

---

## 🔐 Segurança

| ❌ Proibido | ✅ Correto |
|-------------|------------|
| `console.log(data)` | `logger.debug('context', data)` |
| `const key = 'abc'` | `import.meta.env.VITE_KEY` |
| `.insert(body)` | `.insert(schema.parse(data))` |
| `eval()` | Nunca |
| `dangerouslySetInnerHTML` | Evitar ou sanitizar |
| `localStorage.getItem(x)` | `getSecureStorageItem(x)` |

### Arquivos de Segurança
| Arquivo | Uso |
|---------|-----|
| `src/lib/logger.ts` | Logger estruturado (substitui console) |
| `src/lib/storage/secureStorage.ts` | Acesso seguro ao localStorage |
| `src/lib/validators/` | Schemas Zod para validação de inputs |

### Logger — Uso Correto
```tsx
import { logger } from '@/lib/logger';

// ✅ Correto
logger.debug('appointment.created', { appointmentId, clientId });
logger.error('appointment.failed', { error, payload });

// ❌ Errado
console.log('appointment created', appointmentId);
```

---

## 🛠️ Configurações

**NUNCA hardcode valores de negócio.** Centralize em `src/lib/config/`:

```typescript
// src/lib/config/currency.ts
export const CURRENCY_SYMBOL = 'R$';
export const CURRENCY_CODE = 'BRL';

// src/lib/config/business.ts
export const BOOKING_SLOT_DURATION = 30; // minutos
export const BUSINESS_HOURS = { start: '08:00', end: '20:00' };
export const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// src/lib/config/limits.ts
export const MAX_APPOINTMENTS_PER_DAY = 20;
export const MAX_PHOTOS_PER_SERVICE = 10;
export const MIN_BOOKING_NOTICE_HOURS = 2;
```

**Uso:**
```tsx
import { CURRENCY_SYMBOL } from '@/lib/config/currency';
import { BOOKING_SLOT_DURATION } from '@/lib/config/business';
```

**Benefícios:**
- ✅ Mudanças em um único lugar
- ✅ Prepara para multi-moeda/internacionalização
- ✅ Documenta regras de negócio
- ✅ Facilita testes (mock de configs)

---

## 🌐 i18n

| Idioma | Arquivo |
|--------|---------|
| PT | `src/i18n/translations/pt.ts` |
| EN | `src/i18n/translations/en.ts` |

### Regras de Tradução
1. Adicione chaves em **TODOS** os idiomas simultaneamente
2. Mantenha a **mesma ordem** de chaves em ambos os arquivos
3. Use **camelCase** para nomes de chaves
4. Use `t('chave')` do hook `useLanguage()` nos componentes

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();
// Uso: t('bookings.add'), t('cancel'), t('save'), t('clients.title')
```

---

## 🧹 ESLint

- **Zero warnings** — não introduza novos warnings
- **Todas as dependências** listadas em `useEffect`, `useCallback`, `useMemo`
- **Nunca `any`** — use `unknown` ou tipo específico
- Rode `npm run lint` antes de commits

---

## ♿ Acessibilidade (a11y)

### Regras Obrigatórias

| Elemento | Requisito |
|----------|-----------|
| Botões de ícone | `aria-label={t('ação')}` obrigatório |
| Inputs | `id` + `<Label htmlFor>` pareados |
| Imagens | `alt` descritivo (ou `alt=""` se decorativa) |
| Modais | Focus trap automático (shadcn/ui já provê) |
| Ações destrutivas | Confirmação via `ConfirmDialog` |

### Exemplo Correto
```tsx
<Button 
  variant="ghost" 
  size="icon"
  aria-label={t('edit')}  // ✅ Obrigatório
>
  <Pencil className="h-4 w-4" />
</Button>
```

### Navegação por Teclado
- Dialogs: `Escape` fecha, `Tab` navega entre elementos
- Botões: Devem ser focáveis e ativáveis com `Enter`/`Space`
- Links: Use `<a>` para navegação, `<button>` para ações

---

## ⚠️ Tratamento de Erros

### Notificações com Toast (Sonner)

```tsx
import { toast } from 'sonner';

// ✅ Sucesso
toast.success(t('appointmentCreated'));

// ❌ Erro
toast.error(t('errorSaving'));

// ⚠️ Aviso
toast.warning(t('conflictWarning'));
```

### Padrão Try/Catch em Operações Async

```tsx
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

### Regras de Tratamento de Erros

| Contexto | Ação |
|----------|------|
| Operação do usuário falha | `toast.error()` + `logger.error()` |
| Carregamento inicial falha | Mostrar estado de erro na UI |
| Erro de rede | Mostrar mensagem amigável + `toast.error()` |
| Erro inesperado | `logger.error()` (não expor detalhes ao usuário) |

---

## ⚡ Performance

### Quando Usar Hooks de Memoização

| Hook | Quando Usar |
|------|-------------|
| `useMemo` | Cálculos pesados derivados de props/state |
| `useCallback` | Funções passadas como props para componentes filhos |
| `React.memo` | Componentes que re-renderizam frequentemente com mesmas props |

### Exemplo Correto
```tsx
// ✅ useMemo para cálculos derivados
const chartData = useMemo(() => {
  return months.map(m => ({ label: m.label, value: m.total }));
}, [months]);

// ✅ useCallback para handlers passados como props
const handleDelete = useCallback(async (id: string) => {
  await deleteItem(id);
  refresh();
}, [deleteItem, refresh]);
```

### Quando NÃO Usar
```tsx
// ❌ Não memoize valores simples
const fullName = useMemo(() => `${first} ${last}`, [first, last]); // Desnecessário

// ❌ Não memoize funções que não são passadas como props
const handleLocalClick = useCallback(() => setOpen(true), []); // Desnecessário se usado só localmente
```

### Outras Práticas

| Prática | Como |
|---------|------|
| Listas longas | Considere virtualização (react-virtual) se > 100 items |
| Imagens | Use lazy loading nativo: `loading="lazy"` |
| Code splitting | Já configurado via Vite (dynamic imports se necessário) |

---

## 🧪 Testes

O projeto usa **Vitest** + **Testing Library** para testes automatizados.

### Filosofia de Testes

Testes não existem para "passar". Testes existem para:

1. **Especificar comportamento** — O teste é a documentação executável do que a aplicação deve fazer
2. **Prevenir regressões** — Garantir que mudanças não quebrem funcionalidades existentes
3. **Forçar design** — Código testável tende a ser código melhor estruturado
4. **Dar confiança** — Permitir refatoração e evolução sem medo
5. **Revelar bugs** — Testes agressivos encontram problemas ANTES da produção

> **🚨 REGRA DE OURO:** Quando um teste falha, a PRIMEIRA ação é investigar se o código está errado.
> **NUNCA ajuste o teste para passar sem antes confirmar que o comportamento atual está correto.**

| Situação | Ação Correta | Ação ERRADA |
|----------|--------------|-------------|
| Teste falha, código está errado | Corrigir o código | Ajustar o teste |
| Teste falha, teste está errado | Corrigir o teste | Deletar o teste |
| Teste falha, requisito mudou | Atualizar teste E código | Só ajustar teste |

### Testes Agressivos vs Testes Frágeis

| Teste Fraco ❌ | Teste Forte ✅ |
|---------------|---------------|
| `expect(result).toBeDefined()` | `expect(result).toBe(expectedValue)` |
| `expect(result).toBeTruthy()` | `expect(result).toEqual({ ...exactShape })` |
| Testa implementação interna | Testa comportamento observável |
| Ignora edge cases | Cobre limites e casos extremos |
| Confia em inputs sempre válidos | Testa inputs maliciosos |
| Happy path only | Testa erros, timeouts, falhas |

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

### Comandos

```bash
npm run test          # Modo watch (desenvolvimento)
npm run test:run      # Execução única (CI)
npm run test:coverage # Com relatório de cobertura
```

### Convenções

| Regra | Exemplo |
|-------|---------|
| Arquivos co-localizados | `formatters.ts` → `formatters.test.ts` |
| Nomenclatura | `*.test.ts` ou `*.test.tsx` |
| Descrições em inglês | `describe('formatCurrency', ...)` |

### O que Testar (Prioridade)

1. **Validação de Inputs** — `validators/`, schemas Zod
2. **Funções utilitárias** — `formatters.ts`, `dateUtils.ts`, `timeUtils.ts`
3. **Storage seguro** — `secureStorage.ts` (incluir testes de XSS)
4. **Logger** — `logger.ts`
5. **Segurança** — `security.test.ts` (ataques: XSS, SQL Injection, NoSQL Injection, Prototype Pollution, Path Traversal, Command Injection, LDAP Injection, ReDoS, SSRF, JSON Injection, CRLF, Template Injection, Buffer Overflow, Unicode, Polyglot)
6. **Componentes** — Usar `@testing-library/react` para renderização e interação
7. **Hooks** — Usar `renderHook` do Testing Library com mocks de contexto

### O que NÃO Testar (por enquanto)

| Camada | Razão |
|--------|-------|
| **Services** (`appointmentService`, etc.) | Chamam Supabase diretamente, melhor para testes de integração |

### Checklist para Novos Testes

- [ ] Arquivo co-localizado: `arquivo.ts` → `arquivo.test.ts`
- [ ] Importar `describe`, `it`, `expect` de `vitest`
- [ ] Usar `beforeEach` para setup/cleanup
- [ ] Testar casos de sucesso E falha
- [ ] Para segurança: testar payloads maliciosos (XSS, SQL injection)
- [ ] Rodar `npm run test:run` antes de commit

---

## ⛔ Resumo: NÃO Faça

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| Chamar Supabase de componentes | Use hooks + services |
| Arquivos na raiz de `components/` | Use subpastas por domínio (appointment, client, service) |
| Inventar sufixos de componentes | Use a [taxonomia](#sufixos-obrigatórios) |
| `export default` | Named exports: `export const Component` |
| Múltiplos componentes por arquivo | Um componente por arquivo |
| `any` | `unknown` ou tipo específico |
| `console.*` | `logger.*` |
| `DialogFooter` em Dialogs | Div estilizada com `bg-secondary/30` |
| `AlertDialogFooter` fora de AlertDialogs | Use apenas em AlertDialogs |
| Cores hardcoded (`text-gray-500`) | Tokens semânticos (`text-muted-foreground`) |
| `localStorage.getItem` | `getSecureStorageItem` |
| Valores hardcoded (`'R$'`, `30`) | Constantes em `src/lib/config/` |

---

## 🛠️ Comandos

### Desenvolvimento
```bash
npm run dev           # Dev server (porta 8080)
npm run preview       # Preview do build
npm run test          # Testes em modo watch
```

### ✅ Verificação Obrigatória (rodar ANTES de todo commit/PR)
```bash
npx tsc --noEmit        # 1. Verificar tipos TypeScript
npm run test:run        # 2. Testes devem passar
npm run lint            # 3. Zero warnings
npm run build           # 4. Build sem erros
npm run test:coverage   # (opcional) Cobertura de testes
```

> **⚠️ Os quatro comandos de verificação (tsc, test:run, lint, build) são OBRIGATÓRIOS antes de qualquer commit.**

---

*Se parece errado ou inseguro, provavelmente é. Pergunte antes de prosseguir*
