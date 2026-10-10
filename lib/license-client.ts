/**
 * Browser-side device fingerprint.
 *
 * Browsers deliberately do not expose hardware serial numbers, so we build a
 * stable anonymous fingerprint from signals that identify a browser
 * installation on a particular machine: user agent, language, screen
 * geometry, timezone and CPU core count. Two different laptops will differ;
 * the same laptop in the same browser stays the same across sessions.
 *
 * This is a deterrent, not a DRM scheme — a determined user can spoof these
 * signals. It matches the "one license = one device" promise for honest
 * buyers without requiring any native code.
 */
export async function computeDeviceFingerprint(): Promise<string> {
  const signals = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency || 0),
    String(navigator.platform || ''),
  ].join('|')

  const data = new TextEncoder().encode(signals)
  const digest = await crypto.subtle.digest('SHA-256', data)

  const bytes = new Uint8Array(digest)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}
