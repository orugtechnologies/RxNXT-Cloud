import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public / Cron endpoints bypass auth checks completely
  if (pathname.startsWith('/api/cron')) {
    return NextResponse.next();
  }

  // Check for NextAuth token on protected routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
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
