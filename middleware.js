import { NextResponse } from 'next/server'

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
  matcher: '/api/:path*',
}
