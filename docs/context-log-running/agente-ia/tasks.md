# Lista de Tarefas: FEAT-003 - Agente IA

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Pesquisa](research.md) - Documentacao e referencias

**Total: 70 tasks | Complexidade: Media-Alta**

---

## Legenda

- :building_construction: Setup/Arquitetura
- :floppy_disk: Backend/Services
- :robot: IA/Tools
- :white_check_mark: Testes
- :lock: Seguranca/Validacao
- :test_tube: Mocks/Fixtures
- :chart_with_upwards_trend: Observabilidade
- :rotating_light: Error Handling
- :page_facing_up: Documentacao

---

## 1. Setup e Configuracao (6 tasks)

- [ ] :building_construction: **TASK-001:** Instalar dependencias de IA: `ai @ai-sdk/openai`
- [ ] :building_construction: **TASK-002:** Adicionar variavel OPENROUTER_API_KEY no `.env.example` e `.env.local`
- [ ] :building_construction: **TASK-003:** Criar arquivo `src/lib/ai/provider.ts` configurando OpenRouter com createOpenAI e baseURL
- [ ] :building_construction: **TASK-004:** Criar arquivo `src/lib/ai/types.ts` com tipos ChatMessage, ToolCall, ToolOutput
- [ ] :building_construction: **TASK-005:** Criar arquivo `src/types/cart.ts` com tipos CartItem, Cart, CartAddItemInput
- [ ] :building_construction: **TASK-006:** Criar diretorio `src/app/api/chat/tools/` para organizar as tools

---

## 2. Services de Suporte (8 tasks)

- [ ] :floppy_disk: **TASK-007:** Criar service `src/services/ai-menu.service.ts` com funcao getActiveCategories(tenantId) retornando categorias ativas
- [ ] :floppy_disk: **TASK-008:** Adicionar funcao getProductsByCategory(tenantId, categoryId) no ai-menu.service retornando produtos com variacoes e adicionais
- [ ] :floppy_disk: **TASK-009:** Adicionar funcao getProductById(tenantId, productId) no ai-menu.service retornando produto completo
- [ ] :floppy_disk: **TASK-010:** Adicionar funcao isBusinessOpen(tenantId) no ai-menu.service verificando horario de funcionamento atual
- [ ] :floppy_disk: **TASK-011:** Adicionar funcao getBusinessHoursMessage(tenantId) no ai-menu.service retornando mensagem de horario
- [ ] :floppy_disk: **TASK-012:** Criar service `src/services/ai-order.service.ts` com funcao createOrder(orderData) que insere pedido no banco
- [ ] :floppy_disk: **TASK-013:** Adicionar funcao getOrderByNumber(tenantId, orderNumber) no ai-order.service para consultar status
- [ ] :floppy_disk: **TASK-014:** Adicionar funcao findOrCreateCustomer(tenantId, phone, name) no ai-order.service para gerenciar clientes

---

## 3. Cart Manager (6 tasks)

- [ ] :floppy_disk: **TASK-015:** Criar arquivo `src/lib/cart/cart-store.ts` com Map<string, Cart> para armazenar carrinhos por sessionId
- [ ] :floppy_disk: **TASK-016:** Criar classe CartManager em `src/lib/cart/cart-manager.ts` com getInstance(sessionId) retornando instancia
- [ ] :floppy_disk: **TASK-017:** Implementar metodo addItem(item) no CartManager que adiciona item e recalcula totais
- [ ] :floppy_disk: **TASK-018:** Implementar metodo removeItem(itemId) no CartManager que remove item e recalcula totais
- [ ] :floppy_disk: **TASK-019:** Implementar metodo getCart() no CartManager retornando Cart com items, subtotal, deliveryFee, total
- [ ] :floppy_disk: **TASK-020:** Implementar metodo clear() no CartManager que limpa carrinho apos checkout

---

## 4. System Prompt (3 tasks)

- [ ] :robot: **TASK-021:** Criar arquivo `src/lib/ai/system-prompt.ts` com funcao generateSystemPrompt(tenant: Tenant)
- [ ] :robot: **TASK-022:** Implementar secao de IDENTIDADE no system prompt com nome do estabelecimento
- [ ] :robot: **TASK-023:** Implementar secao de REGRAS e FLUXO DE ATENDIMENTO no system prompt com instrucoes detalhadas

---

## 5. Tools - Cardapio (6 tasks)

- [ ] :robot: **TASK-024:** Criar tool getCategories em `src/app/api/chat/tools/get-categories.ts` usando z.object({}) como parametros
- [ ] :robot: **TASK-025:** Implementar execute da tool getCategories chamando ai-menu.service.getActiveCategories
- [ ] :robot: **TASK-026:** Criar tool getProducts em `src/app/api/chat/tools/get-products.ts` com parametro categoryId: z.string()
- [ ] :robot: **TASK-027:** Implementar execute da tool getProducts chamando ai-menu.service.getProductsByCategory e formatando variacoes/adicionais
- [ ] :robot: **TASK-028:** Criar tool checkBusinessHours em `src/app/api/chat/tools/check-hours.ts` sem parametros
- [ ] :robot: **TASK-029:** Implementar execute da tool checkBusinessHours retornando { isOpen, message, nextOpenTime }

---

## 6. Tools - Carrinho (6 tasks)

- [ ] :robot: **TASK-030:** Criar tool addToCart em `src/app/api/chat/tools/add-to-cart.ts` com parametros productId, quantity, variationId, addonIds, notes
- [ ] :robot: **TASK-031:** Implementar execute da tool addToCart validando produto, calculando preco e adicionando ao CartManager
- [ ] :robot: **TASK-032:** Criar tool removeFromCart em `src/app/api/chat/tools/remove-from-cart.ts` com parametro cartItemId: z.string()
- [ ] :robot: **TASK-033:** Implementar execute da tool removeFromCart chamando CartManager.removeItem
- [ ] :robot: **TASK-034:** Criar tool getCart em `src/app/api/chat/tools/get-cart.ts` sem parametros
- [ ] :robot: **TASK-035:** Implementar execute da tool getCart retornando carrinho completo do CartManager

---

## 7. Tools - Pedido (4 tasks)

- [ ] :robot: **TASK-036:** Criar tool checkout em `src/app/api/chat/tools/checkout.ts` com parametros customerPhone, customerName, deliveryAddress, paymentMethod
- [ ] :robot: **TASK-037:** Implementar execute da tool checkout: verificar horario, validar carrinho, criar pedido, limpar carrinho
- [ ] :robot: **TASK-038:** Criar tool getOrderStatus em `src/app/api/chat/tools/get-order-status.ts` com parametro orderNumber: z.number()
- [ ] :robot: **TASK-039:** Implementar execute da tool getOrderStatus consultando pedido e retornando status formatado

---

## 8. API Route Principal (5 tasks)

- [ ] :robot: **TASK-040:** Criar arquivo `src/app/api/chat/tools/index.ts` exportando todas as tools
- [ ] :robot: **TASK-041:** Criar API route `src/app/api/chat/route.ts` com funcao POST recebendo messages, tenantSlug, sessionId
- [ ] :robot: **TASK-042:** Implementar carregamento do tenant por slug no route.ts usando getTenantBySlug
- [ ] :robot: **TASK-043:** Implementar chamada streamText com provider OpenRouter, system prompt e todas as tools
- [ ] :robot: **TASK-044:** Configurar maxSteps: 5 no streamText para permitir multiplas tool calls em sequencia

---

## 9. Testes Unitarios (8 tasks)

- [ ] :white_check_mark: **TASK-045:** Criar teste unitario para CartManager.addItem verificando calculo de preco com variacao e adicionais
- [ ] :white_check_mark: **TASK-046:** Criar teste unitario para CartManager.removeItem verificando recalculo de totais
- [ ] :white_check_mark: **TASK-047:** Criar teste unitario para CartManager.clear verificando reset do carrinho
- [ ] :white_check_mark: **TASK-048:** Criar teste unitario para tool getCategories verificando retorno de categorias ativas
- [ ] :white_check_mark: **TASK-049:** Criar teste unitario para tool getProducts verificando filtro por categoria e formato de retorno
- [ ] :white_check_mark: **TASK-050:** Criar teste unitario para tool addToCart verificando validacao de produto inexistente
- [ ] :white_check_mark: **TASK-051:** Criar teste unitario para tool checkout verificando validacao de carrinho vazio
- [ ] :white_check_mark: **TASK-052:** Criar teste unitario para generateSystemPrompt verificando inclusao de dados do tenant

---

## 10. Seguranca e Validacao (6 tasks)

- [ ] :lock: **TASK-053:** Criar middleware `src/lib/security/rate-limiter.ts` com rate limiting de 30 req/min por IP
- [ ] :lock: **TASK-054:** Criar validador `src/lib/security/validators.ts` com funcao validateSessionId (UUID v4 valido)
- [ ] :lock: **TASK-055:** Adicionar funcao sanitizeInput em validators.ts para sanitizar strings contra XSS/injection
- [ ] :lock: **TASK-056:** Implementar timeout de 30s nas chamadas ao OpenRouter com AbortController
- [ ] :lock: **TASK-057:** Criar logger estruturado `src/lib/logger.ts` com niveis debug/info/warn/error e output JSON
- [ ] :lock: **TASK-058:** Implementar recalculo e validacao de precos no checkout (funcao validateCartItems)

---

## 11. Mocks e Dados de Teste (4 tasks)

- [ ] :test_tube: **TASK-059:** Criar mock `tests/mocks/ai-menu.service.mock.ts` com dados de categorias e produtos de teste
- [ ] :test_tube: **TASK-060:** Criar mock `tests/mocks/cart-manager.mock.ts` para testes isolados de tools
- [ ] :test_tube: **TASK-061:** Criar fixtures `tests/fixtures/products.fixture.ts` com produtos, variacoes e adicionais de exemplo
- [ ] :test_tube: **TASK-062:** Criar mock `tests/mocks/openrouter.mock.ts` para testes de integracao sem consumir API

---

## 12. Observabilidade (4 tasks)

- [ ] :chart_with_upwards_trend: **TASK-063:** Adicionar metricas de tempo de resposta do LLM (latencia p50, p95, p99)
- [ ] :chart_with_upwards_trend: **TASK-064:** Adicionar metricas de tokens consumidos por sessao e por tenant
- [ ] :chart_with_upwards_trend: **TASK-065:** Implementar correlation ID (requestId) em todos os logs de uma sessao de chat
- [ ] :chart_with_upwards_trend: **TASK-066:** Criar endpoint health check `/api/health` verificando conexao com OpenRouter e Supabase

---

## 13. Error Handling (4 tasks)

- [ ] :rotating_light: **TASK-067:** Criar componente de erro gracioso para timeouts do LLM (mensagem amigavel + retry)
- [ ] :rotating_light: **TASK-068:** Implementar tratamento de erro para produtos indisponiveis durante adicao ao carrinho
- [ ] :rotating_light: **TASK-069:** Implementar tratamento de erro para mudanca de preco entre adicao e checkout
- [ ] :rotating_light: **TASK-070:** Criar fallback para quando estabelecimento fecha durante pedido em andamento

---

## Resumo de Tasks

| Categoria                                  | Quantidade   |
| ------------------------------------------ | ------------ |
| :building_construction: Setup              | 6 tasks      |
| :floppy_disk: Services/Cart                | 14 tasks     |
| :robot: IA/Tools                           | 24 tasks     |
| :white_check_mark: Testes                  | 8 tasks      |
| :lock: Seguranca                           | 6 tasks      |
| :test_tube: Mocks                          | 4 tasks      |
| :chart_with_upwards_trend: Observabilidade | 4 tasks      |
| :rotating_light: Error Handling            | 4 tasks      |
| **TOTAL**                                  | **70 tasks** |

**Complexidade:** Media-Alta
**Estimativa:** 3-4 dias de desenvolvimento
**Dependencia:** FEAT-002 (Painel) deve estar completo

---

**Gerado automaticamente por:** sprint-context-generator skill
**Atualizado por:** software-engineer skill (analise de qualidade)
**Data:** 2026-02-05
