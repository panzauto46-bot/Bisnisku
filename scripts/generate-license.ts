/**
 * License generator (seller tool).
 *
 * Usage:
 *   npm run license:gen                        -> yearly license (365 days)
 *   npm run license:gen -- --plan monthly      -> monthly license (30 days)
 *   npm run license:gen -- --plan yearly --count 5
 *
 * Or just double-click Generator-License.bat in the project root.
 *
 * On first run this generates an Ed25519 keypair:
 *   data/license-private.key  -> KEEP SECRET, never commit, never ship
 *   data/license-public.key   -> paste into lib/license-file.ts (LICENSE_PUBLIC_KEY)
 *                                and into the Vercel env var LICENSE_PUBLIC_KEY
 *
 * Each license is written to licenses/BISNISKU-<id>.dat. Send that file to the
 * buyer after payment. One file = one device: the buyer uploads it on the
 * activation page, the app verifies the signature, then binds it to that
 * browser's device fingerprint in the database.
 */

import crypto from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomGroup(length: number): string {
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CHARSET[bytes[i] % CHARSET.length]
  }
  return out
}

function newLicenseId(): string {
  return `${randomGroup(6)}-${randomGroup(6)}-${randomGroup(6)}`
}

const MAGIC = 'BISNISKU-LICENSE'
const VERSION = 1

function parseArgs(args: string[]): { plan: 'monthly' | 'yearly'; count: number } {
  let plan: 'monthly' | 'yearly' = 'yearly'
  let count = 1

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--plan' && args[i + 1]) {
      const next = args[i + 1]
      if (next !== 'monthly' && next !== 'yearly') {
        console.error(`❌ Plan tidak valid: "${next}". Gunakan "monthly" atau "yearly".`)
        process.exit(1)
      }
      plan = next
      i++
    } else if (arg === '--count' && args[i + 1]) {
      const parsed = Number(args[i + 1])
      if (Number.isNaN(parsed) || parsed < 1) {
        console.error(`❌ Jumlah tidak valid: "${args[i + 1]}".`)
        process.exit(1)
      }
      count = Math.min(parsed, 100)
      i++
    }
  }

  return { plan, count }
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url')
}

async function ensureKeypair(): Promise<{ privateKey: crypto.KeyObject; publicKeyB64: string }> {
  const dataDir = path.join(process.cwd(), 'data')
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

  const privPath = path.join(dataDir, 'license-private.key')
  const pubPath = path.join(dataDir, 'license-public.key')

  if (existsSync(privPath) && existsSync(pubPath)) {
    const privateKey = crypto.createPrivateKey({
      key: readFileSync(privPath),
      format: 'der',
      type: 'pkcs8',
    })
    const publicKeyB64 = readFileSync(pubPath, 'utf8').trim()
    return { privateKey, publicKeyB64 }
  }

  // Fresh keypair. This invalidates every previously generated license, so
  // only do it once — hence the loud warning.
  console.log('')
  console.log('⚠️  KEYPAIR BARU DIBUAT!')
  console.log('   Semua license yang pernah Anda buat sebelumnya jadi tidak valid.')
  console.log('   Simpan data/license-private.key dengan aman dan JANGAN di-commit.')
  console.log('')

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519')

  writeFileSync(
    privPath,
    privateKey.export({ format: 'der', type: 'pkcs8' })
  )
  const publicKeyB64 = b64url(publicKey.export({ format: 'der', type: 'spki' }))
  writeFileSync(pubPath, publicKeyB64 + '\n', 'utf8')

  console.log('🔐 Keypair disimpan:')
  console.log(`   Private: ${privPath}  (RAHASIA — jangan di-commit, jangan dikirim)`)
  console.log(`   Public : ${pubPath}`)
  console.log('')
  console.log('   ⚠️  Agar aplikasi bisa memverifikasi license, salin public key ini')
  console.log('   ke LICENSE_PUBLIC_KEY di lib/license-file.ts dan ke env var')
  console.log('   LICENSE_PUBLIC_KEY di Vercel:')
  console.log('')
  console.log(`   ${publicKeyB64}`)
  console.log('')

  return { privateKey, publicKeyB64 }
}

function signLicense(
  privateKey: crypto.KeyObject,
  payload: { id: string; plan: string; exp: number }
): string {
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload), 'utf8'))
  const sig = crypto.sign(null, Buffer.from(payloadB64, 'utf8'), privateKey)
  return `${MAGIC};${VERSION};${payloadB64};${b64url(sig)}`
}

async function main() {
  const { plan, count } = parseArgs(process.argv.slice(2))
  const { privateKey, publicKeyB64 } = await ensureKeypair()

  const outDir = path.join(process.cwd(), 'licenses')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const now = Date.now()
  const days = plan === 'monthly' ? 30 : 365
  const exp = now + days * 24 * 60 * 60 * 1000

  console.log('')
  console.log('🔐 BisnisKu - License Generator')
  console.log(`   Plan: ${plan} (${days} hari) | Jumlah: ${count}`)
  console.log('')

  const created: string[] = []
  for (let i = 0; i < count; i++) {
    const id = newLicenseId()
    const contents = signLicense(privateKey, { id, plan, exp })
    const file = path.join(outDir, `BISNISKU-${id}.dat`)
    writeFileSync(file, contents + '\n', 'utf8')
    created.push(file)
  }

  console.log(`✅ ${count} license berhasil dibuat di folder licenses/:`)
  console.log('')
  created.forEach((file, index) => {
    console.log(`   ${String(index + 1).padStart(2, ' ')}.  ${path.basename(file)}`)
  })
  console.log('')
  console.log('   Kirim file .dat ke pembeli setelah pembayaran diterima.')
  console.log('   Pembeli meng-upload file itu di halaman aktivasi.')
  console.log('   Satu license hanya bisa dipakai di satu perangkat.')
  console.log('')
}

main().catch((error) => {
  console.error('❌ Gagal generate license:', error)
  process.exit(1)
})
