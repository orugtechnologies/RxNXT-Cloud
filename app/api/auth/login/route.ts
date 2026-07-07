export const dynamic = 'force-dynamic';
// Login API no longer needed — NextAuth handles login via /api/auth/[...nextauth]
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ message: 'Use NextAuth signIn() instead' }, { status: 410 });
}

