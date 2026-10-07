import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/**
 * Orders table - stores all imported Shopee orders
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
  shopeeDiscount: real('shopee_discount'),
  productWeight: text('product_weight'),
  totalProductOrdered: integer('total_product_ordered'),
  totalWeight: text('total_weight'),
  sellerVoucher: real('seller_voucher'),
  coinCashback: real('coin_cashback'),
  shopeeVoucher: real('shopee_voucher'),
  discountPackage: text('discount_package'),
  packageDiscountShopee: real('package_discount_shopee'),
  packageDiscountSeller: real('package_discount_seller'),
  shopeeCoinDeduction: real('shopee_coin_deduction'),
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
