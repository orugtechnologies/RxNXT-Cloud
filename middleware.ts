import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply redirect to dashboard routes
  if (
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin')
  ) {
    const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
