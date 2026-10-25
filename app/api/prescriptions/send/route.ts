export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { sendPrescriptionPDF } from '@/services/whatsappService';
import { formatPrescriptionSchedule } from '@/lib/prescriptionScheduleFormatter';
import { generatePrescriptionBase64 } from '@/lib/prescriptionPdfGenerator';
import { getClinicSubscription, getClinicWhatsAppUsage } from '@/lib/subscription';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sub = await getClinicSubscription(user.clinicId);
    if (!sub.allowed) {
      return NextResponse.json({
        error: sub.isUsageLocked ? 'TRIAL_USAGE_LIMIT_REACHED' : 'SUBSCRIPTION_EXPIRED',
        message: sub.isUsageLocked
          ? `Your 150-prescription free trial has ended (${sub.prescriptionsCount || 150}/${sub.trialPrescriptionCap || 150} used). Please select a subscription plan to continue sending prescriptions.`
          : 'Your subscription has expired. Please renew your subscription to continue sending WhatsApp prescriptions.',
        subscription: sub,
      }, { status: 403 });
    }

    // Guard Rail 2: Free Trial WhatsApp Cap (500 messages max per trial)
    const usage = await getClinicWhatsAppUsage(user.clinicId);
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'TRIAL_WHATSAPP_CAP_EXCEEDED',
        message: `Your free trial has reached the limit of ${usage.cap} WhatsApp messages (${usage.used} sent). Please upgrade to an annual plan to continue automated WhatsApp delivery.`,
        usage,
      }, { status: 403 });
    }

    const { prescriptionId, pdfBase64, overridePhone } = await request.json();

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

    // Strict Multi-Tenant Authorization Guard
    if (prescription.clinicId !== user.clinicId && user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden: Access to this prescription is not allowed for your clinic' },
        { status: 403 }
      );
    }

    // Ensure we have a destination phone number to send to
    const destinationPhone = overridePhone?.trim() || prescription.patient.phone;
    if (!destinationPhone) {
      return NextResponse.json({ error: 'No phone number provided for prescription delivery' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.rxnxt.in';
    const pdfDirectUrl = `${baseUrl.replace(/\/$/, '')}/api/prescriptions/${prescription.id}/pdf`;

    // Synthesize structured time-of-day Medication Schedule
    const formatted = formatPrescriptionSchedule({
      patientName: prescription.patient.name,
      clinicName: prescription.clinic.name,
      medicines: prescription.medicines || [],
      diagnosis: prescription.encounter?.diagnosis,
      doctorNotes: prescription.encounter?.notes,
      followUpDate: prescription.encounter?.followUpDate,
      pdfDirectUrl,
    });

    // Ensure PDF Base64 is generated if not sent by client (guaranteed fallback)
    let finalPdfBase64 = pdfBase64;
    if (!finalPdfBase64) {
      try {
        const doctor = await prisma.user.findUnique({
          where: { id: prescription.doctorId || user.id }
        });
        finalPdfBase64 = generatePrescriptionBase64({
          rxId: prescription.id,
          prescriptionId: prescription.id,
          patient: prescription.patient,
          medicines: (prescription.medicines || []).map(m => ({
            id: m.id,
            name: m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine',
            dosage_form: m.dosageForm || undefined,
            strength: m.strength || undefined,
            route: m.route || undefined,
            frequency: m.frequency || '',
            duration: m.duration || '',
            instructions: m.instructions || ''
          })),
          chiefComplaint: prescription.encounter?.chiefComplaint || undefined,
          diagnosis: prescription.encounter?.diagnosis || undefined,
          notes: prescription.encounter?.notes || undefined,
          followUpDate: prescription.encounter?.followUpDate || undefined,
          doctorName: doctor?.fullName || user.fullName || undefined,
          clinicName: prescription.clinic?.name || undefined,
          clinicAddress: prescription.clinic?.address || undefined,
          clinicPhone: prescription.clinic?.phone || undefined,
          doctorRegNo: doctor?.registrationNumber || undefined,
          doctorSpecialization: doctor?.specialization || undefined,
          verificationStatus: doctor?.verificationStatus || undefined,
          medicalCouncil: doctor?.medicalCouncil || undefined,
        });
      } catch (genErr) {
        console.warn('[Server PDF Gen Warning]:', genErr);
      }
    }

    // Dispatch WhatsApp Super-Prescription Message with Medication Schedule and Official PDF
    const result = await sendPrescriptionPDF(
      destinationPhone,
      prescription.patient.name,
      prescription.clinic.name,
      pdfDirectUrl,
      finalPdfBase64,
      prescription.clinicId,
      formatted.templateSummary,
      prescription.id,
      {
        templateSummary: formatted.templateSummary,
        fullMessageBody: formatted.fullMessageBody,
        slotDetails: formatted.slotDetails,
      }
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in send-prescription API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

