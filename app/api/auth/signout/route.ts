export const dynamic = 'force-dynamic';
// Signout is handled by NextAuth /api/auth/signout automatically
import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ message: 'Use NextAuth signOut() instead' }, { status: 410 });
}

