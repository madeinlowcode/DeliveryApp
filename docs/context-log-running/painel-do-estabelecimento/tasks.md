# Lista de Tarefas: FEAT-002 - Painel do Estabelecimento

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Pesquisa](research.md) - Documentacao e referencias

**Total: 90 tasks | Complexidade: Media-Alta**

---

## Legenda

- :building_construction: Setup/Arquitetura
- :floppy_disk: Database/Backend
- :art: Frontend/UI
- :white_check_mark: Testes
- :page_facing_up: Documentacao
- :lock: Seguranca/Validacao
- :scroll: Auditoria/Logging
- :rotating_light: Error Handling
- :zap: Performance/Cache
- :memo: Logger

---

## 1. Setup e Configuracao (12 tasks)

- [ ] :building_construction: **TASK-001:** Instalar dependencias do projeto: `@supabase/supabase-js @supabase/ssr zustand zod react-hook-form @hookform/resolvers @dnd-kit/core @dnd-kit/sortable date-fns sonner`
- [ ] :building_construction: **TASK-002:** Instalar dependencias de desenvolvimento: `vitest @testing-library/react @playwright/test msw prettier-plugin-tailwindcss`
- [ ] :building_construction: **TASK-003:** Configurar ESLint com flat config em `eslint.config.mjs` estendendo next/core-web-vitals e prettier
- [ ] :building_construction: **TASK-004:** Criar arquivo `.prettierrc` com semi:false, singleQuote:true, plugin tailwindcss
- [ ] :building_construction: **TASK-005:** Instalar e configurar Husky com `npx husky init`
- [ ] :building_construction: **TASK-006:** Criar hook `.husky/pre-commit` executando lint-staged
- [ ] :building_construction: **TASK-007:** Adicionar configuracao lint-staged no `package.json` para arquivos .ts,.tsx,.json,.md
- [ ] :building_construction: **TASK-008:** Criar arquivo `.env.example` com variaveis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- [ ] :building_construction: **TASK-009:** Instalar componentes shadcn/ui: `npx shadcn@latest add button card dialog dropdown-menu form input label select sheet switch table tabs textarea toast`
- [ ] :building_construction: **TASK-010:** Criar arquivo `src/lib/utils.ts` com funcao cn() usando clsx e tailwind-merge
- [ ] :building_construction: **TASK-011:** Criar arquivo `src/lib/constants.ts` com ORDER_STATUSES array e PAYMENT_METHODS
- [ ] :building_construction: **TASK-012:** Configurar Playwright com `npx playwright install` e criar `playwright.config.ts` apontando para localhost:3000

---

## 2. Supabase Setup (8 tasks)

- [ ] :floppy_disk: **TASK-013:** Criar cliente Supabase para browser em `src/lib/supabase/client.ts` usando createBrowserClient
- [ ] :floppy_disk: **TASK-014:** Criar cliente Supabase para server em `src/lib/supabase/server.ts` usando createServerClient com cookies
- [ ] :floppy_disk: **TASK-015:** Criar cliente Supabase admin em `src/lib/supabase/admin.ts` usando SUPABASE_SERVICE_ROLE_KEY
- [ ] :floppy_disk: **TASK-016:** Criar middleware de autenticacao em `src/middleware.ts` verificando sessao e redirecionando para /login
- [ ] :floppy_disk: **TASK-017:** Criar migration SQL para tabela `tenants` com campos id, slug, name, logo_url, phone, address, min_order_value, welcome_message, closed_message
- [ ] :floppy_disk: **TASK-018:** Criar migration SQL para tabela `users` com campos id (ref auth.users), tenant_id, email, name, role
- [ ] :floppy_disk: **TASK-019:** Criar funcao SQL `get_user_tenant_id()` que retorna tenant_id do usuario autenticado
- [ ] :floppy_disk: **TASK-020:** Criar RLS policies para tabelas users e tenants permitindo acesso apenas ao proprio tenant

---

## 3. Database - Cardapio (8 tasks)

- [ ] :floppy_disk: **TASK-021:** Criar migration SQL para tabela `categories` com campos id, tenant_id, name, description, image_url, sort_order, is_active
- [ ] :floppy_disk: **TASK-022:** Criar migration SQL para tabela `products` com campos id, tenant_id, category_id, name, description, price, image_url, is_available, sort_order
- [ ] :floppy_disk: **TASK-023:** Criar migration SQL para tabela `product_variations` com campos id, product_id, name, price_modifier, sort_order
- [ ] :floppy_disk: **TASK-024:** Criar migration SQL para tabela `product_addons` com campos id, product_id, name, price, is_available
- [ ] :floppy_disk: **TASK-025:** Criar RLS policies para tabela categories: SELECT, INSERT, UPDATE, DELETE filtrados por tenant_id
- [ ] :floppy_disk: **TASK-026:** Criar RLS policies para tabela products filtrados por tenant_id
- [ ] :floppy_disk: **TASK-027:** Criar RLS policies para tabelas product_variations e product_addons via join com products
- [ ] :floppy_disk: **TASK-028:** Criar arquivo `src/types/database.ts` com tipos TypeScript para todas as tabelas (Category, Product, ProductVariation, ProductAddon)

---

## 4. Database - Pedidos (6 tasks)

- [ ] :floppy_disk: **TASK-029:** Criar migration SQL para tabela `customers` com campos id, tenant_id, phone, name e constraint UNIQUE(tenant_id, phone)
- [ ] :floppy_disk: **TASK-030:** Criar migration SQL para tabela `customer_addresses` com campos id, customer_id, street, number, complement, neighborhood, city, is_default
- [ ] :floppy_disk: **TASK-031:** Criar migration SQL para tabela `orders` com campos id, tenant_id, customer_id, order_number (SERIAL), status, delivery_address, payment_method, subtotal, delivery_fee, total, notes
- [ ] :floppy_disk: **TASK-032:** Criar migration SQL para tabela `order_items` com campos id, order_id, product_id, product_name, quantity, unit_price, variations (JSONB), addons (JSONB)
- [ ] :floppy_disk: **TASK-033:** Criar RLS policies para tabelas orders e order_items filtrados por tenant_id
- [ ] :floppy_disk: **TASK-034:** Adicionar tabela orders ao Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE orders`

---

## 5. Database - Configuracoes (4 tasks)

- [ ] :floppy_disk: **TASK-035:** Criar migration SQL para tabela `business_hours` com campos id, tenant_id, day_of_week (0-6), open_time, close_time, is_closed
- [ ] :floppy_disk: **TASK-036:** Criar migration SQL para tabela `payment_methods` com campos id, tenant_id, name, type (cash/credit/debit/pix), is_active
- [ ] :floppy_disk: **TASK-037:** Criar RLS policies para tabelas business_hours e payment_methods
- [ ] :floppy_disk: **TASK-038:** Criar bucket `pedeai-images` no Supabase Storage com policies de upload autenticado e leitura publica

---

## 6. Layout e Autenticacao (8 tasks)

- [ ] :art: **TASK-039:** Criar componente `src/components/shared/app-sidebar.tsx` com navegacao: Dashboard, Cardapio, Configuracoes
- [ ] :art: **TASK-040:** Criar componente `src/components/shared/header.tsx` com logo do tenant e dropdown de usuario
- [ ] :art: **TASK-041:** Criar componente `src/components/features/auth/user-nav.tsx` com avatar, nome e botao logout
- [ ] :art: **TASK-042:** Criar layout autenticado em `src/app/(auth)/layout.tsx` usando SidebarProvider do shadcn e verificando sessao
- [ ] :art: **TASK-043:** Criar pagina de login em `src/app/(public)/login/page.tsx` com formulario email/senha
- [ ] :art: **TASK-044:** Criar componente `src/components/features/auth/login-form.tsx` com react-hook-form e validacao zod
- [ ] :art: **TASK-045:** Criar API route `src/app/api/auth/callback/route.ts` para callback do Supabase Auth
- [ ] :art: **TASK-046:** Implementar logica de login no login-form chamando supabase.auth.signInWithPassword

---

## 7. Kanban - Componentes (10 tasks)

- [ ] :art: **TASK-047:** Criar tipo `OrderStatus` em `src/types/order.ts` com valores: confirmed, preparing, ready, out_for_delivery, delivered
- [ ] :art: **TASK-048:** Criar service `src/services/orders.service.ts` com metodos: getOrders(), updateOrderStatus(id, status)
- [ ] :art: **TASK-049:** Criar hook `src/hooks/use-orders.ts` que busca pedidos do tenant usando SWR ou React Query
- [ ] :art: **TASK-050:** Criar hook `src/hooks/use-realtime-orders.ts` que subscribe a mudancas na tabela orders via Supabase Realtime
- [ ] :art: **TASK-051:** Criar componente `src/components/features/kanban/kanban-board.tsx` com DndContext do @dnd-kit e 5 colunas
- [ ] :art: **TASK-052:** Criar componente `src/components/features/kanban/kanban-column.tsx` com useDroppable e lista de cards
- [ ] :art: **TASK-053:** Criar componente `src/components/features/kanban/kanban-card.tsx` com useDraggable mostrando numero, cliente, valor
- [ ] :art: **TASK-054:** Criar componente `src/components/features/kanban/order-details-sheet.tsx` usando Sheet do shadcn com detalhes completos do pedido
- [ ] :art: **TASK-055:** Criar hook `src/hooks/use-sound.ts` para tocar som de notificacao ao receber novo pedido
- [ ] :art: **TASK-056:** Criar pagina do dashboard em `src/app/(auth)/dashboard/page.tsx` renderizando KanbanBoard

---

## 8. CRUD Categorias (8 tasks)

- [ ] :art: **TASK-057:** Criar service `src/services/categories.service.ts` com metodos: getAll(), create(), update(), delete(), reorder()
- [ ] :art: **TASK-058:** Criar validador Zod em `src/lib/validators/category.ts` para CategoryFormData com name (required), description, imageUrl
- [ ] :art: **TASK-059:** Criar hook `src/hooks/use-categories.ts` com CRUD de categorias e mutacoes
- [ ] :art: **TASK-060:** Criar componente `src/components/features/cardapio/categories/category-card.tsx` com imagem, nome e acoes (editar, excluir)
- [ ] :art: **TASK-061:** Criar componente `src/components/features/cardapio/categories/category-form.tsx` com react-hook-form, upload de imagem
- [ ] :art: **TASK-062:** Criar componente `src/components/features/cardapio/categories/category-list.tsx` com grid de cards e drag-to-reorder
- [ ] :art: **TASK-063:** Criar pagina de categorias em `src/app/(auth)/cardapio/categorias/page.tsx` com lista e botao nova categoria
- [ ] :art: **TASK-064:** Criar pagina de edicao de categoria em `src/app/(auth)/cardapio/categorias/[id]/page.tsx`

---

## 9. CRUD Produtos (10 tasks)

- [ ] :art: **TASK-065:** Criar service `src/services/products.service.ts` com metodos: getAll(), getById(), create(), update(), delete(), toggleAvailability()
- [ ] :art: **TASK-066:** Criar validador Zod em `src/lib/validators/product.ts` para ProductFormData com name, description, price, categoryId, variations, addons
- [ ] :art: **TASK-067:** Criar hook `src/hooks/use-products.ts` com CRUD de produtos e mutacoes
- [ ] :art: **TASK-068:** Criar componente `src/components/features/cardapio/products/product-card.tsx` com imagem, nome, preco, badge disponibilidade
- [ ] :art: **TASK-069:** Criar componente `src/components/features/cardapio/products/variation-manager.tsx` para adicionar/remover variacoes no form
- [ ] :art: **TASK-070:** Criar componente `src/components/features/cardapio/products/addon-manager.tsx` para adicionar/remover adicionais no form
- [ ] :art: **TASK-071:** Criar componente `src/components/features/cardapio/products/product-form.tsx` completo com variacoes e adicionais
- [ ] :art: **TASK-072:** Criar componente `src/components/shared/image-upload.tsx` que gera signed URL e faz upload para Supabase Storage
- [ ] :art: **TASK-073:** Criar pagina de produtos em `src/app/(auth)/cardapio/produtos/page.tsx` com tabela/grid e filtro por categoria
- [ ] :art: **TASK-074:** Criar pagina de edicao de produto em `src/app/(auth)/cardapio/produtos/[id]/page.tsx`

---

## 10. Configuracoes (6 tasks)

- [ ] :art: **TASK-075:** Criar service `src/services/settings.service.ts` com metodos: getTenantSettings(), updateTenantSettings(), getBusinessHours(), updateBusinessHours()
- [ ] :art: **TASK-076:** Criar componente `src/components/features/settings/general-form.tsx` com nome, telefone, endereco, pedido minimo, mensagens
- [ ] :art: **TASK-077:** Criar componente `src/components/features/settings/logo-upload.tsx` especifico para logo do estabelecimento
- [ ] :art: **TASK-078:** Criar componente `src/components/features/settings/business-hours-form.tsx` com 7 linhas (dom-sab) e campos horario abertura/fechamento
- [ ] :art: **TASK-079:** Criar componente `src/components/features/settings/payment-methods-form.tsx` com checkboxes para formas de pagamento
- [ ] :art: **TASK-080:** Criar pagina de configuracoes em `src/app/(auth)/configuracoes/page.tsx` com tabs: Geral, Horarios, Pagamentos

---

## 11. API Routes (6 tasks)

- [ ] :floppy_disk: **TASK-081:** Criar API route `src/app/api/orders/route.ts` com GET (listar) usando Supabase server client
- [ ] :floppy_disk: **TASK-082:** Criar API route `src/app/api/orders/[id]/route.ts` com PATCH (atualizar status)
- [ ] :floppy_disk: **TASK-083:** Criar API route `src/app/api/categories/route.ts` com GET e POST
- [ ] :floppy_disk: **TASK-084:** Criar API route `src/app/api/categories/[id]/route.ts` com PATCH e DELETE
- [ ] :floppy_disk: **TASK-085:** Criar API route `src/app/api/products/route.ts` com GET e POST incluindo variacoes e adicionais
- [ ] :floppy_disk: **TASK-086:** Criar API route `src/app/api/upload/signed-url/route.ts` que gera URL assinada para upload no Storage

---

## 12. Mocks e Dados de Teste (4 tasks)

- [ ] :floppy_disk: **TASK-087:** Criar arquivo `src/mocks/data/categories.ts` com 5 categorias mockadas (Pizzas, Lanches, Bebidas, Sobremesas, Combos)
- [ ] :floppy_disk: **TASK-088:** Criar arquivo `src/mocks/data/products.ts` com 15 produtos mockados distribuidos nas categorias
- [ ] :floppy_disk: **TASK-089:** Criar arquivo `src/mocks/data/orders.ts` com 10 pedidos mockados em diferentes status
- [ ] :floppy_disk: **TASK-090:** Criar handlers MSW em `src/mocks/handlers.ts` para interceptar chamadas de API em testes

---

## 13. Testes Unitarios (8 tasks)

- [ ] :white_check_mark: **TASK-091:** Configurar Vitest em `vitest.config.ts` com environment jsdom e setup file
- [ ] :white_check_mark: **TASK-092:** Criar teste unitario para `orders.service.ts` verificando getOrders retorna pedidos do tenant
- [ ] :white_check_mark: **TASK-093:** Criar teste unitario para `orders.service.ts` verificando updateOrderStatus valida transicoes permitidas
- [ ] :white_check_mark: **TASK-094:** Criar teste unitario para `categories.service.ts` verificando CRUD completo
- [ ] :white_check_mark: **TASK-095:** Criar teste unitario para `products.service.ts` verificando criacao com variacoes e adicionais
- [ ] :white_check_mark: **TASK-096:** Criar teste unitario para validador `category.ts` verificando rejeicao de nome vazio
- [ ] :white_check_mark: **TASK-097:** Criar teste unitario para validador `product.ts` verificando preco deve ser positivo
- [ ] :white_check_mark: **TASK-098:** Criar teste de componente para `kanban-card.tsx` verificando renderizacao de dados do pedido

---

## 14. Testes E2E (6 tasks)

- [ ] :white_check_mark: **TASK-099:** Criar Page Object `tests/e2e/pages/login.page.ts` com metodos goto() e login(email, password)
- [ ] :white_check_mark: **TASK-100:** Criar Page Object `tests/e2e/pages/dashboard.page.ts` com metodos para interagir com kanban
- [ ] :white_check_mark: **TASK-101:** Criar teste E2E `tests/e2e/specs/auth.spec.ts` verificando login com credenciais validas redireciona para dashboard
- [ ] :white_check_mark: **TASK-102:** Criar teste E2E `tests/e2e/specs/kanban.spec.ts` verificando drag-and-drop atualiza status do pedido
- [ ] :white_check_mark: **TASK-103:** Criar teste E2E `tests/e2e/specs/categories.spec.ts` verificando criacao e edicao de categoria
- [ ] :white_check_mark: **TASK-104:** Criar teste E2E `tests/e2e/specs/products.spec.ts` verificando criacao de produto com variacoes

---

## 15. Documentacao (2 tasks)

- [ ] :page_facing_up: **TASK-105:** Atualizar README.md com secao sobre FEAT-002 incluindo setup do Supabase e variaveis de ambiente
- [ ] :page_facing_up: **TASK-106:** Criar seed script em `scripts/seed.ts` para popular banco com dados de teste de um tenant demo

---

## 16. Seguranca e Validacao (8 tasks)

- [ ] :lock: **TASK-107:** Criar middleware `src/lib/security/rate-limiter.ts` com rate limiting de 60 req/min por usuario
- [ ] :lock: **TASK-108:** Criar funcao `sanitizeInput()` em `src/lib/security/sanitize.ts` para limpar strings contra XSS
- [ ] :lock: **TASK-109:** Criar funcao `sanitizeObject()` que sanitiza recursivamente todos os campos string de um objeto
- [ ] :lock: **TASK-110:** Criar funcao `isValidUUID()` para validar IDs antes de queries no banco
- [ ] :lock: **TASK-111:** Adicionar headers de seguranca no `next.config.js` (X-Frame-Options, CSP, X-Content-Type-Options)
- [ ] :lock: **TASK-112:** Implementar validacao server-side com Zod em todas as API routes (categories, products, orders)
- [ ] :lock: **TASK-113:** Implementar optimistic locking usando campo `updated_at` para evitar sobrescrita de edicoes
- [ ] :lock: **TASK-114:** Criar hook `use-session-timeout.ts` que faz logout apos 24h de inatividade e refresh a cada 1h

---

## 17. Auditoria e Logging (6 tasks)

- [ ] :scroll: **TASK-115:** Criar migration SQL para tabela `audit_logs` com campos tenant_id, user_id, user_email, action, entity_type, entity_id, entity_name, changes (JSONB), ip_address, created_at
- [ ] :scroll: **TASK-116:** Criar indices na tabela `audit_logs` para queries por tenant_id + created_at e entity_type + entity_id
- [ ] :scroll: **TASK-117:** Criar service `src/services/audit.service.ts` com funcao `logAudit(action, entityType, entityId, changes)`
- [ ] :scroll: **TASK-118:** Criar funcao `calculateChanges(oldData, newData)` no audit.service que retorna diff entre objetos
- [ ] :scroll: **TASK-119:** Adicionar chamadas de `logAudit()` em todas as operacoes de CRUD de categories, products e settings
- [ ] :scroll: **TASK-120:** Criar componente `src/components/features/settings/audit-log-viewer.tsx` com tabela paginada de historico

---

## 18. Error Handling e UX (6 tasks)

- [ ] :rotating_light: **TASK-121:** Criar componente `src/components/shared/error-boundary.tsx` que captura erros de renderizacao e exibe fallback
- [ ] :rotating_light: **TASK-122:** Criar hook `src/hooks/use-api-error.ts` que padroniza tratamento de erros de API com toast
- [ ] :rotating_light: **TASK-123:** Implementar retry automatico com backoff exponencial no hook `use-api-error` (3 tentativas)
- [ ] :rotating_light: **TASK-124:** Criar componente `src/components/shared/offline-indicator.tsx` que detecta perda de conexao
- [ ] :rotating_light: **TASK-125:** Adicionar skeleton loading em todas as paginas de listagem (categories, products, dashboard)
- [ ] :rotating_light: **TASK-126:** Criar componente `src/components/shared/confirm-dialog.tsx` para confirmacao de exclusao com mensagem customizada

---

## 19. Performance e Cache (4 tasks)

- [ ] :zap: **TASK-127:** Configurar SWR ou React Query com cache de 5 minutos para listagem de categorias e produtos
- [ ] :zap: **TASK-128:** Adicionar debounce de 300ms nas operacoes de reorder (drag and drop) para evitar multiplas chamadas
- [ ] :zap: **TASK-129:** Implementar compressao de imagens antes do upload usando canvas (max 500KB, formato WebP)
- [ ] :zap: **TASK-130:** Criar indices SQL adicionais para queries frequentes: `(tenant_id, status)` em orders, `(tenant_id, category_id)` em products

---

## 20. Logger Estruturado (2 tasks)

- [ ] :memo: **TASK-131:** Criar `src/lib/logger.ts` com funcoes debug, info, warn, error que outputam JSON estruturado
- [ ] :memo: **TASK-132:** Adicionar logs em todas as API routes para requests, erros e operacoes importantes

---

## Resumo de Tasks

| Categoria                       | Quantidade   |
| ------------------------------- | ------------ |
| :building_construction: Setup   | 12 tasks     |
| :floppy_disk: Database/Backend  | 32 tasks     |
| :art: Frontend                  | 42 tasks     |
| :white_check_mark: Testes       | 14 tasks     |
| :page_facing_up: Docs           | 2 tasks      |
| :lock: Seguranca                | 8 tasks      |
| :scroll: Auditoria              | 6 tasks      |
| :rotating_light: Error Handling | 6 tasks      |
| :zap: Performance               | 4 tasks      |
| :memo: Logger                   | 2 tasks      |
| **TOTAL**                       | **90 tasks** |

**Complexidade:** Media-Alta
**Estimativa:** 4-5 dias de desenvolvimento

---

**Gerado automaticamente por:** sprint-context-generator skill
**Atualizado por:** software-engineer skill (analise de qualidade)
**Data:** 2026-02-05
