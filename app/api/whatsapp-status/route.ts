import { NextResponse } from 'next/server';
import { isMetaConfigured } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isMetaConfigured();
  const rawToken = (process.env.META_WA_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  const rawPhoneId = (process.env.META_WA_PHONE_NUMBER_ID || '').trim().replace(/^["']|["']$/g, '');

  return NextResponse.json({
    status: configured ? 'connected' : 'development_mode',
    provider: 'meta_cloud_api',
    isEnterprise: true,
    requiresQRScan: false,
    debug: {
      phoneIdLength: rawPhoneId.length,
      phoneIdPrefix: rawPhoneId.slice(0, 4) + '...' + rawPhoneId.slice(-4),
      tokenLength: rawToken.length,
      tokenPrefix: rawToken.slice(0, 10),
      tokenSuffix: rawToken.slice(-10),
      version: process.env.META_GRAPH_API_VERSION || 'v20.0',
    },
    message: configured
      ? 'Official Meta WhatsApp Cloud API is connected and active.'
      : 'Meta WhatsApp Cloud API is running in local development mode.',
  });
}

