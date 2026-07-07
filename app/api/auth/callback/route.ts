export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
// Auth callback no longer needed — NextAuth handles sessions internally
export async function GET() {
  return NextResponse.redirect('/doctor/dashboard');
}

