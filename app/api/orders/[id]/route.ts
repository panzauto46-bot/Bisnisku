import { NextRequest, NextResponse } from 'next/server'
import { getOrderById } from '@/services/order.service'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID tidak valid' },
        { status: 400 }
      )
    }

    const order = await getOrderById(id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil detail pesanan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
