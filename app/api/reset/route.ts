import { NextResponse } from 'next/server'
import { resetAllData } from '@/services/order.service'

export const runtime = 'nodejs'

/**
 * DELETE /api/reset
 * Wipes ALL data (orders, product costs, import history).
 * Cannot be undone.
 */
export async function DELETE() {
  try {
    const result = await resetAllData()

    return NextResponse.json({
      success: true,
      message: 'Semua data berhasil dihapus',
      data: result,
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mereset data' },
      { status: 500 }
    )
  }
}
