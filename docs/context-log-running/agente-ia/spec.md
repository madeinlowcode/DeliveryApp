# FEAT-003: Agente IA

**Documentacao Relacionada:**

- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Visao Geral

O Agente IA e o cerebro do PedeAI - um sistema de atendimento automatizado que processa pedidos via chat usando LLM com function calling. O agente consulta o cardapio, gerencia o carrinho, calcula totais e finaliza pedidos, tudo atraves de tools que renderizam componentes visuais interativos (cards, botoes) em vez de texto puro.

**Categoria:** AI / Backend
**Prioridade:** Alta (2o na ordem de desenvolvimento)
**Status:** Pending
**Dependencia:** FEAT-002 (Painel) deve estar completo para ter cardapio disponivel

---

## User Stories

### US-A01: Consultar cardapio via IA

Como cliente,
Quero perguntar sobre o cardapio e ver opcoes visuais,
Para que eu escolha o que quero pedir de forma intuitiva.

**Criterios de aceite:**

- IA responde com cards de categorias quando pergunto "o que tem?"
- IA responde com cards de produtos quando seleciono uma categoria
- Cards mostram imagem, nome, descricao e preco
- Produtos indisponiveis nao aparecem

### US-A02: Adicionar itens ao carrinho

Como cliente,
Quero adicionar produtos ao carrinho clicando em botoes,
Para que eu monte meu pedido sem digitar.

**Criterios de aceite:**

- Ao clicar "Adicionar", IA mostra variacoes se existirem
- Ao clicar "Adicionar", IA mostra adicionais se existirem
- Carrinho e atualizado em tempo real
- IA confirma adicao com resumo

### US-A03: Gerenciar carrinho

Como cliente,
Quero ver, modificar e remover itens do carrinho,
Para que eu tenha controle sobre meu pedido.

**Criterios de aceite:**

- Comando "ver carrinho" mostra resumo visual
- Posso remover itens do carrinho
- Posso alterar quantidade
- Total e recalculado automaticamente

### US-A04: Finalizar pedido

Como cliente,
Quero confirmar meu pedido com endereco e pagamento,
Para que o estabelecimento receba e prepare.

**Criterios de aceite:**

- IA solicita endereco de entrega
- IA mostra formas de pagamento disponiveis
- IA exibe resumo final antes de confirmar
- Pedido e gravado no banco e aparece no Kanban
- Precos sao recalculados no momento do checkout (prevenir manipulacao)
- Se preco mudou desde adicao, cliente e informado

### US-A05: Tratamento de erros gracioso

Como cliente,
Quero receber mensagens claras quando algo der errado,
Para que eu saiba o que fazer e nao fique frustrado.

**Criterios de aceite:**

- Se produto indisponivel durante adicao, informar e sugerir alternativas
- Se preco mudou entre adicao e checkout, informar e pedir confirmacao
- Se estabelecimento fechar durante pedido, informar proximo horario
- Se API/LLM falhar, mostrar mensagem amigavel pedindo para tentar novamente
- Se carrinho expirar, informar e permitir recomecar
- Nunca mostrar erros tecnicos ao usuario (stack traces, etc)

### US-A06: Seguranca e rate limiting

Como estabelecimento,
Quero que o sistema seja protegido contra abusos,
Para que nao haja custos excessivos ou ataques.

**Criterios de aceite:**

- Rate limiting de 30 requisicoes por minuto por IP
- SessionId validado como UUID valido
- Inputs sanitizados contra XSS e injection
- Timeout de 30s para chamadas ao LLM
- Logs de auditoria para todos os pedidos criados

---

## Analise do Arquiteto de Solucoes

### Arquitetura do Agente

```
┌─────────────────────────────────────────────────────────────┐
│                     CHAT INTERFACE                           │
│               (Assistant UI + React)                         │
└────────────────────────┬────────────────────────────────────┘
                         │ useChat / useChatRuntime
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTE                                 │
│              /api/chat/route.ts                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              streamText()                            │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │           SYSTEM PROMPT                      │    │    │
│  │  │  - Contexto do estabelecimento               │    │    │
│  │  │  - Instrucoes de comportamento               │    │    │
│  │  │  - Regras de negocio                         │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              TOOLS                           │    │    │
│  │  │  - getCategories                             │    │    │
│  │  │  - getProducts                               │    │    │
│  │  │  - addToCart                                 │    │    │
│  │  │  - removeFromCart                            │    │    │
│  │  │  - getCart                                   │    │    │
│  │  │  - checkout                                  │    │    │
│  │  │  - checkBusinessHours                        │    │    │
│  │  │  - getOrderStatus                            │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPENROUTER                                │
│              (deepseek/deepseek-chat)                        │
│         Function Calling + Streaming                         │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Diretorios

```
src/
├── app/
│   └── api/
│       └── chat/
│           ├── route.ts              # Endpoint principal do chat
│           └── tools/                # Definicao das tools
│               ├── index.ts          # Export de todas as tools
│               ├── get-categories.ts
│               ├── get-products.ts
│               ├── add-to-cart.ts
│               ├── remove-from-cart.ts
│               ├── get-cart.ts
│               ├── checkout.ts
│               ├── check-hours.ts
│               └── get-order-status.ts
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts              # Configuracao OpenRouter
│   │   ├── system-prompt.ts         # Geracao do system prompt
│   │   └── types.ts                 # Tipos do chat
│   └── cart/
│       ├── cart-manager.ts          # Logica do carrinho (in-memory ou Redis)
│       └── types.ts
│
├── services/
│   ├── ai-menu.service.ts           # Consultas ao cardapio para IA
│   ├── ai-cart.service.ts           # Operacoes do carrinho
│   └── ai-order.service.ts          # Criacao de pedidos
│
└── types/
    ├── chat.ts                      # ChatMessage, ToolCall, etc
    └── cart.ts                      # CartItem, Cart
```

### Dependencias Necessarias

**Producao:**

```json
{
  "ai": "^4.x",
  "@ai-sdk/openai": "^1.x",
  "@assistant-ui/react": "^0.x",
  "@assistant-ui/react-ai-sdk": "^0.x"
}
```

### Fluxo de Dados do Chat

```
1. Usuario envia mensagem
   │
   ▼
2. useChat envia para /api/chat
   │
   ▼
3. streamText processa com LLM
   │
   ├─► LLM decide chamar tool
   │   │
   │   ▼
   │   Tool executa (ex: getProducts)
   │   │
   │   ▼
   │   Retorna dados estruturados
   │   │
   │   ▼
   │   LLM gera resposta contextual
   │
   ▼
4. Stream retorna para cliente
   │
   ▼
5. Cliente renderiza tool output como componente visual
```

---

## Requisitos do Desenvolvedor

### Tools a Implementar

#### 1. getCategories

**Descricao:** Retorna categorias disponiveis do cardapio
**Parametros:** Nenhum
**Retorno:**

```typescript
{
  categories: Array<{
    id: string
    name: string
    description: string
    imageUrl: string
  }>
}
```

#### 2. getProducts

**Descricao:** Retorna produtos de uma categoria
**Parametros:**

```typescript
{
  categoryId: string
}
```

**Retorno:**

```typescript
{
  products: Array<{
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
    variations: Array<{ id: string; name: string; priceModifier: number }>
    addons: Array<{ id: string; name: string; price: number }>
  }>
}
```

#### 3. addToCart

**Descricao:** Adiciona item ao carrinho
**Parametros:**

```typescript
{
  productId: string
  quantity: number
  variationId?: string
  addonIds?: string[]
  notes?: string
}
```

**Retorno:**

```typescript
{
  success: boolean
  cart: Cart
  message: string
}
```

#### 4. removeFromCart

**Descricao:** Remove item do carrinho
**Parametros:**

```typescript
{
  cartItemId: string
}
```

**Retorno:**

```typescript
{
  success: boolean
  cart: Cart
}
```

#### 5. getCart

**Descricao:** Retorna carrinho atual
**Parametros:** Nenhum
**Retorno:**

```typescript
{
  cart: {
    items: CartItem[]
    subtotal: number
    deliveryFee: number
    total: number
  }
}
```

#### 6. checkout

**Descricao:** Finaliza pedido
**Parametros:**

```typescript
{
  customerPhone: string
  customerName: string
  deliveryAddress: string
  paymentMethod: string
}
```

**Retorno:**

```typescript
{
  success: boolean
  orderNumber: number
  message: string
}
```

#### 7. checkBusinessHours

**Descricao:** Verifica se estabelecimento esta aberto
**Parametros:** Nenhum
**Retorno:**

```typescript
{
  isOpen: boolean
  message: string
  nextOpenTime?: string
}
```

#### 8. getOrderStatus

**Descricao:** Consulta status de pedido
**Parametros:**

```typescript
{
  orderNumber: number
}
```

**Retorno:**

```typescript
{
  found: boolean
  status?: string
  statusMessage?: string
}
```

### System Prompt

```typescript
// lib/ai/system-prompt.ts
export function generateSystemPrompt(tenant: Tenant): string {
  return `
Voce e o assistente virtual do ${tenant.name}, um sistema de delivery.

COMPORTAMENTO:
- Seja cordial e objetivo
- Responda sempre em portugues brasileiro
- Use as tools disponiveis para consultar cardapio e gerenciar pedidos
- NUNCA invente produtos ou precos - sempre use a tool getProducts
- Quando o cliente perguntar o que tem, use getCategories
- Quando o cliente escolher uma categoria, use getProducts
- Sempre confirme os itens antes de adicionar ao carrinho

FLUXO DE PEDIDO:
1. Saudar o cliente
2. Mostrar categorias quando solicitado
3. Mostrar produtos da categoria escolhida
4. Adicionar ao carrinho com variacoes/adicionais
5. Confirmar carrinho
6. Solicitar dados de entrega
7. Finalizar pedido

REGRAS:
- Pedido minimo: R$ ${tenant.minOrderValue?.toFixed(2) || '0,00'}
- Se estiver fechado, informar horario de funcionamento
- Sempre mostrar o total atualizado apos adicionar itens

${tenant.welcomeMessage ? `MENSAGEM DE BOAS-VINDAS: ${tenant.welcomeMessage}` : ''}
`
}
```

### Variaveis de Ambiente

```env
# OpenRouter (LLM)
OPENROUTER_API_KEY=sk-or-v1-...

# Modelo
OPENROUTER_MODEL=deepseek/deepseek-chat
```

---

## Especificacoes de Design/UX

### Renderizacao Visual de Tools

Cada tool retorna dados estruturados que sao renderizados como componentes React:

**getCategories → CategoryCards**

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│  🍕    │ │  🍔    │ │  🥤    │
│ Pizzas  │ │ Lanches │ │ Bebidas │
└─────────┘ └─────────┘ └─────────┘
```

**getProducts → ProductCards**

```
┌──────────────────────────────┐
│  [Imagem]                    │
│  Pizza Margherita            │
│  Molho, mussarela, tomate    │
│  R$ 45,00                    │
│  [+ Adicionar]               │
└──────────────────────────────┘
```

**getCart → CartSummary**

```
┌──────────────────────────────┐
│  🛒 Seu Carrinho             │
├──────────────────────────────┤
│  2x Pizza Margherita  R$ 90  │
│  1x Coca-Cola 2L      R$ 12  │
├──────────────────────────────┤
│  Subtotal:           R$ 102  │
│  Entrega:            R$ 5    │
│  TOTAL:              R$ 107  │
├──────────────────────────────┤
│  [Finalizar Pedido]          │
└──────────────────────────────┘
```

### Componentes de UI do Chat

1. **CategoryCard** - Card clicavel de categoria
2. **ProductCard** - Card de produto com botao adicionar
3. **VariationSelector** - Radio buttons para variacoes
4. **AddonSelector** - Checkboxes para adicionais
5. **CartSummary** - Resumo do carrinho
6. **OrderConfirmation** - Confirmacao final do pedido
7. **StatusBadge** - Badge com status do pedido

---

## Requisitos de QA

### Casos de Teste Unitarios

**Tool: getCategories**

- Deve retornar apenas categorias ativas do tenant
- Deve retornar array vazio se nao houver categorias

**Tool: getProducts**

- Deve retornar produtos da categoria especificada
- Deve filtrar produtos indisponiveis
- Deve incluir variacoes e adicionais

**Tool: addToCart**

- Deve adicionar produto simples ao carrinho
- Deve adicionar produto com variacao
- Deve adicionar produto com adicionais
- Deve calcular preco corretamente com modificadores
- Deve rejeitar produto inexistente
- Deve rejeitar quantidade invalida

**Tool: checkout**

- Deve criar pedido no banco
- Deve enviar notificacao realtime
- Deve validar pedido minimo
- Deve rejeitar se estabelecimento fechado

### Casos de Teste E2E

1. **E2E: Fluxo completo de pedido**
   - Acessar chat
   - Perguntar "o que tem?"
   - Clicar em categoria
   - Adicionar produto ao carrinho
   - Ver carrinho
   - Finalizar pedido
   - Verificar pedido no Kanban

2. **E2E: Adicionar produto com variacao**
   - Selecionar produto com variacoes
   - Escolher variacao (tamanho)
   - Verificar preco atualizado
   - Adicionar ao carrinho

3. **E2E: Estabelecimento fechado**
   - Acessar chat fora do horario
   - Tentar fazer pedido
   - Verificar mensagem de fechado

---

## Analise do Gerente de Projeto

### Prioridade

**Prioridade:** Alta

**Justificativa:**

- Bloqueador para FEAT-001 (Chat depende do Agente)
- Core da proposta de valor do produto
- Depende de FEAT-002 (precisa do cardapio)

### Riscos Potenciais

**Risco 1: LLM nao entender pedidos complexos**

- **Probabilidade:** Media
- **Impacto:** Alto
- **Mitigacao:** Prompt engineering robusto, exemplos no prompt, fallback para opcoes

**Risco 2: Custo de API OpenRouter alto**

- **Probabilidade:** Baixa
- **Impacto:** Medio
- **Mitigacao:** Usar modelo custo-beneficio (deepseek), monitorar tokens

**Risco 3: Latencia de resposta**

- **Probabilidade:** Media
- **Impacto:** Medio
- **Mitigacao:** Streaming, otimizar queries do banco

### Estimativa

**Total de tasks:** ~55 tasks
**Complexidade:** Media-Alta
**Tempo estimado:** 2-3 dias

### Criterios de Aceitacao

1. **Funcional:**
   - [ ] Tool getCategories retorna categorias corretas
   - [ ] Tool getProducts retorna produtos com variacoes/adicionais
   - [ ] Tool addToCart adiciona corretamente ao carrinho
   - [ ] Tool checkout cria pedido e aparece no Kanban
   - [ ] Tool checkBusinessHours valida horario corretamente

2. **Qualidade:**
   - [ ] Todas as tools testadas unitariamente
   - [ ] Teste E2E de fluxo completo passando
   - [ ] Latencia < 2s para primeira resposta

3. **UX:**
   - [ ] Respostas em portugues natural
   - [ ] Tools renderizam como componentes visuais
   - [ ] Streaming funcionando (resposta progressiva)

---

## Requisitos de Negocio

### Valor de Negocio

**Problema que resolve:**
Atendimento manual via WhatsApp e lento, propenso a erros e caro (precisa de funcionario). O Agente IA atende 24/7, sem erros, instantaneamente.

**Beneficios:**

1. **Atendimento 24/7:** Clientes podem pedir a qualquer hora
2. **Zero erros:** IA nao esquece item, nao erra preco
3. **Escalabilidade:** Atende infinitos clientes simultaneos
4. **Custo:** Fracao do custo de um atendente

### KPIs

1. **Taxa de conclusao de pedido**
   - Metrica: Pedidos finalizados / Conversas iniciadas
   - Meta: >60%

2. **Tempo medio de pedido**
   - Metrica: Timestamp inicio → confirmacao
   - Meta: <3 minutos

3. **Satisfacao com atendimento**
   - Metrica: Feedback pos-pedido
   - Meta: >4.5/5

---

**Gerado automaticamente por:** sprint-context-generator skill
**Data:** 2026-02-05
