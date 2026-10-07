import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'database.db')
const db = new Database(dbPath)

console.log('🗄️  Initializing BisnisKu database...')
console.log(`📍 Location: ${dbPath}`)

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    cancellation_reason TEXT,
    cancellation_status TEXT,
    tracking_number TEXT,
    shipping_option TEXT,
    pickup_type TEXT,
    ship_by_deadline TEXT,
    shipping_time_set TEXT,
    order_created_at TEXT,
    payment_time TEXT,
    order_type TEXT,
    payment_method TEXT,
    parent_sku TEXT,
    product_name TEXT NOT NULL,
    sku_reference TEXT,
    variant_name TEXT,
    original_price REAL,
    discounted_price REAL,
    quantity INTEGER,
    returned_quantity INTEGER,
    subtotal REAL,
    total_discount REAL,
    seller_discount REAL,
    shopee_discount REAL,
    product_weight TEXT,
    total_product_ordered INTEGER,
    total_weight TEXT,
    seller_voucher REAL,
    coin_cashback REAL,
    shopee_voucher REAL,
    discount_package TEXT,
    package_discount_shopee REAL,
    package_discount_seller REAL,
    shopee_coin_deduction REAL,
    credit_card_discount REAL,
    shipping_fee_paid_by_buyer REAL,
    estimated_shipping_discount REAL,
    return_shipping_fee REAL,
    total_payment REAL,
    estimated_shipping REAL,
    buyer_note TEXT,
    seller_note TEXT,
    buyer_username TEXT,
    recipient_name TEXT,
    phone_number TEXT,
    shipping_address TEXT,
    city TEXT,
    province TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL UNIQUE,
    cost_price REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS import_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    records_count INTEGER,
    imported_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'success'
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_product_name ON orders(product_name);
  CREATE INDEX IF NOT EXISTS idx_orders_order_created_at ON orders(order_created_at);
  CREATE INDEX IF NOT EXISTS idx_orders_buyer_username ON orders(buyer_username);
  CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
  CREATE INDEX IF NOT EXISTS idx_orders_province ON orders(province);
`)

console.log('✅ Tables created successfully')
console.log('   - orders')
console.log('   - products')
console.log('   - import_history')
console.log('✅ Indexes created successfully')
console.log('')
console.log('🎉 Database initialized successfully!')
