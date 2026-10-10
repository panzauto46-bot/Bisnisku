import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import {
  ordersToCsv,
  ordersToPdf,
  profitToCsv,
  profitToPdf,
  statsToPdf,
  earningsToCsv,
  earningsToPdf,
  formatRupiah,
  type ExportFormat,
  type ExportType,
  type ChartPoint,
  type ProductPoint,
  type PaymentPoint,
  type ProfitRow,
  type EarningsRow,
} from '@/services/export.service'
import { getOrders, getDashboardStats } from '@/services/order.service'
import { db } from '@/db'
import { orders, products, orderEarnings } from '@/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
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

async function fetchEarnings(): Promise<EarningsRow[]> {
  // Semua order (kiri) + data penghasilan jika ada (kanan). Order tanpa
  // data penghasilan tetap di-export dengan kolom kosong + status
  // "Belum Cair" agar jelas mana yang belum ada datanya.
  const rows = await db
    .select({
      orderNumber: orders.orderNumber,
      status: orders.status,
      releaseDate: orderEarnings.releaseDate,
      totalEarnings: orderEarnings.totalEarnings,
      productPrice: orderEarnings.productPrice,
      shippingPaidByBuyer: orderEarnings.shippingPaidByBuyer,
      shippingPaidToCourier: orderEarnings.shippingPaidToCourier,
      freeShippingFromPlatform: orderEarnings.freeShippingFromPlatform,
      refundToBuyer: orderEarnings.refundToBuyer,
      adminFee: orderEarnings.adminFee,
      orderProcessFee: orderEarnings.orderProcessFee,
      freeShippingXtraFee: orderEarnings.freeShippingXtraFee,
      transactionFee: orderEarnings.transactionFee,
      serviceFeePromoXtra: orderEarnings.serviceFeePromoXtra,
      campaignFee: orderEarnings.campaignFee,
      amsCommissionFee: orderEarnings.amsCommissionFee,
      autoTopupFee: orderEarnings.autoTopupFee,
      premium: orderEarnings.premium,
      fbsFee: orderEarnings.fbsFee,
      pph22: orderEarnings.pph22,
    })
    .from(orders)
    .leftJoin(orderEarnings, eq(orderEarnings.orderNumber, orders.orderNumber))
    .orderBy(desc(orders.orderCreatedAt))

  return rows.map((r) => {
    const hasEarnings = r.totalEarnings !== null
    return {
      orderNumber: r.orderNumber,
      status: r.status ?? '-',
      hasEarnings,
      releaseDate: r.releaseDate,
      totalEarnings: r.totalEarnings,
      productPrice: r.productPrice,
      shippingPaidByBuyer: r.shippingPaidByBuyer,
      shippingPaidToCourier: r.shippingPaidToCourier,
      freeShippingFromPlatform: r.freeShippingFromPlatform,
      refundToBuyer: r.refundToBuyer,
      adminFee: r.adminFee,
      orderProcessFee: r.orderProcessFee,
      freeShippingXtraFee: r.freeShippingXtraFee,
      transactionFee: r.transactionFee,
      serviceFeePromoXtra: r.serviceFeePromoXtra,
      campaignFee: r.campaignFee,
      amsCommissionFee: r.amsCommissionFee,
      autoTopupFee: r.autoTopupFee,
      premium: r.premium,
      fbsFee: r.fbsFee,
      pph22: r.pph22,
    }
  })
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

    if (!['orders', 'profit', 'stats', 'earnings'].includes(type)) {
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
    } else if (type === 'earnings') {
      const data = await fetchEarnings()

      if (format === 'csv') {
        fileContent = earningsToCsv(data)
      } else if (format === 'xlsx') {
        fileContent = buildEarningsXlsx(data)
      } else {
        fileContent = earningsToPdf(data)
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

function buildEarningsXlsx(rows: EarningsRow[]): ArrayBuffer {
  const settled = rows.filter((r) => r.hasEarnings)
  const totalEarnings = settled.reduce((s, r) => s + (r.totalEarnings ?? 0), 0)
  const totalProduct = settled.reduce((s, r) => s + Math.abs(r.productPrice ?? 0), 0)
  const totalFees = settled.reduce((s, r) => s + platformFeesOf(r), 0)

  const summary: (string | number)[][] = [
    ['Laporan Penghasilan Platform', ''],
    ['Order sudah cair', settled.length],
    ['Total pesanan', rows.length],
    ['Total Penghasilan', formatRupiah(totalEarnings)],
    ['Harga Produk', formatRupiah(totalProduct)],
    ['Total Biaya Platform', formatRupiah(totalFees)],
    [],
  ]

  const header = [
    'No. Pesanan', 'Status Pesanan', 'Status Penghasilan',
    'Tanggal Dana Dilepas', 'Total Penghasilan', 'Harga Produk',
    'Ongkir Dibayar Pembeli', 'Ongkir ke Jasa Kirim',
    'Gratis Ongkir dari Platform', 'Pengembalian ke Pembeli',
    'Biaya Administrasi', 'Biaya Proses Pesanan', 'Biaya Gratis Ongkir XTRA',
    'Biaya Transaksi', 'Biaya Layanan Promo XTRA+', 'Biaya Kampanye',
    'Biaya Komisi AMS', 'Biaya Isi Saldo Otomatis', 'Premi', 'FBS Fee',
    'PPh 22', 'Total Biaya Platform',
  ]

  const body = rows.map((r) => [
    r.orderNumber,
    r.status,
    r.hasEarnings ? 'Sudah Cair' : 'Belum Cair',
    (r.releaseDate || '').slice(0, 10),
    r.totalEarnings ?? '',
    absNum(r.productPrice),
    absNum(r.shippingPaidByBuyer),
    absNum(r.shippingPaidToCourier),
    absNum(r.freeShippingFromPlatform),
    absNum(r.refundToBuyer),
    absNum(r.adminFee),
    absNum(r.orderProcessFee),
    absNum(r.freeShippingXtraFee),
    absNum(r.transactionFee),
    absNum(r.serviceFeePromoXtra),
    absNum(r.campaignFee),
    absNum(r.amsCommissionFee),
    absNum(r.autoTopupFee),
    absNum(r.premium),
    absNum(r.fbsFee),
    absNum(r.pph22),
    r.hasEarnings ? platformFeesOf(r) : '',
  ])

  const aoa = [...summary, header, ...body]
  const ws = sheetFromAoA(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Penghasilan')
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

function absNum(value: number | null | undefined): number | string {
  return value === null || value === undefined ? '' : Math.abs(value)
}

function platformFeesOf(row: EarningsRow): number {
  return (
    Math.abs(row.adminFee ?? 0) +
    Math.abs(row.orderProcessFee ?? 0) +
    Math.abs(row.freeShippingXtraFee ?? 0) +
    Math.abs(row.transactionFee ?? 0) +
    Math.abs(row.serviceFeePromoXtra ?? 0) +
    Math.abs(row.campaignFee ?? 0) +
    Math.abs(row.amsCommissionFee ?? 0) +
    Math.abs(row.autoTopupFee ?? 0) +
    Math.abs(row.premium ?? 0) +
    Math.abs(row.fbsFee ?? 0) +
    Math.abs(row.pph22 ?? 0)
  )
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
    ['Rincian Potongan Platform (order Selesai)', ''],
    ['Diskon dari Penjual', formatRupiah(stats.discountBreakdown.sellerDiscount)],
    ['Diskon dari Platform', formatRupiah(stats.discountBreakdown.platformDiscount)],
    ['Voucher Ditanggung Penjual', formatRupiah(stats.discountBreakdown.sellerVoucher)],
    ['Voucher Ditanggung Platform', formatRupiah(stats.discountBreakdown.platformVoucher)],
    ['Potongan Koin Platform', formatRupiah(stats.discountBreakdown.platformCoinDeduction)],
    ['Cashback Koin', formatRupiah(stats.discountBreakdown.coinCashback)],
    ['Diskon Kartu Kredit', formatRupiah(stats.discountBreakdown.creditCardDiscount)],
    ['Total Potongan Lainnya (platform)', formatRupiah(stats.discountBreakdown.totalPlatformDeduction)],
    ['TOTAL SEMUA POTONGAN', formatRupiah(stats.discountBreakdown.totalAllDeductions)],
    [],
    ['Ongkos Kirim Dibayar Pembeli', formatRupiah(stats.shippingBreakdown.paidByBuyer)],
    ['Perkiraan Ongkos Kirim', formatRupiah(stats.shippingBreakdown.estimatedShipping)],
    ['Estimasi Potongan Biaya Pengiriman', formatRupiah(stats.shippingBreakdown.estimatedShippingDiscount)],
    ['Ongkos Kirim Pengembalian', formatRupiah(stats.shippingBreakdown.returnShippingFee)],
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
  lines.push('Rincian Potongan Platform (order Selesai),')
  lines.push(`Diskon dari Penjual,"${formatRupiah(stats.discountBreakdown.sellerDiscount)}"`)
  lines.push(`Diskon dari Platform,"${formatRupiah(stats.discountBreakdown.platformDiscount)}"`)
  lines.push(`Voucher Ditanggung Penjual,"${formatRupiah(stats.discountBreakdown.sellerVoucher)}"`)
  lines.push(`Voucher Ditanggung Platform,"${formatRupiah(stats.discountBreakdown.platformVoucher)}"`)
  lines.push(`Potongan Koin Platform,"${formatRupiah(stats.discountBreakdown.platformCoinDeduction)}"`)
  lines.push(`Cashback Koin,"${formatRupiah(stats.discountBreakdown.coinCashback)}"`)
  lines.push(`Diskon Kartu Kredit,"${formatRupiah(stats.discountBreakdown.creditCardDiscount)}"`)
  lines.push(`Total Potongan Lainnya (platform),"${formatRupiah(stats.discountBreakdown.totalPlatformDeduction)}"`)
  lines.push(`TOTAL SEMUA POTONGAN,"${formatRupiah(stats.discountBreakdown.totalAllDeductions)}"`)
  lines.push('')
  lines.push(`Ongkos Kirim Dibayar Pembeli,"${formatRupiah(stats.shippingBreakdown.paidByBuyer)}"`)
  lines.push(`Perkiraan Ongkos Kirim,"${formatRupiah(stats.shippingBreakdown.estimatedShipping)}"`)
  lines.push(`Estimasi Potongan Biaya Pengiriman,"${formatRupiah(stats.shippingBreakdown.estimatedShippingDiscount)}"`)
  lines.push(`Ongkos Kirim Pengembalian,"${formatRupiah(stats.shippingBreakdown.returnShippingFee)}"`)
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

