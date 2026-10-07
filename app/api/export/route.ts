import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import {
  ordersToCsv,
  ordersToPdf,
  profitToCsv,
  profitToPdf,
  statsToPdf,
  formatRupiah,
  type ExportFormat,
  type ExportType,
  type ChartPoint,
  type ProductPoint,
  type PaymentPoint,
  type ProfitRow,
} from '@/services/export.service'
import { getOrders, getDashboardStats } from '@/services/order.service'
import { db } from '@/db'
import { orders, products } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { DashboardStats } from '@/types/order.types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIMES: Record<ExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
}

function buildFileName(type: ExportType, format: ExportFormat): string {
  const date = new Date().toISOString().slice(0, 10)
  return `bisnisku-${type}-${date}.${format}`
}

/* -------------------------------------------------------------------------- */
/*                                 Data fetchers                                */
/* -------------------------------------------------------------------------- */

async function fetchAllOrders(status: string) {
  // Fetch everything matching the status (no pagination) for export
  const limit = 100000
  const result = await getOrders({ status: status as any, page: 1, limit })
  return result.data
}

async function fetchStats(): Promise<DashboardStats> {
  return await getDashboardStats()
}

async function fetchRevenue(): Promise<ChartPoint[]> {
  const rows = await db
    .select({
      date: sql<string>`date(${orders.orderCreatedAt})`,
      revenue: sql<number>`sum(${orders.totalPayment})`,
      orders: sql<number>`count(*)`,
    })
    .from(orders)
    .where(eq(orders.status, 'Selesai'))
    .groupBy(sql`date(${orders.orderCreatedAt})`)
    .orderBy(sql`date(${orders.orderCreatedAt})`)

  return rows.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue) || 0,
    orders: Number(r.orders) || 0,
  }))
}

async function fetchTopProducts(): Promise<ProductPoint[]> {
  const rows = await db
    .select({
      name: orders.productName,
      quantity: sql<number>`sum(${orders.quantity})`,
      revenue: sql<number>`sum(${orders.totalPayment})`,
    })
    .from(orders)
    .groupBy(orders.productName)
    .orderBy(sql`sum(${orders.quantity}) DESC`)
    .limit(10)

  return rows.map((r) => ({
    name: r.name,
    quantity: Number(r.quantity) || 0,
    revenue: Number(r.revenue) || 0,
  }))
}

async function fetchPaymentMethods(): Promise<PaymentPoint[]> {
  const rows = await db
    .select({
      method: orders.paymentMethod,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(sql`${orders.paymentMethod} IS NOT NULL`)
    .groupBy(orders.paymentMethod)
    .orderBy(sql`count(*) DESC`)

  const total = rows.reduce((sum, r) => sum + (Number(r.count) || 0), 0)

  return rows.map((r) => ({
    method: r.method || 'Lainnya',
    count: Number(r.count) || 0,
    percentage: total > 0 ? (Number(r.count) / total) * 100 : 0,
  }))
}

async function fetchProfit(): Promise<{ rows: ProfitRow[]; totals: {
  revenue: number; cost: number; profit: number; margin: number
} }> {
  // Revenue & quantity per product (all orders)
  const revenueRows = await db
    .select({
      name: orders.productName,
      quantity: sql<number>`sum(${orders.quantity})`,
      revenue: sql<number>`sum(${orders.totalPayment})`,
    })
    .from(orders)
    .groupBy(orders.productName)

  // Cost per product
  const costRows = await db.select().from(products)

  const costMap = new Map<string, number | null>()
  costRows.forEach((c) => costMap.set(c.productName, c.costPrice ?? null))

  const rows: ProfitRow[] = revenueRows
    .map((r) => {
      const quantity = Number(r.quantity) || 0
      const revenue = Number(r.revenue) || 0
      const unitCost = costMap.get(r.name) ?? null
      const totalCost = unitCost !== null ? unitCost * quantity : 0
      const grossProfit = revenue - totalCost
      const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
      return {
        productName: r.name,
        totalQuantity: quantity,
        totalRevenue: revenue,
        totalCost,
        grossProfit,
        profitMargin,
      }
    })
    .sort((a, b) => b.grossProfit - a.grossProfit)

  const revenue = rows.reduce((s, r) => s + r.totalRevenue, 0)
  const cost = rows.reduce((s, r) => s + r.totalCost, 0)
  const profit = revenue - cost
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  return { rows, totals: { revenue, cost, profit, margin } }
}

/* -------------------------------------------------------------------------- */
/*                                    Route                                     */
/* -------------------------------------------------------------------------- */

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const type = (sp.get('type') || 'orders') as ExportType
    const format = (sp.get('format') || 'csv') as ExportFormat
    const status = sp.get('status') || 'all'

    if (!['orders', 'profit', 'stats'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe export tidak valid' },
        { status: 400 }
      )
    }

    if (!['csv', 'xlsx', 'pdf'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Format export tidak valid' },
        { status: 400 }
      )
    }

    let fileContent: ArrayBuffer | string
    let fileName = buildFileName(type, format)

    if (type === 'orders') {
      const data = await fetchAllOrders(status)

      if (format === 'csv') {
        fileContent = ordersToCsv(data)
      } else if (format === 'xlsx') {
        fileContent = buildOrdersXlsx(data)
      } else {
        fileContent = ordersToPdf(data)
      }
    } else if (type === 'profit') {
      const { rows, totals } = await fetchProfit()

      if (format === 'csv') {
        fileContent = profitToCsv(rows)
      } else if (format === 'xlsx') {
        fileContent = buildProfitXlsx(rows, totals)
      } else {
        fileContent = profitToPdf(rows, totals)
      }
    } else {
      // stats
      const [stats, revenue, topProducts, payments] = await Promise.all([
        fetchStats(),
        fetchRevenue(),
        fetchTopProducts(),
        fetchPaymentMethods(),
      ])

      if (format === 'pdf') {
        fileContent = statsToPdf(stats, revenue, topProducts, payments)
      } else if (format === 'xlsx') {
        fileContent = buildStatsXlsx(stats, revenue, topProducts, payments)
      } else {
        fileContent = buildStatsCsv(stats, revenue, topProducts, payments)
      }
    }

    const body =
      typeof fileContent === 'string'
        ? new TextEncoder().encode(fileContent)
        : fileContent

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': MIMES[format],
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal export data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/* -------------------------------------------------------------------------- */
/*                              Excel builders                                  */
/* -------------------------------------------------------------------------- */

function sheetFromAoA(aoa: (string | number)[][]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  return ws
}

function buildOrdersXlsx(orderRows: ReturnType<typeof ordersToCsv> extends never ? never : any[]): ArrayBuffer {
  const header = [
    'No. Pesanan', 'Status Pesanan', 'Alasan Pembatalan',
    'Status Pembatalan/Pengembalian', 'No. Resi', 'Opsi Pengiriman',
    'Antar ke Counter/Pick-up', 'Harus Dikirim Sebelum',
    'Waktu Pengiriman Diatur', 'Waktu Pesanan Dibuat',
    'Waktu Pembayaran', 'Tipe Pesanan', 'Metode Pembayaran',
    'SKU Induk', 'Nama Produk', 'Nomor Referensi SKU', 'Nama Variasi',
    'Harga Awal', 'Harga Setelah Diskon', 'Jumlah', 'Returned Quantity',
    'Subtotal Pesanan', 'Total Diskon', 'Diskon Dari Penjual',
    'Diskon Dari Platform', 'Berat Produk', 'Jumlah Produk di Pesan',
    'Total Berat', 'Voucher Ditanggung Penjual', 'Cashback Koin',
    'Voucher Ditanggung Platform', 'Paket Diskon',
    'Paket Diskon (Platform)', 'Paket Diskon (Penjual)',
    'Potongan Koin Platform', 'Diskon Kartu Kredit',
    'Ongkir Dibayar Pembeli', 'Estimasi Potongan Ongkir',
    'Ongkir Pengembalian', 'Total Pembayaran', 'Perkiraan Ongkos Kirim',
    'Catatan dari Pembeli', 'Catatan', 'Username (Pembeli)',
    'Nama Penerima', 'No. Telepon', 'Alamat Pengiriman',
    'Kota/Kabupaten', 'Provinsi', 'Waktu Pesanan Selesai',
  ]

  const keys = [
    'orderNumber', 'status', 'cancellationReason', 'cancellationStatus',
    'trackingNumber', 'shippingOption', 'pickupType', 'shipByDeadline',
    'shippingTimeSet', 'orderCreatedAt', 'paymentTime', 'orderType',
    'paymentMethod', 'parentSku', 'productName', 'skuReference',
    'variantName', 'originalPrice', 'discountedPrice', 'quantity',
    'returnedQuantity', 'subtotal', 'totalDiscount', 'sellerDiscount',
    'platformDiscount', 'productWeight', 'totalProductOrdered',
    'totalWeight', 'sellerVoucher', 'coinCashback', 'platformVoucher',
    'discountPackage', 'packageDiscountPlatform', 'packageDiscountSeller',
    'platformCoinDeduction', 'creditCardDiscount', 'shippingFeePaidByBuyer',
    'estimatedShippingDiscount', 'returnShippingFee', 'totalPayment',
    'estimatedShipping', 'buyerNote', 'sellerNote', 'buyerUsername',
    'recipientName', 'phoneNumber', 'shippingAddress', 'city', 'province',
    'completedAt',
  ] as const

  const aoa = [header, ...orderRows.map((o: any) => keys.map((k) => o[k] ?? ''))]

  const ws = sheetFromAoA(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Pesanan')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function buildProfitXlsx(rows: ProfitRow[], totals: {
  revenue: number; cost: number; profit: number; margin: number
}): ArrayBuffer {
  const summary: (string | number)[][] = [
    ['Ringkasan Profit', ''],
    ['Total Pendapatan', formatRupiah(totals.revenue)],
    ['Total Modal', formatRupiah(totals.cost)],
    ['Laba Kotor', formatRupiah(totals.profit)],
    ['Margin', `${totals.margin.toFixed(1)}%`],
    [],
  ]

  const header = [
    'Nama Produk', 'Jumlah Terjual', 'Total Pendapatan',
    'Total Modal', 'Laba Kotor', 'Margin (%)',
  ]
  const body = rows.map((r) => [
    r.productName, r.totalQuantity, r.totalRevenue, r.totalCost,
    r.grossProfit, Number(r.profitMargin.toFixed(2)),
  ])

  const aoa = [...summary, header, ...body]
  const ws = sheetFromAoA(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Profit')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function buildStatsXlsx(
  stats: DashboardStats,
  revenue: ChartPoint[],
  topProducts: ProductPoint[],
  payments: PaymentPoint[]
): ArrayBuffer {
  const metrics: (string | number)[][] = [
    ['Statistik Dashboard', ''],
    ['Total Pesanan', stats.total],
    ['Perlu Dikirim', stats.pending],
    ['Dikirim', stats.shipped],
    ['Selesai', stats.completed],
    ['Dibatalkan', stats.cancelled],
    ['Total Pendapatan', formatRupiah(stats.totalRevenue)],
    ['Rata-rata per Pesanan', formatRupiah(stats.averageOrderValue)],
    ['Total Diskon', formatRupiah(stats.totalDiscount)],
    ['Total Ongkir', formatRupiah(stats.totalShipping)],
    ['Tingkat Penyelesaian', `${stats.completionRate.toFixed(1)}%`],
    ['Tingkat Pembatalan', `${stats.cancellationRate.toFixed(1)}%`],
    [],
  ]

  const productHeader = ['Produk', 'Jumlah', 'Pendapatan']
  const productRows = topProducts.map((p) => [p.name, p.quantity, formatRupiah(p.revenue)])

  const paymentHeader = ['Metode Pembayaran', 'Jumlah', 'Persentase']
  const paymentRows = payments.map((p) => [p.method, p.count, `${p.percentage.toFixed(1)}%`])

  const revenueHeader = ['Tanggal', 'Pendapatan', 'Jumlah Pesanan']
  const revenueRows = revenue.map((r) => [r.date, formatRupiah(r.revenue), r.orders])

  const aoa = [
    ...metrics,
    productHeader, ...productRows, [],
    paymentHeader, ...paymentRows, [],
    revenueHeader, ...revenueRows,
  ]

  const ws = sheetFromAoA(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Statistik')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function buildStatsCsv(
  stats: DashboardStats,
  revenue: ChartPoint[],
  topProducts: ProductPoint[],
  payments: PaymentPoint[]
): string {
  const lines: string[] = []
  lines.push('Statistik Dashboard,')
  lines.push(`Total Pesanan,${stats.total}`)
  lines.push(`Perlu Dikirim,${stats.pending}`)
  lines.push(`Dikirim,${stats.shipped}`)
  lines.push(`Selesai,${stats.completed}`)
  lines.push(`Dibatalkan,${stats.cancelled}`)
  lines.push(`Total Pendapatan,"${formatRupiah(stats.totalRevenue)}"`)
  lines.push(`Rata-rata per Pesanan,"${formatRupiah(stats.averageOrderValue)}"`)
  lines.push(`Total Diskon,"${formatRupiah(stats.totalDiscount)}"`)
  lines.push(`Total Ongkir,"${formatRupiah(stats.totalShipping)}"`)
  lines.push(`Tingkat Penyelesaian,${stats.completionRate.toFixed(1)}%`)
  lines.push(`Tingkat Pembatalan,${stats.cancellationRate.toFixed(1)}%`)
  lines.push('')
  lines.push('Produk,Jumlah,Pendapatan')
  topProducts.forEach((p) =>
    lines.push(`"${p.name.replace(/"/g, '""')}",${p.quantity},"${formatRupiah(p.revenue)}"`)
  )
  lines.push('')
  lines.push('Metode Pembayaran,Jumlah,Persentase')
  payments.forEach((p) =>
    lines.push(`"${p.method.replace(/"/g, '""')}",${p.count},${p.percentage.toFixed(1)}%`)
  )
  lines.push('')
  lines.push('Tanggal,Pendapatan,Jumlah Pesanan')
  revenue.forEach((r) =>
    lines.push(`${r.date},"${formatRupiah(r.revenue)}",${r.orders}`)
  )
  return '\uFEFF' + lines.join('\r\n')
}

export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const

export const EXPORT_TYPES = ['orders', 'profit', 'stats'] as const
