import { NextResponse } from 'next/server'
import { hostFromHeaders, isPlacementHost } from './lib/host-gate.js'

// This file must live at the project root -- Next.js does not load middleware
// from inside app/, so the previous copy never ran.
const allowedOrigins = [
  'https://theinterviewroom.in',
  'https://www.theinterviewroom.in',
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean)

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const placementsHost = isPlacementHost(hostFromHeaders((key) => request.headers.get(key)))

  // robots.txt and sitemap.xml are single static files served on both domains.
  // pict.live needs its own pair so /placements can be indexed there without
  // advertising it on theinterviewroom.in, where it 404s.
  if (placementsHost && pathname === '/robots.txt') {
    return NextResponse.rewrite(new URL('/robots-pict.txt', request.url))
  }
  if (placementsHost && pathname === '/sitemap.xml') {
    return NextResponse.rewrite(new URL('/sitemap-pict.xml', request.url))
  }

  // Defence in depth. The styled 404 comes from notFound() in the page itself --
  // a middleware rewrite would return 200, which is the SEO leak we are avoiding.
  // This exists only so a blocked host never reaches the route or the database.
  if (pathname.startsWith('/placements') && !placementsHost) {
    return new NextResponse(null, { status: 404, headers: { 'cache-control': 'no-store' } })
  }

  const origin = request.headers.get('origin') ?? ''
  const isAllowedOrigin = allowedOrigins.includes(origin)

  if (request.method === 'OPTIONS') {
    return NextResponse.json(
      {},
      {
        headers: {
          ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
          ...corsOptions,
        },
      }
    )
  }

  const response = NextResponse.next()

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Vary', 'Origin')
    for (const [key, value] of Object.entries(corsOptions)) {
      response.headers.set(key, value)
    }
  }

  return response
}

export const config = {
  // Kept narrow on purpose: a broad '/:path*' would put middleware in front of
  // the prerendered landing page.
  matcher: ['/api/:path*', '/placements/:path*', '/robots.txt', '/sitemap.xml'],
}
