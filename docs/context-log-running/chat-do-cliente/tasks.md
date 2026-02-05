# Lista de Tarefas: FEAT-001 - Chat do Cliente

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Pesquisa](research.md) - Documentacao e referencias

**Total: 70 tasks | Complexidade: Media-Alta**

---

## Legenda

- :building_construction: Setup/Arquitetura
- :art: Frontend/UI
- :white_check_mark: Testes
- :page_facing_up: Documentacao

---

## 1. Setup e Configuracao (4 tasks)

- [ ] :building_construction: **TASK-001:** Instalar dependencias do Assistant UI: `@assistant-ui/react @assistant-ui/react-ai-sdk`
- [ ] :building_construction: **TASK-002:** Criar hook `src/hooks/use-chat-session.ts` que gera e persiste sessionId no sessionStorage
- [ ] :building_construction: **TASK-003:** Criar arquivo `src/types/chat.ts` com tipos Message, ToolOutput, ChatState
- [ ] :building_construction: **TASK-004:** Criar store `src/stores/chat-store.ts` com Zustand para estado do cliente (phone, name, addresses)

---

## 2. Layout e Estrutura (8 tasks)

- [ ] :art: **TASK-005:** Criar layout em `src/app/(public)/[slug]/layout.tsx` com meta tags dinamicas do tenant
- [ ] :art: **TASK-006:** Criar pagina principal em `src/app/(public)/[slug]/page.tsx` carregando tenant e renderizando ChatProvider
- [ ] :art: **TASK-007:** Criar loading skeleton em `src/app/(public)/[slug]/loading.tsx` com placeholder do chat
- [ ] :art: **TASK-008:** Criar componente `src/components/features/chat/chat-provider.tsx` com AssistantRuntimeProvider e useChatRuntime
- [ ] :art: **TASK-009:** Criar componente `src/components/features/chat/chat-layout.tsx` com grid sidebar + thread responsivo
- [ ] :art: **TASK-010:** Criar componente `src/components/features/chat/chat-sidebar.tsx` com logo do tenant e area de historico
- [ ] :art: **TASK-011:** Criar componente `src/components/features/chat/chat-thread.tsx` usando ThreadPrimitive do Assistant UI
- [ ] :art: **TASK-012:** Criar componente `src/components/features/chat/chat-composer.tsx` com input de texto e botao enviar

---

## 3. Mensagens (4 tasks)

- [ ] :art: **TASK-013:** Criar componente `src/components/features/chat/messages/user-message.tsx` com avatar e texto alinhado a direita
- [ ] :art: **TASK-014:** Criar componente `src/components/features/chat/messages/assistant-message.tsx` com avatar do bot e ToolRenderer
- [ ] :art: **TASK-015:** Criar componente `src/components/features/chat/chat-welcome.tsx` com mensagem de boas-vindas personalizada do tenant
- [ ] :art: **TASK-016:** Criar componente `src/components/features/chat/tools/tool-renderer.tsx` com switch/case para renderizar cada tool

---

## 4. Tool UI - Cardapio (6 tasks)

- [ ] :art: **TASK-017:** Criar componente `src/components/features/chat/tools/category-cards.tsx` com grid de cards clicaveis
- [ ] :art: **TASK-018:** Implementar onClick em CategoryCards que envia mensagem "Quero ver [categoria]" via runtime.send
- [ ] :art: **TASK-019:** Criar componente `src/components/features/chat/tools/product-cards.tsx` com grid de cards de produtos
- [ ] :art: **TASK-020:** Criar componente `src/components/features/chat/tools/product-detail-modal.tsx` com Dialog para selecao de opcoes
- [ ] :art: **TASK-021:** Criar componente `src/components/features/chat/tools/variation-selector.tsx` com radio buttons para variacoes
- [ ] :art: **TASK-022:** Criar componente `src/components/features/chat/tools/addon-selector.tsx` com checkboxes para adicionais

---

## 5. Tool UI - Carrinho (6 tasks)

- [ ] :art: **TASK-023:** Criar componente `src/components/features/chat/tools/quantity-selector.tsx` com botoes + e - para quantidade
- [ ] :art: **TASK-024:** Criar componente `src/components/features/chat/tools/cart-summary.tsx` exibindo itens, quantidades e totais
- [ ] :art: **TASK-025:** Implementar botao "Remover" em cada item do CartSummary que envia mensagem para remover
- [ ] :art: **TASK-026:** Criar componente `src/components/features/chat/tools/cart-preview.tsx` fixo no footer mostrando total do carrinho
- [ ] :art: **TASK-027:** Criar componente `src/components/features/chat/tools/checkout-form.tsx` para coleta de dados (endereco, pagamento)
- [ ] :art: **TASK-028:** Criar componente `src/components/features/chat/tools/order-confirmation.tsx` com numero do pedido e mensagem de sucesso

---

## 6. Tool UI - Auxiliares (4 tasks)

- [ ] :art: **TASK-029:** Criar componente `src/components/features/chat/tools/business-hours-message.tsx` para exibir status aberto/fechado
- [ ] :art: **TASK-030:** Criar componente `src/components/features/chat/tools/order-status.tsx` para exibir status de pedido consultado
- [ ] :art: **TASK-031:** Criar componente `src/components/features/chat/tools/tool-loading.tsx` com skeleton durante carregamento de tool
- [ ] :art: **TASK-032:** Criar componente `src/components/features/chat/tools/tool-error.tsx` para exibir erros de tools

---

## 7. Sidebar - Historico (6 tasks)

- [ ] :art: **TASK-033:** Criar hook `src/hooks/use-order-history.ts` que busca ultimos 5 pedidos do cliente por telefone
- [ ] :art: **TASK-034:** Criar componente `src/components/features/chat/sidebar/order-history-list.tsx` listando pedidos anteriores
- [ ] :art: **TASK-035:** Criar componente `src/components/features/chat/sidebar/order-history-item.tsx` com numero, itens resumidos, valor
- [ ] :art: **TASK-036:** Implementar botao "Pedir novamente" em OrderHistoryItem que carrega itens no chat
- [ ] :art: **TASK-037:** Criar hook `src/hooks/use-customer.ts` que gerencia dados do cliente (phone, name) no store
- [ ] :art: **TASK-038:** Implementar identificacao do cliente: ao informar telefone, buscar ou criar cliente no banco

---

## 8. Componentes Compartilhados (4 tasks)

- [ ] :art: **TASK-039:** Criar componente `src/components/shared/phone-input.tsx` com mascara para telefone brasileiro
- [ ] :art: **TASK-040:** Criar componente `src/components/shared/address-form.tsx` com campos rua, numero, complemento, bairro
- [ ] :art: **TASK-041:** Criar componente `src/components/shared/image-with-fallback.tsx` com placeholder para imagens que falham
- [ ] :art: **TASK-042:** Criar componente de loading/typing indicator para quando IA esta processando

---

## 9. Responsividade (4 tasks)

- [ ] :art: **TASK-043:** Implementar sidebar colapsavel em drawer para mobile (< 768px) usando Sheet do shadcn
- [ ] :art: **TASK-044:** Ajustar grid de CategoryCards para 2 colunas em mobile, 3 em desktop
- [ ] :art: **TASK-045:** Ajustar grid de ProductCards para 1 coluna em mobile, 2 em desktop
- [ ] :art: **TASK-046:** Testar e ajustar ProductDetailModal para funcionar bem em mobile

---

## 10. Testes E2E (6 tasks)

- [ ] :white_check_mark: **TASK-047:** Criar Page Object `tests/e2e/pages/chat.page.ts` com metodos para interagir com chat
- [ ] :white_check_mark: **TASK-048:** Criar teste E2E `tests/e2e/specs/chat-flow.spec.ts` verificando fluxo completo: categoria > produto > carrinho > checkout
- [ ] :white_check_mark: **TASK-049:** Criar teste E2E verificando renderizacao de CategoryCards ao perguntar "o que tem?"
- [ ] :white_check_mark: **TASK-050:** Criar teste E2E verificando adicao de produto com variacao ao carrinho
- [ ] :white_check_mark: **TASK-051:** Criar teste E2E verificando finalizacao de pedido e exibicao de confirmacao
- [ ] :white_check_mark: **TASK-052:** Criar teste E2E verificando responsividade em viewport mobile (375px)

---

## 11. Acessibilidade (6 tasks)

- [ ] :art: **TASK-053:** Adicionar aria-labels descritivos em todos os elementos interativos (botoes, cards, inputs)
- [ ] :art: **TASK-054:** Implementar navegacao por teclado em CategoryCards (Tab, Enter, Space)
- [ ] :art: **TASK-055:** Implementar navegacao por teclado em ProductCards (Tab, Enter para abrir modal)
- [ ] :art: **TASK-056:** Adicionar focus trap no ProductDetailModal usando hook useFocusTrap
- [ ] :art: **TASK-057:** Criar componente SkipToContent com link "Pular para conteudo principal"
- [ ] :white_check_mark: **TASK-058:** Testar chat com leitor de tela (VoiceOver no Mac ou NVDA no Windows)

---

## 12. Error Handling (4 tasks)

- [ ] :art: **TASK-059:** Criar componente ChatErrorBoundary para capturar erros de renderizacao do chat
- [ ] :art: **TASK-060:** Criar lib/api-error-handler.ts com funcoes handleApiError e showErrorToast
- [ ] :art: **TASK-061:** Criar hook useOnlineStatus que detecta estado de conexao (online/offline)
- [ ] :art: **TASK-062:** Criar componente OfflineBanner que exibe alerta quando usuario esta offline

---

## 13. Loading States (4 tasks)

- [ ] :art: **TASK-063:** Criar componente CategoryCardsSkeleton com skeleton loading para categorias
- [ ] :art: **TASK-064:** Criar componente ProductCardsSkeleton com skeleton loading para produtos
- [ ] :art: **TASK-065:** Criar componente TypingIndicator com animacao de "digitando"
- [ ] :art: **TASK-066:** Criar componente ToolLoading que renderiza skeleton apropriado por tipo de tool

---

## 14. Performance (4 tasks)

- [ ] :art: **TASK-067:** Criar componente ImageWithFallback com lazy loading e placeholder de fallback
- [ ] :art: **TASK-068:** Implementar code splitting para componentes de tools usando dynamic imports
- [ ] :art: **TASK-069:** Criar OptimizedMessageList com memoizacao de mensagens individuais
- [ ] :art: **TASK-070:** Adicionar loading="lazy" em imagens abaixo do fold (index > 3)

---

## 15. Seguranca (4 tasks)

- [ ] :shield: **TASK-071:** Criar lib/sanitize.ts com funcoes sanitizeUserMessage e isValidTenantSlug
- [ ] :shield: **TASK-072:** Criar hook useSessionTimeout que monitora expiracao de sessao (24h) com warning
- [ ] :shield: **TASK-073:** Criar hook useRateLimitHandler para tratar respostas 429 graciosamente
- [ ] :shield: **TASK-074:** Validar tenant slug na pagina [slug]/page.tsx antes de renderizar chat

---

## Resumo de Tasks

| Categoria                     | Quantidade   |
| ----------------------------- | ------------ |
| :building_construction: Setup | 4 tasks      |
| :art: Frontend                | 42 tasks     |
| :white_check_mark: Testes     | 6 tasks      |
| :art: Acessibilidade          | 6 tasks      |
| :art: Error Handling          | 4 tasks      |
| :art: Loading States          | 4 tasks      |
| :art: Performance             | 4 tasks      |
| :shield: Seguranca            | 4 tasks      |
| **TOTAL**                     | **70 tasks** |

**Complexidade:** Media-Alta
**Estimativa:** 3-4 dias de desenvolvimento
**Dependencia:** FEAT-003 (Agente IA) deve estar completo

---

**Gerado automaticamente por:** sprint-context-generator skill
**Atualizado por:** software-engineer skill (analise de qualidade)
**Data:** 2026-02-05
