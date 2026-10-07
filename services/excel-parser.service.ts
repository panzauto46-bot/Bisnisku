import * as XLSX from 'xlsx'
import type { RawOrder } from '@/types/order.types'

/**
 * Column mapping from the marketplace Excel export (Indonesian headers)
 * to our generic internal field names.
 *
 * NOTE: The keys are the ACTUAL column headers in the export file and must
 * match exactly in order to parse the file correctly. This file is the only
 * place in the codebase that references the export format directly — every
 * other module works with the generic `RawOrder` shape.
 */
const COLUMN_MAPPING: Record<string, keyof RawOrder> = {
  'No. Pesanan': 'orderNumber',
  'Status Pesanan': 'status',
  'Alasan Pembatalan': 'cancellationReason',
  'Status Pembatalan/ Pengembalian': 'cancellationStatus',
  'No. Resi': 'trackingNumber',
  'Opsi Pengiriman': 'shippingOption',
  'Antar ke counter/ pick-up': 'pickupType',
  'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)':
    'shipByDeadline',
  'Waktu Pengiriman Diatur': 'shippingTimeSet',
  'Waktu Pesanan Dibuat': 'orderCreatedAt',
  'Waktu Pembayaran Dilakukan': 'paymentTime',
  'Tipe Pesanan': 'orderType',
  'Metode Pembayaran': 'paymentMethod',
  'SKU Induk': 'parentSku',
  'Nama Produk': 'productName',
  'Nomor Referensi SKU': 'skuReference',
  'Nama Variasi': 'variantName',
  'Harga Awal': 'originalPrice',
  'Harga Setelah Diskon': 'discountedPrice',
  'Jumlah': 'quantity',
  'Returned quantity': 'returnedQuantity',
  'Subtotal Pesanan': 'subtotal',
  'Total Diskon': 'totalDiscount',
  'Diskon Dari Penjual': 'sellerDiscount',
  'Diskon Dari Shopee': 'platformDiscount',
  'Berat Produk': 'productWeight',
  'Jumlah Produk di Pesan': 'totalProductOrdered',
  'Total Berat': 'totalWeight',
  'Voucher Ditanggung Penjual': 'sellerVoucher',
  'Cashback Koin': 'coinCashback',
  'Voucher Ditanggung Shopee': 'platformVoucher',
  'Paket Diskon': 'discountPackage',
  'Paket Diskon (Diskon dari Shopee)': 'packageDiscountPlatform',
  'Paket Diskon (Diskon dari Penjual)': 'packageDiscountSeller',
  'Potongan Koin Shopee': 'platformCoinDeduction',
  'Diskon Kartu Kredit': 'creditCardDiscount',
  'Ongkos Kirim Dibayar oleh Pembeli': 'shippingFeePaidByBuyer',
  'Estimasi Potongan Biaya Pengiriman': 'estimatedShippingDiscount',
  'Ongkos Kirim Pengembalian Barang': 'returnShippingFee',
  'Total Pembayaran': 'totalPayment',
  'Perkiraan Ongkos Kirim': 'estimatedShipping',
  'Catatan dari Pembeli': 'buyerNote',
  'Catatan': 'sellerNote',
  'Username (Pembeli)': 'buyerUsername',
  'Nama Penerima': 'recipientName',
  'No. Telepon': 'phoneNumber',
  'Alamat Pengiriman': 'shippingAddress',
  'Kota/Kabupaten': 'city',
  'Provinsi': 'province',
  'Waktu Pesanan Selesai': 'completedAt',
}

/**
 * Required columns (export headers) that must exist in the file
 */
const REQUIRED_COLUMNS = [
  'No. Pesanan',
  'Status Pesanan',
  'Nama Produk',
  'Total Pembayaran',
]

/**
 * Fields that must be trimmed strings
 */
const STRING_FIELDS: (keyof RawOrder)[] = [
  'orderNumber',
  'status',
  'productName',
  'buyerUsername',
  'recipientName',
  'phoneNumber',
]

/**
 * Parse numeric value from cell (handles string numbers, commas, etc.)
 */
function parseNumeric(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    // Remove thousand separators and spaces
    const cleaned = value.replace(/[.,\s]/g, '').replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Parse string value, converting empty strings to null
 */
function parseString(value: any): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str === '' || str === 'NaN' ? null : str
}

export interface ParsedExcelResult {
  success: boolean
  orders: RawOrder[]
  totalRows: number
  errors: string[]
  missingColumns: string[]
}

/**
 * Parse Excel file buffer into RawOrder array
 */
export function parseExcelFile(buffer: ArrayBuffer): ParsedExcelResult {
  const errors: string[] = []

  try {
    const workbook = XLSX.read(buffer, { type: 'array' })

    // Find the orders sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        success: false,
        orders: [],
        totalRows: 0,
        errors: ['File tidak memiliki sheet data'],
        missingColumns: [],
      }
    }

    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON with headers
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
    })

    if (rows.length === 0) {
      return {
        success: false,
        orders: [],
        totalRows: 0,
        errors: ['File tidak memiliki data'],
        missingColumns: [],
      }
    }

    // Validate required columns (check against raw export headers)
    const headers = Object.keys(rows[0])
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col)
    )

    if (missingColumns.length > 0) {
      return {
        success: false,
        orders: [],
        totalRows: rows.length,
        errors: [
          `Kolom wajib tidak ditemukan: ${missingColumns.join(', ')}`,
        ],
        missingColumns,
      }
    }

    // Map each row to RawOrder using the column mapping
    const orders: RawOrder[] = rows.map((row) => {
      // Build a lookup from export header → cell value
      const getValueByHeader = (header: string): any =>
        header in row ? row[header] : null

      const mapped: Record<string, any> = {}

      for (const [excelHeader, fieldName] of Object.entries(COLUMN_MAPPING)) {
        const rawValue = getValueByHeader(excelHeader)

        if (STRING_FIELDS.includes(fieldName)) {
          mapped[fieldName] = String(rawValue || '').trim()
        } else if (typeof rawValue === 'number' || isNumericField(fieldName)) {
          mapped[fieldName] = parseNumeric(rawValue)
        } else {
          mapped[fieldName] = parseString(rawValue)
        }
      }

      return mapped as RawOrder
    })

    // Filter out rows without order number
    const validOrders = orders.filter(
      (order) => order.orderNumber && order.orderNumber !== ''
    )

    return {
      success: true,
      orders: validOrders,
      totalRows: rows.length,
      errors,
      missingColumns: [],
    }
  } catch (error) {
    return {
      success: false,
      orders: [],
      totalRows: 0,
      errors: [
        `Gagal memparse file: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ],
      missingColumns: [],
    }
  }
}

/**
 * Whether a generic field should be parsed as a number
 */
function isNumericField(field: keyof RawOrder): boolean {
  const numericFields: (keyof RawOrder)[] = [
    'originalPrice',
    'discountedPrice',
    'quantity',
    'returnedQuantity',
    'subtotal',
    'totalDiscount',
    'sellerDiscount',
    'platformDiscount',
    'totalProductOrdered',
    'sellerVoucher',
    'coinCashback',
    'platformVoucher',
    'packageDiscountPlatform',
    'packageDiscountSeller',
    'platformCoinDeduction',
    'creditCardDiscount',
    'shippingFeePaidByBuyer',
    'estimatedShippingDiscount',
    'returnShippingFee',
    'totalPayment',
    'estimatedShipping',
  ]
  return numericFields.includes(field)
}
