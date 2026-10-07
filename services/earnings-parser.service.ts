import * as XLSX from 'xlsx'
import type { RawEarnings } from '@/types/earnings.types'

/**
 * Column mapping for the "Penghasilan" sheet of the marketplace settlement
 * export ("Laporan Penghasilan").
 *
 * The sheet uses a two-row header: row 0 holds group titles and row 1 holds
 * the actual column names. We match against the detail header (row 1).
 *
 * NOTE: These are the ACTUAL export headers and must match exactly. This
 * file is the only place that references the settlement export format.
 */
const COLUMN_MAPPING: Record<string, keyof RawEarnings> = {
  'No. Pesanan': 'orderNumber',
  'Tanggal Dana Dilepaskan': 'releaseDate',
  'Metode Pelepasan Dana': 'releaseMethod',
  'Waktu Pesanan Dibuat': 'orderCreatedDate',
  'Total Penghasilan': 'totalEarnings',
  'Harga Produk': 'productPrice',
  'Jumlah Pengembalian Dana ke Pembeli': 'refundToBuyer',
  'Ongkir Dibayar Pembeli': 'shippingPaidByBuyer',
  'Ongkos Kirim yang Dibayarkan ke Jasa Kirim': 'shippingPaidToCourier',
  'Potongan Ongkos Kirim dari Jasa Kirim': 'shippingDiscountFromCourier',
  'Gratis Ongkir dari Shopee': 'freeShippingFromPlatform',
  'Ongkos Kirim Pengembalian Barang': 'returnShippingFee',
  'Return to Seller Fee': 'returnToSellerFee',
  'Pengembalian Biaya Kirim': 'shippingCostRefund',
  'Voucher disponsor oleh Penjual': 'sellerSponsoredVoucher',
  'Cashback Koin disponsori Penjual': 'sellerSponsoredCoinCashback',
  'Diskon Produk dari Shopee': 'platformProductDiscount',
  'Voucher co-fund disponsor oleh Penjual': 'coFundVoucher',
  'Cashback Koin Co-fund disponsori Penjual': 'coFundCoinCashback',
  'Biaya Administrasi': 'adminFee',
  'Biaya Proses Pesanan': 'orderProcessFee',
  'Biaya Gratis Ongkir XTRA - Ukuran Biasa (Kategori G)': 'freeShippingXtraFee',
  'Biaya Transaksi': 'transactionFee',
  'Biaya Layanan Promo XTRA+': 'serviceFeePromoXtra',
  'Biaya Kampanye': 'campaignFee',
  'Biaya Komisi AMS': 'amsCommissionFee',
  'Biaya Isi Saldo Otomatis (dari Penghasilan)': 'autoTopupFee',
  'Premi': 'premium',
  'FBS Fee': 'fbsFee',
  'PPh 22': 'pph22',
  'Username (Pembeli)': 'buyerUsername',
  'Jumlah Dibayar Pembeli': 'buyerPaidAmount',
  'Metode pembayaran pembeli': 'buyerPaymentMethod',
  'Jasa Kirim': 'courier',
  'Nama Kurir': 'courierName',
  'Kode Voucher': 'voucherCode',
}

/** Required columns without which the file is useless */
const REQUIRED_COLUMNS = ['No. Pesanan', 'Total Penghasilan']

/**
 * Parse the settlement export and return one row per ORDER.
 *
 * The sheet contains two row types under "Lihat berdasarkan":
 *  - "Order": one row per order (the aggregate we want)
 *  - "Sku": one row per SKU (a breakdown we deliberately skip, otherwise
 *           every order would be counted multiple times)
 */
export function parseEarningsFile(buffer: ArrayBuffer): {
  rows: RawEarnings[]
  errors: string[]
  totalRows: number
} {
  const errors: string[] = []

  const wb = XLSX.read(buffer, { type: 'array' })

  const sheetName = wb.SheetNames.find((name) =>
    name.toLowerCase().includes('penghasilan')
  )
  if (!sheetName) {
    return {
      rows: [],
      errors: [
        `Sheet "Penghasilan" tidak ditemukan. Sheet yang ada: ${wb.SheetNames.join(', ')}`,
      ],
      totalRows: 0,
    }
  }

  const ws = wb.Sheets[sheetName]
  // raw: keep numbers as numbers, empty strings for blanks
  const grid = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    ws,
    { header: 1, raw: true, defval: null }
  )

  // The sheet starts with a title row, then a group-header row, then the
  // detail header row. Find the detail header row by locating "No. Pesanan".
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(8, grid.length); i++) {
    const row = grid[i]
    if (row && row.some((c) => String(c ?? '').trim() === 'No. Pesanan')) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    return {
      rows: [],
      errors: ['Header kolom "No. Pesanan" tidak ditemukan di sheet Penghasilan.'],
      totalRows: 0,
    }
  }

  const headerRow = grid[headerRowIndex]

  // Map each export column index -> our field name
  const colToField: { index: number; field: keyof RawEarnings }[] = []
  headerRow.forEach((cell, index) => {
    const key = String(cell ?? '').trim()
    const field = COLUMN_MAPPING[key]
    if (field) {
      colToField.push({ index, field })
    }
  })

  // Verify required columns
  const mappedFields = new Set(colToField.map((c) => c.field))
  for (const required of REQUIRED_COLUMNS) {
    const field = COLUMN_MAPPING[required]
    if (field && !mappedFields.has(field)) {
      errors.push(`Kolom wajib "${required}" tidak ditemukan`)
    }
  }

  if (errors.length > 0) {
    return { rows: [], errors, totalRows: 0 }
  }

  // Find the "row type" column ("Lihat berdasarkan") so we can keep only
  // "Order" rows and skip the per-SKU duplicates.
  let rowTypeIndex = -1
  headerRow.forEach((cell, index) => {
    if (String(cell ?? '').trim() === 'Lihat berdasarkan') {
      rowTypeIndex = index
    }
  })

  const rows: RawEarnings[] = []
  let skippedSkuRows = 0

  for (let i = headerRowIndex + 1; i < grid.length; i++) {
    const row = grid[i]
    if (!row) continue

    // Skip per-SKU breakdown rows
    if (rowTypeIndex !== -1) {
      const rowType = String(row[rowTypeIndex] ?? '').trim().toLowerCase()
      if (rowType === 'sku') {
        skippedSkuRows++
        continue
      }
      // Only process "order" rows; ignore anything else (e.g. adjustments)
      if (rowType !== '' && rowType !== 'order') {
        continue
      }
    }

    const orderNumber = String(
      row[colToField.find((c) => c.field === 'orderNumber')?.index ?? 0] ?? ''
    ).trim()

    if (!orderNumber) continue

    const record = {} as Record<string, unknown>
    for (const { index, field } of colToField) {
      record[field] = row[index]
    }

    const totalEarnings = toNumber(record.totalEarnings)
    if (totalEarnings === null) continue

    rows.push({
      orderNumber,
      releaseDate: toString(record.releaseDate),
      releaseMethod: toString(record.releaseMethod),
      orderCreatedDate: toString(record.orderCreatedDate),
      totalEarnings,
      productPrice: toNumber(record.productPrice),
      refundToBuyer: toNumber(record.refundToBuyer),
      shippingPaidByBuyer: toNumber(record.shippingPaidByBuyer),
      shippingPaidToCourier: toNumber(record.shippingPaidToCourier),
      shippingDiscountFromCourier: toNumber(record.shippingDiscountFromCourier),
      freeShippingFromPlatform: toNumber(record.freeShippingFromPlatform),
      returnShippingFee: toNumber(record.returnShippingFee),
      returnToSellerFee: toNumber(record.returnToSellerFee),
      shippingCostRefund: toNumber(record.shippingCostRefund),
      sellerSponsoredVoucher: toNumber(record.sellerSponsoredVoucher),
      sellerSponsoredCoinCashback: toNumber(record.sellerSponsoredCoinCashback),
      platformProductDiscount: toNumber(record.platformProductDiscount),
      coFundVoucher: toNumber(record.coFundVoucher),
      coFundCoinCashback: toNumber(record.coFundCoinCashback),
      adminFee: toNumber(record.adminFee),
      orderProcessFee: toNumber(record.orderProcessFee),
      freeShippingXtraFee: toNumber(record.freeShippingXtraFee),
      transactionFee: toNumber(record.transactionFee),
      serviceFeePromoXtra: toNumber(record.serviceFeePromoXtra),
      campaignFee: toNumber(record.campaignFee),
      amsCommissionFee: toNumber(record.amsCommissionFee),
      autoTopupFee: toNumber(record.autoTopupFee),
      premium: toNumber(record.premium),
      fbsFee: toNumber(record.fbsFee),
      pph22: toNumber(record.pph22),
      buyerUsername: toString(record.buyerUsername),
      buyerPaidAmount: toNumber(record.buyerPaidAmount),
      buyerPaymentMethod: toString(record.buyerPaymentMethod),
      courier: toString(record.courier),
      courierName: toString(record.courierName),
      voucherCode: toString(record.voucherCode),
    })
  }

  return {
    rows,
    errors,
    totalRows: rows.length + skippedSkuRows,
  }
}

/* -------------------------------------------------------------------------- */
/*                              Value normalisers                              */
/* -------------------------------------------------------------------------- */

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const str = String(value).trim()
  if (str === '' || str === '-' || str === '—') return null
  // Source export can carry "Rp 12.345" or "(1.234)" style values
  const negative = /^\(.*\)$/.test(str)
  const cleaned = str.replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3}(\.|$))/g, '')
  const parsed = parseFloat(cleaned.replace(',', '.'))
  if (!Number.isFinite(parsed)) return null
  return negative ? -parsed : parsed
}

function toString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  if (str === '' || str === '-' || str === '—') return null
  return str
}
