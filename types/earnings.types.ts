/**
 * Raw earnings row — mirrors the "Penghasilan" sheet of the marketplace
 * settlement export. Field names are generic; the actual export headers
 * live only in the parser adapter (earnings-parser.service.ts).
 *
 * Fee fields are negative in the source export and are stored as-is.
 */
export interface RawEarnings {
  orderNumber: string
  releaseDate: string | null
  releaseMethod: string | null
  orderCreatedDate: string | null
  totalEarnings: number
  productPrice: number | null
  refundToBuyer: number | null
  shippingPaidByBuyer: number | null
  shippingPaidToCourier: number | null
  shippingDiscountFromCourier: number | null
  freeShippingFromPlatform: number | null
  returnShippingFee: number | null
  returnToSellerFee: number | null
  shippingCostRefund: number | null
  sellerSponsoredVoucher: number | null
  sellerSponsoredCoinCashback: number | null
  platformProductDiscount: number | null
  coFundVoucher: number | null
  coFundCoinCashback: number | null
  adminFee: number | null
  orderProcessFee: number | null
  freeShippingXtraFee: number | null
  transactionFee: number | null
  serviceFeePromoXtra: number | null
  campaignFee: number | null
  amsCommissionFee: number | null
  autoTopupFee: number | null
  premium: number | null
  fbsFee: number | null
  pph22: number | null
  buyerUsername: string | null
  buyerPaidAmount: number | null
  buyerPaymentMethod: string | null
  courier: string | null
  courierName: string | null
  voucherCode: string | null
}

/**
 * Earnings row as stored in the database.
 */
export interface OrderEarnings extends RawEarnings {
  id: number
  createdAt: string
  updatedAt: string
}

/**
 * Earnings row joined with its order (if the order file was imported).
 * `order` is null when the settlement export covers orders that are not
 * (yet) in the orders table.
 */
export interface EarningsWithOrder extends OrderEarnings {
  order: {
    status: string
    productName: string
    orderCreatedAt: string | null
  } | null
}

/**
 * Aggregate earnings statistics for the dashboard panel.
 * Every fee is summed across all imported settlement rows.
 */
export interface EarningsStats {
  totalEarnings: number
  totalProductPrice: number
  totalRefundToBuyer: number
  totalShippingPaidByBuyer: number
  totalShippingPaidToCourier: number
  totalFreeShippingFromPlatform: number
  totalReturnShippingFee: number
  totalReturnToSellerFee: number
  totalShippingCostRefund: number
  totalSellerSponsoredVoucher: number
  totalSellerSponsoredCoinCashback: number
  totalPlatformProductDiscount: number
  totalCoFundVoucher: number
  totalCoFundCoinCashback: number
  totalAdminFee: number
  totalOrderProcessFee: number
  totalFreeShippingXtraFee: number
  totalTransactionFee: number
  totalServiceFeePromoXtra: number
  totalCampaignFee: number
  totalAmsCommissionFee: number
  totalAutoTopupFee: number
  totalPremium: number
  totalFbsFee: number
  totalPph22: number
  /** Sum of every platform fee (positive number) */
  totalPlatformFees: number
  /** Sum of seller-sponsored discounts & cashback (positive number) */
  totalSellerSponsored: number
  rowCount: number
  /** Settlement rows whose order number is not in the orders table */
  unmatchedCount: number
}

export interface EarningsImportResult {
  success: boolean
  totalRows: number
  inserted: number
  updated: number
  skipped: number
  errors: string[]
  fileName: string
}
