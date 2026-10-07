import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { products, orders } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Get all products with cost
    const allProducts = await db.select().from(products)

    // Get distinct product names from orders
    const orderProducts = await db
      .select({
        name: sql<string>`DISTINCT ${orders.productName}`,
      })
      .from(orders)

    // Merge: products that appear in orders
    const productMap = new Map<
      string,
      { id: number | null; productName: string; costPrice: number | null }
    >()

    // Add products with cost
    allProducts.forEach((p) => {
      productMap.set(p.productName, {
        id: p.id,
        productName: p.productName,
        costPrice: p.costPrice,
      })
    })

    // Add products from orders that don't have cost yet
    orderProducts.forEach((p) => {
      if (!productMap.has(p.name)) {
        productMap.set(p.name, {
          id: null,
          productName: p.name,
          costPrice: null,
        })
      }
    })

    const result = Array.from(productMap.values())

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, costPrice } = body

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nama produk wajib diisi' },
        { status: 400 }
      )
    }

    if (costPrice === undefined || typeof costPrice !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Harga modal wajib diisi' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({
      success: true,
      message: 'Harga modal berhasil disimpan',
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan harga modal' },
      { status: 500 }
    )
  }
}
