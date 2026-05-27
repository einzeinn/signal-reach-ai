import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Proxy - Intercepts requests before they reach route handlers
 * Used for request logging and rate limiting on API routes
 * 
 * When using proxy.ts (vs middleware.ts), must export function named 'proxy'
 */
export function proxy(request: NextRequest) {
  // Log all requests to the application
  if (request.nextUrl.pathname.startsWith('/')) {
    const now = new Date().toISOString();
    console.log(`[${now}] ${request.method} ${request.nextUrl.pathname}`);
  }

  // Example: Protect API routes (uncomment if auth is needed for production/demo)
  // if (request.nextUrl.pathname.startsWith('/api/')) {
  //   const token = request.headers.get('authorization');
  //   if (!token) {
  //     return NextResponse.json(
  //       { error: 'Unauthorized' },
  //       { status: 401 }
  //     );
  //   }
  // }

  return NextResponse.next();
}

/**
 * Config determines which routes are intercepted by proxy
 * Matches all API routes and pages EXCEPT static assets
 * 
 * CRITICAL: matcher must include '/api/:path*' to intercept API routes
 * for rate limiting in src/app/api/signals/route.ts
 */
export const config = {
  matcher: [
    // Match all API routes - critical for rate limiting to work
    '/api/:path*',
    // Match all page routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};