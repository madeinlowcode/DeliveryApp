# Plano Tecnico: FEAT-001 - Chat do Cliente

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Arquitetura Proposta

O Chat do Cliente usa Assistant UI integrado com o Vercel AI SDK para criar uma interface de chat que renderiza respostas da IA como componentes visuais interativos.

```
┌─────────────────────────────────────────────────────────────┐
│                 /[slug]/page.tsx                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           AssistantRuntimeProvider                   │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              useChatRuntime                  │    │    │
│  │  │     transport: AssistantChatTransport        │    │    │
│  │  │         api: '/api/chat'                     │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                       │    │
│  │  ┌───────────┐  ┌─────────────────────────────┐     │    │
│  │  │  Sidebar  │  │        Thread                │     │    │
│  │  │           │  │  ┌─────────────────────────┐ │     │    │
│  │  │ - Logo    │  │  │      Messages           │ │     │    │
│  │  │ - History │  │  │  ┌─────────────────────┐│ │     │    │
│  │  │           │  │  │  │  UserMessage        ││ │     │    │
│  │  │           │  │  │  └─────────────────────┘│ │     │    │
│  │  │           │  │  │  ┌─────────────────────┐│ │     │    │
│  │  │           │  │  │  │ AssistantMessage    ││ │     │    │
│  │  │           │  │  │  │  └── ToolRenderer   ││ │     │    │
│  │  │           │  │  │  │       └── Cards     ││ │     │    │
│  │  │           │  │  │  └─────────────────────┘│ │     │    │
│  │  │           │  │  └─────────────────────────┘ │     │    │
│  │  │           │  │  ┌─────────────────────────┐ │     │    │
│  │  │           │  │  │      Composer           │ │     │    │
│  │  │           │  │  └─────────────────────────┘ │     │    │
│  │  └───────────┘  └─────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /api/chat
┌─────────────────────────────────────────────────────────────┐
│                     FEAT-003: Agente IA                      │
│              (streamText + Tools + OpenRouter)               │
└─────────────────────────────────────────────────────────────┘
```

**Principios:**

- Assistant UI gerencia estado do chat
- Tools retornam dados estruturados que viram componentes
- SessionId identifica carrinho sem autenticacao
- Dados do cliente em sessionStorage

---

## Stack Tecnologica

| Tecnologia                 | Versao | Uso                |
| -------------------------- | ------ | ------------------ |
| Assistant UI               | latest | Chat components    |
| @assistant-ui/react-ai-sdk | latest | AI SDK integration |
| Zustand                    | 5.x    | Client state       |

---

## Estrutura de Diretorios

```
src/
├── app/
│   └── (public)/
│       └── [slug]/
│           ├── page.tsx                 # Pagina principal
│           ├── layout.tsx               # Layout com meta tags
│           └── loading.tsx              # Loading skeleton
│
├── components/
│   ├── features/
│   │   └── chat/
│   │       ├── chat-provider.tsx        # AssistantRuntimeProvider
│   │       ├── chat-layout.tsx          # Layout sidebar + thread
│   │       ├── chat-sidebar.tsx         # Sidebar com logo e historico
│   │       ├── chat-thread.tsx          # Thread customizado
│   │       ├── chat-composer.tsx        # Input de mensagens
│   │       ├── chat-welcome.tsx         # Mensagem de boas-vindas
│   │       │
│   │       ├── messages/
│   │       │   ├── user-message.tsx
│   │       │   └── assistant-message.tsx
│   │       │
│   │       └── tools/                   # Componentes visuais das tools
│   │           ├── tool-renderer.tsx    # Router de tools
│   │           ├── category-cards.tsx
│   │           ├── product-cards.tsx
│   │           ├── product-detail-modal.tsx
│   │           ├── variation-selector.tsx
│   │           ├── addon-selector.tsx
│   │           ├── quantity-selector.tsx
│   │           ├── cart-summary.tsx
│   │           ├── checkout-form.tsx
│   │           ├── order-confirmation.tsx
│   │           ├── business-hours-message.tsx
│   │           └── order-status.tsx
│   │
│   └── shared/
│       ├── phone-input.tsx
│       ├── address-form.tsx
│       └── image-with-fallback.tsx
│
├── hooks/
│   ├── use-chat-session.ts              # SessionId management
│   ├── use-tenant.ts                    # Tenant data
│   ├── use-customer.ts                  # Customer identification
│   └── use-order-history.ts             # Previous orders
│
├── stores/
│   └── chat-store.ts                    # Customer, cart preview
│
└── types/
    └── chat.ts                          # Message types
```

---

## Implementacao Principal

### Chat Provider

```typescript
// components/features/chat/chat-provider.tsx
'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { useChatSession } from '@/hooks/use-chat-session'

interface ChatProviderProps {
  tenantSlug: string
  children: React.ReactNode
}

export function ChatProvider({ tenantSlug, children }: ChatProviderProps) {
  const { sessionId } = useChatSession()

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: '/api/chat',
      body: {
        tenantSlug,
        sessionId
      }
    })
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
```

### Chat Thread com Tool Rendering

```typescript
// components/features/chat/chat-thread.tsx
'use client'

import { ThreadPrimitive } from '@assistant-ui/react'
import { UserMessage } from './messages/user-message'
import { AssistantMessage } from './messages/assistant-message'
import { ChatComposer } from './chat-composer'
import { ChatWelcome } from './chat-welcome'

export function ChatThread() {
  return (
    <ThreadPrimitive.Root className="flex flex-col h-full">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <ThreadPrimitive.Empty>
          <ChatWelcome />
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <ThreadPrimitive.ScrollToBottom asChild>
        <button className="absolute bottom-24 right-4 rounded-full p-2 bg-primary text-white shadow-lg">
          ↓
        </button>
      </ThreadPrimitive.ScrollToBottom>

      <div className="border-t p-4">
        <ChatComposer />
      </div>
    </ThreadPrimitive.Root>
  )
}
```

### Tool Renderer

```typescript
// components/features/chat/tools/tool-renderer.tsx
'use client'

import { CategoryCards } from './category-cards'
import { ProductCards } from './product-cards'
import { CartSummary } from './cart-summary'
import { OrderConfirmation } from './order-confirmation'
import { BusinessHoursMessage } from './business-hours-message'
import { OrderStatus } from './order-status'

interface ToolRendererProps {
  toolName: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  input?: any
  output?: any
  error?: string
}

export function ToolRenderer({ toolName, state, input, output, error }: ToolRendererProps) {
  if (state === 'input-streaming' || state === 'input-available') {
    return <ToolLoading toolName={toolName} />
  }

  if (state === 'output-error') {
    return <ToolError message={error} />
  }

  // state === 'output-available'
  switch (toolName) {
    case 'getCategories':
      return <CategoryCards categories={output.categories} />

    case 'getProducts':
      return <ProductCards products={output.products} />

    case 'addToCart':
    case 'removeFromCart':
    case 'getCart':
      return <CartSummary cart={output.cart} message={output.message} />

    case 'checkout':
      return <OrderConfirmation orderNumber={output.orderNumber} message={output.message} />

    case 'checkBusinessHours':
      return <BusinessHoursMessage isOpen={output.isOpen} message={output.message} />

    case 'getOrderStatus':
      return <OrderStatus status={output.status} message={output.statusMessage} />

    default:
      return <pre>{JSON.stringify(output, null, 2)}</pre>
  }
}
```

### Category Cards

```typescript
// components/features/chat/tools/category-cards.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAssistantRuntime } from '@assistant-ui/react'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
}

interface CategoryCardsProps {
  categories: Category[]
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  const runtime = useAssistantRuntime()

  const handleCategoryClick = (category: Category) => {
    // Enviar mensagem como se o usuario tivesse digitado
    runtime.send({ text: `Quero ver ${category.name}` })
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCategoryClick(category)}
        >
          <CardContent className="p-3">
            <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className="font-medium text-center">{category.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Product Cards

```typescript
// components/features/chat/tools/product-cards.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductDetailModal } from './product-detail-modal'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  variations: Array<{ id: string; name: string; priceModifier: number }>
  addons: Array<{ id: string; name: string; price: number }>
}

interface ProductCardsProps {
  products: Product[]
}

export function ProductCards({ products }: ProductCardsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <p className="text-lg font-bold mt-2">
                R$ {product.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                onClick={() => setSelectedProduct(product)}
              >
                + Adicionar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
```

### Product Detail Modal

```typescript
// components/features/chat/tools/product-detail-modal.tsx
'use client'

import { useState } from 'react'
import { useAssistantRuntime } from '@assistant-ui/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VariationSelector } from './variation-selector'
import { AddonSelector } from './addon-selector'
import { QuantitySelector } from './quantity-selector'

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const runtime = useAssistantRuntime()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    product.variations.length > 0 ? product.variations[0].id : null
  )
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const calculateTotal = () => {
    let total = product.price
    if (selectedVariation) {
      const variation = product.variations.find(v => v.id === selectedVariation)
      total += variation?.priceModifier || 0
    }
    selectedAddons.forEach(addonId => {
      const addon = product.addons.find(a => a.id === addonId)
      total += addon?.price || 0
    })
    return total * quantity
  }

  const handleAdd = () => {
    // Construir mensagem para a IA processar
    let message = `Adicionar ${quantity}x ${product.name}`
    if (selectedVariation) {
      const variation = product.variations.find(v => v.id === selectedVariation)
      message += ` - ${variation?.name}`
    }
    if (selectedAddons.length > 0) {
      const addonNames = selectedAddons.map(id =>
        product.addons.find(a => a.id === id)?.name
      ).filter(Boolean)
      message += ` com ${addonNames.join(', ')}`
    }

    runtime.send({ text: message })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.variations.length > 0 && (
            <VariationSelector
              variations={product.variations}
              selected={selectedVariation}
              onSelect={setSelectedVariation}
            />
          )}

          {product.addons.length > 0 && (
            <AddonSelector
              addons={product.addons}
              selected={selectedAddons}
              onToggle={(id) => {
                setSelectedAddons(prev =>
                  prev.includes(id)
                    ? prev.filter(a => a !== id)
                    : [...prev, id]
                )
              }}
            />
          )}

          <QuantitySelector
            quantity={quantity}
            onChange={setQuantity}
          />
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <span className="text-lg font-bold">
              Total: R$ {calculateTotal().toFixed(2)}
            </span>
            <Button onClick={handleAdd}>
              Adicionar ao Carrinho
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Hooks

### useChatSession

```typescript
// hooks/use-chat-session.ts
'use client'

import { useState, useEffect } from 'react'

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Verificar se ja existe sessionId no storage
    let id = sessionStorage.getItem('chatSessionId')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('chatSessionId', id)
    }
    setSessionId(id)
  }, [])

  const resetSession = () => {
    const newId = crypto.randomUUID()
    sessionStorage.setItem('chatSessionId', newId)
    setSessionId(newId)
  }

  return { sessionId, resetSession }
}
```

### useOrderHistory

```typescript
// hooks/use-order-history.ts
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface OrderSummary {
  id: string
  orderNumber: number
  total: number
  itemsCount: number
  createdAt: string
}

export function useOrderHistory(tenantId: string, customerPhone?: string) {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!customerPhone) return

    const fetchOrders = async () => {
      setIsLoading(true)
      const supabase = createBrowserClient()

      const { data } = await supabase
        .from('orders')
        .select(
          `
          id,
          order_number,
          total,
          created_at,
          order_items(count)
        `
        )
        .eq('tenant_id', tenantId)
        .eq('customer.phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setOrders(
          data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            total: o.total,
            itemsCount: o.order_items[0]?.count || 0,
            createdAt: o.created_at,
          }))
        )
      }
      setIsLoading(false)
    }

    fetchOrders()
  }, [tenantId, customerPhone])

  return { orders, isLoading }
}
```

---

## Pagina Principal

```typescript
// app/(public)/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/services/settings.service'
import { ChatProvider } from '@/components/features/chat/chat-provider'
import { ChatLayout } from '@/components/features/chat/chat-layout'

interface ChatPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ChatPageProps) {
  const tenant = await getTenantBySlug(params.slug)
  if (!tenant) return {}

  return {
    title: `Pedidos - ${tenant.name}`,
    description: `Faca seu pedido no ${tenant.name} de forma rapida e facil!`
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const tenant = await getTenantBySlug(params.slug)

  if (!tenant) {
    notFound()
  }

  return (
    <ChatProvider tenantSlug={params.slug}>
      <ChatLayout tenant={tenant} />
    </ChatProvider>
  )
}
```

---

## Variaveis de Ambiente

Nenhuma variavel adicional - usa as mesmas de FEAT-002 e FEAT-003.

---

## Decisoes Tecnicas

### 1. Assistant UI vs Construir do zero

- **Decisao:** Usar Assistant UI
- **Razao:** Componentes prontos, integração nativa com AI SDK
- **Trade-off:** Dependencia de biblioteca terceira

### 2. SessionId no Cliente

- **Decisao:** Gerar UUID no cliente e guardar em sessionStorage
- **Razao:** Identificar carrinho sem necessidade de auth
- **Trade-off:** Perde se limpar storage (aceitavel)

### 3. Tool UI Components

- **Decisao:** Cada tool tem seu componente visual
- **Razao:** Experiencia rica vs texto puro
- **Trade-off:** Mais trabalho frontend, mas UX muito melhor

---

## Riscos Tecnicos

### 1. Complexidade do Assistant UI

- **Probabilidade:** Media
- **Impacto:** Medio
- **Mitigacao:** Documentacao, exemplos oficiais

### 2. Performance de imagens

- **Probabilidade:** Media
- **Impacto:** Baixo
- **Mitigacao:** Next.js Image optimization, lazy loading

---

## Error Handling

### Error Boundary

```typescript
// components/features/chat/chat-error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chat Error:', error, errorInfo)
    }
    // In production, send to error tracking service
    // errorTracker.captureException(error, { extra: errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">
            Nao foi possivel carregar o chat. Tente novamente.
          </p>
          <Button onClick={this.handleRetry}>
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### API Error Handler

```typescript
// lib/api-error-handler.ts
import { toast } from 'sonner'

interface ApiError {
  message: string
  code?: string
  status?: number
}

// AIDEV-NOTE: Mensagens amigaveis para erros de API - nunca expor detalhes tecnicos
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Sem conexao. Verifique sua internet e tente novamente.',
  RATE_LIMITED: 'Muitas requisicoes. Aguarde um momento e tente novamente.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente em alguns instantes.',
  TIMEOUT: 'A requisicao demorou muito. Tente novamente.',
  UNAUTHORIZED: 'Sessao expirada. Recarregue a pagina.',
  NOT_FOUND: 'Recurso nao encontrado.',
  DEFAULT: 'Algo deu errado. Tente novamente.',
}

export function handleApiError(error: unknown): ApiError {
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return { message: ERROR_MESSAGES.NETWORK_ERROR, code: 'NETWORK_ERROR' }
  }

  // Response error
  if (error instanceof Response) {
    switch (error.status) {
      case 429:
        return { message: ERROR_MESSAGES.RATE_LIMITED, code: 'RATE_LIMITED', status: 429 }
      case 401:
        return { message: ERROR_MESSAGES.UNAUTHORIZED, code: 'UNAUTHORIZED', status: 401 }
      case 404:
        return { message: ERROR_MESSAGES.NOT_FOUND, code: 'NOT_FOUND', status: 404 }
      case 500:
      case 502:
      case 503:
        return { message: ERROR_MESSAGES.SERVER_ERROR, code: 'SERVER_ERROR', status: error.status }
      default:
        return { message: ERROR_MESSAGES.DEFAULT, code: 'UNKNOWN', status: error.status }
    }
  }

  // Timeout error
  if (error instanceof DOMException && error.name === 'AbortError') {
    return { message: ERROR_MESSAGES.TIMEOUT, code: 'TIMEOUT' }
  }

  return { message: ERROR_MESSAGES.DEFAULT, code: 'UNKNOWN' }
}

export function showErrorToast(error: unknown, options?: { retry?: () => void }) {
  const apiError = handleApiError(error)

  toast.error(apiError.message, {
    action: options?.retry
      ? {
          label: 'Tentar novamente',
          onClick: options.retry,
        }
      : undefined,
  })

  return apiError
}
```

---

## Offline Detection

### useOnlineStatus Hook

```typescript
// hooks/use-online-status.ts
'use client'

import { useState, useEffect, useCallback } from 'react'

interface OnlineStatus {
  isOnline: boolean
  wasOffline: boolean // True if was offline and just came back
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setWasOffline(true)
      // Reset wasOffline after a short delay
      setTimeout(() => setWasOffline(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, wasOffline }
}
```

### Offline Banner Component

```typescript
// components/features/chat/offline-banner.tsx
'use client'

import { useOnlineStatus } from '@/hooks/use-online-status'
import { WifiOff, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()

  if (isOnline && !wasOffline) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-colors',
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-destructive text-destructive-foreground'
      )}
      role="alert"
      aria-live="polite"
    >
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <Wifi className="h-4 w-4" />
          Conexao restaurada
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          Voce esta offline. Verifique sua conexao.
        </span>
      )}
    </div>
  )
}
```

---

## Loading States

### Category Cards Skeleton

```typescript
// components/features/chat/tools/category-cards-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function CategoryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <Skeleton className="aspect-square rounded-lg mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Product Cards Skeleton

```typescript
// components/features/chat/tools/product-cards-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

export function ProductCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/4" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
```

### Typing Indicator

```typescript
// components/features/chat/typing-indicator.tsx
'use client'

import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn('flex items-center gap-1 p-3', className)}
      role="status"
      aria-label="Assistente digitando"
    >
      <span className="sr-only">Assistente esta digitando</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}
```

### Tool Loading Component

```typescript
// components/features/chat/tools/tool-loading.tsx
import { CategoryCardsSkeleton } from './category-cards-skeleton'
import { ProductCardsSkeleton } from './product-cards-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface ToolLoadingProps {
  toolName: string
}

export function ToolLoading({ toolName }: ToolLoadingProps) {
  switch (toolName) {
    case 'getCategories':
      return <CategoryCardsSkeleton />
    case 'getProducts':
      return <ProductCardsSkeleton />
    case 'getCart':
    case 'addToCart':
    case 'removeFromCart':
      return (
        <div className="p-4 border rounded-lg my-4">
          <Skeleton className="h-5 w-1/3 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-1/4 mt-4 ml-auto" />
        </div>
      )
    default:
      return (
        <div className="p-4">
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )
  }
}
```

---

## Acessibilidade

### Skip to Content Link

```typescript
// components/features/chat/skip-to-content.tsx
export function SkipToContent() {
  return (
    <a
      href="#chat-main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Pular para o conteudo principal
    </a>
  )
}
```

### Accessible Category Cards

```typescript
// components/features/chat/tools/category-cards.tsx (versao acessivel)
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAssistantRuntime } from '@assistant-ui/react'
import Image from 'next/image'
import { useCallback } from 'react'

interface Category {
  id: string
  name: string
  description: string
  imageUrl: string
}

interface CategoryCardsProps {
  categories: Category[]
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  const runtime = useAssistantRuntime()

  const handleCategoryClick = useCallback((category: Category) => {
    runtime.send({ text: `Quero ver ${category.name}` })
  }, [runtime])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, category: Category) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCategoryClick(category)
    }
  }, [handleCategoryClick])

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4"
      role="list"
      aria-label="Categorias do cardapio"
    >
      {categories.map((category, index) => (
        <Card
          key={category.id}
          role="listitem"
          tabIndex={0}
          className="cursor-pointer hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => handleCategoryClick(category)}
          onKeyDown={(e) => handleKeyDown(e, category)}
          aria-label={`${category.name}. ${category.description}. Pressione Enter para ver produtos.`}
        >
          <CardContent className="p-3">
            <div className="aspect-square relative rounded-lg overflow-hidden mb-2">
              <Image
                src={category.imageUrl}
                alt={`Imagem da categoria ${category.name}`}
                fill
                className="object-cover"
                loading={index < 3 ? 'eager' : 'lazy'}
              />
            </div>
            <h3 className="font-medium text-center">{category.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Focus Trap for Modal

```typescript
// hooks/use-focus-trap.ts
'use client'

import { useEffect, useRef } from 'react'

export function useFocusTrap<T extends HTMLElement>() {
  const containerRef = useRef<T>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element on mount
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [])

  return containerRef
}
```

---

## Seguranca

### Input Sanitization

```typescript
// lib/sanitize.ts

// AIDEV-SECURITY: Sanitiza input do usuario antes de enviar para API
export function sanitizeUserMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return ''
  }

  return (
    message
      // Remove tags HTML
      .replace(/<[^>]*>/g, '')
      // Remove scripts
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Limita tamanho maximo
      .substring(0, 2000)
      // Remove caracteres de controle (exceto newlines)
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
  )
}

// Valida slug do tenant
export function isValidTenantSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false
  }
  // Apenas letras minusculas, numeros e hifens, 3-50 caracteres
  return /^[a-z0-9-]{3,50}$/.test(slug)
}

// Valida telefone brasileiro
export function isValidBrazilianPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }
  // Remove formatacao
  const digits = phone.replace(/\D/g, '')
  // 10 ou 11 digitos (com DDD)
  return /^[1-9]{2}[0-9]{8,9}$/.test(digits)
}
```

### Session Timeout Handler

```typescript
// hooks/use-session-timeout.ts
'use client'

import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000 // 24 hours
const WARNING_BEFORE_MS = 5 * 60 * 1000 // 5 minutes before

export function useSessionTimeout(onExpire: () => void) {
  const checkSession = useCallback(() => {
    const sessionStart = sessionStorage.getItem('chatSessionStart')
    if (!sessionStart) {
      sessionStorage.setItem('chatSessionStart', Date.now().toString())
      return
    }

    const elapsed = Date.now() - parseInt(sessionStart, 10)
    const remaining = SESSION_TIMEOUT_MS - elapsed

    if (remaining <= 0) {
      // Session expired
      toast.error('Sua sessao expirou. Iniciando nova sessao...')
      onExpire()
      return
    }

    if (remaining <= WARNING_BEFORE_MS) {
      // Warning before expiration
      const minutes = Math.ceil(remaining / 60000)
      toast.warning(`Sua sessao expira em ${minutes} minutos`)
    }
  }, [onExpire])

  useEffect(() => {
    // Check immediately
    checkSession()

    // Check every minute
    const interval = setInterval(checkSession, 60000)

    return () => clearInterval(interval)
  }, [checkSession])
}
```

### Rate Limit Handler

```typescript
// hooks/use-rate-limit-handler.ts
'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface RateLimitState {
  isRateLimited: boolean
  retryAfter: number | null
}

export function useRateLimitHandler() {
  const [state, setState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: null,
  })

  const handleRateLimitError = useCallback((retryAfterSeconds: number = 60) => {
    setState({ isRateLimited: true, retryAfter: retryAfterSeconds })

    toast.error(`Muitas requisicoes. Tente novamente em ${retryAfterSeconds} segundos.`)

    // Auto-reset after retry period
    setTimeout(() => {
      setState({ isRateLimited: false, retryAfter: null })
    }, retryAfterSeconds * 1000)
  }, [])

  const checkRateLimit = useCallback(
    (response: Response): boolean => {
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10)
        handleRateLimitError(retryAfter)
        return true
      }
      return false
    },
    [handleRateLimitError]
  )

  return {
    isRateLimited: state.isRateLimited,
    retryAfter: state.retryAfter,
    handleRateLimitError,
    checkRateLimit,
  }
}
```

---

## Performance

### Image with Lazy Loading and Fallback

```typescript
// components/shared/image-with-fallback.tsx
'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/placeholder-product.png',
  className,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
```

### Message List Optimization

```typescript
// components/features/chat/optimized-message-list.tsx
'use client'

import { memo, useMemo } from 'react'
import { UserMessage } from './messages/user-message'
import { AssistantMessage } from './messages/assistant-message'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  parts?: any[]
}

interface MessageListProps {
  messages: Message[]
}

// AIDEV-PERF: Memoiza mensagens individuais para evitar re-renders desnecessarios
const MemoizedUserMessage = memo(UserMessage)
const MemoizedAssistantMessage = memo(AssistantMessage)

export function OptimizedMessageList({ messages }: MessageListProps) {
  const renderedMessages = useMemo(() => {
    return messages.map((message) => {
      if (message.role === 'user') {
        return <MemoizedUserMessage key={message.id} message={message} />
      }
      return <MemoizedAssistantMessage key={message.id} message={message} />
    })
  }, [messages])

  return <div className="space-y-4">{renderedMessages}</div>
}
```

---

**Gerado automaticamente por:** sprint-context-generator skill
**Atualizado por:** software-engineer skill (analise de qualidade)
**Data:** 2026-02-05
