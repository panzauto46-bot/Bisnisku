/**
 * License session helpers.
 *
 * This module is imported by the Edge middleware, so it MUST only use Web
 * Crypto (crypto.subtle) — never node:crypto. The heavier license-file
 * verification (Ed25519) lives in lib/license-file.ts and is only used from
 * the activate API route, which runs on the nodejs runtime.
 */

export const COOKIE_NAME = 'bk_sess'

export const PLANS = {
  monthly: { label: 'Bulanan', days: 30 },
  yearly: { label: 'Tahunan', days: 365 },
} as const

export type Plan = keyof typeof PLANS

export interface SessionPayload {
  licenseId: string
  plan: string
  exp: number
  deviceId: string
}

const enc = new TextEncoder()
const dec = new TextDecoder()

function b64urlEncode(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str: string): Uint8Array {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function strToBytes(str: string): Uint8Array {
  return enc.encode(str)
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    strToBytes(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * The app secret used to sign session cookies. Read from the environment so
 * it is never baked into the client bundle. Deliberately has NO hardcoded
 * fallback — the previous default secret was public on GitHub and let anyone
 * forge a session.
 */
function getAppSecret(): string {
  const secret = process.env.LICENSE_SECRET
  if (!secret) {
    throw new Error(
      'LICENSE_SECRET is not set. The app cannot sign session cookies without ' +
        'it. Add it to .env.local (development) or to the Vercel project ' +
        'settings (production).'
    )
  }
  return secret
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const data = b64urlEncode(strToBytes(JSON.stringify(payload)))
  const key = await hmacKey(getAppSecret())
  const sig = await crypto.subtle.sign('HMAC', key, strToBytes(data) as BufferSource)
  return `${data}.${b64urlEncode(new Uint8Array(sig))}`
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null

  try {
    const key = await hmacKey(getAppSecret())
    const sigBytes = b64urlDecode(sig)
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as BufferSource,
      strToBytes(data) as BufferSource
    )
    if (!valid) return null

    const parsed = JSON.parse(dec.decode(b64urlDecode(data))) as SessionPayload
    if (typeof parsed.exp !== 'number' || typeof parsed.deviceId !== 'string') return null
    if (parsed.exp < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export function formatExpiry(exp: number): string {
  return new Date(exp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function planLabel(plan: string): string {
  return PLANS[plan as Plan]?.label ?? plan
}
