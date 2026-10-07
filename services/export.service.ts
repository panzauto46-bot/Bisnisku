import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { OrderWithCategory, DashboardStats } from '@/types/order.types'

/**
 * Export service — generates CSV, Excel (.xlsx) and PDF files
 * for orders, profit summary, and dashboard statistics.
 */

type OrderRow = OrderWithCategory

/* -------------------------------------------------------------------------- */
/*                                   Orders                                    */
/* -------------------------------------------------------------------------- */

/**
 * Human-readable labels for every order field (Indonesian, matching the
 * marketplace export so the file stays familiar to the user).
 */
const ORDER_FIELDS: { key: keyof OrderRow; label: string }[] = [
  { key: 'orderNumber', label: 'No. Pesanan' },
  { key: 'status', label: 'Status Pesanan' },
  { key: 'cancellationReason', label: 'Alasan Pembatalan' },
  { key: 'cancellationStatus', label: 'Status Pembatalan/Pengembalian' },
  { key: 'trackingNumber', label: 'No. Resi' },
  { key: 'shippingOption', label: 'Opsi Pengiriman' },
  { key: 'pickupType', label: 'Antar ke Counter/Pick-up' },
  { key: 'shipByDeadline', label: 'Harus Dikirim Sebelum' },
  { key: 'shippingTimeSet', label: 'Waktu Pengiriman Diatur' },
  { key: 'orderCreatedAt', label: 'Waktu Pesanan Dibuat' },
  { key: 'paymentTime', label: 'Waktu Pembayaran' },
  { key: 'orderType', label: 'Tipe Pesanan' },
  { key: 'paymentMethod', label: 'Metode Pembayaran' },
  { key: 'parentSku', label: 'SKU Induk' },
  { key: 'productName', label: 'Nama Produk' },
  { key: 'skuReference', label: 'Nomor Referensi SKU' },
  { key: 'variantName', label: 'Nama Variasi' },
  { key: 'originalPrice', label: 'Harga Awal' },
  { key: 'discountedPrice', label: 'Harga Setelah Diskon' },
  { key: 'quantity', label: 'Jumlah' },
  { key: 'returnedQuantity', label: 'Returned Quantity' },
  { key: 'subtotal', label: 'Subtotal Pesanan' },
  { key: 'totalDiscount', label: 'Total Diskon' },
  { key: 'sellerDiscount', label: 'Diskon Dari Penjual' },
  { key: 'platformDiscount', label: 'Diskon Dari Platform' },
  { key: 'productWeight', label: 'Berat Produk' },
  { key: 'totalProductOrdered', label: 'Jumlah Produk di Pesan' },
  { key: 'totalWeight', label: 'Total Berat' },
  { key: 'sellerVoucher', label: 'Voucher Ditanggung Penjual' },
  { key: 'coinCashback', label: 'Cashback Koin' },
  { key: 'platformVoucher', label: 'Voucher Ditanggung Platform' },
  { key: 'discountPackage', label: 'Paket Diskon' },
  { key: 'packageDiscountPlatform', label: 'Paket Diskon (Platform)' },
  { key: 'packageDiscountSeller', label: 'Paket Diskon (Penjual)' },
  { key: 'platformCoinDeduction', label: 'Potongan Koin Platform' },
  { key: 'creditCardDiscount', label: 'Diskon Kartu Kredit' },
  { key: 'shippingFeePaidByBuyer', label: 'Ongkir Dibayar Pembeli' },
  { key: 'estimatedShippingDiscount', label: 'Estimasi Potongan Ongkir' },
  { key: 'returnShippingFee', label: 'Ongkir Pengembalian' },
  { key: 'totalPayment', label: 'Total Pembayaran' },
  { key: 'estimatedShipping', label: 'Perkiraan Ongkos Kirim' },
  { key: 'buyerNote', label: 'Catatan dari Pembeli' },
  { key: 'sellerNote', label: 'Catatan' },
  { key: 'buyerUsername', label: 'Username (Pembeli)' },
  { key: 'recipientName', label: 'Nama Penerima' },
  { key: 'phoneNumber', label: 'No. Telepon' },
  { key: 'shippingAddress', label: 'Alamat Pengiriman' },
  { key: 'city', label: 'Kota/Kabupaten' },
  { key: 'province', label: 'Provinsi' },
  { key: 'completedAt', label: 'Waktu Pesanan Selesai' },
]

/** Cell renderer: numbers stay raw (Excel/CSV) or get formatted (PDF). */
function cellValue(order: OrderRow, key: keyof OrderRow): string | number {
  const value = order[key]
  if (value === null || value === undefined) return ''
  return value as string | number
}

function quoteCsv(value: string | number): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function ordersToCsv(orders: OrderRow[]): string {
  const header = ORDER_FIELDS.map((f) => quoteCsv(f.label)).join(',')
  const rows = orders.map((order) =>
    ORDER_FIELDS.map((f) => quoteCsv(cellValue(order, f.key))).join(',')
  )
  // Prepend BOM so Excel detects UTF-8 (Indonesian text has no special chars,
  // but keeps it consistent with the export source)
  return '\uFEFF' + [header, ...rows].join('\r\n')
}

/* -------------------------------------------------------------------------- */
/*                              Profit summary                                 */
/* -------------------------------------------------------------------------- */

export interface ProfitRow {
  productName: string
  totalQuantity: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
}

export function profitToCsv(rows: ProfitRow[]): string {
  const header = [
    'Nama Produk',
    'Jumlah Terjual',
    'Total Pendapatan',
    'Total Modal',
    'Laba Kotor',
    'Margin (%)',
  ]
    .map(quoteCsv)
    .join(',')
  const body = rows
    .map((r) =>
      [
        r.productName,
        r.totalQuantity,
        r.totalRevenue,
        r.totalCost,
        r.grossProfit,
        Number(r.profitMargin.toFixed(2)),
      ]
        .map(quoteCsv)
        .join(',')
    )
    .join('\r\n')
  return '\uFEFF' + [header, body].join('\r\n')
}

/* -------------------------------------------------------------------------- */
/*                            Dashboard statistics                             */
/* -------------------------------------------------------------------------- */

export interface ChartPoint {
  date: string
  revenue: number
  orders: number
}
export interface ProductPoint {
  name: string
  quantity: number
  revenue: number
}
export interface PaymentPoint {
  method: string
  count: number
  percentage: number
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                    */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function formatRupiah(value: number): string {
  return 'Rp ' + Math.round(value).toLocaleString('id-ID')
}

/* -------------------------------------------------------------------------- */
/*                                    PDF                                       */
/* -------------------------------------------------------------------------- */

const BRAND = '#2563eb'
const INK = '#0f172a'
const MUTED = '#64748b'

function pdfHeader(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(BRAND)
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 4, 'F')

  doc.setFontSize(18)
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, 14, 27)

  doc.setDrawColor('#e2e8f0')
  doc.setLineWidth(0.5)
  doc.line(14, 31, doc.internal.pageSize.getWidth() - 14, 31)
}

function pdfFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const width = doc.internal.pageSize.getWidth()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `BisnisKu - Exported ${new Date().toLocaleString('id-ID')}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    )
    doc.text(`Halaman ${i} dari ${pageCount}`, width - 14, doc.internal.pageSize.getHeight() - 8, {
      align: 'right',
    })
  }
}

/**
 * PDF #1: full order table (multi-page).
 * Uses the essential columns so the text stays readable.
 */
export function ordersToPdf(orders: OrderRow[]): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  pdfHeader(
    doc,
    'Data Pesanan (Lengkap)',
    `${orders.length} pesanan - semua kolom utama`
  )

  const head = [
    [
      'No. Pesanan',
      'Status',
      'Produk',
      'Qty',
      'Harga',
      'Total',
      'Metode Bayar',
      'Tanggal',
      'Alasan Pembatalan',
    ],
  ]

  const body = orders.map((o) => [
    o.orderNumber,
    o.status,
    truncate(o.productName, 40),
    String(o.quantity ?? 0),
    formatRupiah(o.discountedPrice ?? 0),
    formatRupiah(o.totalPayment ?? 0),
    o.paymentMethod ?? '-',
    formatDateOnly(o.orderCreatedAt),
    o.cancellationReason ?? '-',
  ])

  autoTable(doc, {
    head,
    body,
    startY: 36,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 7 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 20 },
      2: { cellWidth: 50 },
      4: { halign: 'right' as const, cellWidth: 24 },
      5: { halign: 'right' as const, cellWidth: 26 },
      7: { cellWidth: 22 },
      8: { cellWidth: 40 },
    },
    didDrawPage: () => pdfFooter(doc),
  })

  return doc.output('arraybuffer')
}

/**
 * PDF #2: dashboard report — metrics, status breakdown, top products,
 * payment methods. 1-2 pages.
 */
export function statsToPdf(
  stats: DashboardStats,
  revenue: ChartPoint[],
  topProducts: ProductPoint[],
  payments: PaymentPoint[]
): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const width = doc.internal.pageSize.getWidth()

  pdfHeader(doc, 'Laporan Dashboard', 'Ringkasan performa toko Anda')

  let y = 40

  /* --- Metric cards --- */
  const cards: { label: string; value: string }[] = [
    { label: 'Total Pesanan', value: stats.total.toLocaleString('id-ID') },
    { label: 'Pendapatan', value: formatRupiah(stats.totalRevenue) },
    { label: 'Rata-rata / Pesanan', value: formatRupiah(stats.averageOrderValue) },
    { label: 'Total Diskon', value: formatRupiah(stats.totalDiscount) },
    { label: 'Total Ongkir', value: formatRupiah(stats.totalShipping) },
    {
      label: 'Tingkat Penyelesaian',
      value: `${stats.completionRate.toFixed(1)}%`,
    },
  ]

  const cardWidth = (width - 28 - 8) / 3
  cards.forEach((card, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = 14 + col * (cardWidth + 4)
    const cy = y + row * 22

    doc.setFillColor('#f8fafc')
    doc.setDrawColor('#e2e8f0')
    doc.roundedRect(x, cy, cardWidth, 18, 2, 2, 'FD')

    doc.setFontSize(7)
    doc.setTextColor(MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label.toUpperCase(), x + 4, cy + 6)

    doc.setFontSize(12)
    doc.setTextColor(INK)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + 4, cy + 14)
  })

  y += 2 * 22 + 6

  /* --- Status breakdown --- */
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'bold')
  doc.text('Distribusi Status Pesanan', 14, y)
  y += 4

  autoTable(doc, {
    head: [['Status', 'Jumlah', 'Persentase']],
    body: [
      ['Perlu Dikirim', stats.pending, pct(stats.pending, stats.total)],
      ['Dikirim', stats.shipped, pct(stats.shipped, stats.total)],
      ['Selesai', stats.completed, pct(stats.completed, stats.total)],
      ['Dibatalkan', stats.cancelled, pct(stats.cancelled, stats.total)],
    ],
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 1: { halign: 'right' as const }, 2: { halign: 'right' as const } },
    didDrawPage: () => pdfFooter(doc),
  })

  y = (doc as any).lastAutoTable.finalY + 10

  /* --- Top products --- */
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'bold')
  doc.text('Produk Terlaris (Top 10)', 14, y)
  y += 4

  autoTable(doc, {
    head: [['#', 'Nama Produk', 'Jumlah', 'Pendapatan']],
    body: topProducts.slice(0, 10).map((p, i) => [
      String(i + 1),
      truncate(p.name, 45),
      String(p.quantity),
      formatRupiah(p.revenue),
    ]),
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: 'right' as const },
      3: { halign: 'right' as const },
    },
    didDrawPage: () => pdfFooter(doc),
  })

  y = (doc as any).lastAutoTable.finalY + 10

  /* --- Payment methods --- */
  doc.setFontSize(11)
  doc.setTextColor(INK)
  doc.setFont('helvetica', 'bold')
  doc.text('Metode Pembayaran', 14, y)
  y += 4

  autoTable(doc, {
    head: [['Metode', 'Jumlah', 'Persentase']],
    body: payments.map((p) => [p.method, p.count, `${p.percentage.toFixed(1)}%`]),
    startY: y,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: { 1: { halign: 'right' as const }, 2: { halign: 'right' as const } },
    didDrawPage: () => pdfFooter(doc),
  })

  pdfFooter(doc)

  return doc.output('arraybuffer')
}

/**
 * PDF #3: profit summary report.
 */
export function profitToPdf(rows: ProfitRow[], totals: {
  revenue: number
  cost: number
  profit: number
  margin: number
}): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  pdfHeader(doc, 'Laporan Profit', 'Analisis keuntungan per produk')

  /* --- Summary cards --- */
  const cards = [
    { label: 'Total Pendapatan', value: formatRupiah(totals.revenue) },
    { label: 'Total Modal', value: formatRupiah(totals.cost) },
    { label: 'Laba Kotor', value: formatRupiah(totals.profit) },
    { label: 'Margin', value: `${totals.margin.toFixed(1)}%` },
  ]

  const cardWidth = (doc.internal.pageSize.getWidth() - 28 - 12) / 4
  cards.forEach((card, index) => {
    const x = 14 + index * (cardWidth + 4)
    doc.setFillColor('#f8fafc')
    doc.setDrawColor('#e2e8f0')
    doc.roundedRect(x, 40, cardWidth, 18, 2, 2, 'FD')

    doc.setFontSize(6.5)
    doc.setTextColor(MUTED)
    doc.setFont('helvetica', 'normal')
    doc.text(card.label.toUpperCase(), x + 3, 46)

    doc.setFontSize(11)
    doc.setTextColor(INK)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + 3, 54)
  })

  autoTable(doc, {
    head: [['#', 'Nama Produk', 'Qty', 'Pendapatan', 'Modal', 'Laba', 'Margin']],
    body: rows.map((r, i) => [
      String(i + 1),
      truncate(r.productName, 40),
      String(r.totalQuantity),
      formatRupiah(r.totalRevenue),
      formatRupiah(r.totalCost),
      formatRupiah(r.grossProfit),
      `${r.profitMargin.toFixed(1)}%`,
    ]),
    startY: 66,
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 8 },
      3: { halign: 'right' as const },
      4: { halign: 'right' as const },
      5: { halign: 'right' as const },
      6: { halign: 'right' as const },
    },
    didDrawPage: () => pdfFooter(doc),
  })

  return doc.output('arraybuffer')
}

/* -------------------------------------------------------------------------- */
/*                                 Utilities                                    */
/* -------------------------------------------------------------------------- */

function pct(part: number, total: number): string {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '0%'
}

function truncate(value: string, max: number): string {
  if (!value) return '-'
  return value.length > max ? value.slice(0, max) + '…' : value
}

function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '-'
  // Input looks like "2026-09-06 00:13"
  return value.slice(0, 10)
}

export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const
export type ExportFormat = (typeof EXPORT_FORMATS)[number]

export const EXPORT_TYPES = ['orders', 'profit', 'stats'] as const
export type ExportType = (typeof EXPORT_TYPES)[number]
