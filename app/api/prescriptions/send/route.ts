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

    // Fetch Prescription, Patient, Encounter, and Medicines
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
        clinic: true,
        encounter: true,
        medicines: {
          include: {
            drug: true,
          }
        }
      }
    });

    if (!prescription || !prescription.patient) {
      return NextResponse.json({ error: 'Prescription or Patient not found' }, { status: 404 });
    }

    // Ensure we have a phone number to send to
    if (!prescription.patient.phone) {
      return NextResponse.json({ error: 'Patient does not have a phone number' }, { status: 400 });
    }

    // Synthesize AI Present-Day Treatment Summary
    let aiTreatmentSummary = '';
    const encounter = prescription.encounter;
    const medicines = prescription.medicines || [];

    if (encounter?.diagnosis) {
      aiTreatmentSummary += `🩺 *Diagnosis:* ${encounter.diagnosis}\n\n`;
    }

    if (medicines.length > 0) {
      aiTreatmentSummary += `💊 *AI Present-Day Treatment Schedule:*\n`;
      medicines.forEach((m, idx) => {
        const medName = m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine';
        const strength = m.strength ? ` ${m.strength}` : '';
        const form = m.dosageForm ? ` (${m.dosageForm})` : '';
        const freq = m.frequency ? ` • *Dose:* ${m.frequency}` : '';
        const duration = m.duration ? ` for ${m.duration}` : '';
        const instr = m.instructions ? ` [${m.instructions}]` : '';

        aiTreatmentSummary += `${idx + 1}. *${medName}${strength}*${form}${freq}${duration}${instr}\n`;
      });
    }

    if (encounter?.notes) {
      aiTreatmentSummary += `\n📝 *Doctor Advice:* ${encounter.notes}\n`;
    }

    if (encounter?.followUpDate) {
      const formattedFollowUp = new Date(encounter.followUpDate).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
      aiTreatmentSummary += `\n📅 *Next Follow-up Visit:* ${formattedFollowUp}\n`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pdfDownloadUrl = `${baseUrl}/patient/prescription/${prescription.id}/view`;

    // Dispatch WhatsApp Message with AI Treatment Summary
    const result = await sendPrescriptionPDF(
      prescription.patient.phone,
      prescription.patient.name,
      prescription.clinic.name,
      pdfDownloadUrl,
      pdfBase64,
      prescription.clinicId,
      aiTreatmentSummary
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in send-prescription API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

