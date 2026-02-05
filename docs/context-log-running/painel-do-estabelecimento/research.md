# Pesquisa e Documentacao: PedeAI MVP

**Data da pesquisa:** 2026-02-05
**Tecnologias pesquisadas:** 5 tecnologias
**Melhores praticas:** 5 areas (Clean Arch, E2E, TDD, Linting, Hooks)

---

## Indice

1. [Tecnologias Utilizadas](#1-tecnologias-utilizadas)
2. [Melhores Praticas Pesquisadas](#2-melhores-praticas-pesquisadas)
3. [Artigos Relevantes](#3-artigos-relevantes)
4. [Exemplos de Implementacao](#4-exemplos-de-implementacao)

---

## 1. Tecnologias Utilizadas

### 1.1. Supabase

- **Link oficial**: https://supabase.com/docs
- **Versao**: Latest (2026)
- **Descricao**: Plataforma de desenvolvimento Postgres com Auth, Realtime, Storage e Row Level Security

**Instalacao:**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Principais APIs:**

- `createClient()`: Criar cliente Supabase
- `supabase.auth.signInWithPassword()`: Login com email/senha
- `supabase.auth.signUp()`: Registro de usuario
- `supabase.from('table').select()`: Query de dados
- `supabase.channel().on()`: Subscricao Realtime
- `supabase.storage.from('bucket').upload()`: Upload de arquivos

**Exemplo - Row Level Security (RLS):**

```sql
-- Criar tabela com RLS
create table profiles (
  id uuid references auth.users not null primary key,
  tenant_id uuid references tenants(id) not null,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);

-- Habilitar RLS
alter table profiles enable row level security;

-- Policy: Usuarios so veem dados do seu tenant
create policy "Users can view own tenant data"
  on profiles for select
  using (tenant_id = (select tenant_id from users where id = auth.uid()));

-- Policy: Usuarios podem atualizar proprio perfil
create policy "Users can update own profile"
  on profiles for update
  using ((select auth.uid()) = id);
```

**Exemplo - Realtime Subscription:**

```typescript
// Subscribing to database changes
const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `tenant_id=eq.${tenantId}`,
    },
    (payload) => {
      console.log('Order changed:', payload)
      // Update UI with new order
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

**Exemplo - Storage Upload:**

```typescript
// Generate signed upload URL (API Route)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabaseAdmin.storage
  .from('products')
  .createSignedUploadUrl(`${tenantId}/${productId}`, { upsert: true })
```

**Links uteis:**

- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- Realtime: https://supabase.com/docs/guides/realtime

---

### 1.2. Vercel AI SDK 6

- **Link oficial**: https://ai-sdk.dev/docs
- **Versao**: 6.x (2026)
- **Descricao**: Toolkit TypeScript para construir aplicacoes com IA, streaming, tools e function calling

**Instalacao:**

```bash
npm install ai @ai-sdk/openai @ai-sdk/react
```

**Principais APIs:**

- `streamText()`: Stream de texto com modelo LLM
- `useChat()`: Hook React para chat
- `tools`: Definicao de funcoes que a IA pode chamar
- `convertToModelMessages()`: Converter mensagens para formato do modelo

**Exemplo - API Route com Tools:**

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'

export async function POST(req: Request) {
  const { messages, system } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    system,
    messages,
    tools: {
      getCategories: tool({
        description: 'Get available menu categories',
        parameters: z.object({}),
        execute: async () => {
          // Fetch from database
          return { categories: ['Pizzas', 'Lanches', 'Bebidas'] }
        },
      }),
      addToCart: tool({
        description: 'Add item to cart',
        parameters: z.object({
          productId: z.string(),
          quantity: z.number(),
          variations: z.array(z.string()).optional(),
          addons: z.array(z.string()).optional(),
        }),
        execute: async ({ productId, quantity, variations, addons }) => {
          // Add to cart logic
          return { success: true, cartTotal: 45.9 }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
```

**Exemplo - useChat Hook com Tool Rendering:**

```typescript
'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export default function Chat() {
  const { messages, sendMessage, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  return (
    <>
      {messages?.map(message => (
        <div key={message.id}>
          {message.parts.map(part => {
            switch (part.type) {
              case 'text':
                return <div>{part.text}</div>

              case 'tool-getCategories':
                if (part.state === 'output-available') {
                  return <CategoryCards categories={part.output.categories} />
                }
                return <LoadingSpinner />

              case 'tool-addToCart':
                if (part.state === 'output-available') {
                  return <CartConfirmation total={part.output.cartTotal} />
                }
                return <LoadingSpinner />
            }
          })}
        </div>
      ))}
    </>
  )
}
```

**Links uteis:**

- Tools: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- useChat: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- Streaming: https://ai-sdk.dev/docs/ai-sdk-core/streaming

---

### 1.3. Assistant UI

- **Link oficial**: https://www.assistant-ui.com/docs
- **Versao**: Latest (2026)
- **Descricao**: Biblioteca React para criar interfaces de chat com IA, com componentes prontos e integração com Vercel AI SDK

**Instalacao:**

```bash
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
```

**Principais componentes:**

- `AssistantRuntimeProvider`: Provider do runtime
- `useChatRuntime`: Hook para integrar com AI SDK
- `Thread`: Componente principal de conversa
- `ThreadPrimitive`: Primitivos para customizacao
- `Composer`: Input de mensagens

**Exemplo - Setup basico:**

```typescript
"use client"

import { Thread } from "@/components/assistant-ui/thread"
import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk"

export default function ChatPage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
```

**Exemplo - Thread customizado com primitivos:**

```typescript
import { ThreadPrimitive } from "@assistant-ui/react"

const CustomThread = () => (
  <ThreadPrimitive.Root className="flex flex-col h-full">
    <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
      <ThreadPrimitive.Empty>
        <div className="text-center text-gray-500 py-8">
          Ola! O que voce gostaria de pedir hoje?
        </div>
      </ThreadPrimitive.Empty>

      <ThreadPrimitive.Messages
        components={{
          UserMessage: UserMessage,
          AssistantMessage: AssistantMessage,
        }}
      />
    </ThreadPrimitive.Viewport>

    <ThreadPrimitive.ScrollToBottom asChild>
      <button className="absolute bottom-20 right-4 rounded-full p-2 bg-white shadow">
        Scroll to bottom
      </button>
    </ThreadPrimitive.ScrollToBottom>

    <Composer />
  </ThreadPrimitive.Root>
)
```

**Links uteis:**

- Getting Started: https://www.assistant-ui.com/docs/getting-started
- AI SDK Integration: https://www.assistant-ui.com/docs/runtimes/ai-sdk
- Primitives: https://www.assistant-ui.com/docs/primitives

---

### 1.4. OpenRouter

- **Link oficial**: https://openrouter.ai/docs
- **Versao**: API v1
- **Descricao**: Gateway para multiplos modelos LLM com API compativel com OpenAI

**Instalacao:**

```bash
# Usar com AI SDK OpenAI provider
npm install @ai-sdk/openai
```

**Configuracao:**

```typescript
import { createOpenAI } from '@ai-sdk/openai'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

// Usar modelo deepseek
const model = openrouter('deepseek/deepseek-chat')
```

**Modelos recomendados:**

- `deepseek/deepseek-chat`: Bom custo-beneficio, suporta function calling
- `anthropic/claude-3-sonnet`: Alta qualidade em portugues
- `openai/gpt-4o-mini`: Rapido e barato

**Links uteis:**

- Models: https://openrouter.ai/models
- API Reference: https://openrouter.ai/docs/api-reference

---

### 1.5. shadcn/ui

- **Link oficial**: https://ui.shadcn.com
- **Versao**: Latest (2026)
- **Descricao**: Colecao de componentes UI acessiveis e customizaveis para React

**Instalacao:**

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet input
```

**Componentes principais para o projeto:**

- `Button`: Botoes com variantes
- `Card`: Cards para produtos e categorias
- `Dialog/Sheet`: Modais e paineis laterais
- `Input`: Campos de formulario
- `DropdownMenu`: Menus dropdown
- `Tabs`: Navegacao por abas

**Exemplo - Card de Produto:**

```typescript
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function ProductCard({ product }) {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <img src={product.imageUrl} alt={product.name} className="rounded-lg" />
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <p className="text-lg font-bold mt-2">R$ {product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Adicionar</Button>
      </CardFooter>
    </Card>
  )
}
```

**Exemplo - Dark Mode:**

```typescript
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Links uteis:**

- Components: https://ui.shadcn.com/docs/components
- Dark Mode: https://ui.shadcn.com/docs/dark-mode
- CLI: https://ui.shadcn.com/docs/cli

---

## 2. Melhores Praticas Pesquisadas

### 2.1. Clean Architecture para Next.js

**Fontes:**

- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide)
- [Modern Full Stack Architecture Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)

**Estrutura de diretorios recomendada:**

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rotas autenticadas
│   │   ├── dashboard/
│   │   ├── cardapio/
│   │   └── configuracoes/
│   ├── (public)/          # Rotas publicas
│   │   └── [slug]/        # Chat do cliente (tenant slug)
│   ├── api/               # API Routes
│   │   ├── chat/
│   │   └── webhooks/
│   └── layout.tsx
│
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Componentes por feature
│   │   ├── kanban/
│   │   ├── cardapio/
│   │   └── chat/
│   └── shared/           # Componentes compartilhados
│
├── lib/                   # Utilitarios e configuracoes
│   ├── supabase/         # Cliente Supabase
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/               # Configuracao AI SDK
│   ├── utils.ts
│   └── constants.ts
│
├── services/              # Logica de negocio
│   ├── orders/
│   ├── products/
│   ├── customers/
│   └── cart/
│
├── hooks/                 # Custom React hooks
│   ├── use-orders.ts
│   ├── use-realtime.ts
│   └── use-cart.ts
│
├── types/                 # TypeScript types
│   ├── database.ts       # Types gerados do Supabase
│   ├── api.ts
│   └── index.ts
│
└── stores/               # Estado global (Zustand)
    ├── cart-store.ts
    └── ui-store.ts
```

**Principios chave:**

- **Separacao de responsabilidades**: UI separada de logica de negocio
- **Feature-based organization**: Codigo agrupado por dominio
- **Server Components por padrao**: Client Components apenas quando necessario
- **Colocacao**: Arquivos relacionados proximos uns dos outros

---

### 2.2. Testes E2E com Playwright

**Fontes:**

- [Testing: Playwright | Next.js](https://nextjs.org/docs/pages/guides/testing/playwright)
- [E2E Testing Next.js with Playwright](https://medium.com/@natanael280198/end-to-end-testing-your-next-js-app-with-playwright-75ada18447ac)

**Setup:**

```bash
npm init playwright@latest
```

**Estrutura recomendada:**

```
tests/
├── e2e/
│   ├── fixtures/          # Dados de teste
│   │   └── test-data.ts
│   ├── pages/             # Page Object Model
│   │   ├── login.page.ts
│   │   ├── dashboard.page.ts
│   │   └── cardapio.page.ts
│   └── specs/
│       ├── auth.spec.ts
│       ├── orders.spec.ts
│       └── cardapio.spec.ts
└── playwright.config.ts
```

**Exemplo - Page Object Model:**

```typescript
// tests/e2e/pages/login.page.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Senha')
    this.submitButton = page.getByRole('button', { name: 'Entrar' })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

**Exemplo - Teste E2E:**

```typescript
// tests/e2e/specs/auth.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'password123')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Bem-vindo')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('invalid@example.com', 'wrong')

    await expect(page.getByText('Credenciais invalidas')).toBeVisible()
  })
})
```

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

### 2.3. TDD (Test-Driven Development)

**Workflow Red-Green-Refactor:**

1. RED: Escrever teste que falha
2. GREEN: Implementar codigo minimo para passar
3. REFACTOR: Melhorar codigo mantendo testes passando

**Exemplo pratico:**

```typescript
// 1. RED: Teste falha (servico ainda nao existe)
describe('OrderService', () => {
  it('should calculate order total with addons', () => {
    const items = [{ productId: '1', price: 25.0, quantity: 2, addons: [{ price: 3.0 }] }]
    const deliveryFee = 5.0

    const total = OrderService.calculateTotal(items, deliveryFee)

    expect(total).toBe(61.0) // (25 + 3) * 2 + 5
  })
})

// 2. GREEN: Implementacao minima
class OrderService {
  static calculateTotal(items: OrderItem[], deliveryFee: number): number {
    const itemsTotal = items.reduce((sum, item) => {
      const addonsTotal = item.addons?.reduce((a, addon) => a + addon.price, 0) || 0
      return sum + (item.price + addonsTotal) * item.quantity
    }, 0)
    return itemsTotal + deliveryFee
  }
}

// 3. REFACTOR: Melhorar legibilidade
class OrderService {
  static calculateTotal(items: OrderItem[], deliveryFee: number): number {
    const itemsTotal = items.reduce((sum, item) => {
      return sum + this.calculateItemTotal(item)
    }, 0)
    return itemsTotal + deliveryFee
  }

  private static calculateItemTotal(item: OrderItem): number {
    const addonsTotal = this.calculateAddonsTotal(item.addons)
    return (item.price + addonsTotal) * item.quantity
  }

  private static calculateAddonsTotal(addons?: Addon[]): number {
    return addons?.reduce((sum, addon) => sum + addon.price, 0) || 0
  }
}
```

**Metas de cobertura:**

- Unitarios: >80%
- Integracao: >70%
- E2E: Fluxos principais 100%

---

### 2.4. Linting (ESLint/Prettier)

**Fontes:**

- [ESLint Prettier Husky Setup Next.js](https://dev.to/joshchu/how-to-setup-prettier-eslint-husky-and-lint-staged-with-a-nextjs-and-typescript-project-i7b)
- [Next.js ESLint Configuration](https://nextjs.org/docs/app/api-reference/config/eslint)

**Instalacao:**

```bash
npm install -D eslint prettier eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

**eslint.config.mjs:**

```javascript
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'],
  },
]

export default eslintConfig
```

**.prettierrc:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Scripts package.json:**

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

---

### 2.5. Husky Git Hooks

**Fontes:**

- [Step-by-Step Guide Husky ESLint Prettier](https://dev.to/mdasif-me/step-by-step-guide-to-setting-up-husky-eslint-and-prettier-in-a-nextjs-typescript-project-2f2l)

**Setup completo:**

```bash
npm install -D husky lint-staged
npx husky init
```

**.husky/pre-commit:**

```bash
npx lint-staged
```

**.husky/pre-push:**

```bash
npm run type-check
npm run test
```

**package.json (lint-staged):**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**package.json (scripts adicionais):**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky"
  }
}
```

---

## 3. Artigos Relevantes

Lista de artigos e recursos para leitura futura:

- [Next.js Folder Structure Best Practices 2026](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide) - Guia completo de estrutura de pastas
- [Modern Full Stack Architecture Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/) - Arquitetura moderna para aplicacoes fullstack
- [Testing: Playwright | Next.js](https://nextjs.org/docs/pages/guides/testing/playwright) - Documentacao oficial de testes E2E
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security) - Guia completo de Row Level Security
- [Vercel AI SDK Tools](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling) - Function calling com AI SDK
- [Assistant UI Getting Started](https://www.assistant-ui.com/docs/getting-started) - Setup inicial do Assistant UI
- [ESLint Flat Config Migration](https://eslint.org/docs/latest/use/configure/migration-guide) - Migracao para nova configuracao ESLint

---

## 4. Exemplos de Implementacao

Repositorios GitHub de referencia:

### 4.1. Supabase Next.js Template

- **Link**: https://github.com/supabase/supabase/tree/master/examples/user-management/nextjs-user-management
- **Stack**: Next.js, Supabase, TypeScript
- **O que aproveitar**:
  - Estrutura de autenticacao com SSR
  - Configuracao de RLS
  - Upload de avatares com Storage

### 4.2. AI SDK Examples

- **Link**: https://github.com/vercel/ai/tree/main/examples
- **Stack**: Next.js, AI SDK, Various LLMs
- **O que aproveitar**:
  - Implementacao de tools
  - Streaming de respostas
  - Integracao com diferentes providers

### 4.3. shadcn/ui Examples

- **Link**: https://github.com/shadcn-ui/ui/tree/main/apps/www
- **Stack**: Next.js, Tailwind, Radix UI
- **O que aproveitar**:
  - Padroes de componentes
  - Theming e dark mode
  - Acessibilidade

---

**Fim do research.md**
