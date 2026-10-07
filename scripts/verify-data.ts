/**
 * One-off script: verify imported order data matches expected values.
 */
import { db } from '../db'
import { orders } from '../db/schema'
import { sql } from 'drizzle-orm'
import { mapStatusCategory } from '../services/order.service'

async function main() {
  const all = await db.select().from(orders)

  console.log(`\n📦 Total orders in DB: ${all.length}`)

  const byCategory: Record<string, number> = {}
  for (const o of all) {
    const cat = mapStatusCategory(o)
    byCategory[cat] = (byCategory[cat] || 0) + 1
  }
  console.log('\n📊 By status category:')
  for (const [k, v] of Object.entries(byCategory)) {
    console.log(`   ${k.padEnd(12)}: ${v}`)
  }

  const totalRevenue = all.reduce((s, o) => s + (o.totalPayment || 0), 0)
  console.log(`\n💰 Total revenue (ALL orders): Rp ${totalRevenue.toLocaleString('id-ID')}`)

  const completedRevenue = all
    .filter((o) => mapStatusCategory(o) === 'completed')
    .reduce((s, o) => s + (o.totalPayment || 0), 0)
  console.log(`💰 Revenue (completed only, dashboard metric): Rp ${completedRevenue.toLocaleString('id-ID')}`)

  const avgOrder = totalRevenue / all.length
  console.log(`📈 Avg per order: Rp ${Math.round(avgOrder).toLocaleString('id-ID')}`)

  const totalDiscount = all.reduce((s, o) => s + (o.totalDiscount || 0), 0)
  console.log(`🏷️  Total discount: Rp ${totalDiscount.toLocaleString('id-ID')}`)

  const platformDiscount = all.reduce((s, o) => s + (o.platformDiscount || 0), 0)
  console.log(`   platformDiscount sum: Rp ${platformDiscount.toLocaleString('id-ID')}`)

  const platformVoucher = all.reduce((s, o) => s + (o.platformVoucher || 0), 0)
  console.log(`   platformVoucher sum: Rp ${platformVoucher.toLocaleString('id-ID')}`)

  const coinDeduction = all.reduce((s, o) => s + (o.platformCoinDeduction || 0), 0)
  console.log(`   platformCoinDeduction sum: Rp ${coinDeduction.toLocaleString('id-ID')}`)

  const pkgPlatform = all.reduce((s, o) => s + (o.packageDiscountPlatform || 0), 0)
  console.log(`   packageDiscountPlatform sum: Rp ${pkgPlatform.toLocaleString('id-ID')}`)

  // Sample a completed order to spot-check the 49 fields
  const sample = all.find((o) => o.orderNumber === all[0].orderNumber)
  if (sample) {
    console.log(`\n🔍 Sample order ${sample.orderNumber}:`)
    console.log(`   product: ${sample.productName}`)
    console.log(`   buyer: ${sample.buyerUsername} (${sample.recipientName})`)
    console.log(`   city: ${sample.city}, province: ${sample.province}`)
    console.log(`   payment method: ${sample.paymentMethod}`)
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
