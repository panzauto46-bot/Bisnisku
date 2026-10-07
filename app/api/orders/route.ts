import { NextRequest, NextResponse } from 'next/server'
import { getOrders } from '@/services/order.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters = {
      status: (searchParams.get('status') as any) || 'all',
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      province: searchParams.get('province') || undefined,
      city: searchParams.get('city') || undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : 10,
      sortBy: searchParams.get('sortBy') || 'orderCreatedAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    }

    const result = await getOrders(filters)

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data pesanan',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
