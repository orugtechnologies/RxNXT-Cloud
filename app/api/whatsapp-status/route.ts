import { NextResponse } from 'next/server';
import { isMetaConfigured } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doTest = searchParams.get('test') === 'true';

  const configured = isMetaConfigured();
  const rawToken = (process.env.META_WA_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  const rawPhoneId = (process.env.META_WA_PHONE_NUMBER_ID || '').trim().replace(/^["']|["']$/g, '');
  const graphApiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';

  let testResult: any = null;
  if (doTest && rawToken && rawPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/${graphApiVersion}/${rawPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: '919966773614',
          type: 'text',
          text: {
            preview_url: true,
            body: '🔍 Vercel Live Diagnostic Ping to +91 9966773614',
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      testResult = {
        httpStatus: res.status,
        metaResponse: data,
      };
    } catch (err: any) {
      testResult = {
        fetchError: err.message,
      };
    }
  }

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
      version: graphApiVersion,
    },
    testResult,
    message: configured
      ? 'Official Meta WhatsApp Cloud API is connected and active.'
      : 'Meta WhatsApp Cloud API is running in local development mode.',
  });
}


