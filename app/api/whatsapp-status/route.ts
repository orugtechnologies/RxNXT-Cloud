import { NextResponse } from 'next/server';
import { isMetaConfigured, getEffectivePhoneNumberId } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isMetaConfigured();
  const phoneId = getEffectivePhoneNumberId();

  return NextResponse.json({
    status: configured ? 'connected' : 'development_mode',
    provider: 'meta_cloud_api',
    activePhoneNumberId: phoneId ? `${phoneId.slice(0, 4)}...${phoneId.slice(-4)}` : null,
    isEnterprise: true,
    requiresQRScan: false,
    message: configured
      ? 'Official Meta WhatsApp Cloud API is connected and active.'
      : 'Meta WhatsApp Cloud API is running in local development mode.',
  });
}



