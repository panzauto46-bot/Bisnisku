/**
 * Order status types
 */
export type OrderStatus = 'all' | 'pending' | 'shipped' | 'completed' | 'cancelled'

/**
 * Raw order data as imported from marketplace Excel export (49 columns)
 *
 * NOTE: This interface uses generic field names. The actual Excel header
 * strings are mapped in `excel-parser.service.ts` (the file adapter),
 * which is the only place that references the export format directly.
 */
export interface RawOrder {
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
  originalPrice: number
  discountedPrice: number
  quantity: number
  returnedQuantity: number
  subtotal: number
  totalDiscount: number
  sellerDiscount: number
  platformDiscount: number
  productWeight: string | null
  totalProductOrdered: number
  totalWeight: string | null
  sellerVoucher: number
  coinCashback: number
  platformVoucher: number
  discountPackage: string | null
  packageDiscountPlatform: number
  packageDiscountSeller: number
  platformCoinDeduction: number
  creditCardDiscount: number
  shippingFeePaidByBuyer: number
  estimatedShippingDiscount: number
  returnShippingFee: number
  totalPayment: number
  estimatedShipping: number
  buyerNote: string | null
  sellerNote: string | null
  buyerUsername: string
  recipientName: string
  phoneNumber: string
  shippingAddress: string | null
  city: string | null
  province: string | null
  completedAt: string | null
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
  platformDiscount: number | null
  productWeight: string | null
  totalProductOrdered: number | null
  totalWeight: string | null
  sellerVoucher: number | null
  coinCashback: number | null
  platformVoucher: number | null
  discountPackage: string | null
  packageDiscountPlatform: number | null
  packageDiscountSeller: number | null
  platformCoinDeduction: number | null
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
 *
 * `hasEarnings` menandakan apakah order sudah ada di file penghasilan yang
 * di-import (artinya dananya sudah dilepaskan platform). Murni dibaca dari
 * tabel order_earnings — tidak ada koneksi API ke marketplace.
 */
export interface OrderWithCategory extends Order {
  statusCategory: OrderStatus
  hasEarnings?: boolean
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
 * Breakdown of every deduction component the platform applies,
 * so the seller can see exactly what was subtracted.
 * Basis: completed orders only (same as totalRevenue).
 */
export interface DiscountBreakdown {
  /** Product-price discounts (the Excel "Total Diskon" column) */
  sellerDiscount: number
  platformDiscount: number
  sellerVoucher: number
  /** Payment-level platform deductions (NOT inside "Total Diskon") */
  platformVoucher: number
  platformCoinDeduction: number
  coinCashback: number
  creditCardDiscount: number
  /** Totals */
  totalProductDiscount: number
  totalPlatformDeduction: number
  totalAllDeductions: number
}

export interface ShippingBreakdown {
  paidByBuyer: number
  estimatedShipping: number
  estimatedShippingDiscount: number
  returnShippingFee: number
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
  discountBreakdown: DiscountBreakdown
  shippingBreakdown: ShippingBreakdown
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
