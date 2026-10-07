import { NextResponse } from 'next/server'
import { getProductPerformance, getProfitStats } from '@/services/profit.service'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const [stats, performance] = await Promise.all([
      getProfitStats(),
      getProductPerformance(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats,
        performance,
      },
    })
  } catch (error) {
    console.error('Profit API error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data profit' },
      { status: 500 }
    )
  }
}
