import * as XLSX from 'xlsx'
import type { RawOrder } from '@/types/order.types'

/**
 * Column mapping from Shopee Indonesian headers to our field names
 */
const COLUMN_MAPPING: Record<string, keyof RawOrder> = {
  'No. Pesanan': 'No. Pesanan',
  'Status Pesanan': 'Status Pesanan',
  'Alasan Pembatalan': 'Alasan Pembatalan',
  'Status Pembatalan/ Pengembalian': 'Status Pembatalan/ Pengembalian',
  'No. Resi': 'No. Resi',
  'Opsi Pengiriman': 'Opsi Pengiriman',
  'Antar ke counter/ pick-up': 'Antar ke counter/ pick-up',
  'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)':
    'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)',
  'Waktu Pengiriman Diatur': 'Waktu Pengiriman Diatur',
  'Waktu Pesanan Dibuat': 'Waktu Pesanan Dibuat',
  'Waktu Pembayaran Dilakukan': 'Waktu Pembayaran Dilakukan',
  'Tipe Pesanan': 'Tipe Pesanan',
  'Metode Pembayaran': 'Metode Pembayaran',
  'SKU Induk': 'SKU Induk',
  'Nama Produk': 'Nama Produk',
  'Nomor Referensi SKU': 'Nomor Referensi SKU',
  'Nama Variasi': 'Nama Variasi',
  'Harga Awal': 'Harga Awal',
  'Harga Setelah Diskon': 'Harga Setelah Diskon',
  'Jumlah': 'Jumlah',
  'Returned quantity': 'Returned quantity',
  'Subtotal Pesanan': 'Subtotal Pesanan',
  'Total Diskon': 'Total Diskon',
  'Diskon Dari Penjual': 'Diskon Dari Penjual',
  'Diskon Dari Shopee': 'Diskon Dari Shopee',
  'Berat Produk': 'Berat Produk',
  'Jumlah Produk di Pesan': 'Jumlah Produk di Pesan',
  'Total Berat': 'Total Berat',
  'Voucher Ditanggung Penjual': 'Voucher Ditanggung Penjual',
  'Cashback Koin': 'Cashback Koin',
  'Voucher Ditanggung Shopee': 'Voucher Ditanggung Shopee',
  'Paket Diskon': 'Paket Diskon',
  'Paket Diskon (Diskon dari Shopee)': 'Paket Diskon (Diskon dari Shopee)',
  'Paket Diskon (Diskon dari Penjual)': 'Paket Diskon (Diskon dari Penjual)',
  'Potongan Koin Shopee': 'Potongan Koin Shopee',
  'Diskon Kartu Kredit': 'Diskon Kartu Kredit',
  'Ongkos Kirim Dibayar oleh Pembeli': 'Ongkos Kirim Dibayar oleh Pembeli',
  'Estimasi Potongan Biaya Pengiriman': 'Estimasi Potongan Biaya Pengiriman',
  'Ongkos Kirim Pengembalian Barang': 'Ongkos Kirim Pengembalian Barang',
  'Total Pembayaran': 'Total Pembayaran',
  'Perkiraan Ongkos Kirim': 'Perkiraan Ongkos Kirim',
  'Catatan dari Pembeli': 'Catatan dari Pembeli',
  'Catatan': 'Catatan',
  'Username (Pembeli)': 'Username (Pembeli)',
  'Nama Penerima': 'Nama Penerima',
  'No. Telepon': 'No. Telepon',
  'Alamat Pengiriman': 'Alamat Pengiriman',
  'Kota/Kabupaten': 'Kota/Kabupaten',
  'Provinsi': 'Provinsi',
  'Waktu Pesanan Selesai': 'Waktu Pesanan Selesai',
}

/**
 * Required columns that must exist in the file
 */
const REQUIRED_COLUMNS = [
  'No. Pesanan',
  'Status Pesanan',
  'Nama Produk',
  'Total Pembayaran',
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

    // Validate required columns
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

    // Map each row to RawOrder
    const orders: RawOrder[] = rows.map((row, index) => {
      const getOrderValue = (header: string): any => {
        // Try exact match first, then try mapping
        if (header in row) return row[header]
        return null
      }

      return {
        'No. Pesanan': String(getOrderValue('No. Pesanan') || '').trim(),
        'Status Pesanan': String(
          getOrderValue('Status Pesanan') || ''
        ).trim(),
        'Alasan Pembatalan': parseString(
          getOrderValue('Alasan Pembatalan')
        ),
        'Status Pembatalan/ Pengembalian': parseString(
          getOrderValue('Status Pembatalan/ Pengembalian')
        ),
        'No. Resi': parseString(getOrderValue('No. Resi')),
        'Opsi Pengiriman': parseString(getOrderValue('Opsi Pengiriman')),
        'Antar ke counter/ pick-up': parseString(
          getOrderValue('Antar ke counter/ pick-up')
        ),
        'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)':
          parseString(
            getOrderValue(
              'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)'
            )
          ),
        'Waktu Pengiriman Diatur': parseString(
          getOrderValue('Waktu Pengiriman Diatur')
        ),
        'Waktu Pesanan Dibuat': parseString(
          getOrderValue('Waktu Pesanan Dibuat')
        ),
        'Waktu Pembayaran Dilakukan': parseString(
          getOrderValue('Waktu Pembayaran Dilakukan')
        ),
        'Tipe Pesanan': parseString(getOrderValue('Tipe Pesanan')),
        'Metode Pembayaran': parseString(getOrderValue('Metode Pembayaran')),
        'SKU Induk': parseString(getOrderValue('SKU Induk')),
        'Nama Produk': String(getOrderValue('Nama Produk') || '').trim(),
        'Nomor Referensi SKU': parseString(
          getOrderValue('Nomor Referensi SKU')
        ),
        'Nama Variasi': parseString(getOrderValue('Nama Variasi')),
        'Harga Awal': parseNumeric(getOrderValue('Harga Awal')),
        'Harga Setelah Diskon': parseNumeric(
          getOrderValue('Harga Setelah Diskon')
        ),
        'Jumlah': parseNumeric(getOrderValue('Jumlah')),
        'Returned quantity': parseNumeric(getOrderValue('Returned quantity')),
        'Subtotal Pesanan': parseNumeric(getOrderValue('Subtotal Pesanan')),
        'Total Diskon': parseNumeric(getOrderValue('Total Diskon')),
        'Diskon Dari Penjual': parseNumeric(
          getOrderValue('Diskon Dari Penjual')
        ),
        'Diskon Dari Shopee': parseNumeric(
          getOrderValue('Diskon Dari Shopee')
        ),
        'Berat Produk': parseString(getOrderValue('Berat Produk')),
        'Jumlah Produk di Pesan': parseNumeric(
          getOrderValue('Jumlah Produk di Pesan')
        ),
        'Total Berat': parseString(getOrderValue('Total Berat')),
        'Voucher Ditanggung Penjual': parseNumeric(
          getOrderValue('Voucher Ditanggung Penjual')
        ),
        'Cashback Koin': parseNumeric(getOrderValue('Cashback Koin')),
        'Voucher Ditanggung Shopee': parseNumeric(
          getOrderValue('Voucher Ditanggung Shopee')
        ),
        'Paket Diskon': parseString(getOrderValue('Paket Diskon')),
        'Paket Diskon (Diskon dari Shopee)': parseNumeric(
          getOrderValue('Paket Diskon (Diskon dari Shopee)')
        ),
        'Paket Diskon (Diskon dari Penjual)': parseNumeric(
          getOrderValue('Paket Diskon (Diskon dari Penjual)')
        ),
        'Potongan Koin Shopee': parseNumeric(
          getOrderValue('Potongan Koin Shopee')
        ),
        'Diskon Kartu Kredit': parseNumeric(
          getOrderValue('Diskon Kartu Kredit')
        ),
        'Ongkos Kirim Dibayar oleh Pembeli': parseNumeric(
          getOrderValue('Ongkos Kirim Dibayar oleh Pembeli')
        ),
        'Estimasi Potongan Biaya Pengiriman': parseNumeric(
          getOrderValue('Estimasi Potongan Biaya Pengiriman')
        ),
        'Ongkos Kirim Pengembalian Barang': parseNumeric(
          getOrderValue('Ongkos Kirim Pengembalian Barang')
        ),
        'Total Pembayaran': parseNumeric(getOrderValue('Total Pembayaran')),
        'Perkiraan Ongkos Kirim': parseNumeric(
          getOrderValue('Perkiraan Ongkos Kirim')
        ),
        'Catatan dari Pembeli': parseString(
          getOrderValue('Catatan dari Pembeli')
        ),
        'Catatan': parseString(getOrderValue('Catatan')),
        'Username (Pembeli)': String(
          getOrderValue('Username (Pembeli)') || ''
        ).trim(),
        'Nama Penerima': String(getOrderValue('Nama Penerima') || '').trim(),
        'No. Telepon': String(getOrderValue('No. Telepon') || '').trim(),
        'Alamat Pengiriman': parseString(getOrderValue('Alamat Pengiriman')),
        'Kota/Kabupaten': parseString(getOrderValue('Kota/Kabupaten')),
        'Provinsi': parseString(getOrderValue('Provinsi')),
        'Waktu Pesanan Selesai': parseString(
          getOrderValue('Waktu Pesanan Selesai')
        ),
      }
    })

    // Filter out rows without order number
    const validOrders = orders.filter(
      (order) => order['No. Pesanan'] && order['No. Pesanan'] !== ''
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
