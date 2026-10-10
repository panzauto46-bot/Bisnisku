/**
 * License file verification.
 *
 * Licenses are Ed25519-signed files produced by the standalone generator
 * (Generator-License.bat / npm run license:gen). The generator holds the
 * PRIVATE key; the application ships only the PUBLIC key below, so a buyer
 * who reads the deployed source still cannot forge a license.
 *
 * File format (single line, semicolon separated):
 *   BISNISKU-LICENSE;1;<base64url payload JSON>;<base64url Ed25519 signature>
 *
 * Payload: { id: string, plan: 'monthly'|'yearly', exp: number(ms) }
 *
 * This module uses node:crypto and must only be imported from the nodejs
 * runtime (API routes), never from the Edge middleware.
 */

import crypto from 'node:crypto'

export const LICENSE_MAGIC = 'BISNISKU-LICENSE'
export const LICENSE_VERSION = 1

export interface LicensePayload {
  id: string
  plan: string
  exp: number
}

/**
 * Ed25519 public key (SPKI DER, base64). Public by design — it can only
 * verify licenses, never create them. The matching private key exists only in
 * data/license-private.key on the seller's machine (git-ignored).
 *
 * Defaults to the keypair this project was shipped with. To rotate, run
 * `npm run license:gen`, take the printed public key and either set the
 * LICENSE_PUBLIC_KEY env var or replace the value below, then redeploy.
 */
export const LICENSE_PUBLIC_KEY =
  process.env.LICENSE_PUBLIC_KEY ??
  'MCowBQYDK2VwAyEAw_YCtPtI2f65Qc0fObgJ0rukoEnsLZoFwGFNlvzjsyc'

function b64urlDecode(str: string): Buffer {
  return Buffer.from(str, 'base64url')
}

export function verifyLicenseFile(
  contents: string,
  publicKey: string = LICENSE_PUBLIC_KEY
): LicensePayload | null {
  if (!publicKey) {
    console.error('LICENSE_PUBLIC_KEY is not set — cannot verify license files')
    return null
  }

  const parts = contents.trim().split(';')
  if (parts.length !== 4) return null
  const [magic, version, payloadB64, sigB64] = parts
  if (magic !== LICENSE_MAGIC || version !== String(LICENSE_VERSION)) return null

  let payload: LicensePayload
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8'))
  } catch {
    return null
  }

  if (typeof payload.id !== 'string' || typeof payload.plan !== 'string') return null
  if (typeof payload.exp !== 'number') return null
  if (payload.exp < Date.now()) return null

  try {
    const keyObj = crypto.createPublicKey({
      key: b64urlDecode(publicKey),
      format: 'der',
      type: 'spki',
    })
    const ok = crypto.verify(
      null,
      Buffer.from(payloadB64, 'utf8'),
      keyObj,
      b64urlDecode(sigB64)
    )
    return ok ? payload : null
  } catch (e) {
    console.error('License signature verification failed:', e)
    return null
  }
}
