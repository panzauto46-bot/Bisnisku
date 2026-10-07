import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { sql, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const result = await db
      .select({
        name: orders.productName,
        total: sql<number>`sum(${orders.quantity})`,
        revenue: sql<number>`sum(${orders.totalPayment})`,
      })
      .from(orders)
      .groupBy(orders.productName)
      .orderBy(desc(sql`sum(${orders.quantity})`))
      .limit(10)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Products chart error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data produk',
      },
      { status: 500 }
    )
  }
}
