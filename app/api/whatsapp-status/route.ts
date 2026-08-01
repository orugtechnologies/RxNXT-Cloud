import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';
    const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/status?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Microservice returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[WhatsApp Status Proxy Error]', error);
    return NextResponse.json(
      { error: 'Failed to connect to microservice', details: error.message },
      { status: 503 }
    );
  }
}
