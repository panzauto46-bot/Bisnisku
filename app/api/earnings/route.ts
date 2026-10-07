import { NextResponse } from 'next/server'
import { getEarningsStats } from '@/services/earnings.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getEarningsStats()

    if (!stats) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Get earnings stats error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil statistik penghasilan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
