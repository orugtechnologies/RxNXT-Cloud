import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePrescriptionBuffer } from '@/lib/prescriptionPdfGenerator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');

    if (!prescriptionId) {
      return new NextResponse('Prescription ID is required', { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        patient: true,
        clinic: true,
        medicines: {
          include: {
            drug: true,
          },
        },
        encounter: true,
      },
    });

    if (!prescription) {
      return new NextResponse('Prescription not found', { status: 404 });
    }

    let doctor: any = null;
    if (prescription.doctorId) {
      doctor = await prisma.user.findUnique({
        where: { id: prescription.doctorId },
      });
    }

    const pdfBuffer = generatePrescriptionBuffer({
      patient: prescription.patient,
      medicines: (prescription.medicines || []).map((m) => ({
        id: m.id,
        name: m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine',
        dosage_form: m.dosageForm || undefined,
        strength: m.strength || undefined,
        route: m.route || undefined,
        frequency: m.frequency || '',
        duration: m.duration || '',
        instructions: m.instructions || '',
      })),
      chiefComplaint: prescription.encounter?.chiefComplaint || undefined,
      diagnosis: prescription.encounter?.diagnosis || undefined,
      notes: prescription.encounter?.notes || undefined,
      followUpDate: prescription.encounter?.followUpDate || undefined,
      doctorName: doctor?.fullName || undefined,
      clinicName: prescription.clinic?.name || undefined,
      clinicAddress: prescription.clinic?.address || undefined,
      clinicPhone: prescription.clinic?.phone || undefined,
      doctorRegNo: doctor?.registrationNumber || undefined,
      doctorSpecialization: doctor?.specialization || undefined,
      verificationStatus: doctor?.verificationStatus || undefined,
      medicalCouncil: doctor?.medicalCouncil || undefined,
    });

    const safePatientName = (prescription.patient?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `RxNXT_Prescription_${safePatientName}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error in prescriptions/pdf route:', error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}
