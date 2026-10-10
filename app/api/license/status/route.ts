import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, PLANS, verifySession, formatExpiry } from '@/lib/license'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Returns the current activation state. Used by the app shell to show the
 * active plan and its expiry date.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifySession(token) : null

  if (!payload) {
    return NextResponse.json({ activated: false })
  }

  const plan = payload.plan as keyof typeof PLANS
  return NextResponse.json({
    activated: true,
    plan,
    planLabel: PLANS[plan]?.label ?? payload.plan,
    expiresAt: payload.exp,
    expiresAtLabel: formatExpiry(payload.exp),
  })
}
