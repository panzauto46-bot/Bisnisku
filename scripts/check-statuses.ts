import { db } from '../db'
import { orders } from '../db/schema'
import { sql } from 'drizzle-orm'

async function checkStatuses() {
  const result = await db
    .select({
      status: orders.status,
      count: sql`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status)
    .orderBy(sql`count(*) DESC`)

  console.log('Status distribution:')
  result.forEach((row: any) => {
    console.log(`  ${row.status}: ${row.count}`)
  })

  // Check how many have tracking number
  const withTracking = await db
    .select({ count: sql`count(*)` })
    .from(orders)
    .where(sql`${orders.trackingNumber} IS NOT NULL`)

  console.log(`\nWith tracking number: ${withTracking[0].count}`)
}

checkStatuses()
