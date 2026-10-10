import { createClient } from '@libsql/client'
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import * as schema from './schema'

/**
 * Database connection.
 *
 * Uses libSQL, which works both with a local SQLite file (development) and a
 * remote Turso database (production on Vercel). The connection is chosen by
 * environment variables:
 *
 *   TURSO_DATABASE_URL  e.g. libsql://bisnisku-xxxx.turso.io
 *   TURSO_AUTH_TOKEN    the database access token (remote only)
 *
 * When no URL is configured we fall back to a local file at ./data/database.db
 * so `next dev` keeps working out of the box.
 *
 * IMPORTANT: this module is imported by API routes (nodejs runtime) only.
 * The Edge middleware deliberately never touches the database — it only
 * verifies the signed session cookie.
 */
function resolveUrl(): string {
  const configured =
    process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL

  if (configured) return configured

  // Local file fallback. libSQL requires an absolute path for file: URLs.
  const dataDir = path.join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  return `file:${path.join(dataDir, 'database.db').replace(/\\/g, '/')}`
}

const url = resolveUrl()
const authToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN

// Singleton so every request reuses the same client across a warm instance.
let _client: ReturnType<typeof createClient> | null = null
let _db: LibSQLDatabase<typeof schema> | null = null

function createConnection() {
  if (_db) {
    return _db
  }

  _client = createClient({ url, authToken })

  _db = drizzle(_client, { schema })

  return _db
}

export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop) {
    const connection = createConnection()
    return (connection as any)[prop]
  },
})

export { schema }
