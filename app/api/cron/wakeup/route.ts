export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Security check for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';
    
    // We intentionally don't await the full response text if it's going to timeout.
    // The mere act of dispatching the GET request to Render forces it to start its boot sequence.
    console.log('[Wakeup Cron] Pinging Render microservice at 7:55 AM IST to wake it up...');
    
    // We use a short timeout wrapper so the Vercel function doesn't crash from hitting its own 15s limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // abort after 8s (well under Vercel 15s limit)

    try {
      await fetch(`${MICROSERVICE_URL}/api/whatsapp/status`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      console.log('[Wakeup Cron] Microservice was already awake!');
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('[Wakeup Cron] Microservice is asleep and currently booting up in the background!');
      } else {
        console.log('[Wakeup Cron] Ping failed:', e.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Wakeup ping dispatched to Render.' });

  } catch (error: any) {
    console.error('Wakeup cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
