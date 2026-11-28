import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect superadmin routes: strictly require superadmin role
  if (pathname.startsWith('/superadmin/dashboard')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'rxnxt-local-dev-secret-key-2024' 
    });
    const role = (token?.role as string)?.toLowerCase().replace('_', '');
    if (!token || role !== 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/login', req.url));
    }
  }

  // Only apply redirect to dashboard routes
  if (
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/receptionist') ||
    pathname.startsWith('/pharmacist') ||
    pathname.startsWith('/nurse') ||
    pathname.startsWith('/lab') ||
    pathname.startsWith('/admin')
  ) {
    const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
