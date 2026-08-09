import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes and auth pages bypass session check
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next') || pathname === '/login') {
    return NextResponse.next();
  }

  // Check NextAuth session cookie for protected dashboard routes
  const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/doctor/:path*',
    '/receptionist/:path*',
    '/nurse/:path*',
    '/admin/:path*',
    '/superadmin/:path*',
  ],
};
