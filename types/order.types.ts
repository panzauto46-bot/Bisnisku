/**
 * Order status types
 */
export type OrderStatus = 'all' | 'pending' | 'shipped' | 'completed' | 'cancelled'

/**
 * Raw order data as imported from Shopee Excel export (49 columns)
 */
export interface RawOrder {
  'No. Pesanan': string
  'Status Pesanan': string
  'Alasan Pembatalan': string | null
  'Status Pembatalan/ Pengembalian': string | null
  'No. Resi': string | null
  'Opsi Pengiriman': string | null
  'Antar ke counter/ pick-up': string | null
  'Pesanan Harus Dikirimkan Sebelum (Menghindari keterlambatan)': string | null
  'Waktu Pengiriman Diatur': string | null
  'Waktu Pesanan Dibuat': string | null
  'Waktu Pembayaran Dilakukan': string | null
  'Tipe Pesanan': string | null
  'Metode Pembayaran': string | null
  'SKU Induk': string | null
  'Nama Produk': string
  'Nomor Referensi SKU': string | null
  'Nama Variasi': string | null
  'Harga Awal': number
  'Harga Setelah Diskon': number
  'Jumlah': number
  'Returned quantity': number
  'Subtotal Pesanan': number
  'Total Diskon': number
  'Diskon Dari Penjual': number
  'Diskon Dari Shopee': number
  'Berat Produk': string | null
  'Jumlah Produk di Pesan': number
  'Total Berat': string | null
  'Voucher Ditanggung Penjual': number
  'Cashback Koin': number
  'Voucher Ditanggung Shopee': number
  'Paket Diskon': string | null
  'Paket Diskon (Diskon dari Shopee)': number
  'Paket Diskon (Diskon dari Penjual)': number
  'Potongan Koin Shopee': number
  'Diskon Kartu Kredit': number
  'Ongkos Kirim Dibayar oleh Pembeli': number
  'Estimasi Potongan Biaya Pengiriman': number
  'Ongkos Kirim Pengembalian Barang': number
  'Total Pembayaran': number
  'Perkiraan Ongkos Kirim': number | string
  'Catatan dari Pembeli': string | null
  'Catatan': string | null
  'Username (Pembeli)': string
  'Nama Penerima': string
  'No. Telepon': string
  'Alamat Pengiriman': string | null
  'Kota/Kabupaten': string | null
  'Provinsi': string | null
  'Waktu Pesanan Selesai': string | null
}

/**
 * Normalized order entity stored in database
 */
export interface Order {
  id: number
  orderNumber: string
  status: string
  cancellationReason: string | null
  cancellationStatus: string | null
  trackingNumber: string | null
  shippingOption: string | null
  pickupType: string | null
  shipByDeadline: string | null
  shippingTimeSet: string | null
  orderCreatedAt: string | null
  paymentTime: string | null
  orderType: string | null
  paymentMethod: string | null
  parentSku: string | null
  productName: string
  skuReference: string | null
  variantName: string | null
  originalPrice: number | null
  discountedPrice: number | null
  quantity: number | null
  returnedQuantity: number | null
  subtotal: number | null
  totalDiscount: number | null
  sellerDiscount: number | null
  shopeeDiscount: number | null
  productWeight: string | null
  totalProductOrdered: number | null
  totalWeight: string | null
  sellerVoucher: number | null
  coinCashback: number | null
  shopeeVoucher: number | null
  discountPackage: string | null
  packageDiscountShopee: number | null
  packageDiscountSeller: number | null
  shopeeCoinDeduction: number | null
  creditCardDiscount: number | null
  shippingFeePaidByBuyer: number | null
  estimatedShippingDiscount: number | null
  returnShippingFee: number | null
  totalPayment: number | null
  estimatedShipping: number | null
  buyerNote: string | null
  sellerNote: string | null
  buyerUsername: string | null
  recipientName: string | null
  phoneNumber: string | null
  shippingAddress: string | null
  city: string | null
  province: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Order with computed category status
 */
export interface OrderWithCategory extends Order {
  statusCategory: OrderStatus
}

/**
 * Filter options for querying orders
 */
export interface OrderFilters {
  status?: OrderStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  paymentMethod?: string
  province?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response for orders
 */
export interface PaginatedOrders {
  data: OrderWithCategory[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total: number
  pending: number
  shipped: number
  completed: number
  cancelled: number
  totalRevenue: number
  totalProfit: number
  averageOrderValue: number
  totalDiscount: number
  totalShipping: number
  completionRate: number
  cancellationRate: number
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean
  totalRows: number
  inserted: number
  skipped: number
  errors: string[]
  fileName: string
}

/**
 * Product with cost for profit analysis
 */
export interface Product {
  id: number
  productName: string
  costPrice: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Product with computed profit metrics
 */
export interface ProductPerformance {
  productName: string
  unitsSold: number
  revenue: number
  cost: number
  profit: number
  margin: number
  roi: number
}
