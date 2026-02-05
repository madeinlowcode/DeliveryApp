# Plano Tecnico: FEAT-002 - Painel do Estabelecimento

**Documentacao Relacionada:**

- [Especificacao](spec.md) - Requisitos e analise de personas
- [Lista de Tasks](tasks.md) - Tarefas detalhadas
- [Pesquisa](research.md) - Documentacao e referencias

---

## Arquitetura Proposta

O Painel do Estabelecimento segue uma arquitetura feature-based com Clean Architecture simplificada, aproveitando Server Components do Next.js 16 para otimizar performance e SEO.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│  (Browser - React Client Components)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ API Routes  │  │   Server    │         │
│  │ (RSC/Client)│  │  (REST)     │  │  Actions    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                  │
│         └────────────────┼────────────────┘                  │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SERVICES LAYER                          │    │
│  │   orders.service │ products.service │ auth.service   │    │
│  └────────────────────────┬────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │ Database │  │ Realtime │  │ Storage  │    │
│  │  (JWT)   │  │(Postgres)│  │(Channels)│  │ (S3)     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                      │                                       │
│                      ▼                                       │
│              Row Level Security                              │
│         (Isolamento por tenant_id)                          │
└─────────────────────────────────────────────────────────────┘
```

**Principios arquiteturais:**

- Server Components por padrao, Client Components apenas para interatividade
- API Routes para operacoes que precisam de service role
- Realtime via Supabase channels com filtro por tenant
- RLS garante isolamento de dados automaticamente

---

## Stack Tecnologica

**Linguagem:** TypeScript 5.x
**Framework:** Next.js 16 (App Router)

**Frontend:**
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| React | 19.x | UI Library |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Component Library |
| @dnd-kit | 6.x | Drag and Drop |
| Zustand | 5.x | State Management |
| React Hook Form | 7.x | Forms |
| Zod | 3.x | Validation |

**Backend:**
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Supabase | latest | BaaS |
| @supabase/ssr | latest | SSR Auth |

**Testing:**
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Vitest | 2.x | Unit Tests |
| Playwright | 1.x | E2E Tests |
| MSW | 2.x | API Mocking |
| Testing Library | 16.x | Component Tests |

**DevOps/Tooling:**
| Tecnologia | Uso |
|------------|-----|
| ESLint | Linting |
| Prettier | Formatting |
| Husky | Git Hooks |
| lint-staged | Pre-commit |

---

## Estrutura de Diretorios

```
src/
├── app/
│   ├── (auth)/                         # Grupo autenticado
│   │   ├── layout.tsx                  # Layout com sidebar
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Kanban
│   │   │   └── loading.tsx
│   │   ├── cardapio/
│   │   │   ├── page.tsx               # Overview cardapio
│   │   │   ├── categorias/
│   │   │   │   ├── page.tsx           # Lista categorias
│   │   │   │   ├── nova/page.tsx      # Criar categoria
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Editar categoria
│   │   │   │       └── produtos/page.tsx
│   │   │   └── produtos/
│   │   │       ├── page.tsx           # Lista produtos
│   │   │       ├── novo/page.tsx      # Criar produto
│   │   │       └── [id]/page.tsx      # Editar produto
│   │   └── configuracoes/
│   │       ├── page.tsx               # Config geral
│   │       ├── horarios/page.tsx
│   │       └── pagamentos/page.tsx
│   │
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts               # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts           # PATCH, DELETE
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── reorder/route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/availability/route.ts
│   │   └── upload/
│   │       └── signed-url/route.ts
│   │
│   ├── layout.tsx                      # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── ui/                             # shadcn/ui (auto-gerado)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── toast.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── user-nav.tsx
│   │   │
│   │   ├── kanban/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── kanban-card.tsx
│   │   │   ├── order-details-sheet.tsx
│   │   │   └── new-order-alert.tsx
│   │   │
│   │   ├── cardapio/
│   │   │   ├── categories/
│   │   │   │   ├── category-list.tsx
│   │   │   │   ├── category-card.tsx
│   │   │   │   └── category-form.tsx
│   │   │   ├── products/
│   │   │   │   ├── product-list.tsx
│   │   │   │   ├── product-card.tsx
│   │   │   │   ├── product-form.tsx
│   │   │   │   ├── variation-manager.tsx
│   │   │   │   └── addon-manager.tsx
│   │   │   └── shared/
│   │   │       ├── sortable-list.tsx
│   │   │       └── availability-toggle.tsx
│   │   │
│   │   └── settings/
│   │       ├── general-form.tsx
│   │       ├── business-hours-form.tsx
│   │       ├── payment-methods-form.tsx
│   │       └── logo-upload.tsx
│   │
│   └── shared/
│       ├── app-sidebar.tsx
│       ├── header.tsx
│       ├── page-header.tsx
│       ├── data-table.tsx
│       ├── image-upload.tsx
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       └── confirm-dialog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   ├── admin.ts                    # Service role client
│   │   └── middleware.ts               # Auth middleware
│   ├── utils.ts                        # cn() helper
│   ├── constants.ts                    # Order statuses, etc
│   └── validators/
│       ├── category.ts
│       ├── product.ts
│       └── settings.ts
│
├── services/
│   ├── orders.service.ts
│   ├── categories.service.ts
│   ├── products.service.ts
│   ├── variations.service.ts
│   ├── addons.service.ts
│   ├── settings.service.ts
│   └── upload.service.ts
│
├── hooks/
│   ├── use-orders.ts
│   ├── use-realtime-orders.ts
│   ├── use-categories.ts
│   ├── use-products.ts
│   ├── use-tenant.ts
│   └── use-sound.ts
│
├── types/
│   ├── database.ts                     # Supabase generated types
│   ├── order.ts
│   ├── product.ts
│   ├── category.ts
│   └── index.ts
│
├── stores/
│   └── ui-store.ts                     # Sidebar state, modals, etc
│
└── mocks/
    ├── handlers.ts                     # MSW handlers
    ├── data/
    │   ├── orders.ts
    │   ├── categories.ts
    │   └── products.ts
    └── server.ts
```

---

## Schema do Banco de Dados

### Tabelas Principais

```sql
-- Tenants (Estabelecimentos)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  phone VARCHAR(20),
  address TEXT,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  welcome_message TEXT,
  closed_message TEXT DEFAULT 'Estamos fechados no momento',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Usuarios do painel)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operator',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (Categorias do cardapio)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Produtos)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variations (Variacoes: tamanho, sabor)
CREATE TABLE product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- Product Addons (Adicionais)
CREATE TABLE product_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true
);

-- Customers (Clientes)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, phone)
);

-- Customer Addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (Pedidos)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  order_number SERIAL,
  status VARCHAR(50) DEFAULT 'confirmed',
  delivery_address TEXT,
  payment_method VARCHAR(50),
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  variations JSONB,
  addons JSONB
);

-- Business Hours (Horarios de funcionamento)
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 6=sabado
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(tenant_id, day_of_week)
);

-- Payment Methods (Formas de pagamento aceitas)
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- cash, credit, debit, pix
  is_active BOOLEAN DEFAULT true
);
```

### Row Level Security Policies

```sql
-- Enable RLS em todas as tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ... (todas as tabelas)

-- Helper function para obter tenant_id do usuario atual
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Policy para usuarios
CREATE POLICY "Users can view own tenant" ON users
  FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Policy para categorias
CREATE POLICY "Users can manage own tenant categories" ON categories
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policy para produtos
CREATE POLICY "Users can manage own tenant products" ON products
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Policy para pedidos
CREATE POLICY "Users can manage own tenant orders" ON orders
  FOR ALL USING (tenant_id = get_user_tenant_id());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =============================================
-- AUDITORIA
-- =============================================

-- Audit Logs (Historico de alteracoes)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- create, update, delete
  entity_type VARCHAR(50) NOT NULL, -- category, product, order, settings
  entity_id UUID,
  entity_name VARCHAR(255), -- Nome do item para exibicao
  changes JSONB, -- { field: { old: x, new: y } }
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para queries por tenant e data
CREATE INDEX idx_audit_logs_tenant_date ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- RLS para audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tenant audit logs" ON audit_logs
  FOR SELECT USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can insert own tenant audit logs" ON audit_logs
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id());

-- =============================================
-- TRIGGERS PARA UPDATED_AT (Optimistic Locking)
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Componentes Principais

### KanbanBoard

```typescript
// components/features/kanban/kanban-board.tsx
'use client'

import { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { Order, OrderStatus } from '@/types/order'
import { KanbanColumn } from './kanban-column'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: 'confirmed', title: 'Confirmado' },
  { id: 'preparing', title: 'Em Preparo' },
  { id: 'ready', title: 'Pronto' },
  { id: 'out_for_delivery', title: 'Saiu Entrega' },
  { id: 'delivered', title: 'Entregue' },
]

// AIDEV-NOTE: Transicoes de status validas para evitar erros
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed: ['preparing', 'ready'],
  preparing: ['ready', 'confirmed'],
  ready: ['out_for_delivery', 'preparing'],
  out_for_delivery: ['delivered', 'ready'],
  delivered: [], // Status final
}

export function KanbanBoard() {
  const { orders, setOrders, updateOrderStatus, isLoading, error } = useRealtimeOrders()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const orderId = active.id as string
    const newStatus = over.id as OrderStatus
    const order = orders.find(o => o.id === orderId)

    if (!order) return

    // Validar se a transicao e permitida
    const currentStatus = order.status
    if (currentStatus === newStatus) return

    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      toast.error(`Nao e possivel mover de "${currentStatus}" para "${newStatus}"`)
      return
    }

    // AIDEV-PERF: Optimistic update para UX responsiva
    const previousOrders = [...orders]
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ))

    setIsUpdating(true)

    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Pedido #${order.order_number} movido para ${newStatus}`)

      logger.info('Order status updated', {
        orderId,
        orderNumber: order.order_number,
        from: currentStatus,
        to: newStatus
      })

    } catch (error) {
      // AIDEV-NOTE: Rollback em caso de erro
      setOrders(previousOrders)

      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error('Erro ao atualizar status', {
        description: 'Tente novamente em alguns segundos.',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleDragEnd(event)
        }
      })

      logger.error('Failed to update order status', {
        orderId,
        from: currentStatus,
        to: newStatus,
        error: message
      })
    } finally {
      setIsUpdating(false)
    }
  }, [orders, setOrders, updateOrderStatus])

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive mb-4">Erro ao carregar pedidos</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline"
        >
          Recarregar pagina
        </button>
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            orders={orders.filter((o) => o.status === column.id)}
            isLoading={isLoading}
            isDragging={activeId !== null}
          />
        ))}
      </div>

      {/* Overlay de loading durante atualizacao */}
      {isUpdating && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </DndContext>
  )
}
```

### ProductForm

```typescript
// components/features/cardapio/products/product-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormData } from '@/lib/validators/product'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ImageUpload } from '@/components/shared/image-upload'
import { VariationManager } from './variation-manager'
import { AddonManager } from './addon-manager'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  onSubmit: (data: ProductFormData) => Promise<void>
}

export function ProductForm({ product, categories, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      variations: [],
      addons: [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pizza Margherita" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  folder="products"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ... outros campos ... */}

        <VariationManager
          variations={form.watch('variations')}
          onChange={(variations) => form.setValue('variations', variations)}
        />

        <AddonManager
          addons={form.watch('addons')}
          onChange={(addons) => form.setValue('addons', addons)}
        />
      </form>
    </Form>
  )
}
```

---

---

## Servicos de Seguranca

### Rate Limiter

```typescript
// lib/security/rate-limiter.ts

// AIDEV-NOTE: Rate limiter em memoria (usar Redis em producao para multi-instance)
const requests = new Map<string, { count: number; resetTime: number }>()

interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number
}

export async function rateLimit(
  req: Request,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  // Identificar usuario por IP ou user ID
  const identifier =
    req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'

  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const record = requests.get(identifier)

  if (!record || now > record.resetTime) {
    requests.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1, resetIn: windowSeconds }
  }

  if (record.count >= maxRequests) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000)
    return { success: false, remaining: 0, resetIn }
  }

  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  }
}

// Cleanup periodico
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of requests.entries()) {
      if (now > record.resetTime) {
        requests.delete(key)
      }
    }
  }, 60000) // A cada minuto
}
```

### Sanitizacao de Input

```typescript
// lib/security/sanitize.ts

// AIDEV-SECURITY: Sanitizar inputs contra XSS
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, etc)
    .slice(0, 10000) // Limitar tamanho maximo
}

// Sanitizar objeto inteiro
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    const value = sanitized[key]
    if (typeof value === 'string') {
      ;(sanitized as Record<string, unknown>)[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      ;(sanitized as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      )
    }
  }

  return sanitized
}

// Validar UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}
```

### Servico de Auditoria

```typescript
// services/audit.service.ts
import { createClient } from '@/lib/supabase/server'

interface AuditLogInput {
  action: 'create' | 'update' | 'delete'
  entityType: 'category' | 'product' | 'order' | 'settings' | 'business_hours' | 'payment_method'
  entityId: string
  entityName?: string
  changes?: Record<string, { old?: unknown; new?: unknown }>
  request?: Request
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const supabase = await createClient()

    // Obter usuario atual
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Obter tenant_id do usuario
    const { data: userProfile } = await supabase
      .from('users')
      .select('tenant_id, email, name')
      .eq('id', user.id)
      .single()

    if (!userProfile) return

    // Extrair IP e User Agent se disponivel
    const ipAddress =
      input.request?.headers.get('x-forwarded-for') ||
      input.request?.headers.get('x-real-ip') ||
      null
    const userAgent = input.request?.headers.get('user-agent') || null

    // Inserir log de auditoria
    await supabase.from('audit_logs').insert({
      tenant_id: userProfile.tenant_id,
      user_id: user.id,
      user_email: userProfile.email,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_name: input.entityName,
      changes: input.changes || null,
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  } catch (error) {
    // AIDEV-NOTE: Nao falhar a operacao principal por erro de auditoria
    console.error('Failed to log audit:', error)
  }
}

// Helper para calcular diff entre objetos
export function calculateChanges(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {}

  for (const key of Object.keys(newData)) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      }
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}
```

---

## API Route com Seguranca Completa

```typescript
// app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/lib/validators/category'
import { logAudit } from '@/services/audit.service'
import { sanitizeObject, isValidUUID } from '@/lib/security/sanitize'
import { rateLimit } from '@/lib/security/rate-limiter'
import { logger } from '@/lib/logger'

// GET /api/categories
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 60, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas requisicoes. Aguarde um momento.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimitResult.resetIn) },
        }
      )
    }

    const supabase = await createClient()

    // Verificar autenticacao
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar categorias (RLS filtra por tenant automaticamente)
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      logger.error('Failed to fetch categories', { userId: user.id, error })
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    logger.error('Unexpected error in GET /api/categories', { error })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/categories
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 30, 60) // Mais restritivo para escrita
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas requisicoes. Aguarde um momento.' },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticacao
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Parse body
    const body = await req.json()

    // Validar com Zod
    const validation = categorySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados invalidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    // AIDEV-SECURITY: Sanitizar dados
    const sanitizedData = sanitizeObject({
      name: validation.data.name,
      description: validation.data.description || '',
      image_url: validation.data.imageUrl || null,
      sort_order: validation.data.sortOrder || 0,
      is_active: true,
    })

    // Inserir (RLS adiciona tenant_id automaticamente)
    const { data: category, error } = await supabase
      .from('categories')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      logger.error('Failed to create category', { userId: user.id, error })
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    // AIDEV-NOTE: Log de auditoria
    await logAudit({
      action: 'create',
      entityType: 'category',
      entityId: category.id,
      entityName: category.name,
      changes: { created: { old: null, new: sanitizedData } },
      request: req,
    })

    logger.info('Category created', {
      userId: user.id,
      categoryId: category.id,
      name: category.name,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    logger.error('Unexpected error in POST /api/categories', { error })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

```typescript
// app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/lib/validators/category'
import { logAudit, calculateChanges } from '@/services/audit.service'
import { sanitizeObject, isValidUUID } from '@/lib/security/sanitize'
import { rateLimit } from '@/lib/security/rate-limiter'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/categories/[id]
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = params

    // Validar UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(req, 30, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Muitas requisicoes' }, { status: 429 })
    }

    const supabase = await createClient()

    // Verificar autenticacao
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar categoria atual para auditoria e optimistic locking
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingCategory) {
      return NextResponse.json({ error: 'Categoria nao encontrada' }, { status: 404 })
    }

    // Parse body
    const body = await req.json()

    // AIDEV-SECURITY: Optimistic locking - verificar se foi modificado
    if (body.expectedUpdatedAt) {
      const expectedTime = new Date(body.expectedUpdatedAt).getTime()
      const actualTime = new Date(existingCategory.updated_at).getTime()

      if (actualTime > expectedTime) {
        return NextResponse.json(
          {
            error: 'Conflito de edicao',
            message: 'Esta categoria foi modificada por outro usuario. Recarregue os dados.',
            currentData: existingCategory,
          },
          { status: 409 }
        )
      }
    }

    // Validar
    const validation = categorySchema.partial().safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Sanitizar
    const sanitizedData = sanitizeObject({
      ...(validation.data.name && { name: validation.data.name }),
      ...(validation.data.description !== undefined && {
        description: validation.data.description,
      }),
      ...(validation.data.imageUrl !== undefined && { image_url: validation.data.imageUrl }),
      ...(validation.data.sortOrder !== undefined && { sort_order: validation.data.sortOrder }),
      ...(validation.data.isActive !== undefined && { is_active: validation.data.isActive }),
    })

    // Atualizar
    const { data: category, error } = await supabase
      .from('categories')
      .update(sanitizedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update category', { userId: user.id, categoryId: id, error })
      return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
    }

    // Auditoria
    const changes = calculateChanges(existingCategory, category)
    if (changes) {
      await logAudit({
        action: 'update',
        entityType: 'category',
        entityId: id,
        entityName: category.name,
        changes,
        request: req,
      })
    }

    logger.info('Category updated', { userId: user.id, categoryId: id })

    return NextResponse.json(category)
  } catch (error) {
    logger.error('Unexpected error in PATCH /api/categories/[id]', { error })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const rateLimitResult = await rateLimit(req, 30, 60)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Muitas requisicoes' }, { status: 429 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar categoria para auditoria
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria nao encontrada' }, { status: 404 })
    }

    // Verificar se tem produtos vinculados
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        {
          error: 'Categoria possui produtos',
          message: `Esta categoria possui ${count} produto(s). Remova ou mova os produtos antes de excluir.`,
        },
        { status: 400 }
      )
    }

    // Excluir
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      logger.error('Failed to delete category', { userId: user.id, categoryId: id, error })
      return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
    }

    // Auditoria
    await logAudit({
      action: 'delete',
      entityType: 'category',
      entityId: id,
      entityName: existingCategory.name,
      changes: { deleted: { old: existingCategory, new: null } },
      request: req,
    })

    logger.info('Category deleted', {
      userId: user.id,
      categoryId: id,
      name: existingCategory.name,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/categories/[id]', { error })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

---

## Logger

```typescript
// lib/logger.ts

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

## Variaveis de Ambiente

```env
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# APP
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PedeAI

# ===========================================
# UPLOAD (Supabase Storage)
# ===========================================
NEXT_PUBLIC_STORAGE_BUCKET=pedeai-images

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info  # debug | info | warn | error
```

---

## Setup ESLint/Prettier/Husky

### ESLint (eslint.config.mjs)

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
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**'],
  },
]

export default eslintConfig
```

### Prettier (.prettierrc)

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

### Husky + lint-staged

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Decisoes Tecnicas

### 1. @dnd-kit para Drag and Drop

- **Decisao**: Usar @dnd-kit em vez de react-beautiful-dnd
- **Razao**: react-beautiful-dnd esta deprecated, @dnd-kit e mais moderno e bem mantido
- **Trade-offs**: Curva de aprendizado, mas melhor performance

### 2. Server Components por Padrao

- **Decisao**: Usar RSC para paginas de listagem
- **Razao**: Melhor performance, menos JS no cliente
- **Trade-offs**: Client Components para interatividade (forms, dnd)

### 3. Zustand para Estado Global

- **Decisao**: Usar Zustand em vez de Context API
- **Razao**: Mais simples que Redux, melhor performance que Context
- **Trade-offs**: Mais uma dependencia

### 4. React Hook Form + Zod

- **Decisao**: Usar RHF com Zod para formularios
- **Razao**: Performance, validacao type-safe, integracao com shadcn
- **Trade-offs**: Nenhum significativo

---

## Riscos Tecnicos

### 1. Realtime com Muitos Pedidos

- **Probabilidade**: Baixa
- **Impacto**: Alto
- **Mitigacao**: Filtrar por tenant no subscribe, paginacao

### 2. Performance de Imagens

- **Probabilidade**: Media
- **Impacto**: Medio
- **Mitigacao**: Compressao antes do upload, CDN do Supabase

### 3. Conflitos de Drag and Drop

- **Probabilidade**: Media
- **Impacto**: Baixo
- **Mitigacao**: Optimistic updates com rollback, testes E2E

---

**Gerado automaticamente por:** sprint-context-generator skill
**Data:** 2026-02-05
