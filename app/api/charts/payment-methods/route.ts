import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { sql, desc } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const result = await db
      .select({
        name: orders.paymentMethod,
        value: sql<number>`count(*)`,
      })
      .from(orders)
      .where(sql`${orders.paymentMethod} IS NOT NULL`)
      .groupBy(orders.paymentMethod)
      .orderBy(desc(sql`count(*)`))

    // Filter out null/empty names
    const filtered = result.filter(
      (row) => row.name && row.name.trim() !== ''
    )

    return NextResponse.json({
      success: true,
      data: filtered,
    })
  } catch (error) {
    console.error('Payment methods chart error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data metode pembayaran',
      },
      { status: 500 }
    )
  }
}
