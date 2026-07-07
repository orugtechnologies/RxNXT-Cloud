export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

// Health check — no database dependency needed
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    database: 'SQLite (local)',
    timestamp: new Date().toISOString(),
  });
}

