export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * Wakeup route (Deprecated):
 * The platform has migrated 100% to Meta WhatsApp Cloud API,
 * which is hosted directly by Meta and does not require wake-up pings.
 */
export async function GET(request: Request) {
  // Security check for Vercel Cron if CRON_SECRET is configured
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  return NextResponse.json({
    success: true,
    provider: 'meta_cloud_api',
    message: 'Meta WhatsApp Cloud API operates 24/7 and does not require a wakeup ping.',
  });
}

