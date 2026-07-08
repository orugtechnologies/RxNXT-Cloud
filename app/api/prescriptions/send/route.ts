export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { sendPrescriptionPDF } from '@/services/whatsappService';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prescriptionId, pdfBase64 } = await request.json();

    if (!prescriptionId) {
      return NextResponse.json({ error: 'Missing prescriptionId' }, { status: 400 });
    }

    // Fetch Prescription and Patient data
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
        clinic: true,
      }
    });

    if (!prescription || !prescription.patient) {
      return NextResponse.json({ error: 'Prescription or Patient not found' }, { status: 404 });
    }

    // Ensure we have a phone number to send to
    if (!prescription.patient.phone) {
      return NextResponse.json({ error: 'Patient does not have a phone number' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pdfDownloadUrl = `${baseUrl}/patient/prescription/${prescription.id}/view`;

    // Dispatch WhatsApp Message
    const result = await sendPrescriptionPDF(
      prescription.patient.phone,
      prescription.patient.name,
      prescription.clinic.name,
      pdfDownloadUrl,
      pdfBase64
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in send-prescription API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

