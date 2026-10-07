/**
 * One-off script: import the marketplace Excel export into the database.
 *
 * Usage: npx tsx scripts/import-excel.ts "<path-to-xlsx>"
 */
import * as fs from 'fs'
import { parseExcelFile } from '../services/excel-parser.service'
import { insertOrders } from '../services/order.service'

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('❌ Missing file path. Usage: npx tsx scripts/import-excel.ts <file.xlsx>')
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`📥 Reading file: ${filePath}`)
  const buffer = fs.readFileSync(filePath)

  console.log('🔍 Parsing Excel...')
  const result = parseExcelFile(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))

  if (!result.success) {
    console.error('❌ Parse failed:', result.errors.join(', '))
    if (result.missingColumns.length) {
      console.error('   Missing columns:', result.missingColumns.join(', '))
    }
    process.exit(1)
  }

  console.log(`✅ Parsed ${result.orders.length} orders (of ${result.totalRows} rows)`)
  if (result.errors.length) {
    console.warn('⚠️  Parse warnings:', result.errors.slice(0, 5).join(', '))
  }

  console.log('💾 Inserting into database...')
  const insertResult = await insertOrders(result.orders)

  console.log('\n🎉 Import complete!')
  console.log(`   Inserted: ${insertResult.inserted}`)
  console.log(`   Skipped:  ${insertResult.skipped}`)
  if (insertResult.errors.length) {
    console.warn(`   Errors:   ${insertResult.errors.length}`)
    insertResult.errors.slice(0, 5).forEach((e) => console.warn('   -', e))
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
