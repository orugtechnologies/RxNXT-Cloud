import { NextResponse } from 'next/server';
import { isMetaConfigured, sendPrescriptionPDF } from '@/services/whatsappService';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doTest = searchParams.get('test') === 'true';
  const doSendTest = searchParams.get('test') === 'send';

  const configured = isMetaConfigured();
  const rawToken = (process.env.META_WA_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  const rawPhoneId = (process.env.META_WA_PHONE_NUMBER_ID || '').trim().replace(/^["']|["']$/g, '');
  const graphApiVersion = process.env.META_GRAPH_API_VERSION || 'v20.0';

  let testResult: any = null;
  if (doSendTest) {
    try {
      const rx = await prisma.prescription.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { patient: true, clinic: true, encounter: true, medicines: { include: { drug: true } } },
      });
      if (rx && rx.patient) {
        let aiSummary = '🩺 *Diagnosis:* ' + (rx.encounter?.diagnosis || 'Routine Consultation') + '\n\n💊 *Treatment Schedule:*\n';
        (rx.medicines || []).forEach((m, idx) => {
          aiSummary += `${idx + 1}. *${m.customName || m.drug?.brandName || 'Medicine'}* • ${m.frequency || '1-0-1'}\n`;
        });
        const res = await sendPrescriptionPDF(
          rx.patient.phone,
          rx.patient.name,
          rx.clinic.name,
          'https://app.rxnxt.in/p/view',
          undefined,
          rx.clinicId,
          aiSummary
        );
        testResult = { success: true, res };
      }
    } catch (err: any) {
      testResult = {
        success: false,
        errorMessage: err.message,
        metaDebug: err.metaDebug || null,
        errorStack: err.stack,
      };
    }

  } else if (doTest && rawToken && rawPhoneId) {

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


