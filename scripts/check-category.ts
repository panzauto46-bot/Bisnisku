import { db } from '../db'
import { orders } from '../db/schema'
import { sql } from 'drizzle-orm'

async function checkCategory() {
  // Check Perlu Dikirim & Belum Bayar
  const result = await db
    .select({
      status: orders.status,
      hasTracking: sql`CASE WHEN ${orders.trackingNumber} IS NOT NULL THEN 1 ELSE 0 END`,
      hasPayment: sql`CASE WHEN ${orders.paymentTime} IS NOT NULL THEN 1 ELSE 0 END`,
      count: sql`count(*)`,
    })
    .from(orders)
    .where(sql`${orders.status} IN ('Perlu Dikirim', 'Belum Bayar')`)
    .groupBy(orders.status, sql`CASE WHEN ${orders.trackingNumber} IS NOT NULL THEN 1 ELSE 0 END`, sql`CASE WHEN ${orders.paymentTime} IS NOT NULL THEN 1 ELSE 0 END`)

  console.log('Perlu Dikirim / Belum Bayar breakdown:')
  result.forEach((row: any) => {
    console.log(
      `  ${row.status} | tracking: ${row.hasTracking} | payment: ${row.hasPayment} | count: ${row.count}`
    )
  })

  // Check "Pesanan diterima" statuses
  const received = await db
    .select({ count: sql`count(*)` })
    .from(orders)
    .where(sql`${orders.status} LIKE 'Pesanan diterima%'`)
  console.log(`\nPesanan diterima: ${received[0].count}`)
}

checkCategory()
