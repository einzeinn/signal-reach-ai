import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // ← ini yang penting

export function middleware(request: NextRequest) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${request.method} ${request.nextUrl.pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
