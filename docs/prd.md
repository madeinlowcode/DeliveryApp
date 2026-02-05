# PRD - PedeAI

## Metadata

| Campo       | Valor                     |
| ----------- | ------------------------- |
| **Projeto** | PedeAI                    |
| **Versão**  | 1.0.0                     |
| **Data**    | 2026-01-27                |
| **Status**  | Draft                     |
| **Autor**   | Product Discovery Session |

---

## 1. Overview

### 1.1 Problema

Estabelecimentos de delivery perdem vendas por não conseguir atender clientes rapidamente. Contratar atendentes para responder via WhatsApp é caro, e os pedidos chegam desorganizados de vários canais. Donos de pequenos e médios negócios precisam de automação acessível que substitua o atendimento humano sem perder qualidade.

### 1.2 Solução

**PedeAI** é um sistema SaaS multi-tenant que oferece um **chat inteligente com IA visual** para atendimento automatizado de pedidos delivery. Em vez de texto puro, a IA responde com componentes visuais interativos (cards de categorias, cards de produtos com imagem e preço, botões clicáveis, seletores de quantidade), criando uma experiência semelhante a um app mobile dentro de uma interface de chat.

Os pedidos realizados pelo chat caem em tempo real num **painel Kanban** para gestão do estabelecimento.

### 1.3 Objetivo

Conquistar **10 estabelecimentos** usando a plataforma, validando a proposta de valor do produto com um MVP funcional.

### 1.4 Proposta de Valor

> "Seu delivery atendido por inteligência artificial - clientes fazem pedidos em segundos, sem precisar de atendentes."

---

## 2. Contexto

### 2.1 Background

O mercado de delivery cresce continuamente no Brasil. Plataformas como iFood cobram taxas altas (12-27%), motivando estabelecimentos a buscar canais próprios. Porém, atender via WhatsApp exige mão de obra dedicada e é propenso a erros. PedeAI resolve isso com IA que atende automaticamente via interface visual moderna.

### 2.2 Usuários

#### Persona 1: Dono do Estabelecimento

| Atributo          | Detalhe                                             |
| ----------------- | --------------------------------------------------- |
| **Porte**         | Qualquer (pequeno a grande)                         |
| **Segmento**      | Restaurantes, farmácias, pet shops, mercados, etc.  |
| **Necessidade**   | Sistema que faz 90%+ do atendimento automaticamente |
| **Dor principal** | Perder vendas por demora no atendimento             |
| **Nível técnico** | Baixo a médio                                       |

#### Persona 2: Cliente Final

| Atributo          | Detalhe                                                |
| ----------------- | ------------------------------------------------------ |
| **Perfil**        | Universal (todas as idades e perfis)                   |
| **Necessidade**   | Fazer pedido rápido, sem fricção                       |
| **Dor principal** | Digitar muito, interfaces confusas, demora na resposta |
| **Expectativa**   | Experiência visual e interativa, como um app           |

### 2.3 Métricas de Sucesso (MVP)

| Métrica                                    | Target      |
| ------------------------------------------ | ----------- |
| Estabelecimentos cadastrados               | 10          |
| Pedidos completados via chat IA            | 100         |
| Taxa de conclusão do pedido (início → fim) | > 60%       |
| Tempo médio para completar um pedido       | < 3 minutos |

---

## 3. Jobs To Be Done (JTBD)

### Dono do Estabelecimento

| Tipo          | Job                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Funcional** | "Quando recebo muitos pedidos, quero resposta automática, para não perder vendas enquanto estou ocupado."           |
| **Funcional** | "Quando os pedidos chegam, quero ver tudo organizado num só lugar, para saber o que preparar e entregar."           |
| **Emocional** | "Quando fecho o caixa do dia, quero me sentir no controle, para ter tranquilidade de que nada passou despercebido." |
| **Social**    | "Quando clientes elogiam o atendimento, quero parecer moderno, para que meu negócio seja visto como profissional."  |

### Cliente Final

| Tipo          | Job                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Funcional** | "Quando quero pedir delivery, quero fazer meu pedido rapidamente, para não perder tempo com menus confusos."         |
| **Funcional** | "Quando já pedi nesse lugar antes, quero que ele lembre minhas preferências, para não precisar repetir tudo."        |
| **Emocional** | "Quando faço um pedido, quero me sentir atendido, para ter certeza de que meu pedido foi entendido."                 |
| **Social**    | "Quando indico um lugar para amigos, quero que a experiência seja boa, para não passar vergonha com indicação ruim." |

---

## 4. Assumptions (Suposições)

### 4.1 Valor

| #   | Suposição                                           | Risco | Validação                         |
| --- | --------------------------------------------------- | ----- | --------------------------------- |
| V1  | Donos de delivery preferem IA a contratar atendente | Médio | Validar com primeiros 10 clientes |
| V2  | Clientes vão usar chat em vez de ligar/WhatsApp     | Médio | Monitorar taxa de adoção          |
| V3  | Interface visual (cards) é melhor que texto puro    | Baixo | Comparar com A/B testing futuro   |
| V4  | 10 estabelecimentos vão pagar por isso              | Médio | Validar no MVP                    |

### 4.2 Usabilidade

| #   | Suposição                                         | Risco | Validação               |
| --- | ------------------------------------------------- | ----- | ----------------------- |
| U1  | Donos conseguem configurar cardápio sozinhos      | Baixo | Testar com 3 usuários   |
| U2  | Clientes entendem que estão falando com IA        | Baixo | Feedback qualitativo    |
| U3  | Fluxo de pedido por chat é intuitivo sem tutorial | Baixo | Observar primeiros usos |

### 4.3 Viabilidade

| #   | Suposição                                   | Risco | Validação                  |
| --- | ------------------------------------------- | ----- | -------------------------- |
| F1  | É possível fazer o MVP em 1 semana          | Médio | Monitorar progresso diário |
| F2  | IA entende pedidos com variações/adicionais | Médio | Testar cenários complexos  |
| F3  | Supabase Realtime atende para Kanban        | Baixo | POC no dia 1               |

---

## 5. Arquitetura do Sistema

### 5.1 Estrutura de Painéis

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA PedeAI                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. PAINEL SUPERADMIN              admin.pedeai.com.br          │
│     └── Gestão da plataforma SaaS (empresas, planos, métricas) │
│                                                                 │
│  2. PAINEL ESTABELECIMENTO         {slug}.pedeai.com.br         │
│     └── Gestão do delivery (kanban, cardápio, clientes, config) │
│                                                                 │
│  3. CHAT DO CLIENTE                pedido.{slug}.pedeai.com.br  │
│     └── Portal de pedidos com IA visual                         │
│                                                                 │
│  4. SITE INSTITUCIONAL             www.pedeai.com.br            │
│     └── Landing page + cadastro de novos estabelecimentos       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Canais de Acesso do Cliente

```
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Site/Link    │   │  QR Code      │   │  WhatsApp     │
│  direto       │   │  na loja      │   │  (msg auto    │
│               │   │               │   │  com link)    │
└──────┬────────┘   └──────┬────────┘   └──────┬────────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ▼
              ┌─────────────────────────┐
              │     Chat IA PedeAI      │
              │  (portal de pedidos)    │
              └─────────────────────────┘
```

### 5.3 Fluxo de Identificação do Cliente

```
1. Cliente acessa o chat
2. Sistema pede apenas o número de WhatsApp
3. Verifica no banco:

   CLIENTE EXISTE:
   → Carrega nome, endereços salvos
   → "Olá João! Quer entregar no mesmo endereço?"
   → [Sim] [Outro endereço]

   CLIENTE NOVO:
   → Pede apenas o nome neste momento
   → Endereço só na hora de finalizar o pedido
   → Dados coletados progressivamente durante a conversa
```

---

## 6. Scope (Escopo)

### 6.1 MVP (Semana 1)

#### 6.1.1 Chat do Cliente (Portal de Pedidos)

| #   | Feature                    | Descrição                                                                                 |
| --- | -------------------------- | ----------------------------------------------------------------------------------------- |
| C1  | Interface de chat          | Layout estilo Claude.ai com sidebar esquerda (últimos pedidos) e área de conversa central |
| C2  | Cards de categorias        | IA mostra categorias em cards visuais com imagem e nome (estilo app mobile)               |
| C3  | Cards de produtos          | IA mostra produtos em cards com imagem, nome, descrição e preço + botão adicionar         |
| C4  | Carrinho visual            | Resumo do carrinho com itens, quantidades e total                                         |
| C5  | Botões de ação             | Botões clicáveis em vez de digitação (selecionar categoria, adicionar item, finalizar)    |
| C6  | Identificação por WhatsApp | Cliente informa número → sistema busca/cria cadastro                                      |
| C7  | Cadastro progressivo       | Nome no início, endereço só na finalização, dados salvos para próxima vez                 |
| C8  | Variações de produto       | Seleção visual de tamanhos/sabores com preços diferentes                                  |
| C9  | Adicionais/complementos    | Seleção de adicionais com preços                                                          |
| C10 | Finalização do pedido      | Endereço + forma de pagamento + confirmação                                               |
| C11 | Histórico de pedidos       | Sidebar esquerda mostra últimos pedidos do cliente                                        |
| C12 | Repetir pedido             | Botão para repetir um pedido anterior                                                     |

#### 6.1.2 Painel do Estabelecimento

| #   | Feature               | Descrição                                                                     |
| --- | --------------------- | ----------------------------------------------------------------------------- |
| E1  | Login/autenticação    | Email + senha via Supabase Auth                                               |
| E2  | Dashboard Kanban      | Colunas: Confirmado → Em Preparo → Pronto → Saiu Entrega → Entregue           |
| E3  | Drag and drop         | Arrastar pedidos entre colunas                                                |
| E4  | Cards de pedido       | Número, cliente, itens, endereço, valor, pagamento                            |
| E5  | Tempo real            | Novo pedido aparece automaticamente (Supabase Realtime)                       |
| E6  | Alerta de novo pedido | Som/notificação visual ao receber pedido                                      |
| E7  | CRUD categorias       | Criar, editar, excluir, ordenar categorias do cardápio                        |
| E8  | CRUD produtos         | Criar, editar, excluir produtos com nome, descrição, preço, imagem, categoria |
| E9  | CRUD variações        | Tamanhos/sabores com preços diferentes por produto                            |
| E10 | CRUD adicionais       | Complementos com preços vinculados aos produtos                               |
| E11 | Disponibilidade       | Ativar/desativar produto temporariamente                                      |
| E12 | White-label           | Logo e nome do estabelecimento customizáveis na sidebar                       |
| E13 | Horário funcionamento | Configurar abertura/fechamento por dia da semana                              |
| E14 | Config básica         | Nome, telefone, endereço, pedido mínimo, formas de pagamento                  |

#### 6.1.3 Agente IA

| #   | Feature               | Descrição                                                  |
| --- | --------------------- | ---------------------------------------------------------- |
| A1  | Saudação inteligente  | Mensagem de boas-vindas personalizada pelo estabelecimento |
| A2  | Consultar cardápio    | Tool: busca categorias e produtos disponíveis              |
| A3  | Adicionar ao carrinho | Tool: adiciona item com variação e adicionais              |
| A4  | Remover do carrinho   | Tool: remove item do carrinho                              |
| A5  | Ver carrinho          | Tool: exibe resumo do carrinho atual                       |
| A6  | Calcular total        | Tool: calcula subtotal + taxa de entrega                   |
| A7  | Finalizar pedido      | Tool: grava pedido no banco, notifica painel               |
| A8  | Verificar horário     | Tool: informa se está aberto ou fechado                    |
| A9  | Consultar status      | Tool: informa status de pedido existente                   |
| A10 | Renderização visual   | Respostas com cards e botões em vez de texto puro          |

### 6.2 Pós-MVP (Futuro)

| Fase       | Features                                                                       |
| ---------- | ------------------------------------------------------------------------------ |
| **Fase 2** | Painel Superadmin completo (CRUD empresas, planos, faturamento, "entrar como") |
| **Fase 2** | Site institucional + cadastro de novos estabelecimentos                        |
| **Fase 2** | Gestão de bairros com taxas de entrega                                         |
| **Fase 2** | Gestão de entregadores                                                         |
| **Fase 3** | Integração WhatsApp (MegaAPI) - envio de mensagens do estabelecimento          |
| **Fase 3** | Chat estilo WhatsApp Web no painel (comunicação estabelecimento → cliente)     |
| **Fase 3** | Notificações de status do pedido via WhatsApp                                  |
| **Fase 4** | Impressão térmica automática                                                   |
| **Fase 4** | Sistema de pagamento/assinaturas (SaaS billing)                                |
| **Fase 4** | Follow-up de carrinho abandonado                                               |
| **Fase 5** | Relatórios e analytics                                                         |
| **Fase 5** | Programa de fidelidade                                                         |
| **Fase 5** | Avaliação pós-pedido                                                           |

---

## 7. User Stories (MVP)

### 7.1 Chat do Cliente

```
US-C01: Ver categorias do cardápio
Como cliente,
Quero ver as categorias em cards visuais com imagens,
Para que eu encontre rapidamente o que desejo pedir.

Critérios de aceite:
- Cards exibem imagem e nome da categoria
- Ao clicar no card, IA mostra os produtos daquela categoria
- Layout responsivo (funciona em mobile)
```

```
US-C02: Ver produtos de uma categoria
Como cliente,
Quero ver os produtos em cards com imagem, nome, descrição e preço,
Para que eu escolha o que quero pedir sem precisar digitar.

Critérios de aceite:
- Cards exibem imagem, nome, descrição curta e preço
- Botão "Adicionar" visível em cada card
- Produtos indisponíveis não aparecem
```

```
US-C03: Adicionar item ao carrinho
Como cliente,
Quero adicionar um produto ao carrinho clicando num botão,
Para que eu monte meu pedido sem precisar digitar.

Critérios de aceite:
- Se tem variações, mostra opções clicáveis (ex: tamanhos)
- Se tem adicionais, mostra lista com checkbox e preço
- Confirmação visual de item adicionado
- Carrinho atualiza automaticamente
```

```
US-C04: Identificação por WhatsApp
Como cliente,
Quero informar meu WhatsApp e ser reconhecido,
Para que eu não precise repetir meus dados toda vez.

Critérios de aceite:
- Campo pede apenas número de WhatsApp no início
- Se cliente existe: carrega nome e endereços salvos
- Se cliente novo: pede apenas o nome
- Endereço solicitado só na finalização
```

```
US-C05: Finalizar pedido
Como cliente,
Quero confirmar meu pedido com endereço e forma de pagamento,
Para que meu pedido seja enviado ao estabelecimento.

Critérios de aceite:
- Mostra resumo completo (itens, quantidades, valores)
- Cliente existente: oferece endereço salvo ou novo
- Cliente novo: solicita endereço e salva para próxima vez
- Seleção de forma de pagamento (configurada pelo estabelecimento)
- Confirmação final antes de enviar
- Mensagem de confirmação com número do pedido
```

```
US-C06: Ver histórico de pedidos
Como cliente,
Quero ver meus últimos pedidos na sidebar,
Para que eu possa acompanhar ou repetir um pedido anterior.

Critérios de aceite:
- Sidebar esquerda lista últimos pedidos (data, itens resumidos, valor)
- Botão "Pedir novamente" em cada pedido
- Ao clicar, carrega os itens no carrinho
```

### 7.2 Painel do Estabelecimento

```
US-E01: Visualizar pedidos no Kanban
Como dono do estabelecimento,
Quero ver meus pedidos organizados em colunas de status,
Para que eu saiba o que precisa ser preparado e entregue.

Critérios de aceite:
- 5 colunas: Confirmado, Em Preparo, Pronto, Saiu Entrega, Entregue
- Card mostra: número, cliente, itens, endereço, valor, pagamento
- Drag and drop entre colunas
- Novos pedidos aparecem em tempo real com alerta sonoro
```

```
US-E02: Gerenciar cardápio
Como dono do estabelecimento,
Quero cadastrar e organizar meu cardápio (categorias, produtos, variações, adicionais),
Para que os clientes vejam as opções corretas no chat.

Critérios de aceite:
- CRUD completo de categorias com imagem e ordenação
- CRUD de produtos com nome, descrição, preço, imagem, categoria
- CRUD de variações por produto (tamanho, sabor) com preços
- CRUD de adicionais com preços vinculados a produtos
- Toggle de disponibilidade por produto
- Drag and drop para ordenação
```

```
US-E03: Personalizar o estabelecimento
Como dono do estabelecimento,
Quero configurar logo, nome e horários do meu negócio,
Para que o chat do cliente reflita minha marca.

Critérios de aceite:
- Upload de logo (exibida na sidebar do chat e do painel)
- Nome do estabelecimento editável
- Horário de funcionamento por dia da semana
- Mensagem de estabelecimento fechado customizável
- Configuração de formas de pagamento aceitas
- Configuração de pedido mínimo
```

---

## 8. Technical Stack

### 8.1 Stack Escolhida

| Camada             | Tecnologia                        | Justificativa                                                |
| ------------------ | --------------------------------- | ------------------------------------------------------------ |
| **Frontend**       | Next.js 16+ (App Router)          | SSR, Server Components, API Routes integradas                |
| **Estilização**    | Tailwind CSS + shadcn/ui          | Desenvolvimento rápido, componentes acessíveis               |
| **Chat UI**        | Assistant UI + Vercel AI SDK 6    | Renderização de tools como componentes React, streaming      |
| **Autenticação**   | Supabase Auth                     | JWT integrado, social login, multi-tenant ready              |
| **Banco de Dados** | Supabase (PostgreSQL)             | Realtime, RLS para multi-tenant, migrável para Postgres puro |
| **Realtime**       | Supabase Realtime                 | Kanban updates sem WebSocket manual                          |
| **Storage**        | Supabase Storage                  | Imagens de produtos, logos                                   |
| **LLM**            | OpenRouter deepseek/deepseek-v3.2 | Qualidade de resposta, function calling robusto              |
| **IA SDK**         | Vercel AI SDK 6                   | Streaming, tool calls, integração nativa com React           |
| **Deploy**         | Vercel                            | Zero-config para Next.js, edge functions                     |

### 8.2 Alternativas Consideradas

| Escolha      | Alternativa       | Motivo da decisão                                      |
| ------------ | ----------------- | ------------------------------------------------------ |
| Supabase     | Firebase          | Supabase é PostgreSQL (migrável), RLS nativo, realtime |
| Claude API   | OpenAI GPT-4      | Qualidade em português, tool calling confiável         |
| Assistant UI | Construir do zero | Componentes prontos para renderizar tools como UI      |
| Vercel       | AWS/Railway       | Zero-config para Next.js, free tier generoso           |

### 8.3 Estrutura Multi-tenant

```
Estratégia: Row-Level Security (RLS) no Supabase

- Todas as tabelas possuem coluna tenant_id
- RLS policies garantem isolamento automático
- Tenant identificado pelo subdomínio na URL
- Sem necessidade de bancos separados
```

---

## 9. Banco de Dados (Tabelas Principais)

| Tabela               | Descrição                                   | Relações                        |
| -------------------- | ------------------------------------------- | ------------------------------- |
| `tenants`            | Estabelecimentos (nome, slug, logo, config) | -                               |
| `users`              | Usuários do painel (donos, operadores)      | → tenants                       |
| `categories`         | Categorias do cardápio                      | → tenants                       |
| `products`           | Produtos                                    | → tenants, → categories         |
| `product_variations` | Variações (tamanho, sabor)                  | → products                      |
| `product_addons`     | Adicionais/complementos                     | → products                      |
| `customers`          | Clientes (nome, whatsapp)                   | → tenants                       |
| `customer_addresses` | Endereços dos clientes                      | → customers                     |
| `orders`             | Pedidos                                     | → tenants, → customers          |
| `order_items`        | Itens do pedido                             | → orders, → products            |
| `order_item_addons`  | Adicionais dos itens                        | → order_items, → product_addons |
| `carts`              | Carrinhos ativos (sessão do chat)           | → tenants, → customers          |
| `cart_items`         | Itens no carrinho                           | → carts, → products             |
| `business_hours`     | Horários de funcionamento                   | → tenants                       |
| `tenant_settings`    | Configurações gerais                        | → tenants                       |

---

## 10. Interface do Chat (Conceito)

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │   [LOGO]     │  │                                          │  │
│  │  Nome Estab. │  │  🤖 Olá João! Bem-vindo de volta!       │  │
│  │              │  │     O que vai querer hoje?                │  │
│  │ ─────────── │  │                                          │  │
│  │              │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │
│  │ ÚLTIMOS      │  │  │ 🍕      │ │ 🍔      │ │ 🥤      │   │  │
│  │ PEDIDOS      │  │  │ Pizzas  │ │ Lanches │ │ Bebidas │   │  │
│  │              │  │  └─────────┘ └─────────┘ └─────────┘   │  │
│  │ #142 - R$45  │  │                                          │  │
│  │ 2 pizzas     │  │  ┌─────────┐ ┌─────────┐               │  │
│  │ [Pedir de    │  │  │ 🍰      │ │ 🥗      │               │  │
│  │  novo]       │  │  │ Sobrem. │ │ Saladas │               │  │
│  │              │  │  └─────────┘ └─────────┘               │  │
│  │ #138 - R$32  │  │                                          │  │
│  │ 1 lanche     │  │                                          │  │
│  │ [Pedir de    │  │  ─────────────────────────────────────  │  │
│  │  novo]       │  │  🛒 Carrinho: 0 itens                   │  │
│  │              │  │                                          │  │
│  │              │  │  ┌────────────────────────────────────┐  │  │
│  │              │  │  │  Digite sua mensagem...        [➤] │  │  │
│  │              │  │  └────────────────────────────────────┘  │  │
│  └──────────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Success Metrics (KPIs)

### MVP

| KPI                          | Target  | Como medir                                   |
| ---------------------------- | ------- | -------------------------------------------- |
| Estabelecimentos ativos      | 10      | COUNT tenants com pedidos nos últimos 7 dias |
| Pedidos completados via chat | 100     | COUNT orders com origin='chat_ai'            |
| Taxa de conclusão do pedido  | > 60%   | Pedidos finalizados / Carrinhos iniciados    |
| Tempo médio de pedido        | < 3 min | Timestamp início chat → confirmação pedido   |
| Uptime do sistema            | > 99%   | Monitoramento Vercel                         |

### Pós-MVP

| KPI                         | Target    | Como medir                     |
| --------------------------- | --------- | ------------------------------ |
| MRR (receita recorrente)    | A definir | Sum(plano \* tenants ativos)   |
| Churn mensal                | < 10%     | Tenants que cancelaram / Total |
| NPS                         | > 50      | Pesquisa periódica             |
| Pedidos/mês/estabelecimento | > 200     | Média de orders por tenant     |

---

## 12. Dependencies & Blockers

### Dependencies

| #   | Dependência                | Impacto                                         | Status      |
| --- | -------------------------- | ----------------------------------------------- | ----------- |
| D1  | Conta Supabase criada      | Bloqueante - sem banco, sem sistema             | A verificar |
| D2  | API Key Claude (Anthropic) | Bloqueante - sem IA, sem chat                   | A verificar |
| D3  | Conta Vercel               | Bloqueante - sem deploy                         | A verificar |
| D4  | Domínio pedeai.com.br      | Não bloqueante para MVP (pode usar .vercel.app) | A verificar |

### Riscos

| #   | Risco                             | Probabilidade | Impacto | Mitigação                            |
| --- | --------------------------------- | ------------- | ------- | ------------------------------------ |
| R1  | MVP ultrapassar 1 semana          | Média         | Alto    | Cortar features não essenciais       |
| R2  | IA não entender pedidos complexos | Baixa         | Médio   | Prompt engineering + fallback manual |
| R3  | Custo API Claude muito alto       | Baixa         | Médio   | Monitorar tokens, usar cache         |

---

## 13. Fases de Desenvolvimento

### Fase 1 - MVP (Semana 1)

| Dia   | Foco                                                             |
| ----- | ---------------------------------------------------------------- |
| Dia 1 | Setup projeto, Supabase schema, autenticação, estrutura base     |
| Dia 2 | CRUD cardápio (categorias, produtos, variações, adicionais)      |
| Dia 3 | Chat IA: interface visual + tools (consultar cardápio, carrinho) |
| Dia 4 | Chat IA: finalização pedido + identificação cliente              |
| Dia 5 | Kanban (tempo real) + alerta sonoro + testes                     |
| Dia 6 | Configurações do estabelecimento + white-label                   |
| Dia 7 | Testes finais, ajustes, deploy                                   |

### Fase 2 - Expansão

- Painel Superadmin (CRUD empresas, planos, "entrar como")
- Site institucional + onboarding de novos estabelecimentos
- Gestão de bairros e taxas de entrega
- Gestão de entregadores

### Fase 3 - WhatsApp

- Integração MegaAPI (conexão, QR Code, status)
- Chat estilo WhatsApp Web no painel
- Notificações de status do pedido via WhatsApp
- Mensagem automática com link do chat ao receber contato

### Fase 4 - Monetização

- Impressão térmica
- Sistema de billing (planos/assinaturas)
- Follow-up de carrinho abandonado

### Fase 5 - Growth

- Relatórios e analytics
- Programa de fidelidade
- Avaliação pós-pedido
- Cardápio digital público (SEO)

---

## 14. Próximos Passos

1. **Validar PRD** - Revisar e aprovar este documento
2. **Configurar ambiente** - Criar contas Supabase, Vercel, Anthropic
3. **Executar `/sprint-context-generator`** - Gerar contexto técnico do sprint
4. **Iniciar desenvolvimento** - Seguir plano da Fase 1 (MVP)

---

## Fontes e Referências

- [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6)
- [Assistant UI - React Library for AI Chat](https://github.com/assistant-ui/assistant-ui)
- [shadcn/ui AI Components](https://www.shadcn.io/ai)
- [Makerkit - SaaS Boilerplate](https://makerkit.dev/next-supabase)
- [Supastarter](https://supastarter.dev/)
- [Vercel AI SDK Introduction](https://ai-sdk.dev/docs/introduction)
- [React Server Components: Render Visual Interface in Chat](https://ai-sdk.dev/cookbook/rsc/render-visual-interface-in-chat)
