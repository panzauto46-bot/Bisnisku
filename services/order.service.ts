import { db } from '@/db'
import { orders, products, importHistory, orderEarnings } from '@/db/schema'
import { eq, and, gte, lte, desc, asc, inArray, sql } from 'drizzle-orm'
import type {
  Order,
  OrderStatus,
  OrderWithCategory,
  OrderFilters,
  PaginatedOrders,
  DashboardStats,
  RawOrder,
} from '@/types/order.types'

/**
 * Map marketplace status string to our internal status category
 *
 * Marketplace statuses found in export:
 * - "Selesai" → completed
 * - "Batal" / "Dibatalkan" → cancelled
 * - "Sedang Dikirim" → shipped (in transit)
 * - "Telah Dikirim" → shipped (delivered)
 * - "Pesanan diterima, namun Pembeli masih dapat mengajukan pengembalian..." → shipped (return window)
 * - "Perlu Dikirim" → pending (needs to be shipped, resi may be pre-generated)
 * - "Belum Bayar" → pending (awaiting payment)
 *
 * NOTE: This logic must stay in sync with buildStatusCondition() below.
 */
export function mapStatusCategory(order: Order): OrderStatus {
  const status = (order.status || '').toLowerCase()

  // Cancelled
  if (status === 'batal' || status.includes('dibatalkan')) {
    return 'cancelled'
  }

  // Completed
  if (status === 'selesai') {
    return 'completed'
  }

  // Shipped: in transit, delivered, or in return window
  if (
    status === 'sedang dikirim' ||
    status === 'telah dikirim' ||
    status.startsWith('pesanan diterima')
  ) {
    return 'shipped'
  }

  // Everything else is pending (Perlu Dikirim, Belum Bayar, unknown)
  return 'pending'
}

/**
 * Convert RawOrder to Order entity
 */
export function rawToOrder(
  raw: RawOrder
): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString()

  return {
    orderNumber: raw.orderNumber || '',
    status: raw.status || '',
    cancellationReason: raw.cancellationReason || null,
    cancellationStatus: raw.cancellationStatus || null,
    trackingNumber: raw.trackingNumber || null,
    shippingOption: raw.shippingOption || null,
    pickupType: raw.pickupType || null,
    shipByDeadline: raw.shipByDeadline || null,
    shippingTimeSet: raw.shippingTimeSet || null,
    orderCreatedAt: raw.orderCreatedAt || null,
    paymentTime: raw.paymentTime || null,
    orderType: raw.orderType || null,
    paymentMethod: raw.paymentMethod || null,
    parentSku: raw.parentSku || null,
    productName: raw.productName || '',
    skuReference: raw.skuReference || null,
    variantName: raw.variantName || null,
    originalPrice: raw.originalPrice || 0,
    discountedPrice: raw.discountedPrice || 0,
    quantity: raw.quantity || 0,
    returnedQuantity: raw.returnedQuantity || 0,
    subtotal: raw.subtotal || 0,
    totalDiscount: raw.totalDiscount || 0,
    sellerDiscount: raw.sellerDiscount || 0,
    platformDiscount: raw.platformDiscount || 0,
    productWeight: raw.productWeight || null,
    totalProductOrdered: raw.totalProductOrdered || 0,
    totalWeight: raw.totalWeight || null,
    sellerVoucher: raw.sellerVoucher || 0,
    coinCashback: raw.coinCashback || 0,
    platformVoucher: raw.platformVoucher || 0,
    discountPackage: raw.discountPackage || null,
    packageDiscountPlatform: raw.packageDiscountPlatform || 0,
    packageDiscountSeller: raw.packageDiscountSeller || 0,
    platformCoinDeduction: raw.platformCoinDeduction || 0,
    creditCardDiscount: raw.creditCardDiscount || 0,
    shippingFeePaidByBuyer: raw.shippingFeePaidByBuyer || 0,
    estimatedShippingDiscount: raw.estimatedShippingDiscount || 0,
    returnShippingFee: raw.returnShippingFee || 0,
    totalPayment: raw.totalPayment || 0,
    estimatedShipping: raw.estimatedShipping || 0,
    buyerNote: raw.buyerNote || null,
    sellerNote: raw.sellerNote || null,
    buyerUsername: raw.buyerUsername || '',
    recipientName: raw.recipientName || '',
    phoneNumber: raw.phoneNumber || '',
    shippingAddress: raw.shippingAddress || null,
    city: raw.city || null,
    province: raw.province || null,
    completedAt: raw.completedAt || null,
  }
}

/**
 * Build where clause based on status category
 */
function buildStatusCondition(status: OrderStatus) {
  switch (status) {
    case 'pending':
      // Everything that is not completed, cancelled, or shipped
      return sql`${orders.status} NOT IN ('Selesai', 'Batal', 'Dibatalkan', 'Sedang Dikirim', 'Telah Dikirim') AND ${orders.status} NOT LIKE 'Pesanan diterima%'`
    case 'shipped':
      return sql`${orders.status} IN ('Sedang Dikirim', 'Telah Dikirim') OR ${orders.status} LIKE 'Pesanan diterima%'`
    case 'completed':
      return eq(orders.status, 'Selesai')
    case 'cancelled':
      return sql`${orders.status} IN ('Batal', 'Dibatalkan')`
    default:
      return sql`1=1`
  }
}

/**
 * Get orders with filtering and pagination
 */
export async function getOrders(
  filters: OrderFilters = {}
): Promise<PaginatedOrders> {
  const {
    status = 'all',
    search,
    dateFrom,
    dateTo,
    paymentMethod,
    province,
    city,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = 'orderCreatedAt',
    sortOrder = 'desc',
  } = filters

  const offset = (page - 1) * limit

  // Build conditions array
  const conditions = []

  // Status filter
  if (status !== 'all') {
    conditions.push(buildStatusCondition(status))
  }

  // Search filter
  if (search) {
    const searchPattern = `%${search}%`
    conditions.push(
      sql`(
        ${orders.orderNumber} LIKE ${searchPattern} OR
        ${orders.productName} LIKE ${searchPattern} OR
        ${orders.buyerUsername} LIKE ${searchPattern} OR
        ${orders.recipientName} LIKE ${searchPattern} OR
        ${orders.trackingNumber} LIKE ${searchPattern}
      )`
    )
  }

  // Date range filter
  if (dateFrom) {
    conditions.push(sql`${orders.orderCreatedAt} >= ${dateFrom}`)
  }
  if (dateTo) {
    conditions.push(sql`${orders.orderCreatedAt} <= ${dateTo} || ' 23:59:59'`)
  }

  // Payment method filter
  if (paymentMethod) {
    conditions.push(eq(orders.paymentMethod, paymentMethod))
  }

  // Location filters
  if (province) {
    conditions.push(eq(orders.province, province))
  }
  if (city) {
    conditions.push(eq(orders.city, city))
  }

  // Price range filter
  if (minPrice !== undefined) {
    conditions.push(gte(orders.totalPayment, minPrice))
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(orders.totalPayment, maxPrice))
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : sql`1=1`

  // Build order by
  const sortColumn =
    sortBy === 'totalPayment'
      ? orders.totalPayment
      : sortBy === 'productName'
        ? orders.productName
        : orders.orderCreatedAt
  const orderClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)

  // Execute query
  const result = await db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset)

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause)

  const total = countResult[0]?.count || 0

  // Cek order mana yang sudah ada di file penghasilan yang di-import
  // (tabel order_earnings). Dipakai untuk badge "Sudah Cair / Belum Cair"
  // di tabel pesanan. Murni membaca hasil import Excel, tidak ada API call.
  const orderNumbers = result.map((o) => o.orderNumber)
  const earningsRows = orderNumbers.length
    ? await db
        .select({ orderNumber: orderEarnings.orderNumber })
        .from(orderEarnings)
        .where(inArray(orderEarnings.orderNumber, orderNumbers))
    : []
  const earningsSet = new Set(earningsRows.map((r) => r.orderNumber))

  // Add status category to each order
  const ordersWithCategory: OrderWithCategory[] = result.map((order) => ({
    ...order,
    statusCategory: mapStatusCategory(order as Order),
    hasEarnings: earningsSet.has(order.orderNumber),
  }))

  return {
    data: ordersWithCategory,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get dashboard statistics
 *
 * Money metrics (revenue, discount, shipping) are computed from COMPLETED
 * orders only, so every rupiah shown is money that actually moved. Counting
 * cancelled orders in the discount/shipping totals made them look far larger
 * than what was really transacted.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Get all orders
  const allOrders = await db.select().from(orders)

  let total = 0
  let pending = 0
  let shipped = 0
  let completed = 0
  let cancelled = 0
  let totalRevenue = 0
  let totalDiscount = 0
  let totalShipping = 0

  // Per-component deduction totals (completed orders only)
  let sellerDiscount = 0
  let platformDiscount = 0
  let sellerVoucher = 0
  let platformVoucher = 0
  let platformCoinDeduction = 0
  let coinCashback = 0
  let creditCardDiscount = 0
  let shippingPaidByBuyer = 0
  let estimatedShipping = 0
  let estimatedShippingDiscount = 0
  let returnShippingFee = 0

  allOrders.forEach((order) => {
    total++
    const category = mapStatusCategory(order as Order)

    switch (category) {
      case 'pending':
        pending++
        break
      case 'shipped':
        shipped++
        break
      case 'completed':
        completed++
        totalRevenue += order.totalPayment || 0

        // Deductions that actually happened on a paid order
        totalDiscount += order.totalDiscount || 0
        totalShipping += order.shippingFeePaidByBuyer || 0

        sellerDiscount += order.sellerDiscount || 0
        platformDiscount += order.platformDiscount || 0
        sellerVoucher += order.sellerVoucher || 0
        platformVoucher += order.platformVoucher || 0
        platformCoinDeduction += order.platformCoinDeduction || 0
        coinCashback += order.coinCashback || 0
        creditCardDiscount += order.creditCardDiscount || 0
        shippingPaidByBuyer += order.shippingFeePaidByBuyer || 0
        estimatedShipping += order.estimatedShipping || 0
        estimatedShippingDiscount += order.estimatedShippingDiscount || 0
        returnShippingFee += order.returnShippingFee || 0
        break
      case 'cancelled':
        cancelled++
        break
    }
  })

  // "Total Diskon" from the export only covers product-price discounts
  // (seller + platform + seller voucher). Platform vouchers, coins and
  // card discounts are subtracted at checkout and are NOT in that column.
  const totalProductDiscount =
    sellerDiscount + platformDiscount + sellerVoucher
  const totalPlatformDeduction =
    platformVoucher + platformCoinDeduction + coinCashback + creditCardDiscount

  return {
    total,
    pending,
    shipped,
    completed,
    cancelled,
    totalRevenue,
    totalProfit: 0, // Will be calculated in profit service
    averageOrderValue: completed > 0 ? totalRevenue / completed : 0,
    totalDiscount,
    totalShipping,
    discountBreakdown: {
      sellerDiscount,
      platformDiscount,
      sellerVoucher,
      platformVoucher,
      platformCoinDeduction,
      coinCashback,
      creditCardDiscount,
      totalProductDiscount,
      totalPlatformDeduction,
      totalAllDeductions: totalProductDiscount + totalPlatformDeduction,
    },
    shippingBreakdown: {
      paidByBuyer: shippingPaidByBuyer,
      estimatedShipping,
      estimatedShippingDiscount,
      returnShippingFee,
    },
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
  }
}

/**
 * Get single order by ID
 */
export async function getOrderById(id: number): Promise<OrderWithCategory | null> {
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1)

  if (result.length === 0) {
    return null
  }

  const order = result[0] as Order
  return {
    ...order,
    statusCategory: mapStatusCategory(order),
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderWithCategory | null> {
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const order = result[0] as Order
  return {
    ...order,
    statusCategory: mapStatusCategory(order),
  }
}

/**
 * Insert multiple orders in bulk.
 *
 * Uses a single INSERT ... ON CONFLICT DO NOTHING per chunk instead of one
 * SELECT + INSERT per row. With Turso each query is an HTTP round trip, so
 * the per-row loop made a 500-row import take minutes instead of seconds.
 */
export async function insertOrders(
  rawOrders: any[]
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const errors: string[] = []
  let skipped = 0

  const now = new Date().toISOString()

  const rows = rawOrders
    .map((raw) => {
      try {
        const orderData = rawToOrder(raw)
        if (!orderData.orderNumber) {
          skipped++
          return null
        }
        return { ...orderData, createdAt: now, updatedAt: now }
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : String(error)
        errors.push(`Order ${raw.orderNumber || 'unknown'}: ${errMsg}`)
        skipped++
        return null
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  const CHUNK = 100
  let inserted = 0

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    try {
      const result = await db
        .insert(orders)
        .values(chunk)
        .onConflictDoNothing({
          target: orders.orderNumber,
        })
      inserted += result.rowsAffected
      skipped += chunk.length - result.rowsAffected
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : String(error)
      errors.push(`Chunk starting at ${chunk[0]?.orderNumber}: ${errMsg}`)
      skipped += chunk.length
    }
  }

  return { inserted, skipped, errors }
}

/**
 * Delete ALL data from the database (orders, products, earnings, import
 * history). Returns the number of deleted rows per table.
 *
 * WARNING: This is destructive and cannot be undone.
 */
export async function resetAllData(): Promise<{
  orders: number
  products: number
  orderEarnings: number
  importHistory: number
}> {
  const deletedOrders = await db.delete(orders)
  const deletedProducts = await db.delete(products)
  const deletedEarnings = await db.delete(orderEarnings)
  const deletedHistory = await db.delete(importHistory)

  return {
    orders: deletedOrders.rowsAffected,
    products: deletedProducts.rowsAffected,
    orderEarnings: deletedEarnings.rowsAffected,
    importHistory: deletedHistory.rowsAffected,
  }
}
