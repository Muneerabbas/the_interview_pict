import { NextResponse } from 'next/server';

export function middleware(request) {
  const allowedOrigins = ['https://www.pict.life', 'https://pict.life']; // Add only allowed domains
  const origin = request.headers.get('origin');

  if (origin) {
    if (allowedOrigins.includes(origin)) {
      // Allow request
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');

      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: response.headers });
      }

      return response;
    } else {
      // Block request from non-allowed origins (including localhost)
      return new NextResponse(
        JSON.stringify({ message: 'CORS: Origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Allow same-origin requests (requests without an Origin header)
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*', // Apply CORS middleware to all API routes
};
