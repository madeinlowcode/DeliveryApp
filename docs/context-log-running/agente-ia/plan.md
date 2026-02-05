# Plano Tecnico: FEAT-003 - Agente IA

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Arquitetura Proposta

O Agente IA usa o Vercel AI SDK 6 com OpenRouter para processar mensagens e executar tools que consultam o cardapio e gerenciam pedidos.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (FEAT-001)                       │
│              AssistantRuntimeProvider                        │
│                   useChatRuntime                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST /api/chat
                         │ { messages, tenantSlug }
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    /api/chat/route.ts                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  1. Extrair tenantSlug do request                   │    │
│  │  2. Carregar configuracoes do tenant                │    │
│  │  3. Gerar system prompt dinamico                    │    │
│  │  4. Chamar streamText com tools                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    TOOLS                             │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │    │
│  │  │getCategories│ │ getProducts │ │  addToCart  │   │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │    │
│  │  │removeFromCart│ │   getCart   │ │  checkout   │   │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘   │    │
│  │  ┌─────────────┐ ┌─────────────┐                   │    │
│  │  │ checkHours  │ │getOrderStatus│                  │    │
│  │  └─────────────┘ └─────────────┘                   │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  OPENROUTER │  │  SUPABASE   │  │CART MANAGER │
│    (LLM)    │  │  (Database) │  │ (In-Memory) │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Principios:**

- Tools sao funcoes puras que consultam dados e retornam JSON
- Carrinho gerenciado em memoria por sessao (ou Redis em producao)
- System prompt dinamico baseado nas configuracoes do tenant
- Streaming para UX responsiva

---

## Stack Tecnologica

| Tecnologia     | Versao | Uso                 |
| -------------- | ------ | ------------------- |
| Vercel AI SDK  | 4.x    | streamText, tools   |
| @ai-sdk/openai | 1.x    | Provider OpenRouter |
| OpenRouter     | API v1 | Gateway LLM         |
| deepseek-chat  | latest | Modelo LLM          |
| Zod            | 3.x    | Schema validation   |

---

## Estrutura de Diretorios

```
src/
├── app/
│   └── api/
│       └── chat/
│           ├── route.ts                 # Endpoint principal
│           └── tools/
│               ├── index.ts             # Exporta todas tools
│               ├── get-categories.ts    # Tool: listar categorias
│               ├── get-products.ts      # Tool: listar produtos
│               ├── add-to-cart.ts       # Tool: adicionar ao carrinho
│               ├── remove-from-cart.ts  # Tool: remover do carrinho
│               ├── get-cart.ts          # Tool: ver carrinho
│               ├── checkout.ts          # Tool: finalizar pedido
│               ├── check-hours.ts       # Tool: verificar horario
│               └── get-order-status.ts  # Tool: status do pedido
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts                  # Config OpenRouter
│   │   ├── system-prompt.ts             # Gerador de system prompt
│   │   └── types.ts                     # Tipos do chat
│   │
│   └── cart/
│       ├── cart-manager.ts              # Gerenciador de carrinho
│       ├── cart-store.ts                # Store em memoria
│       └── types.ts                     # CartItem, Cart
│
├── services/
│   ├── ai-menu.service.ts               # Queries de cardapio para IA
│   ├── ai-cart.service.ts               # Operacoes de carrinho
│   └── ai-order.service.ts              # Criar pedido
│
└── types/
    ├── chat.ts
    └── cart.ts
```

---

## Implementacao das Tools

### Tool: getCategories

```typescript
// app/api/chat/tools/get-categories.ts
import { tool } from 'ai'
import { z } from 'zod'
import { getActiveCategories } from '@/services/ai-menu.service'

export const getCategoriesTools = (tenantId: string) =>
  tool({
    description:
      'Retorna as categorias disponiveis do cardapio. Use quando o cliente perguntar o que tem ou quiser ver o menu.',
    parameters: z.object({}),
    execute: async () => {
      const categories = await getActiveCategories(tenantId)
      return {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url,
        })),
      }
    },
  })
```

### Tool: getProducts

```typescript
// app/api/chat/tools/get-products.ts
import { tool } from 'ai'
import { z } from 'zod'
import { getProductsByCategory } from '@/services/ai-menu.service'

export const getProductsTool = (tenantId: string) =>
  tool({
    description:
      'Retorna produtos de uma categoria especifica. Use quando o cliente escolher uma categoria.',
    parameters: z.object({
      categoryId: z.string().describe('ID da categoria'),
    }),
    execute: async ({ categoryId }) => {
      const products = await getProductsByCategory(tenantId, categoryId)
      return {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.image_url,
          variations: p.variations.map((v) => ({
            id: v.id,
            name: v.name,
            priceModifier: v.price_modifier,
          })),
          addons: p.addons.map((a) => ({
            id: a.id,
            name: a.name,
            price: a.price,
          })),
        })),
      }
    },
  })
```

### Tool: addToCart

```typescript
// app/api/chat/tools/add-to-cart.ts
import { tool } from 'ai'
import { z } from 'zod'
import { CartManager } from '@/lib/cart/cart-manager'
import { getProductById } from '@/services/ai-menu.service'
import { logger } from '@/lib/logger'

export const addToCartTool = (tenantId: string, sessionId: string) =>
  tool({
    description:
      'Adiciona um produto ao carrinho. Use quando o cliente quiser adicionar algo ao pedido.',
    parameters: z.object({
      productId: z.string().describe('ID do produto'),
      quantity: z.number().min(1).max(99).default(1).describe('Quantidade (max 99)'),
      variationId: z.string().optional().describe('ID da variacao escolhida'),
      addonIds: z.array(z.string()).max(20).optional().describe('IDs dos adicionais escolhidos'),
      notes: z.string().max(200).optional().describe('Observacoes do item (max 200 chars)'),
    }),
    execute: async ({ productId, quantity, variationId, addonIds, notes }) => {
      try {
        // AIDEV-SECURITY: Buscar produto atualizado do banco (preco atual)
        const product = await getProductById(tenantId, productId)

        // Validacao: Produto existe?
        if (!product) {
          logger.warn('Product not found for cart', { tenantId, productId })
          return {
            success: false,
            message:
              'Desculpe, este produto nao foi encontrado. Pode ter sido removido do cardapio.',
          }
        }

        // AIDEV-SECURITY: Produto esta disponivel?
        if (!product.available) {
          logger.info('Unavailable product add attempt', { tenantId, productId })
          return {
            success: false,
            message: `Desculpe, ${product.name} nao esta disponivel no momento. Posso sugerir outra opcao?`,
          }
        }

        // Validacao: Variacao obrigatoria?
        if (product.variations.length > 0 && !variationId) {
          return {
            success: false,
            message: `Por favor, escolha uma opcao para ${product.name}:`,
            requiresVariation: true,
            variations: product.variations.map((v) => ({
              id: v.id,
              name: v.name,
              priceModifier: v.price_modifier,
            })),
          }
        }

        // Validacao: Variacao valida?
        let selectedVariation = null
        if (variationId) {
          selectedVariation = product.variations.find((v) => v.id === variationId)
          if (!selectedVariation) {
            return {
              success: false,
              message: 'Opcao invalida. Por favor, escolha uma das opcoes disponiveis.',
              variations: product.variations.map((v) => ({
                id: v.id,
                name: v.name,
                priceModifier: v.price_modifier,
              })),
            }
          }
        }

        // Validacao: Adicionais validos?
        let selectedAddons: typeof product.addons = []
        if (addonIds && addonIds.length > 0) {
          selectedAddons = product.addons.filter((a) => addonIds.includes(a.id))
          const invalidCount = addonIds.length - selectedAddons.length
          if (invalidCount > 0) {
            logger.warn('Invalid addons in cart request', { tenantId, productId, addonIds })
            // Continua com os validos, apenas loga
          }
        }

        // Adicionar ao carrinho com lock
        const cartManager = CartManager.getInstance(sessionId)

        const item = await cartManager.addItem({
          productId,
          productName: product.name,
          quantity,
          unitPrice: product.price, // AIDEV-SECURITY: Sempre usar preco do banco
          variation: selectedVariation
            ? {
                id: selectedVariation.id,
                name: selectedVariation.name,
                priceModifier: selectedVariation.price_modifier,
              }
            : null,
          addons: selectedAddons.map((a) => ({
            id: a.id,
            name: a.name,
            price: a.price,
          })),
          notes: notes?.slice(0, 200), // Garantir limite
        })

        const cart = cartManager.getCart()

        logger.info('Item added to cart', {
          sessionId,
          productId,
          quantity,
          itemTotal: item.totalPrice,
        })

        return {
          success: true,
          message: `${quantity}x ${product.name} adicionado ao carrinho!`,
          cart: {
            items: cart.items,
            subtotal: cart.subtotal,
            total: cart.total,
            itemCount: cart.items.length,
          },
        }
      } catch (error) {
        logger.error('Error adding to cart', {
          sessionId,
          productId,
          error: error instanceof Error ? error.message : 'Unknown',
        })

        return {
          success: false,
          message: 'Ocorreu um erro ao adicionar o item. Por favor, tente novamente.',
        }
      }
    },
  })
```

### Tool: checkout

```typescript
// app/api/chat/tools/checkout.ts
import { tool } from 'ai'
import { z } from 'zod'
import { CartManager } from '@/lib/cart/cart-manager'
import { createOrder, findOrCreateCustomer } from '@/services/ai-order.service'
import {
  isBusinessOpen,
  getBusinessHoursMessage,
  validateCartItems,
} from '@/services/ai-menu.service'
import { getTenantSettings } from '@/services/settings.service'
import { validatePhone, sanitizeInput } from '@/lib/security/validators'
import { logger } from '@/lib/logger'

export const checkoutTool = (tenantId: string, sessionId: string) =>
  tool({
    description: 'Finaliza o pedido. Use quando o cliente confirmar todos os dados.',
    parameters: z.object({
      customerPhone: z.string().describe('Telefone do cliente com DDD'),
      customerName: z.string().max(100).describe('Nome do cliente'),
      deliveryAddress: z.string().max(300).describe('Endereco completo de entrega'),
      paymentMethod: z.string().describe('Forma de pagamento escolhida'),
    }),
    execute: async ({ customerPhone, customerName, deliveryAddress, paymentMethod }) => {
      try {
        // AIDEV-SECURITY: Sanitizar inputs
        const sanitizedName = sanitizeInput(customerName)
        const sanitizedAddress = sanitizeInput(deliveryAddress)
        const sanitizedPhone = customerPhone.replace(/\D/g, '')

        // Validar telefone
        if (!validatePhone(sanitizedPhone)) {
          return {
            success: false,
            message:
              'Numero de telefone invalido. Por favor, informe um numero com DDD (ex: 11999998888).',
          }
        }

        // Verificar se esta aberto
        const isOpen = await isBusinessOpen(tenantId)
        if (!isOpen) {
          const hoursMessage = await getBusinessHoursMessage(tenantId)
          return {
            success: false,
            message: `Desculpe, estamos fechados no momento. ${hoursMessage}`,
          }
        }

        const cartManager = CartManager.getInstance(sessionId)
        const cart = cartManager.getCart()

        // Validar carrinho nao vazio
        if (cart.items.length === 0) {
          return {
            success: false,
            message: 'Seu carrinho esta vazio. Que tal adicionar algo?',
          }
        }

        // Carregar configuracoes do tenant
        const settings = await getTenantSettings(tenantId)

        // Validar pedido minimo
        if (settings.min_order_value && cart.subtotal < settings.min_order_value) {
          return {
            success: false,
            message: `O pedido minimo e de R$ ${settings.min_order_value.toFixed(2)}. Seu carrinho esta em R$ ${cart.subtotal.toFixed(2)}. Que tal adicionar mais alguma coisa?`,
          }
        }

        // Validar forma de pagamento
        const validPaymentMethods = settings.payment_methods || ['dinheiro', 'pix', 'cartao']
        if (!validPaymentMethods.includes(paymentMethod.toLowerCase())) {
          return {
            success: false,
            message: `Forma de pagamento invalida. Opcoes disponiveis: ${validPaymentMethods.join(', ')}.`,
          }
        }

        // AIDEV-SECURITY: Revalidar itens do carrinho (precos podem ter mudado)
        const validation = await validateCartItems(tenantId, cart.items)

        if (!validation.valid) {
          // Alguns itens nao estao mais disponiveis
          if (validation.unavailableItems.length > 0) {
            const names = validation.unavailableItems.map((i) => i.productName).join(', ')
            return {
              success: false,
              message: `Alguns itens nao estao mais disponiveis: ${names}. Por favor, remova-os do carrinho.`,
              unavailableItems: validation.unavailableItems,
            }
          }

          // Precos mudaram
          if (validation.priceChanges.length > 0) {
            const changes = validation.priceChanges
              .map(
                (c) =>
                  `${c.productName}: R$ ${c.oldPrice.toFixed(2)} -> R$ ${c.newPrice.toFixed(2)}`
              )
              .join(', ')

            logger.info('Price changes detected at checkout', {
              sessionId,
              changes: validation.priceChanges,
            })

            return {
              success: false,
              message: `Alguns precos foram atualizados: ${changes}. Deseja continuar com os novos valores?`,
              priceChanges: validation.priceChanges,
              newTotal: validation.recalculatedTotal,
            }
          }
        }

        // Buscar ou criar cliente
        const customer = await findOrCreateCustomer(tenantId, sanitizedPhone, sanitizedName)

        // Criar pedido no banco
        const order = await createOrder({
          tenantId,
          customerId: customer.id,
          customerPhone: sanitizedPhone,
          customerName: sanitizedName,
          deliveryAddress: sanitizedAddress,
          paymentMethod: paymentMethod.toLowerCase(),
          items: cart.items,
          subtotal: validation.valid ? cart.subtotal : validation.recalculatedTotal,
          deliveryFee: cart.deliveryFee,
          total: validation.valid ? cart.total : validation.recalculatedTotal + cart.deliveryFee,
        })

        // Limpar carrinho apos sucesso
        cartManager.clear()

        logger.info('Order created successfully', {
          sessionId,
          orderId: order.id,
          orderNumber: order.order_number,
          total: order.total,
        })

        return {
          success: true,
          orderNumber: order.order_number,
          message: `Pedido #${order.order_number} confirmado! Voce recebera atualizacoes sobre o status pelo WhatsApp.`,
          order: {
            number: order.order_number,
            total: order.total,
            estimatedTime: settings.estimated_delivery_time || '30-45 min',
          },
        }
      } catch (error) {
        logger.error('Checkout error', {
          sessionId,
          tenantId,
          error: error instanceof Error ? error.message : 'Unknown',
        })

        return {
          success: false,
          message:
            'Ocorreu um erro ao finalizar o pedido. Por favor, tente novamente em alguns segundos.',
        }
      }
    },
  })
```

---

## API Route Principal

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { generateSystemPrompt } from '@/lib/ai/system-prompt'
import { getTenantBySlug } from '@/services/settings.service'
import { validateSessionId, sanitizeInput } from '@/lib/security/validators'
import { rateLimiter } from '@/lib/security/rate-limiter'
import { logger } from '@/lib/logger'
import {
  getCategoriesTools,
  getProductsTool,
  addToCartTool,
  removeFromCartTool,
  getCartTool,
  checkoutTool,
  checkHoursTool,
  getOrderStatusTool,
} from './tools'

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// AIDEV-NOTE: Timeout de 30s para evitar requests penduradas
const LLM_TIMEOUT_MS = 30000

export async function POST(req: Request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  try {
    // AIDEV-SECURITY: Rate limiting por IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimiter.check(clientIp, 30, 60) // 30 req/min

    if (!rateLimitResult.success) {
      logger.warn('Rate limit exceeded', { requestId, clientIp })
      return new Response(JSON.stringify({ error: 'Muitas requisicoes. Aguarde um momento.' }), {
        status: 429,
        headers: { 'Retry-After': '60' },
      })
    }

    const body = await req.json()
    const { messages, tenantSlug, sessionId } = body

    // AIDEV-SECURITY: Validar sessionId como UUID
    if (!validateSessionId(sessionId)) {
      logger.warn('Invalid sessionId', { requestId, sessionId })
      return new Response(JSON.stringify({ error: 'Sessao invalida' }), { status: 400 })
    }

    // AIDEV-SECURITY: Sanitizar inputs
    const sanitizedSlug = sanitizeInput(tenantSlug)

    // Carregar tenant
    const tenant = await getTenantBySlug(sanitizedSlug)
    if (!tenant) {
      return new Response(JSON.stringify({ error: 'Estabelecimento nao encontrado' }), {
        status: 404,
      })
    }

    // Log de inicio
    logger.info('Chat request started', {
      requestId,
      tenantId: tenant.id,
      sessionId,
      messageCount: messages.length,
    })

    // Gerar system prompt
    const systemPrompt = generateSystemPrompt(tenant)

    // Criar tools com contexto
    const tools = {
      getCategories: getCategoriesTools(tenant.id),
      getProducts: getProductsTool(tenant.id),
      addToCart: addToCartTool(tenant.id, sessionId),
      removeFromCart: removeFromCartTool(sessionId),
      getCart: getCartTool(sessionId),
      checkout: checkoutTool(tenant.id, sessionId),
      checkBusinessHours: checkHoursTool(tenant.id),
      getOrderStatus: getOrderStatusTool(tenant.id),
    }

    // AIDEV-PERF: Stream resposta com timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)

    try {
      const result = streamText({
        model: openrouter('deepseek/deepseek-chat'),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: 5,
        abortSignal: controller.signal,
      })

      // Log de sucesso
      logger.info('Chat request completed', {
        requestId,
        durationMs: Date.now() - startTime,
      })

      return result.toDataStreamResponse()
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    // AIDEV-NOTE: Nunca expor detalhes do erro ao usuario
    logger.error('Chat API error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: Date.now() - startTime,
    })

    // Mensagem amigavel para o usuario
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    const userMessage = isTimeout
      ? 'A resposta demorou muito. Por favor, tente novamente.'
      : 'Ocorreu um erro. Por favor, tente novamente em alguns segundos.'

    return new Response(JSON.stringify({ error: userMessage }), { status: isTimeout ? 504 : 500 })
  }
}
```

---

## Validadores de Seguranca

```typescript
// lib/security/validators.ts

// AIDEV-SECURITY: Validacao de UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateSessionId(sessionId: unknown): sessionId is string {
  if (typeof sessionId !== 'string') return false
  if (sessionId.length !== 36) return false
  return UUID_REGEX.test(sessionId)
}

// AIDEV-SECURITY: Sanitizacao basica contra XSS/injection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, 100) // Limitar tamanho
    .replace(/[<>\"'&]/g, '') // Remover caracteres perigosos
}

// Validar telefone brasileiro
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}
```

---

## Rate Limiter

```typescript
// lib/security/rate-limiter.ts

// AIDEV-NOTE: Rate limiter simples em memoria (usar Redis em producao)
const requests = new Map<string, { count: number; resetTime: number }>()

export const rateLimiter = {
  async check(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000

    const record = requests.get(key)

    if (!record || now > record.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0 }
    }

    record.count++
    return { success: true, remaining: maxRequests - record.count }
  },

  // Limpar registros expirados periodicamente
  cleanup() {
    const now = Date.now()
    for (const [key, record] of requests.entries()) {
      if (now > record.resetTime) {
        requests.delete(key)
      }
    }
  },
}

// Cleanup a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000)
}
```

---

## Cart Manager

```typescript
// lib/cart/cart-manager.ts
import { CartItem, Cart, CartItemInput } from './types'
import { logger } from '@/lib/logger'

// AIDEV-NOTE: Store de carrinhos em memoria (usar Redis em producao)
const carts = new Map<string, Cart>()

// AIDEV-PERF: Locks para evitar race conditions
const locks = new Map<string, Promise<void>>()

// AIDEV-NOTE: TTL para carrinhos inativos (30 minutos)
const CART_TTL_MS = 30 * 60 * 1000
const cartTimestamps = new Map<string, number>()

export class CartManager {
  private sessionId: string
  private cart: Cart

  private constructor(sessionId: string) {
    this.sessionId = sessionId
    this.cart = carts.get(sessionId) || this.createEmptyCart()
    this.updateTimestamp()
  }

  static getInstance(sessionId: string): CartManager {
    return new CartManager(sessionId)
  }

  // AIDEV-PERF: Lock para operacoes atomicas
  private async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    const currentLock = locks.get(this.sessionId) || Promise.resolve()

    let releaseLock: () => void
    const newLock = new Promise<void>((resolve) => {
      releaseLock = resolve
    })
    locks.set(this.sessionId, newLock)

    await currentLock

    try {
      return await fn()
    } finally {
      releaseLock!()
      // Limpar lock se nao houver mais operacoes pendentes
      if (locks.get(this.sessionId) === newLock) {
        locks.delete(this.sessionId)
      }
    }
  }

  async addItem(item: CartItemInput): Promise<CartItem> {
    return this.withLock(() => {
      // Reload cart from store (pode ter sido modificado)
      this.cart = carts.get(this.sessionId) || this.createEmptyCart()

      const totalPrice = this.calculateItemPrice(item)
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        variation: item.variation,
        addons: item.addons || [],
        notes: item.notes,
        totalPrice,
        addedAt: new Date().toISOString(),
      }

      // AIDEV-NOTE: Verificar se ja existe item identico e incrementar quantidade
      const existingIndex = this.findExistingItemIndex(item)
      if (existingIndex >= 0) {
        this.cart.items[existingIndex].quantity += item.quantity
        this.cart.items[existingIndex].totalPrice = this.calculateItemPrice(
          this.cart.items[existingIndex]
        )
        logger.debug('Incremented existing cart item', {
          sessionId: this.sessionId,
          itemId: this.cart.items[existingIndex].id,
        })
      } else {
        this.cart.items.push(cartItem)
      }

      this.recalculate()
      this.save()

      return existingIndex >= 0 ? this.cart.items[existingIndex] : cartItem
    })
  }

  async removeItem(itemId: string): Promise<boolean> {
    return this.withLock(() => {
      this.cart = carts.get(this.sessionId) || this.createEmptyCart()

      const initialLength = this.cart.items.length
      this.cart.items = this.cart.items.filter((i) => i.id !== itemId)

      if (this.cart.items.length === initialLength) {
        logger.warn('Item not found for removal', { sessionId: this.sessionId, itemId })
        return false
      }

      this.recalculate()
      this.save()

      logger.debug('Removed cart item', { sessionId: this.sessionId, itemId })
      return true
    })
  }

  async updateQuantity(itemId: string, quantity: number): Promise<CartItem | null> {
    return this.withLock(() => {
      this.cart = carts.get(this.sessionId) || this.createEmptyCart()

      const item = this.cart.items.find((i) => i.id === itemId)
      if (!item) {
        return null
      }

      if (quantity <= 0) {
        this.cart.items = this.cart.items.filter((i) => i.id !== itemId)
      } else {
        item.quantity = Math.min(quantity, 99) // Max 99
        item.totalPrice = this.calculateItemPrice(item)
      }

      this.recalculate()
      this.save()

      return item
    })
  }

  getCart(): Cart {
    this.updateTimestamp()
    // Retornar copia para evitar mutacao externa
    return JSON.parse(JSON.stringify(this.cart))
  }

  clear(): void {
    this.cart = this.createEmptyCart()
    this.save()
    logger.debug('Cart cleared', { sessionId: this.sessionId })
  }

  // AIDEV-NOTE: Verificar se carrinho expirou
  isExpired(): boolean {
    const timestamp = cartTimestamps.get(this.sessionId)
    if (!timestamp) return false
    return Date.now() - timestamp > CART_TTL_MS
  }

  private createEmptyCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      deliveryFee: 5, // TODO: Buscar do tenant
      total: 5,
    }
  }

  private findExistingItemIndex(newItem: CartItemInput): number {
    return this.cart.items.findIndex(
      (existing) =>
        existing.productId === newItem.productId &&
        existing.variation?.id === newItem.variation?.id &&
        JSON.stringify(existing.addons?.map((a) => a.id).sort()) ===
          JSON.stringify(newItem.addons?.map((a) => a.id).sort() || [])
    )
  }

  private calculateItemPrice(item: CartItemInput | CartItem): number {
    let price = item.unitPrice
    if (item.variation?.priceModifier) {
      price += item.variation.priceModifier
    }
    if (item.addons && item.addons.length > 0) {
      price += item.addons.reduce((sum, a) => sum + a.price, 0)
    }
    return price * item.quantity
  }

  private recalculate(): void {
    this.cart.subtotal = this.cart.items.reduce((sum, item) => sum + item.totalPrice, 0)
    this.cart.total = this.cart.subtotal + this.cart.deliveryFee
  }

  private save(): void {
    carts.set(this.sessionId, this.cart)
    this.updateTimestamp()
  }

  private updateTimestamp(): void {
    cartTimestamps.set(this.sessionId, Date.now())
  }

  // AIDEV-PERF: Cleanup de carrinhos expirados
  static cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [sessionId, timestamp] of cartTimestamps.entries()) {
      if (now - timestamp > CART_TTL_MS) {
        carts.delete(sessionId)
        cartTimestamps.delete(sessionId)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up expired carts', { count: cleaned })
    }
  }
}

// Cleanup a cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => CartManager.cleanup(), 10 * 60 * 1000)
}
```

---

## Logger

```typescript
// lib/logger.ts

// AIDEV-NOTE: Logger estruturado simples (usar Pino/Winston em producao)
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('debug')) {
      console.debug(JSON.stringify(formatLog('debug', message, meta)))
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('info')) {
      console.info(JSON.stringify(formatLog('info', message, meta)))
    }
  },

  warn(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('warn')) {
      console.warn(JSON.stringify(formatLog('warn', message, meta)))
    }
  },

  error(message: string, meta?: Record<string, unknown>) {
    if (shouldLog('error')) {
      console.error(JSON.stringify(formatLog('error', message, meta)))
    }
  },
}
```

---

## System Prompt

```typescript
// lib/ai/system-prompt.ts
import { Tenant } from '@/types/database'

export function generateSystemPrompt(tenant: Tenant): string {
  return `Voce e o assistente virtual do ${tenant.name}, um sistema de delivery inteligente.

## IDENTIDADE
- Nome do estabelecimento: ${tenant.name}
- Voce representa este estabelecimento no atendimento ao cliente

## COMPORTAMENTO
- Seja cordial, objetivo e prestativo
- Responda SEMPRE em portugues brasileiro
- Use emojis com moderacao para deixar a conversa mais amigavel
- Seja proativo em oferecer opcoes e sugestoes

## REGRAS IMPORTANTES
1. NUNCA invente produtos, precos ou informacoes
2. SEMPRE use as tools disponiveis para consultar dados
3. Quando o cliente perguntar "o que tem?", use getCategories
4. Quando o cliente escolher uma categoria, use getProducts
5. Sempre confirme os itens antes de adicionar ao carrinho
6. Sempre mostre o total atualizado apos modificar o carrinho

## FLUXO DE ATENDIMENTO
1. Saudar o cliente com uma mensagem amigavel
2. Perguntar o que ele gostaria de pedir
3. Mostrar categorias quando solicitado (tool: getCategories)
4. Mostrar produtos da categoria escolhida (tool: getProducts)
5. Se o produto tiver variacoes, perguntar qual opcao
6. Se o produto tiver adicionais, oferecer as opcoes
7. Adicionar ao carrinho (tool: addToCart)
8. Perguntar se deseja mais alguma coisa
9. Quando finalizar, mostrar resumo (tool: getCart)
10. Solicitar dados: nome, telefone, endereco, forma de pagamento
11. Finalizar pedido (tool: checkout)

## CONFIGURACOES DO ESTABELECIMENTO
${tenant.min_order_value ? `- Pedido minimo: R$ ${tenant.min_order_value.toFixed(2)}` : ''}
${tenant.welcome_message ? `- Mensagem de boas-vindas: ${tenant.welcome_message}` : ''}
${tenant.closed_message ? `- Mensagem quando fechado: ${tenant.closed_message}` : ''}

## FORMATO DE RESPOSTAS
- Ao mostrar categorias ou produtos, a tool retornara dados estruturados que serao renderizados visualmente
- Ao adicionar ao carrinho, confirme com uma mensagem e mostre o total
- Ao finalizar, confirme o numero do pedido e agradeca`
}
```

---

## Servico de Validacao de Carrinho

```typescript
// services/ai-menu.service.ts (adicionar funcao)

interface CartValidationResult {
  valid: boolean
  unavailableItems: Array<{
    cartItemId: string
    productId: string
    productName: string
    reason: 'deleted' | 'unavailable'
  }>
  priceChanges: Array<{
    cartItemId: string
    productId: string
    productName: string
    oldPrice: number
    newPrice: number
  }>
  recalculatedTotal: number
}

// AIDEV-SECURITY: Validar todos os itens do carrinho antes do checkout
export async function validateCartItems(
  tenantId: string,
  cartItems: CartItem[]
): Promise<CartValidationResult> {
  const result: CartValidationResult = {
    valid: true,
    unavailableItems: [],
    priceChanges: [],
    recalculatedTotal: 0,
  }

  for (const item of cartItems) {
    const product = await getProductById(tenantId, item.productId)

    // Produto foi deletado
    if (!product) {
      result.valid = false
      result.unavailableItems.push({
        cartItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        reason: 'deleted',
      })
      continue
    }

    // Produto esta indisponivel
    if (!product.available) {
      result.valid = false
      result.unavailableItems.push({
        cartItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        reason: 'unavailable',
      })
      continue
    }

    // Calcular preco atual
    let currentPrice = product.price

    // Variacao
    if (item.variation) {
      const variation = product.variations.find((v) => v.id === item.variation!.id)
      if (variation) {
        currentPrice += variation.price_modifier
      }
    }

    // Adicionais
    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const currentAddon = product.addons.find((a) => a.id === addon.id)
        if (currentAddon) {
          currentPrice += currentAddon.price
        }
      }
    }

    const expectedUnitPrice =
      item.unitPrice +
      (item.variation?.priceModifier || 0) +
      (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0)

    // Verificar se preco mudou
    if (Math.abs(currentPrice - expectedUnitPrice) > 0.01) {
      result.valid = false
      result.priceChanges.push({
        cartItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        oldPrice: expectedUnitPrice,
        newPrice: currentPrice,
      })
    }

    // Calcular total com preco atual
    result.recalculatedTotal += currentPrice * item.quantity
  }

  return result
}
```

---

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: { status: 'ok' | 'error'; latencyMs?: number; error?: string }
    openrouter: { status: 'ok' | 'error'; latencyMs?: number; error?: string }
  }
}

export async function GET(): Promise<Response> {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok' },
      openrouter: { status: 'ok' },
    },
  }

  // Check Supabase
  try {
    const start = Date.now()
    const supabase = await createClient()
    await supabase.from('tenants').select('id').limit(1)
    health.checks.database.latencyMs = Date.now() - start
  } catch (error) {
    health.status = 'unhealthy'
    health.checks.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    logger.error('Health check: database failed', { error })
  }

  // Check OpenRouter (simple connectivity test)
  try {
    const start = Date.now()
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    })
    health.checks.openrouter.latencyMs = Date.now() - start

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy'
    health.checks.openrouter = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    logger.error('Health check: OpenRouter failed', { error })
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

  return new Response(JSON.stringify(health), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

---

## Variaveis de Ambiente

```env
# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Modelo (opcional, pode ser hardcoded)
OPENROUTER_MODEL=deepseek/deepseek-chat

# Logging
LOG_LEVEL=info  # debug | info | warn | error
```

---

## Decisoes Tecnicas

### 1. OpenRouter vs API direta

- **Decisao:** Usar OpenRouter como gateway
- **Razao:** Flexibilidade para trocar modelos, pricing unificado
- **Trade-off:** Dependencia de terceiro

### 2. Cart em memoria vs banco

- **Decisao:** Cart em memoria (Map) para MVP
- **Razao:** Simplicidade, sem necessidade de persistencia
- **Trade-off:** Perde carrinho se servidor reiniciar (aceitavel para MVP)
- **Evolucao:** Migrar para Redis em producao

### 3. Session ID

- **Decisao:** Gerar no cliente e enviar em cada request
- **Razao:** Identificar carrinho sem autenticacao
- **Implementacao:** UUID gerado no localStorage do browser

### 4. maxSteps no streamText

- **Decisao:** maxSteps: 5
- **Razao:** Permitir fluxos complexos (ex: adicionar item → mostrar carrinho)
- **Trade-off:** Mais tokens consumidos, mas UX melhor

---

## Riscos Tecnicos

### 1. Latencia do LLM

- **Probabilidade:** Media
- **Impacto:** Medio
- **Mitigacao:** Streaming, feedback visual de "digitando"

### 2. Consumo de tokens

- **Probabilidade:** Media
- **Impacto:** Baixo (deepseek e barato)
- **Mitigacao:** Monitorar uso, otimizar prompts

### 3. Tool call incorreta

- **Probabilidade:** Baixa
- **Impacto:** Medio
- **Mitigacao:** Descriptions claras, exemplos no prompt

---

**Gerado automaticamente por:** sprint-context-generator skill
**Data:** 2026-02-05
