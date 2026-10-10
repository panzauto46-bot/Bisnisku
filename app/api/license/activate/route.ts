import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { licenseActivations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  COOKIE_NAME,
  PLANS,
  createSession,
  formatExpiry,
  planLabel,
} from '@/lib/license'
import { verifyLicenseFile } from '@/lib/license-file'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Activate a license file.
 *
 * Body: { license: string, deviceId: string }
 *   license  — full contents of the license.dat file the buyer uploaded
 *   deviceId — SHA-256 browser fingerprint computed client-side
 *
 * The license file is verified with the embedded Ed25519 public key. If it is
 * valid we then enforce one-license-one-device: the first activation records
 * the device fingerprint, and a different device trying the same license id is
 * refused with 409.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 })
  }

  const licenseContents = String((body as { license?: string })?.license ?? '').trim()
  const deviceId = String((body as { deviceId?: string })?.deviceId ?? '').trim()

  if (!licenseContents) {
    return NextResponse.json(
      { error: 'File license belum di-upload.' },
      { status: 400 }
    )
  }
  if (!deviceId) {
    return NextResponse.json(
      { error: 'Device tidak terdeteksi. Aktifkan kembali browser Anda.' },
      { status: 400 }
    )
  }

  // 1. Verify the cryptographic signature. This is what actually proves the
  //    buyer paid — no database needed for it.
  const license = verifyLicenseFile(licenseContents)

  if (!license) {
    return NextResponse.json(
      {
        error:
          'License tidak valid atau sudah kedaluwarsa. Pastikan Anda meng-upload file license.dat yang benar.',
      },
      { status: 404 }
    )
  }

  if (!PLANS[license.plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Plan pada license tidak dikenal.' }, { status: 400 })
  }

  // 2. Enforce one license = one device.
  const existing = await db
    .select()
    .from(licenseActivations)
    .where(eq(licenseActivations.licenseId, license.id))
    .limit(1)

  const expiresAtIso = new Date(license.exp).toISOString()

  if (existing.length > 0) {
    const activation = existing[0]

    if (activation.deviceId !== deviceId) {
      return NextResponse.json(
        {
          error:
            'License ini sudah digunakan di perangkat lain. Satu license hanya bisa dipakai pada satu perangkat.',
        },
        { status: 409 }
      )
    }

    // Same device activating again (e.g. cleared cookies) — refresh the record
    // and issue a new session.
    await db
      .update(licenseActivations)
      .set({ expiresAt: expiresAtIso })
      .where(eq(licenseActivations.id, activation.id))
  } else {
    await db.insert(licenseActivations).values({
      licenseId: license.id,
      plan: license.plan,
      deviceId,
      activatedAt: new Date().toISOString(),
      expiresAt: expiresAtIso,
    })
  }

  // 3. Issue a signed session cookie that the middleware will accept.
  const token = await createSession({
    licenseId: license.id,
    plan: license.plan,
    exp: license.exp,
    deviceId,
  })

  const response = NextResponse.json({
    success: true,
    plan: license.plan,
    planLabel: planLabel(license.plan),
    expiresAt: new Date(license.exp).toISOString(),
    expiresAtLabel: formatExpiry(license.exp),
  })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor((license.exp - Date.now()) / 1000),
  })

  return response
}
