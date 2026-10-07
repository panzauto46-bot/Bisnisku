import Database from 'better-sqlite3'
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import * as schema from './schema'

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'database.db')

// Singleton pattern to avoid multiple connections
let _sqlite: Database.Database | null = null
let _db: BetterSQLite3Database<typeof schema> | null = null

function createConnection() {
  if (_db) {
    return _db
  }

  _sqlite = new Database(dbPath)

  // Enable WAL mode for better performance (ignore if locked)
  try {
    _sqlite.pragma('journal_mode = WAL')
    _sqlite.pragma('foreign_keys = ON')
  } catch (e) {
    // Pragma may fail if database is locked during build
    console.warn('Database pragma warning:', e)
  }

  _db = drizzle(_sqlite, { schema })

  return _db
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    const connection = createConnection()
    return (connection as any)[prop]
  },
})

export { schema }
