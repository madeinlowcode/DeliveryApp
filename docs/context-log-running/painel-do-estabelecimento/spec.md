# FEAT-002: Painel do Estabelecimento

**Documentacao Relacionada:**

- [Plano Tecnico](plan.md) - Arquitetura e decisoes tecnicas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Visao Geral

O Painel do Estabelecimento e o modulo administrativo do PedeAI onde donos e operadores gerenciam seu delivery. Inclui dashboard Kanban para gestao de pedidos em tempo real, CRUD completo de cardapio (categorias, produtos, variacoes, adicionais), e configuracoes do estabelecimento (white-label, horarios, formas de pagamento).

**Categoria:** Dashboard / Admin Panel
**Prioridade:** Alta (1o na ordem de desenvolvimento)
**Status:** Pending

---

## User Stories

### US-E01: Visualizar pedidos no Kanban

Como dono do estabelecimento,
Quero ver meus pedidos organizados em colunas de status,
Para que eu saiba o que precisa ser preparado e entregue.

**Criterios de aceite:**

- 5 colunas: Confirmado, Em Preparo, Pronto, Saiu Entrega, Entregue
- Card mostra: numero, cliente, itens, endereco, valor, pagamento
- Drag and drop entre colunas
- Novos pedidos aparecem em tempo real com alerta sonoro

### US-E02: Gerenciar cardapio

Como dono do estabelecimento,
Quero cadastrar e organizar meu cardapio (categorias, produtos, variacoes, adicionais),
Para que os clientes vejam as opcoes corretas no chat.

**Criterios de aceite:**

- CRUD completo de categorias com imagem e ordenacao
- CRUD de produtos com nome, descricao, preco, imagem, categoria
- CRUD de variacoes por produto (tamanho, sabor) com precos
- CRUD de adicionais com precos vinculados a produtos
- Toggle de disponibilidade por produto
- Drag and drop para ordenacao

### US-E03: Personalizar o estabelecimento

Como dono do estabelecimento,
Quero configurar logo, nome e horarios do meu negocio,
Para que o chat do cliente reflita minha marca.

**Criterios de aceite:**

- Upload de logo (exibida na sidebar do chat e do painel)
- Nome do estabelecimento editavel
- Horario de funcionamento por dia da semana
- Mensagem de estabelecimento fechado customizavel
- Configuracao de formas de pagamento aceitas
- Configuracao de pedido minimo

### US-E04: Auditoria de acoes

Como dono do estabelecimento,
Quero ver historico de alteracoes no cardapio e configuracoes,
Para que eu saiba quem modificou o que e quando.

**Criterios de aceite:**

- Log de criacao, edicao e exclusao de categorias e produtos
- Registro de quem fez a alteracao (nome/email do usuario)
- Timestamp de cada acao
- Detalhes do que foi alterado (valores antes/depois)
- Visualizacao do historico na pagina de configuracoes
- Filtro por tipo de entidade e periodo

### US-E05: Seguranca do painel

Como dono do estabelecimento,
Quero que meu painel seja seguro contra ataques e acessos nao autorizados,
Para que meus dados e dos meus clientes estejam protegidos.

**Criterios de aceite:**

- Sessao expira apos 24h de inatividade
- Renovacao automatica de token a cada 1h de atividade
- Protecao contra CSRF em todos os formularios
- Inputs sanitizados contra XSS e SQL injection
- Rate limiting nas APIs (60 req/min por usuario)
- Headers de seguranca configurados (CSP, X-Frame-Options)
- Logout em todas as abas simultaneamente

### US-E06: Tratamento de erros amigavel

Como operador do estabelecimento,
Quero ver mensagens claras quando algo der errado,
Para que eu saiba como resolver o problema.

**Criterios de aceite:**

- Mensagens de erro em portugues, sem termos tecnicos
- Indicador visual de perda de conexao
- Retry automatico em falhas de rede (com feedback)
- Toast de confirmacao em todas as acoes bem-sucedidas
- Toast de erro com opcao de tentar novamente
- Skeleton loading durante carregamento de dados

### US-E07: Edicao concorrente segura

Como dono do estabelecimento,
Quero ser avisado se outro usuario editou o mesmo item que eu,
Para que nao haja perda de dados.

**Criterios de aceite:**

- Detectar se item foi modificado por outro usuario durante edicao
- Exibir aviso com opcao de recarregar ou sobrescrever
- Usar campo updated_at para controle de versao (optimistic locking)
- Impedir sobrescrita acidental de alteracoes

---

## Analise do Arquiteto de Solucoes

### Estrutura de Diretorios Proposta

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Layout autenticado com sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Kanban de pedidos
│   │   ├── cardapio/
│   │   │   ├── page.tsx            # Lista de categorias
│   │   │   ├── categorias/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── produtos/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── configuracoes/
│   │       └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── api/
│       ├── orders/
│       ├── categories/
│       ├── products/
│       └── upload/
│
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── features/
│   │   ├── kanban/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── kanban-card.tsx
│   │   │   └── order-details-sheet.tsx
│   │   ├── cardapio/
│   │   │   ├── category-card.tsx
│   │   │   ├── category-form.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── variation-form.tsx
│   │   │   └── addon-form.tsx
│   │   └── settings/
│   │       ├── general-settings.tsx
│   │       ├── business-hours.tsx
│   │       └── payment-methods.tsx
│   └── shared/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── image-upload.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils.ts
│
├── services/
│   ├── orders.service.ts
│   ├── categories.service.ts
│   ├── products.service.ts
│   └── settings.service.ts
│
├── hooks/
│   ├── use-orders.ts
│   ├── use-realtime-orders.ts
│   ├── use-categories.ts
│   └── use-products.ts
│
├── types/
│   └── database.ts
│
└── stores/
    └── ui-store.ts
```

### Dependencias Necessarias

**Producao:**

```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "zustand": "^5.x",
  "zod": "^3.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "date-fns": "^3.x",
  "sonner": "^1.x"
}
```

**Desenvolvimento:**

```json
{
  "@playwright/test": "^1.x",
  "vitest": "^2.x",
  "@testing-library/react": "^16.x",
  "msw": "^2.x"
}
```

### Padroes de Arquitetura

**Padrao escolhido:** Feature-based com Clean Architecture simplificada

**Camadas:**

1. **Presentation (app/, components/)**: Paginas e componentes React
2. **Application (hooks/, stores/)**: Logica de UI e estado
3. **Domain (services/)**: Regras de negocio
4. **Infrastructure (lib/supabase/)**: Acesso a dados

**Fluxo de dados:**

```
User Action → Component → Hook → Service → Supabase
           ← State Update ← Response ← Data ←
```

### Decisoes de Escalabilidade

- **Realtime com Supabase**: Usar channels por tenant para isolar eventos
- **Imagens**: Upload para Supabase Storage com CDN
- **Cache**: React Query/SWR para cache de dados do cardapio
- **RLS**: Todas as queries filtradas automaticamente por tenant_id

---

## Requisitos do Desenvolvedor

### Componentes/Modulos a Criar

**Backend (API Routes):**

1. **orders/** (`src/app/api/orders/`)
   - `GET /api/orders` - Listar pedidos do tenant
   - `PATCH /api/orders/[id]` - Atualizar status do pedido
   - Subscricao Realtime via Supabase client

2. **categories/** (`src/app/api/categories/`)
   - `GET /api/categories` - Listar categorias
   - `POST /api/categories` - Criar categoria
   - `PATCH /api/categories/[id]` - Atualizar categoria
   - `DELETE /api/categories/[id]` - Excluir categoria
   - `PATCH /api/categories/reorder` - Reordenar categorias

3. **products/** (`src/app/api/products/`)
   - `GET /api/products` - Listar produtos
   - `POST /api/products` - Criar produto
   - `PATCH /api/products/[id]` - Atualizar produto
   - `DELETE /api/products/[id]` - Excluir produto
   - `PATCH /api/products/[id]/availability` - Toggle disponibilidade

4. **upload/** (`src/app/api/upload/`)
   - `POST /api/upload/signed-url` - Gerar URL assinada para upload

**Frontend (Components):**

1. **KanbanBoard** (`components/features/kanban/kanban-board.tsx`)
   - Responsabilidade: Renderizar board com 5 colunas
   - Props: `orders: Order[]`, `onOrderMove: (id, status) => void`
   - Features: Drag and drop, realtime updates

2. **KanbanCard** (`components/features/kanban/kanban-card.tsx`)
   - Responsabilidade: Card individual do pedido
   - Props: `order: Order`, `onClick: () => void`
   - Features: Resumo do pedido, badge de status

3. **CategoryForm** (`components/features/cardapio/category-form.tsx`)
   - Responsabilidade: Formulario de criacao/edicao de categoria
   - Props: `category?: Category`, `onSubmit: (data) => void`
   - Features: Upload de imagem, validacao

4. **ProductForm** (`components/features/cardapio/product-form.tsx`)
   - Responsabilidade: Formulario completo de produto
   - Props: `product?: Product`, `categories: Category[]`
   - Features: Variacoes, adicionais, upload de imagem

### APIs a Implementar

#### GET /api/orders

**Descricao:** Listar pedidos do tenant com filtros

**Query params:**

```
?status=confirmed,preparing&date=2026-02-05
```

**Response (200):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "number": 142,
      "status": "confirmed",
      "customer": {
        "name": "Joao Silva",
        "phone": "11999999999"
      },
      "items": [
        {
          "product": { "name": "Pizza Margherita" },
          "quantity": 2,
          "price": 45.0,
          "variations": ["Grande"],
          "addons": ["Borda recheada"]
        }
      ],
      "address": "Rua das Flores, 123",
      "total": 95.0,
      "paymentMethod": "credit_card",
      "createdAt": "2026-02-05T10:30:00Z"
    }
  ]
}
```

#### POST /api/categories

**Descricao:** Criar nova categoria

**Request body:**

```json
{
  "name": "Pizzas",
  "description": "Nossas pizzas artesanais",
  "imageUrl": "https://storage.supabase.co/...",
  "sortOrder": 1
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Pizzas",
  "description": "Nossas pizzas artesanais",
  "imageUrl": "https://storage.supabase.co/...",
  "sortOrder": 1,
  "createdAt": "2026-02-05T10:30:00Z"
}
```

### Variaveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Especificacoes de Design/UX

### Layout do Painel

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────────┐ │
│  │   [LOGO]     │  │  Dashboard                    [User ▾]   │ │
│  │  Nome Estab. │  ├──────────────────────────────────────────┤ │
│  │              │  │                                          │ │
│  │ ─────────── │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│  │              │  │  │Confirmado│ │Em Preparo│ │  Pronto │    │ │
│  │ □ Dashboard  │  │  ├─────────┤ ├─────────┤ ├─────────┤    │ │
│  │ □ Cardapio   │  │  │ #142    │ │ #140    │ │ #139    │    │ │
│  │ □ Pedidos    │  │  │ Joao    │ │ Maria   │ │ Pedro   │    │ │
│  │ □ Config     │  │  │ R$95    │ │ R$45    │ │ R$32    │    │ │
│  │              │  │  └─────────┘ └─────────┘ └─────────┘    │ │
│  │              │  │                                          │ │
│  │              │  │  ┌─────────┐ ┌─────────┐                │ │
│  │              │  │  │Saiu Entr│ │Entregue │                │ │
│  │              │  │  ├─────────┤ ├─────────┤                │ │
│  │              │  │  │ #138    │ │ #137    │                │ │
│  │              │  │  │ Ana     │ │ Carlos  │                │ │
│  │              │  │  │ R$28    │ │ R$55    │                │ │
│  └──────────────┘  │  └─────────┘ └─────────┘                │ │
│                    └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes UI Reutilizaveis

1. **DataTable** - Tabela com sorting, filtering, pagination
2. **ImageUpload** - Upload de imagens com preview e crop
3. **FormSection** - Secao de formulario com titulo e descricao
4. **StatusBadge** - Badge colorido por status do pedido
5. **EmptyState** - Estado vazio com ilustracao e CTA

### Acessibilidade (WCAG 2.1 Level AA)

- Todos os inputs com labels associados
- Drag and drop com alternativa de teclado (botoes mover)
- Contraste minimo 4.5:1
- Focus indicators visiveis
- Alertas sonoros com equivalente visual

### Responsividade

**Desktop (1024px+):** Layout completo com sidebar fixa
**Tablet (768px-1023px):** Sidebar colapsavel, kanban horizontal com scroll
**Mobile (< 768px):** Sidebar em drawer, kanban em lista vertical

---

## Requisitos de QA

### Estrategia de Testes

**Piramide:**

- Unitarios: 60+ testes (services, utils)
- Integracao: 20+ testes (API routes)
- E2E: 15+ testes (fluxos principais)

### Casos de Teste Unitarios

**OrderService:**

- Deve listar pedidos do tenant atual
- Deve atualizar status do pedido
- Deve validar transicoes de status permitidas
- Deve notificar via realtime ao atualizar

**CategoryService:**

- Deve criar categoria com dados validos
- Deve rejeitar categoria sem nome
- Deve reordenar categorias corretamente
- Deve excluir categoria e seus produtos

**ProductService:**

- Deve criar produto com variacoes
- Deve criar produto com adicionais
- Deve toggle disponibilidade
- Deve validar preco positivo

### Casos de Teste E2E

1. **E2E: Login e acesso ao dashboard**
   - Fazer login com credenciais validas
   - Verificar redirecionamento para /dashboard
   - Verificar que kanban esta visivel

2. **E2E: Mover pedido no Kanban**
   - Visualizar pedido na coluna "Confirmado"
   - Arrastar para "Em Preparo"
   - Verificar que card moveu de coluna
   - Verificar que status atualizou no banco

3. **E2E: Criar categoria**
   - Navegar para Cardapio > Categorias
   - Clicar "Nova Categoria"
   - Preencher nome e fazer upload de imagem
   - Salvar e verificar na lista

4. **E2E: Criar produto completo**
   - Navegar para Cardapio > Produtos
   - Clicar "Novo Produto"
   - Preencher todos os campos
   - Adicionar variacao (tamanho)
   - Adicionar adicional
   - Salvar e verificar detalhes

5. **E2E: Receber pedido em tempo real**
   - Estar na pagina do dashboard
   - Simular novo pedido via API
   - Verificar que card aparece na coluna "Confirmado"
   - Verificar alerta sonoro/visual

### Cobertura de Testes

- Unitarios: >80%
- E2E: 100% dos fluxos criticos (login, kanban, CRUD)

---

## Analise do Gerente de Projeto

### Prioridade da Feature

**Prioridade:** Alta

**Justificativa:**

- Bloqueador para FEAT-003 (Agente IA precisa do cardapio)
- Bloqueador para FEAT-001 (Chat precisa do Agente IA)
- Estrutura de banco de dados e criada aqui
- Dados mockados dependem desta estrutura

### Riscos Potenciais

**Risco 1: Complexidade do Drag and Drop**

- **Probabilidade:** Media
- **Impacto:** Medio
- **Descricao:** DnD pode ter bugs em diferentes browsers/devices
- **Mitigacao:** Usar @dnd-kit (biblioteca madura), testar em multiplos browsers

**Risco 2: Performance do Realtime com muitos pedidos**

- **Probabilidade:** Baixa
- **Impacto:** Alto
- **Descricao:** Muitos pedidos simultaneos podem sobrecarregar
- **Mitigacao:** Filtrar por tenant no subscribe, paginacao, virtualizacao

**Risco 3: Upload de imagens falhar**

- **Probabilidade:** Media
- **Impacto:** Medio
- **Descricao:** Problemas de CORS, tamanho de arquivo
- **Mitigacao:** Validacao client-side, compressao, retry logic

### Estimativa de Complexidade

**Total de tasks:** ~65 tasks
**Complexidade:** Media
**Tempo estimado:** 3-4 dias

### Criterios de Aceitacao

A feature sera considerada completa quando:

1. **Funcional:**
   - [ ] Login/logout funcionando
   - [ ] Kanban com 5 colunas e drag-and-drop
   - [ ] CRUD completo de categorias
   - [ ] CRUD completo de produtos com variacoes e adicionais
   - [ ] Upload de imagens funcionando
   - [ ] Configuracoes do estabelecimento editaveis
   - [ ] Realtime funcionando para novos pedidos

2. **Qualidade:**
   - [ ] Cobertura de testes >80%
   - [ ] Testes E2E passando
   - [ ] Sem erros no console
   - [ ] Performance aceitavel (<1s load)

3. **Nao-Funcional:**
   - [ ] Codigo segue padroes ESLint/Prettier
   - [ ] Acessibilidade basica implementada
   - [ ] Responsivo em tablet e desktop
   - [ ] Dados mockados disponiveis

### Marcos (Milestones)

**Marco 1:** Setup + Auth + Layout base (Tasks 001-015)
**Marco 2:** Kanban funcionando com realtime (Tasks 016-030)
**Marco 3:** CRUD Cardapio completo (Tasks 031-050)
**Marco 4:** Configuracoes + Testes + Polish (Tasks 051-065)

---

## Requisitos de Negocio

### Valor de Negocio

**Problema que resolve:**
Donos de delivery perdem pedidos por falta de organizacao. Sem um sistema visual, e facil esquecer um pedido ou perder o controle do fluxo de preparo e entrega.

**Beneficios esperados:**

1. **Organizacao:** Visualizacao clara de todos os pedidos por status
2. **Agilidade:** Atualizacao de status com um arraste
3. **Controle:** Historico completo de pedidos
4. **Autonomia:** Dono gerencia cardapio sem suporte tecnico

### KPIs

1. **Tempo medio para aceitar pedido**
   - Baseline: Manual (variavel)
   - Meta: <30 segundos apos receber
   - Prazo: 30 dias apos deploy

2. **Taxa de uso do Kanban**
   - Metrica: % de pedidos movidos pelo kanban vs API direta
   - Meta: >90%
   - Prazo: 30 dias

3. **Categorias/Produtos cadastrados por tenant**
   - Metrica: Media de itens no cardapio
   - Meta: >20 produtos por tenant
   - Prazo: 60 dias

### Impacto no Usuario

**Persona: Dono do Estabelecimento**

- Visao clara de todos os pedidos
- Facilidade para gerenciar cardapio
- Sensacao de controle e profissionalismo

---

**Gerado automaticamente por:** sprint-context-generator skill
**Data:** 2026-02-05
