import { db } from '@/db'
import { orders, products } from '@/db/schema'
import { eq, sql, desc, asc } from 'drizzle-orm'
import type { ProductPerformance, Product } from '@/types/order.types'

/**
 * Get or create product by name
 */
export async function getOrCreateProduct(
  productName: string
): Promise<Product | null> {
  try {
    // Try to find existing
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.productName, productName))
      .limit(1)

    if (existing.length > 0) {
      return existing[0] as Product
    }

    // Create new with null cost
    const now = new Date().toISOString()
    const result = await db
      .insert(products)
      .values({
        productName,
        costPrice: null,
        notes: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return result[0] as Product
  } catch (error) {
    console.error('Error getting/creating product:', error)
    return null
  }
}

/**
 * Update product cost price
 */
export async function updateProductCost(
  productName: string,
  costPrice: number
): Promise<boolean> {
  try {
    const now = new Date().toISOString()

    // Try update first
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.productName, productName))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(products)
        .set({ costPrice, updatedAt: now })
        .where(eq(products.productName, productName))
    } else {
      await db.insert(products).values({
        productName,
        costPrice,
        notes: null,
        createdAt: now,
        updatedAt: now,
      })
    }

    return true
  } catch (error) {
    console.error('Error updating product cost:', error)
    return false
  }
}

/**
 * Calculate profit for a single order
 *
 * Profit = (Harga Setelah Diskon × Jumlah)
 *          - (Modal × Jumlah)
 *          - Ongkos Kirim yang ditanggung penjual
 *          - Diskon dari Penjual
 *          - Fee marketplace (estimasi)
 */
export function calculateOrderProfit(
  order: {
    discountedPrice: number
    quantity: number
    shippingFeePaidByBuyer: number
    estimatedShipping: number
    sellerDiscount: number
    packageDiscountSeller: number
    sellerVoucher: number
    returnShippingFee: number
  },
  costPrice: number,
  marketplaceFeePercent: number = 0
): number {
  // Revenue after discount
  const revenue = (order.discountedPrice || 0) * (order.quantity || 1)

  // Cost of goods sold
  const cogs = (costPrice || 0) * (order.quantity || 1)

  // Shipping cost borne by seller (estimated shipping minus what buyer paid)
  const shippingCost = Math.max(
    0,
    (order.estimatedShipping || 0) - (order.shippingFeePaidByBuyer || 0)
  )

  // Seller-borne discounts
  const sellerDiscounts =
    (order.sellerDiscount || 0) +
    (order.packageDiscountSeller || 0) +
    (order.sellerVoucher || 0)

  // Return shipping cost
  const returnCost = order.returnShippingFee || 0

  // Marketplace fee
  const marketplaceFee = revenue * (marketplaceFeePercent / 100)

  const profit =
    revenue - cogs - shippingCost - sellerDiscounts - returnCost - marketplaceFee

  return profit
}

/**
 * Get product performance report
 */
export async function getProductPerformance(): Promise<ProductPerformance[]> {
  // Get all distinct products with their sales data
  const salesData = await db
    .select({
      productName: orders.productName,
      unitsSold: sql<number>`sum(${orders.quantity})`,
      revenue: sql<number>`sum(${orders.totalPayment})`,
    })
    .from(orders)
    .where(eq(orders.status, 'Selesai'))
    .groupBy(orders.productName)

  // Get all product costs
  const productCosts = await db.select().from(products)

  const costMap = new Map<string, number>()
  productCosts.forEach((p) => {
    costMap.set(p.productName, p.costPrice || 0)
  })

  // Calculate performance
  const performance: ProductPerformance[] = salesData.map((row) => {
    const cost = costMap.get(row.productName) || 0
    const unitsSold = row.unitsSold || 0
    const revenue = row.revenue || 0
    const totalCost = cost * unitsSold
    const profit = revenue - totalCost
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0

    return {
      productName: row.productName,
      unitsSold,
      revenue,
      cost: totalCost,
      profit,
      margin,
      roi,
    }
  })

  // Sort by profit descending
  performance.sort((a, b) => b.profit - a.profit)

  return performance
}

/**
 * Get overall profit statistics
 */
export async function getProfitStats() {
  const performance = await getProductPerformance()

  const totalRevenue = performance.reduce((sum, p) => sum + p.revenue, 0)
  const totalCost = performance.reduce((sum, p) => sum + p.cost, 0)
  const totalProfit = performance.reduce((sum, p) => sum + p.profit, 0)

  // Count products with cost set
  const productsWithCost = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(sql`${products.costPrice} IS NOT NULL`)

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    productsAnalyzed: performance.length,
    productsWithCost: productsWithCost[0]?.count || 0,
    bestProduct: performance[0] || null,
    worstProduct: performance[performance.length - 1] || null,
  }
}

/**
 * Get all products that appear in orders but don't have cost set
 */
export async function getProductsMissingCost(): Promise<string[]> {
  const allProducts = await db
    .select({
      name: sql<string>`DISTINCT ${orders.productName}`,
    })
    .from(orders)

  const costSet = await db
    .select({ productName: products.productName })
    .from(products)
    .where(sql`${products.costPrice} IS NOT NULL`)

  const costSetNames = new Set(costSet.map((p) => p.productName))

  return allProducts
    .map((p) => p.name)
    .filter((name) => !costSetNames.has(name))
}
