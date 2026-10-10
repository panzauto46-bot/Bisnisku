import { db } from '@/db'
import { orderEarnings, orders, importHistory } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import type {
  RawEarnings,
  OrderEarnings,
  EarningsStats,
  EarningsImportResult,
} from '@/types/earnings.types'

/**
 * Insert (or update) settlement rows from the "Penghasilan" export.
 *
 * The settlement file is a separate export from the order file, so rows are
 * upserted by order number: importing a newer settlement file refreshes the
 * numbers without creating duplicates. Done in bulk chunks — with Turso each
 * query is an HTTP round trip, so a per-row loop would be far too slow.
 */
export async function insertEarnings(
  rawRows: RawEarnings[],
  fileName: string,
  fileSize: number | null
): Promise<EarningsImportResult> {
  const errors: string[] = []
  let inserted = 0
  let updated = 0
  let skipped = 0

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const rows = rawRows
    .filter((raw) => raw.orderNumber)
    .map((raw) => ({
      orderNumber: raw.orderNumber,
      releaseDate: raw.releaseDate,
      releaseMethod: raw.releaseMethod,
      orderCreatedDate: raw.orderCreatedDate,
      totalEarnings: raw.totalEarnings,
      productPrice: raw.productPrice,
      refundToBuyer: raw.refundToBuyer,
      shippingPaidByBuyer: raw.shippingPaidByBuyer,
      shippingPaidToCourier: raw.shippingPaidToCourier,
      shippingDiscountFromCourier: raw.shippingDiscountFromCourier,
      freeShippingFromPlatform: raw.freeShippingFromPlatform,
      returnShippingFee: raw.returnShippingFee,
      returnToSellerFee: raw.returnToSellerFee,
      shippingCostRefund: raw.shippingCostRefund,
      sellerSponsoredVoucher: raw.sellerSponsoredVoucher,
      sellerSponsoredCoinCashback: raw.sellerSponsoredCoinCashback,
      platformProductDiscount: raw.platformProductDiscount,
      coFundVoucher: raw.coFundVoucher,
      coFundCoinCashback: raw.coFundCoinCashback,
      adminFee: raw.adminFee,
      orderProcessFee: raw.orderProcessFee,
      freeShippingXtraFee: raw.freeShippingXtraFee,
      transactionFee: raw.transactionFee,
      serviceFeePromoXtra: raw.serviceFeePromoXtra,
      campaignFee: raw.campaignFee,
      amsCommissionFee: raw.amsCommissionFee,
      autoTopupFee: raw.autoTopupFee,
      premium: raw.premium,
      fbsFee: raw.fbsFee,
      pph22: raw.pph22,
      buyerUsername: raw.buyerUsername,
      buyerPaidAmount: raw.buyerPaidAmount,
      buyerPaymentMethod: raw.buyerPaymentMethod,
      courier: raw.courier,
      courierName: raw.courierName,
      voucherCode: raw.voucherCode,
      createdAt: now,
      updatedAt: now,
    }))

  const CHUNK = 100

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    try {
      const result = await db
        .insert(orderEarnings)
        .values(chunk)
        .onConflictDoUpdate({
          target: orderEarnings.orderNumber,
          set: {
            releaseDate: sql`excluded.release_date`,
            releaseMethod: sql`excluded.release_method`,
            orderCreatedDate: sql`excluded.order_created_date`,
            totalEarnings: sql`excluded.total_earnings`,
            productPrice: sql`excluded.product_price`,
            refundToBuyer: sql`excluded.refund_to_buyer`,
            shippingPaidByBuyer: sql`excluded.shipping_paid_by_buyer`,
            shippingPaidToCourier: sql`excluded.shipping_paid_to_courier`,
            shippingDiscountFromCourier: sql`excluded.shipping_discount_from_courier`,
            freeShippingFromPlatform: sql`excluded.free_shipping_from_platform`,
            returnShippingFee: sql`excluded.return_shipping_fee`,
            returnToSellerFee: sql`excluded.return_to_seller_fee`,
            shippingCostRefund: sql`excluded.shipping_cost_refund`,
            sellerSponsoredVoucher: sql`excluded.seller_sponsored_voucher`,
            sellerSponsoredCoinCashback: sql`excluded.seller_sponsored_coin_cashback`,
            platformProductDiscount: sql`excluded.platform_product_discount`,
            coFundVoucher: sql`excluded.co_fund_voucher`,
            coFundCoinCashback: sql`excluded.co_fund_coin_cashback`,
            adminFee: sql`excluded.admin_fee`,
            orderProcessFee: sql`excluded.order_process_fee`,
            freeShippingXtraFee: sql`excluded.free_shipping_xtra_fee`,
            transactionFee: sql`excluded.transaction_fee`,
            serviceFeePromoXtra: sql`excluded.service_fee_promo_xtra`,
            campaignFee: sql`excluded.campaign_fee`,
            amsCommissionFee: sql`excluded.ams_commission_fee`,
            autoTopupFee: sql`excluded.auto_topup_fee`,
            premium: sql`excluded.premium`,
            fbsFee: sql`excluded.fbs_fee`,
            pph22: sql`excluded.pph22`,
            buyerUsername: sql`excluded.buyer_username`,
            buyerPaidAmount: sql`excluded.buyer_paid_amount`,
            buyerPaymentMethod: sql`excluded.buyer_payment_method`,
            courier: sql`excluded.courier`,
            courierName: sql`excluded.courier_name`,
            voucherCode: sql`excluded.voucher_code`,
            updatedAt: now,
          },
        })

      // With libSQL, rowsAffected counts each row actually modified.
      updated += result.rowsAffected
      if (result.rowsAffected < chunk.length) {
        inserted += chunk.length - result.rowsAffected
      }
    } catch (error) {
      skipped += chunk.length
      errors.push(
        `Chunk starting at ${chunk[0]?.orderNumber}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Record the import in history
  try {
    await db.insert(importHistory).values({
      fileName,
      fileSize,
      recordsCount: rawRows.length,
      importedAt: now,
      status: 'success',
    })
  } catch (error) {
    errors.push(
      `Gagal mencatat riwayat import: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  return {
    success: true,
    totalRows: rawRows.length,
    inserted,
    updated,
    skipped,
    errors,
    fileName,
  }
}

/**
 * Aggregate every settlement row into dashboard statistics.
 *
 * Fees are stored negative (as in the export); the totals below are
 * reported as positive magnitudes so the UI can show "Biaya Administrasi:
 * Rp 1.234" without a leading minus sign.
 */
export async function getEarningsStats(): Promise<EarningsStats | null> {
  const rows = await db.select().from(orderEarnings)

  if (rows.length === 0) return null

  const sum = (selector: (row: OrderEarnings) => number | null) =>
    rows.reduce((total, row) => total + Math.abs(selector(row) ?? 0), 0)

  // Order numbers present in the settlement export but not in the orders
  // table — the order file covers a different (usually wider) period.
  const existingOrders = await db
    .select({ orderNumber: orders.orderNumber })
    .from(orders)
  const existingSet = new Set(existingOrders.map((r) => r.orderNumber))
  const unmatchedCount = rows.filter(
    (r) => !existingSet.has(r.orderNumber)
  ).length

  const platformFeeKeys: (keyof EarningsStats)[] = [
    'totalAdminFee',
    'totalOrderProcessFee',
    'totalFreeShippingXtraFee',
    'totalTransactionFee',
    'totalServiceFeePromoXtra',
    'totalCampaignFee',
    'totalAmsCommissionFee',
    'totalAutoTopupFee',
    'totalPremium',
    'totalFbsFee',
    'totalPph22',
  ]

  const stats: EarningsStats = {
    totalEarnings: rows.reduce((s, r) => s + r.totalEarnings, 0),
    totalProductPrice: sum((r) => r.productPrice),
    totalRefundToBuyer: sum((r) => r.refundToBuyer),
    totalShippingPaidByBuyer: sum((r) => r.shippingPaidByBuyer),
    totalShippingPaidToCourier: sum((r) => r.shippingPaidToCourier),
    totalFreeShippingFromPlatform: sum((r) => r.freeShippingFromPlatform),
    totalReturnShippingFee: sum((r) => r.returnShippingFee),
    totalReturnToSellerFee: sum((r) => r.returnToSellerFee),
    totalShippingCostRefund: sum((r) => r.shippingCostRefund),
    totalSellerSponsoredVoucher: sum((r) => r.sellerSponsoredVoucher),
    totalSellerSponsoredCoinCashback: sum((r) => r.sellerSponsoredCoinCashback),
    totalPlatformProductDiscount: sum((r) => r.platformProductDiscount),
    totalCoFundVoucher: sum((r) => r.coFundVoucher),
    totalCoFundCoinCashback: sum((r) => r.coFundCoinCashback),
    totalAdminFee: sum((r) => r.adminFee),
    totalOrderProcessFee: sum((r) => r.orderProcessFee),
    totalFreeShippingXtraFee: sum((r) => r.freeShippingXtraFee),
    totalTransactionFee: sum((r) => r.transactionFee),
    totalServiceFeePromoXtra: sum((r) => r.serviceFeePromoXtra),
    totalCampaignFee: sum((r) => r.campaignFee),
    totalAmsCommissionFee: sum((r) => r.amsCommissionFee),
    totalAutoTopupFee: sum((r) => r.autoTopupFee),
    totalPremium: sum((r) => r.premium),
    totalFbsFee: sum((r) => r.fbsFee),
    totalPph22: sum((r) => r.pph22),
    totalPlatformFees: 0,
    totalSellerSponsored: 0,
    rowCount: rows.length,
    unmatchedCount,
  }

  stats.totalPlatformFees = platformFeeKeys.reduce(
    (s, key) => s + (stats[key] as number),
    0
  )
  stats.totalSellerSponsored =
    stats.totalSellerSponsoredVoucher +
    stats.totalSellerSponsoredCoinCashback +
    stats.totalCoFundVoucher +
    stats.totalCoFundCoinCashback +
    stats.totalPlatformProductDiscount

  return stats
}

/**
 * Get a single order's settlement data, for the order detail modal.
 */
export async function getEarningsByOrderNumber(
  orderNumber: string
): Promise<OrderEarnings | null> {
  const rows = await db
    .select()
    .from(orderEarnings)
    .where(eq(orderEarnings.orderNumber, orderNumber))
    .limit(1)

  return rows.length > 0 ? (rows[0] as OrderEarnings) : null
}

/**
 * Delete all settlement rows (used by the reset feature).
 */
export async function resetAllEarnings(): Promise<void> {
  await db.delete(orderEarnings)
}
