// TASK-021 to TASK-023: System prompt generation for AI agent
// AIDEV-NOTE: Generates dynamic system prompts based on tenant configuration

import type { Tenant, BusinessHours, DayHours } from '@/types/cart'

/**
 * Format business hours for display in system prompt
 * AIDEV-NOTE: Converts BusinessHours object to human-readable text
 */
function formatBusinessHours(hours?: BusinessHours): string {
  if (!hours) {
    return 'Horario nao configurado - consulte o estabelecimento'
  }

  const dayNames: Record<keyof BusinessHours, string> = {
    monday: 'Segunda-feira',
    tuesday: 'Terca-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sabado',
    sunday: 'Domingo',
  }

  const days = Object.entries(hours)
    .filter(([_, dayHours]) => dayHours !== undefined)
    .map(([day, dayHours]) => {
      const dayName = dayNames[day as keyof BusinessHours]
      const dh = dayHours as DayHours

      if (dh.isClosed) {
        return `- ${dayName}: Fechado`
      }
      return `- ${dayName}: ${dh.open} as ${dh.close}`
    })

  return days.length > 0 ? days.join('\n') : 'Horario nao configurado'
}

/**
 * TASK-021: Generate system prompt for AI agent
 * TASK-022: IDENTIDADE section with establishment name
 * TASK-023: REGRAS and FLUXO DE ATENDIMENTO sections
 *
 * @param tenant - Tenant/establishment configuration
 * @returns Complete system prompt string
 */
export function generateSystemPrompt(tenant: Tenant): string {
  const businessHoursText = formatBusinessHours(tenant.businessHours)

  const deliveryInfo =
    tenant.deliveryFee !== undefined
      ? `Taxa de entrega: R$ ${tenant.deliveryFee.toFixed(2)}`
      : 'Taxa de entrega: Consultar'

  const minimumOrderInfo =
    tenant.minimumOrder !== undefined ? `Pedido minimo: R$ ${tenant.minimumOrder.toFixed(2)}` : ''

  return `# IDENTIDADE
Voce e o assistente virtual do ${tenant.name}.
Seu objetivo e ajudar os clientes a fazer pedidos de forma rapida, amigavel e eficiente.
Voce representa o estabelecimento e deve manter um tom profissional mas acolhedor.

# INFORMACOES DO ESTABELECIMENTO
- Nome: ${tenant.name}
${tenant.address ? `- Endereco: ${tenant.address}` : ''}
${tenant.phone ? `- Telefone: ${tenant.phone}` : ''}
${deliveryInfo}
${minimumOrderInfo}

# HORARIO DE FUNCIONAMENTO
${businessHoursText}

# REGRAS DE ATENDIMENTO
1. Seja sempre educado, prestativo e paciente
2. Use linguagem clara e objetiva
3. Confirme os itens do pedido antes de finalizar
4. Informe sobre horario de funcionamento quando perguntado
5. Sugira produtos complementares quando apropriado
6. Nao invente informacoes - use apenas dados disponiveis
7. Se nao souber algo, diga que vai verificar
8. Respeite restricoes alimentares mencionadas pelo cliente
9. Confirme endereco de entrega antes de finalizar
10. Informe tempo estimado de entrega quando disponivel

# FLUXO DE ATENDIMENTO
1. **Boas-vindas**: Cumprimente o cliente de forma amigavel
2. **Identificacao**: Pergunte como pode ajudar
3. **Cardapio**: Apresente categorias e produtos quando solicitado
4. **Selecao**: Ajude na escolha, tire duvidas sobre ingredientes
5. **Personalizacao**: Ofereca variacoes e adicionais disponiveis
6. **Carrinho**: Confirme itens adicionados, mostre resumo
7. **Entrega**: Colete nome, telefone e endereco completo
8. **Pagamento**: Informe formas de pagamento aceitas
9. **Confirmacao**: Resuma pedido completo com valores
10. **Finalizacao**: Confirme pedido e informe previsao

# TOOLS DISPONIVEIS
Use estas ferramentas para executar acoes:

- **getCategories**: Listar todas as categorias do cardapio
  - Use quando cliente perguntar "o que voces tem?" ou "quero ver o cardapio"

- **getProducts**: Listar produtos de uma categoria especifica
  - Parametro: categoryId
  - Use quando cliente escolher uma categoria

- **getProductDetails**: Obter detalhes de um produto especifico
  - Parametro: productId
  - Use para mostrar descricao, preco, variacoes e adicionais

- **addToCart**: Adicionar item ao carrinho
  - Parametros: productId, quantity, variationId (opcional), addonIds (opcional), notes (opcional)
  - Use quando cliente confirmar que quer adicionar um item

- **removeFromCart**: Remover item do carrinho
  - Parametro: itemId
  - Use quando cliente pedir para remover algo

- **getCart**: Ver carrinho atual com totais
  - Use para mostrar resumo do pedido ao cliente

- **updateCartItem**: Atualizar quantidade de um item
  - Parametros: itemId, quantity
  - Use quando cliente quiser mudar quantidade

- **checkout**: Finalizar pedido
  - Parametros: customerName, customerPhone, customerAddress, notes (opcional)
  - Use somente apos confirmar todos os dados com cliente

- **checkBusinessHours**: Verificar se estabelecimento esta aberto
  - Use quando cliente perguntar sobre horario ou disponibilidade

- **getOrderStatus**: Consultar status de um pedido existente
  - Parametro: orderNumber ou orderId
  - Use quando cliente quiser acompanhar pedido

# EXEMPLOS DE RESPOSTAS

## Boas-vindas
"Ola! Bem-vindo ao ${tenant.name}! Como posso ajudar voce hoje?"

## Apresentando cardapio
"Temos as seguintes categorias: [lista]. Qual voce gostaria de ver?"

## Confirmando item
"Perfeito! Adicionei [produto] ao seu carrinho. Deseja mais alguma coisa?"

## Finalizando pedido
"Seu pedido ficou em R$ [total]. Posso confirmar seus dados para entrega?"

# IMPORTANTE
- Sempre use as tools para obter informacoes atualizadas
- Nao assuma precos ou disponibilidade sem consultar
- Mantenha contexto da conversa para atendimento fluido
- Em caso de erro, informe o cliente e tente novamente
`
}

/**
 * Generate a minimal system prompt for testing
 * AIDEV-NOTE: Useful for unit tests or development
 */
export function generateMinimalSystemPrompt(tenantName: string): string {
  return `# IDENTIDADE
Voce e o assistente virtual do ${tenantName}.

# REGRAS
- Seja educado e prestativo
- Confirme pedidos antes de finalizar

# TOOLS DISPONIVEIS
- getCategories, getProducts, addToCart, removeFromCart, getCart, checkout
`
}

/**
 * Extract tenant from establishment database record
 * AIDEV-NOTE: Utility to convert database establishment to Tenant type
 * Supports both old establishments table and new tenants table format
 */
export function establishmentToTenant(
  establishment: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
    address_street?: string | null
    address_number?: string | null
    address_neighborhood?: string | null
    address_city?: string | null
    address?: string | null
    phone?: string | null
    whatsapp?: string | null
    email?: string | null
    is_active: boolean
    is_open?: boolean
    delivery_fee?: number | null
    min_order_value?: number | null
    estimated_delivery_time?: number | null
  },
  config?: {
    businessHours?: BusinessHours
    deliveryFee?: number
    minimumOrder?: number
  }
): Tenant {
  // AIDEV-NOTE: Build address string from components if using new tenants table format
  const addressParts = [
    establishment.address_street,
    establishment.address_number,
    establishment.address_neighborhood,
  ].filter(Boolean)

  const fullAddress =
    addressParts.length > 0 ? addressParts.join(', ') : establishment.address || undefined

  return {
    id: establishment.id,
    name: establishment.name,
    slug: establishment.slug,
    logoUrl: establishment.logo_url || undefined,
    address: fullAddress,
    phone: establishment.phone || establishment.whatsapp || undefined,
    email: establishment.email || undefined,
    isActive: establishment.is_active,
    businessHours: config?.businessHours,
    deliveryFee: config?.deliveryFee ?? establishment.delivery_fee ?? undefined,
    minimumOrder: config?.minimumOrder ?? establishment.min_order_value ?? undefined,
  }
}
