import { NextResponse } from 'next/server';
import { isMetaConfigured } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isMetaConfigured();

  return NextResponse.json({
    status: configured ? 'connected' : 'development_mode',
    provider: 'meta_cloud_api',
    isEnterprise: true,
    requiresQRScan: false,
    message: configured
      ? 'Official Meta WhatsApp Cloud API is connected and active.'
      : 'Meta WhatsApp Cloud API is running in local development mode.',
  });
}
