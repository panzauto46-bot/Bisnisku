import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/**
 * Orders table - stores all imported marketplace orders
 */
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNumber: text('order_number').notNull().unique(),
  status: text('status').notNull(),
  cancellationReason: text('cancellation_reason'),
  cancellationStatus: text('cancellation_status'),
  trackingNumber: text('tracking_number'),
  shippingOption: text('shipping_option'),
  pickupType: text('pickup_type'),
  shipByDeadline: text('ship_by_deadline'),
  shippingTimeSet: text('shipping_time_set'),
  orderCreatedAt: text('order_created_at'),
  paymentTime: text('payment_time'),
  orderType: text('order_type'),
  paymentMethod: text('payment_method'),
  parentSku: text('parent_sku'),
  productName: text('product_name').notNull(),
  skuReference: text('sku_reference'),
  variantName: text('variant_name'),
  originalPrice: real('original_price'),
  discountedPrice: real('discounted_price'),
  quantity: integer('quantity'),
  returnedQuantity: integer('returned_quantity'),
  subtotal: real('subtotal'),
  totalDiscount: real('total_discount'),
  sellerDiscount: real('seller_discount'),
  platformDiscount: real('platform_discount'),
  productWeight: text('product_weight'),
  totalProductOrdered: integer('total_product_ordered'),
  totalWeight: text('total_weight'),
  sellerVoucher: real('seller_voucher'),
  coinCashback: real('coin_cashback'),
  platformVoucher: real('platform_voucher'),
  discountPackage: text('discount_package'),
  packageDiscountPlatform: real('package_discount_platform'),
  packageDiscountSeller: real('package_discount_seller'),
  platformCoinDeduction: real('platform_coin_deduction'),
  creditCardDiscount: real('credit_card_discount'),
  shippingFeePaidByBuyer: real('shipping_fee_paid_by_buyer'),
  estimatedShippingDiscount: real('estimated_shipping_discount'),
  returnShippingFee: real('return_shipping_fee'),
  totalPayment: real('total_payment'),
  estimatedShipping: real('estimated_shipping'),
  buyerNote: text('buyer_note'),
  sellerNote: text('seller_note'),
  buyerUsername: text('buyer_username'),
  recipientName: text('recipient_name'),
  phoneNumber: text('phone_number'),
  shippingAddress: text('shipping_address'),
  city: text('city'),
  province: text('province'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * Products table - stores product cost for profit analysis
 */
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productName: text('product_name').notNull().unique(),
  costPrice: real('cost_price'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * Order earnings table - stores the marketplace settlement report
 * ("Laporan Penghasilan"), which is a separate export from the order file.
 *
 * Every platform fee (admin, transaction, campaign, etc.) lives here. Values
 * for fees are negative in the source export and are stored as-is.
 */
export const orderEarnings = sqliteTable('order_earnings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderNumber: text('order_number').notNull().unique(),
  // Settlement info
  releaseDate: text('release_date'),
  releaseMethod: text('release_method'),
  orderCreatedDate: text('order_created_date'),
  // Headline number: what the seller actually receives
  totalEarnings: real('total_earnings').notNull(),
  // Product & shipping
  productPrice: real('product_price'),
  refundToBuyer: real('refund_to_buyer'),
  shippingPaidByBuyer: real('shipping_paid_by_buyer'),
  shippingPaidToCourier: real('shipping_paid_to_courier'),
  shippingDiscountFromCourier: real('shipping_discount_from_courier'),
  freeShippingFromPlatform: real('free_shipping_from_platform'),
  returnShippingFee: real('return_shipping_fee'),
  returnToSellerFee: real('return_to_seller_fee'),
  shippingCostRefund: real('shipping_cost_refund'),
  // Seller-sponsored discounts
  sellerSponsoredVoucher: real('seller_sponsored_voucher'),
  sellerSponsoredCoinCashback: real('seller_sponsored_coin_cashback'),
  platformProductDiscount: real('platform_product_discount'),
  coFundVoucher: real('co_fund_voucher'),
  coFundCoinCashback: real('co_fund_coin_cashback'),
  // Platform fees (stored negative, as in the source export)
  adminFee: real('admin_fee'),
  orderProcessFee: real('order_process_fee'),
  freeShippingXtraFee: real('free_shipping_xtra_fee'),
  transactionFee: real('transaction_fee'),
  serviceFeePromoXtra: real('service_fee_promo_xtra'),
  campaignFee: real('campaign_fee'),
  amsCommissionFee: real('ams_commission_fee'),
  autoTopupFee: real('auto_topup_fee'),
  premium: real('premium'),
  fbsFee: real('fbs_fee'),
  pph22: real('pph22'),
  // Buyer & courier info
  buyerUsername: text('buyer_username'),
  buyerPaidAmount: real('buyer_paid_amount'),
  buyerPaymentMethod: text('buyer_payment_method'),
  courier: text('courier'),
  courierName: text('courier_name'),
  voucherCode: text('voucher_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

/**
 * Import history table - tracks all file imports
 */
export const importHistory = sqliteTable('import_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'),
  recordsCount: integer('records_count'),
  importedAt: text('imported_at').notNull(),
  status: text('status').notNull().default('success'),
})
