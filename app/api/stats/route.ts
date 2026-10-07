import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/services/order.service'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const stats = await getDashboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil statistik',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
