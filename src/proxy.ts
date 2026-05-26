import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy to protect routes and log requests.
 * (Replacing middleware.ts in this version of Next.js)
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
 * This config determines which routes will be intercepted by the proxy
 */
export const config = {
  matcher: [
    // Match all routes EXCEPT static assets, next internals, and favicon
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};