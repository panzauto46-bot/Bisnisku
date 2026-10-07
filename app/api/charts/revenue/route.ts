import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Get daily revenue from completed orders
    const result = await db
      .select({
        date: sql<string>`substr(${orders.orderCreatedAt}, 1, 10)`,
        revenue: sql<number>`sum(${orders.totalPayment})`,
        orderCount: sql<number>`count(*)`,
      })
      .from(orders)
      .where(eq(orders.status, 'Selesai'))
      .groupBy(sql`substr(${orders.orderCreatedAt}, 1, 10)`)
      .orderBy(sql`substr(${orders.orderCreatedAt}, 1, 10)`)
      .limit(30)

    // Format date to be more readable
    const formatted = result.map((row) => {
      const dateStr = row.date
      if (!dateStr) return { date: '', revenue: 0, orders: 0 }

      const parts = dateStr.split('-')
      if (parts.length === 3) {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
          'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
        ]
        const monthIndex = parseInt(parts[1]) - 1
        return {
          date: `${parseInt(parts[2])} ${months[monthIndex] || parts[1]}`,
          revenue: row.revenue || 0,
          orders: row.orderCount || 0,
        }
      }

      return { date: dateStr, revenue: row.revenue || 0, orders: row.orderCount || 0 }
    })

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error('Revenue chart error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data pendapatan',
      },
      { status: 500 }
    )
  }
}
