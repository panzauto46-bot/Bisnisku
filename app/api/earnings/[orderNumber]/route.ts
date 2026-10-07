import { NextRequest, NextResponse } from 'next/server'
import { getEarningsByOrderNumber } from '@/services/earnings.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'Nomor pesanan diperlukan' },
        { status: 400 }
      )
    }

    const earnings = await getEarningsByOrderNumber(orderNumber)

    return NextResponse.json({
      success: true,
      data: earnings,
    })
  } catch (error) {
    console.error('Get earnings by order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data penghasilan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
