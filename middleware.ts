import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME, verifySession } from './lib/license'

/**
 * Blocks every application route unless the request carries a valid,
 * unexpired license cookie. Public routes (landing page, login, and the
 * license API itself) are excluded via the matcher below.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifySession(token) : null

  if (!payload) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Everything except: static assets, favicon, the landing page root,
    // the login page, and the license API endpoints.
    '/((?!_next/static|_next/image|favicon.ico|login|api/license|$).*)',
  ],
}
