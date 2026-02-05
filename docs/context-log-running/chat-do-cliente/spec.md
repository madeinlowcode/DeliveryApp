# FEAT-001: Chat do Cliente

**Documentacao Relacionada:**

- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Visao Geral

O Chat do Cliente e o portal de pedidos do PedeAI - uma interface de chat estilo Claude/ChatGPT onde clientes interagem com a IA para fazer pedidos. Em vez de texto puro, a IA responde com componentes visuais interativos (cards de categorias, cards de produtos com imagem e preco, botoes clicaveis, seletores de quantidade), criando uma experiencia semelhante a um app mobile dentro de uma interface de chat.

**Categoria:** Frontend / Customer Portal
**Prioridade:** Alta (3o na ordem de desenvolvimento)
**Status:** Pending
**Dependencia:** FEAT-003 (Agente IA) deve estar completo

---

## User Stories

### US-C01: Ver categorias do cardapio

Como cliente,
Quero ver as categorias em cards visuais com imagens,
Para que eu encontre rapidamente o que desejo pedir.

**Criterios de aceite:**

- Cards exibem imagem e nome da categoria
- Ao clicar no card, IA mostra os produtos daquela categoria
- Layout responsivo (funciona em mobile)

### US-C02: Ver produtos de uma categoria

Como cliente,
Quero ver os produtos em cards com imagem, nome, descricao e preco,
Para que eu escolha o que quero pedir sem precisar digitar.

**Criterios de aceite:**

- Cards exibem imagem, nome, descricao curta e preco
- Botao "Adicionar" visivel em cada card
- Produtos indisponiveis nao aparecem

### US-C03: Adicionar item ao carrinho

Como cliente,
Quero adicionar um produto ao carrinho clicando num botao,
Para que eu monte meu pedido sem precisar digitar.

**Criterios de aceite:**

- Se tem variacoes, mostra opcoes clicaveis (ex: tamanhos)
- Se tem adicionais, mostra lista com checkbox e preco
- Confirmacao visual de item adicionado
- Carrinho atualiza automaticamente

### US-C04: Identificacao por WhatsApp

Como cliente,
Quero informar meu WhatsApp e ser reconhecido,
Para que eu nao precise repetir meus dados toda vez.

**Criterios de aceite:**

- Campo pede apenas numero de WhatsApp no inicio
- Se cliente existe: carrega nome e enderecos salvos
- Se cliente novo: pede apenas o nome
- Endereco solicitado so na finalizacao

### US-C05: Finalizar pedido

Como cliente,
Quero confirmar meu pedido com endereco e forma de pagamento,
Para que meu pedido seja enviado ao estabelecimento.

**Criterios de aceite:**

- Mostra resumo completo (itens, quantidades, valores)
- Cliente existente: oferece endereco salvo ou novo
- Cliente novo: solicita endereco e salva para proxima vez
- Selecao de forma de pagamento (configurada pelo estabelecimento)
- Confirmacao final antes de enviar
- Mensagem de confirmacao com numero do pedido

### US-C06: Ver historico de pedidos

Como cliente,
Quero ver meus ultimos pedidos na sidebar,
Para que eu possa acompanhar ou repetir um pedido anterior.

**Criterios de aceite:**

- Sidebar esquerda lista ultimos pedidos (data, itens resumidos, valor)
- Botao "Pedir novamente" em cada pedido
- Ao clicar, carrega os itens no carrinho

### US-C07: Tratamento de erros

Como cliente,
Quero ver mensagens amigaveis quando algo der errado,
Para que eu saiba o que aconteceu e o que fazer.

**Criterios de aceite:**

- Erros de API mostram toast com mensagem amigavel (nunca detalhes tecnicos)
- Erro de conexao mostra "Sem conexao. Verifique sua internet."
- Botao "Tentar novamente" disponivel em erros recuperaveis
- Error boundary captura erros de renderizacao sem quebrar toda a pagina
- Log de erros no console para debugging (apenas em desenvolvimento)

### US-C08: Acessibilidade

Como cliente com deficiencia visual ou motora,
Quero navegar pelo chat usando teclado e leitor de tela,
Para que eu consiga fazer pedidos de forma independente.

**Criterios de aceite:**

- Todos os elementos interativos com aria-label descritivo
- Navegacao por teclado funcional (Tab, Enter, Escape)
- Focus trap em modais (ProductDetailModal)
- Skip to content link no inicio da pagina
- Anuncios de status para leitores de tela (aria-live)
- Contraste de cores minimo 4.5:1 (WCAG AA)

### US-C09: Estados de carregamento

Como cliente,
Quero ver indicadores de carregamento enquanto o conteudo carrega,
Para que eu saiba que o sistema esta funcionando.

**Criterios de aceite:**

- Skeleton loading para CategoryCards enquanto carrega
- Skeleton loading para ProductCards enquanto carrega
- Typing indicator enquanto IA processa resposta
- Skeleton na sidebar para historico de pedidos
- Transicao suave entre skeleton e conteudo real

### US-C10: Deteccao de offline

Como cliente,
Quero ser informado quando estou sem conexao,
Para que eu saiba por que o chat nao esta respondendo.

**Criterios de aceite:**

- Banner fixo no topo quando offline: "Voce esta offline"
- Banner desaparece automaticamente quando conexao retorna
- Mensagens digitadas offline sao mantidas e enviadas quando reconectar
- Input desabilitado com placeholder "Aguardando conexao..." quando offline

---

## Analise do Arquiteto de Solucoes

### Arquitetura do Chat

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAGINA DO CHAT                                │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │   SIDEBAR    │  │              CHAT AREA                    │ │
│  │              │  │                                          │ │
│  │  [Logo]      │  │  AssistantRuntimeProvider                │ │
│  │  Historico   │  │    └── Thread                            │ │
│  │  de Pedidos  │  │         ├── Messages                     │ │
│  │              │  │         │    ├── UserMessage             │ │
│  │  - Pedido 1  │  │         │    └── AssistantMessage        │ │
│  │  - Pedido 2  │  │         │         └── ToolUI             │ │
│  │              │  │         │              ├── CategoryCards │ │
│  │              │  │         │              ├── ProductCards  │ │
│  │              │  │         │              └── CartSummary   │ │
│  │              │  │         └── Composer                     │ │
│  └──────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura de Diretorios

```
src/
├── app/
│   └── (public)/
│       └── [slug]/                     # Rota dinamica por tenant
│           ├── page.tsx                # Pagina principal do chat
│           ├── layout.tsx              # Layout com sidebar
│           └── loading.tsx             # Loading state
│
├── components/
│   ├── features/
│   │   └── chat/
│   │       ├── chat-provider.tsx       # AssistantRuntimeProvider wrapper
│   │       ├── chat-thread.tsx         # Thread customizado
│   │       ├── chat-sidebar.tsx        # Sidebar com historico
│   │       ├── chat-composer.tsx       # Input de mensagens
│   │       ├── message-user.tsx        # Mensagem do usuario
│   │       ├── message-assistant.tsx   # Mensagem da IA
│   │       │
│   │       └── tools/                  # Componentes visuais das tools
│   │           ├── category-cards.tsx
│   │           ├── product-cards.tsx
│   │           ├── product-detail.tsx
│   │           ├── variation-selector.tsx
│   │           ├── addon-selector.tsx
│   │           ├── cart-summary.tsx
│   │           ├── checkout-form.tsx
│   │           └── order-confirmation.tsx
│   │
│   └── shared/
│       ├── phone-input.tsx
│       └── address-form.tsx
│
├── hooks/
│   ├── use-chat-session.ts             # Gerencia sessionId
│   ├── use-customer.ts                 # Dados do cliente
│   └── use-order-history.ts            # Historico de pedidos
│
└── stores/
    └── chat-store.ts                   # Estado do chat (customer, cart preview)
```

### Dependencias Necessarias

**Producao:**

```json
{
  "@assistant-ui/react": "^0.x",
  "@assistant-ui/react-ai-sdk": "^0.x"
}
```

---

## Requisitos do Desenvolvedor

### Componentes de Tool UI

Cada tool do Agente IA retorna dados que sao renderizados como componentes visuais:

#### 1. CategoryCards

**Tool:** getCategories
**Props:** `{ categories: Category[] }`
**Comportamento:** Grid de cards clicaveis, ao clicar envia mensagem com nome da categoria

#### 2. ProductCards

**Tool:** getProducts
**Props:** `{ products: Product[] }`
**Comportamento:** Grid de cards com botao "Adicionar"

#### 3. VariationSelector

**Tool:** addToCart (quando produto tem variacoes)
**Props:** `{ variations: Variation[], onSelect: (id) => void }`
**Comportamento:** Radio buttons para selecionar variacao

#### 4. AddonSelector

**Tool:** addToCart (quando produto tem adicionais)
**Props:** `{ addons: Addon[], onToggle: (id) => void }`
**Comportamento:** Checkboxes para selecionar adicionais

#### 5. CartSummary

**Tool:** getCart
**Props:** `{ cart: Cart }`
**Comportamento:** Lista de itens com quantidades e totais

#### 6. OrderConfirmation

**Tool:** checkout
**Props:** `{ orderNumber: number, message: string }`
**Comportamento:** Card de confirmacao com numero do pedido

### Fluxo de Identificacao do Cliente

```
1. Cliente acessa /pizzaria-do-joao (slug do tenant)
2. Chat inicia com mensagem de boas-vindas
3. Ao adicionar primeiro item:
   - Se sessionId tem customerPhone: continua normalmente
   - Se nao: IA pergunta "Qual seu numero de WhatsApp?"
4. Cliente informa telefone
5. Sistema busca cliente no banco:
   - EXISTE: "Ola [Nome]! Entregar no mesmo endereco?"
   - NOVO: "Qual seu nome?"
6. Dados salvos no sessionStorage
7. No checkout: pede endereco se novo, oferece salvo se existente
```

### Variaveis de Ambiente

```env
# Nenhuma adicional - usa as mesmas do Agente IA
```

---

## Especificacoes de Design/UX

### Layout do Chat

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │   [LOGO]     │  │                                          │  │
│  │  Pizzaria    │  │  🤖 Ola! Bem-vindo a Pizzaria do Joao!  │  │
│  │  do Joao     │  │     O que voce gostaria de pedir hoje?   │  │
│  │              │  │                                          │  │
│  │ ─────────── │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │  │
│  │              │  │  │  🍕    │ │  🍔    │ │  🥤    │    │  │
│  │ ULTIMOS      │  │  │ Pizzas  │ │ Lanches │ │ Bebidas │    │  │
│  │ PEDIDOS      │  │  └─────────┘ └─────────┘ └─────────┘    │  │
│  │              │  │                                          │  │
│  │ #142 - R$95  │  │                                          │  │
│  │ 2 pizzas     │  │  👤 Quero ver as pizzas                  │  │
│  │ [Pedir de    │  │                                          │  │
│  │  novo]       │  │  🤖 Otimo! Aqui estao nossas pizzas:    │  │
│  │              │  │                                          │  │
│  │ #138 - R$45  │  │  ┌─────────────────┐ ┌─────────────────┐│  │
│  │ 1 lanche     │  │  │   [Imagem]      │ │   [Imagem]      ││  │
│  │ [Pedir de    │  │  │ Margherita      │ │ Calabresa       ││  │
│  │  novo]       │  │  │ R$ 45,00        │ │ R$ 48,00        ││  │
│  │              │  │  │ [+ Adicionar]   │ │ [+ Adicionar]   ││  │
│  │              │  │  └─────────────────┘ └─────────────────┘│  │
│  │              │  │                                          │  │
│  │              │  │  ─────────────────────────────────────  │  │
│  │              │  │  🛒 Carrinho: 0 itens                   │  │
│  │              │  │                                          │  │
│  │              │  │  ┌────────────────────────────────────┐  │  │
│  │              │  │  │  Digite sua mensagem...        [➤] │  │  │
│  │              │  │  └────────────────────────────────────┘  │  │
│  └──────────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Componentes UI

1. **ChatSidebar** - Logo, nome do tenant, historico de pedidos
2. **ChatThread** - Area de mensagens com scroll
3. **ChatComposer** - Input de texto com botao enviar
4. **CategoryCard** - Card de categoria clicavel
5. **ProductCard** - Card de produto com botao adicionar
6. **CartPreview** - Preview fixo do carrinho no footer

### Acessibilidade

- Todas as imagens com alt text
- Botoes com aria-label descritivo
- Focus trap no chat
- Navegacao por teclado funcional
- Suporte a screen readers

### Responsividade

**Desktop (1024px+):** Layout com sidebar visivel
**Tablet (768px-1023px):** Sidebar colapsavel em drawer
**Mobile (< 768px):** Sidebar em drawer, chat fullscreen

---

## Requisitos de QA

### Casos de Teste E2E

1. **E2E: Fluxo completo de pedido**
   - Acessar /tenant-slug
   - Ver mensagem de boas-vindas
   - Clicar em categoria (cards aparecem)
   - Clicar em produto (opcoes aparecem)
   - Adicionar ao carrinho
   - Ver carrinho atualizado
   - Finalizar pedido
   - Ver confirmacao com numero

2. **E2E: Cliente recorrente**
   - Fazer pedido e finalizar
   - Recarregar pagina
   - Iniciar novo pedido
   - Verificar que nome e endereco sao lembrados

3. **E2E: Repetir pedido**
   - Ter pedido anterior no historico
   - Clicar "Pedir novamente"
   - Verificar itens no carrinho

4. **E2E: Mobile responsivo**
   - Acessar em viewport mobile
   - Verificar sidebar em drawer
   - Verificar chat funcional
   - Verificar cards responsivos

5. **E2E: Estabelecimento fechado**
   - Acessar fora do horario
   - Verificar mensagem de fechado

---

## Analise do Gerente de Projeto

### Prioridade

**Prioridade:** Alta

**Justificativa:**

- Interface final do produto
- Depende de FEAT-002 e FEAT-003
- Essencial para validacao do MVP

### Riscos

**Risco 1: Complexidade do Assistant UI**

- **Probabilidade:** Media
- **Impacto:** Medio
- **Mitigacao:** Seguir documentacao oficial, usar exemplos

**Risco 2: Performance de renderizacao de tools**

- **Probabilidade:** Baixa
- **Impacto:** Medio
- **Mitigacao:** Lazy loading de componentes, otimizar imagens

### Estimativa

**Total de tasks:** ~50 tasks
**Complexidade:** Media
**Tempo estimado:** 2-3 dias

### Criterios de Aceitacao

1. **Funcional:**
   - [ ] Chat carrega com mensagem de boas-vindas
   - [ ] Tools renderizam como componentes visuais
   - [ ] Carrinho funciona corretamente
   - [ ] Checkout cria pedido
   - [ ] Historico mostra pedidos anteriores

2. **UX:**
   - [ ] Interface responsiva (mobile, tablet, desktop)
   - [ ] Streaming de mensagens funcionando
   - [ ] Interacoes fluidas (botoes, cards)

3. **Qualidade:**
   - [ ] Testes E2E passando
   - [ ] Sem erros no console
   - [ ] Performance aceitavel

---

## Requisitos de Negocio

### Valor de Negocio

**Problema que resolve:**
Clientes querem fazer pedidos rapido, sem digitar muito, com interface intuitiva. O chat visual oferece experiencia superior a chatbots de texto.

**Beneficios:**

1. **UX superior:** Interface visual > texto puro
2. **Conversao:** Menos friccao = mais pedidos
3. **Diferencial:** Experiencia unica no mercado

### KPIs

1. **Taxa de conclusao de pedido**
   - Meta: >60% dos chats iniciados viram pedido

2. **Tempo medio de pedido**
   - Meta: <3 minutos do inicio ao fim

3. **Satisfacao do cliente**
   - Meta: >4.5/5 em feedback

---

**Gerado automaticamente por:** sprint-context-generator skill
**Data:** 2026-02-05
