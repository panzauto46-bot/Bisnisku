import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm'
import type {
  Order,
  OrderStatus,
  OrderWithCategory,
  OrderFilters,
  PaginatedOrders,
  DashboardStats,
} from '@/types/order.types'

/**
 * Map Shopee status string to our internal status category
 *
 * Shopee statuses found in export:
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
export function rawToOrder(raw: any): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {
  const now = new Date().toISOString()

  return {
    orderNumber: raw['No. Pesanan'] || '',
    status: raw['Status Pesanan'] || '',
    cancellationReason: raw['Alasan Pembatalan'] || null,
    cancellationStatus: raw['Status Pembatalan/ Pengembalian'] || null,
    trackingNumber: raw['No. Resi'] || null,
    shippingOption: raw['Opsi Pengiriman'] || null,
    pickupType: raw['Antar ke counter/ pick-up'] || null,
    shipByDeadline:
      raw[
        'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)'
      ] || null,
    shippingTimeSet: raw['Waktu Pengiriman Diatur'] || null,
    orderCreatedAt: raw['Waktu Pesanan Dibuat'] || null,
    paymentTime: raw['Waktu Pembayaran Dilakukan'] || null,
    orderType: raw['Tipe Pesanan'] || null,
    paymentMethod: raw['Metode Pembayaran'] || null,
    parentSku: raw['SKU Induk'] || null,
    productName: raw['Nama Produk'] || '',
    skuReference: raw['Nomor Referensi SKU'] || null,
    variantName: raw['Nama Variasi'] || null,
    originalPrice: raw['Harga Awal'] || 0,
    discountedPrice: raw['Harga Setelah Diskon'] || 0,
    quantity: raw['Jumlah'] || 0,
    returnedQuantity: raw['Returned quantity'] || 0,
    subtotal: raw['Subtotal Pesanan'] || 0,
    totalDiscount: raw['Total Diskon'] || 0,
    sellerDiscount: raw['Diskon Dari Penjual'] || 0,
    shopeeDiscount: raw['Diskon Dari Shopee'] || 0,
    productWeight: raw['Berat Produk'] || null,
    totalProductOrdered: raw['Jumlah Produk di Pesan'] || 0,
    totalWeight: raw['Total Berat'] || null,
    sellerVoucher: raw['Voucher Ditanggung Penjual'] || 0,
    coinCashback: raw['Cashback Koin'] || 0,
    shopeeVoucher: raw['Voucher Ditanggung Shopee'] || 0,
    discountPackage: raw['Paket Diskon'] || null,
    packageDiscountShopee: raw['Paket Diskon (Diskon dari Shopee)'] || 0,
    packageDiscountSeller: raw['Paket Diskon (Diskon dari Penjual)'] || 0,
    shopeeCoinDeduction: raw['Potongan Koin Shopee'] || 0,
    creditCardDiscount: raw['Diskon Kartu Kredit'] || 0,
    shippingFeePaidByBuyer: raw['Ongkos Kirim Dibayar oleh Pembeli'] || 0,
    estimatedShippingDiscount:
      raw['Estimasi Potongan Biaya Pengiriman'] || 0,
    returnShippingFee: raw['Ongkos Kirim Pengembalian Barang'] || 0,
    totalPayment: raw['Total Pembayaran'] || 0,
    estimatedShipping: raw['Perkiraan Ongkos Kirim'] || 0,
    buyerNote: raw['Catatan dari Pembeli'] || null,
    sellerNote: raw['Catatan'] || null,
    buyerUsername: raw['Username (Pembeli)'] || '',
    recipientName: raw['Nama Penerima'] || '',
    phoneNumber: raw['No. Telepon'] || '',
    shippingAddress: raw['Alamat Pengiriman'] || null,
    city: raw['Kota/Kabupaten'] || null,
    province: raw['Provinsi'] || null,
    completedAt: raw['Waktu Pesanan Selesai'] || null,
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

  // Add status category to each order
  const ordersWithCategory: OrderWithCategory[] = result.map((order) => ({
    ...order,
    statusCategory: mapStatusCategory(order as Order),
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
        break
      case 'cancelled':
        cancelled++
        break
    }

    totalDiscount += order.totalDiscount || 0
    totalShipping += order.shippingFeePaidByBuyer || 0
  })

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
 * Insert multiple orders (batch)
 */
export async function insertOrders(
  rawOrders: any[]
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const errors: string[] = []
  let inserted = 0
  let skipped = 0

  const now = new Date().toISOString()

  for (const raw of rawOrders) {
    try {
      const orderData = rawToOrder(raw)

      // Skip if no order number
      if (!orderData.orderNumber) {
        skipped++
        continue
      }

      // Check for existing
      const existing = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderData.orderNumber))
        .limit(1)

      if (existing.length > 0) {
        skipped++
        continue
      }

      await db.insert(orders).values({
        ...orderData,
        createdAt: now,
        updatedAt: now,
      })

      inserted++
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : String(error)
      errors.push(`Order ${raw['No. Pesanan'] || 'unknown'}: ${errMsg}`)
      skipped++
    }
  }

  return { inserted, skipped, errors }
}
