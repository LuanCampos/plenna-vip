# Estratégia de Testes — Plenna VIP

## Objetivos

- **Cobertura 100%** em `src/lib/`, `src/hooks/`, `src/components/`, `src/contexts/`, `src/pages/` (exclusões em `vitest.config.ts`).
- **Testes fortes**: assertions específicas (`toBe(expected)`, `toEqual(...)`); evitar `toBeDefined()`/`toBeTruthy()`.
- **Mocks centralizados** em `@/test/mocks`; nunca UUIDs/entidades inline nos testes.
- **Execução rápida**: configuração do Vitest otimizada para velocidade.

## Execução mais rápida

1. **Pool `threads`**  
   Vitest usa worker threads em vez de processos (forks). Menor overhead de comunicação.

2. **Paralelismo**  
   - `fileParallelism: true`: arquivos de teste rodam em paralelo.  
   - `maxConcurrency: 5`: até 5 testes concorrentes por arquivo (evita picos de CPU).

3. **Timeouts**  
   - `testTimeout: 10000`, `hookTimeout: 10000`: evita que um teste travado segure a suíte.

4. **Comandos**  
   - Desenvolvimento: `npm run test` (watch).  
   - CI/verificação: `npm run test:run`.  
   - Cobertura: `npm run test:coverage`.

5. **Dicas**  
   - Rodar um arquivo: `npx vitest run src/path/to/file.test.ts`.  
   - Manter `setup.ts` enxuto; evitar imports pesados globais.  
   - Preferir mocks enxutos (ex.: `vi.mock('@/lib/supabase')`) em vez de subir dependências reais.

## Mocks centralizados

| Recurso        | Local                    | Uso |
|----------------|--------------------------|-----|
| IDs            | `@/test/mocks` (ids)     | `MOCK_TENANT_ID`, `MOCK_CLIENT_ID`, etc. |
| Entidades      | `@/test/mocks` (entities)| `MOCK_VALID_CLIENT`, `MOCK_CLIENT_ENTITY`, `createMockClient()` |
| Contextos      | `@/test/mocks` (contexts)| `MOCK_TENANT_CONTEXT`, `MOCK_AUTH_CONTEXT`, `MOCK_LANGUAGE_CONTEXT` |
| Sessão/Auth    | `@/test/mocks` (contexts)| `MOCK_USER`, `MOCK_SESSION` para `getSession`/`onAuthStateChange` |
| Segurança      | `@/test/mocks` (security)| `XSS_HTML_PAYLOADS`, `SQL_INJECTION_PAYLOADS`, etc. |
| Browser        | `@/test/mocks` (browser) | `setupConsoleMocks()`, `restoreConsoleMocks()`, `setupMatchMediaMock()` |

## Testes fortes

- **Não use:** `expect(x).toBeDefined()`, `expect(x).toBeTruthy()` como critério de sucesso.
- **Use:** `expect(x).toBe(expected)`, `expect(x).toEqual({ ... })`, `expect(fn).toHaveBeenCalledWith(...)`.
- Cobrir ramos de erro (try/catch, `logger.error`), hooks fora do provider (throw) e edge cases quando fizer sentido.

## Cobertura 100%

- **Thresholds** no `vitest.config.ts`: 99% statements/lines, 95% branches, 97% functions. A meta é **100%**; o que falta são sobretudo ramos defensivos (ex.: `if (!deleteId) return`) e ramos de optional chaining em vários arquivos.
- Para atingir 100% em branches/functions, seria necessário cobrir explicitamente todos os ramos (ex.: hooks com retorno vazio, ternários em Header/Sidebar, early returns em Lists).

## Verificação

Antes de dar por concluída qualquer alteração que afete código testável:

```bash
npx tsc --noEmit
npm run test:run
npm run lint
npm run test:coverage  # deve passar nos thresholds; meta 100%
npm run build
```
