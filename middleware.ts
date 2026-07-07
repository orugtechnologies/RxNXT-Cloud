// middleware.ts
// NextAuth middleware — protects all routes except public pages.
// Replaces the old Supabase session middleware.

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protect all routes EXCEPT:
     * - /login, /register, /forgot-password (auth pages)
     * - /api/auth/* (NextAuth endpoints)
     * - Static files (images, fonts, etc.)
     */
    '/((?!login|register|forgot-password|api/auth|_next/static|_next/image|favicon.ico|Logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
