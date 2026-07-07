export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // MVP: just return success
  return NextResponse.json({ message: 'Preference saved (MVP)' }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ data: [] });
}

