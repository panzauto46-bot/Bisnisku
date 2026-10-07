import { NextResponse } from 'next/server'
import { getEarningsStats, getEarningsReconciliation } from '@/services/earnings.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [stats, reconciliation] = await Promise.all([
      getEarningsStats(),
      getEarningsReconciliation(),
    ])

    if (!stats) {
      return NextResponse.json({
        success: true,
        data: null,
      })
    }

    return NextResponse.json({
      success: true,
      data: stats,
      reconciliation,
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
