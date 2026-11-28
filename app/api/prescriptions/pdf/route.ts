import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePrescriptionBuffer } from '@/lib/prescriptionPdfGenerator';
import { getCompletedLabReportsForPatient } from '@/lib/prescriptionLabHelper';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { verifyPrescriptionPdfToken } from '@/lib/prescriptionToken';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');

    if (!prescriptionId) {
      return new NextResponse('Prescription ID is required', { status: 400 });
    }

    // 1. First fetch minimal prescription header to authorize BEFORE loading full PHI
    const rxHeader = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { id: true, clinicId: true, patientId: true },
    });

    if (!rxHeader) {
      return new NextResponse('Prescription not found', { status: 404 });
    }

    // 2. Authorization check: Either active clinic user session OR valid HMAC signature token
    const user = await getAuthenticatedUser();
    const token = searchParams.get('token');

    const isClinicUser = user && (user.clinicId === rxHeader.clinicId || user.role === 'superadmin');
    const hasValidToken = verifyPrescriptionPdfToken(prescriptionId, token);

    if (!isClinicUser && !hasValidToken) {
      return new NextResponse('Unauthorized: Access denied. Valid login or signed link required.', { status: 403 });
    }

    // 3. Authorized — now load complete clinical details
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

    const labReports = await getCompletedLabReportsForPatient({
      patientId: prescription.patientId,
      clinicId: prescription.clinicId,
      referenceDate: prescription.createdAt,
      fallbackDoctorName: doctor?.fullName,
      fallbackClinic: prescription.clinic ? {
        name: prescription.clinic.name,
        address: prescription.clinic.address,
        phone: prescription.clinic.phone,
      } : undefined,
      patient: prescription.patient ? {
        name: prescription.patient.name,
        age: prescription.patient.age,
        gender: prescription.patient.gender,
        phone: prescription.patient.phone,
      } : undefined,
    });

    const pdfBuffer = generatePrescriptionBuffer({
      rxId: prescription.id,
      prescriptionId: prescription.id,
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
      labReports,
    });

    const safePatientName = (prescription.patient?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `RxNXT_Prescription_${safePatientName}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Error in prescriptions/pdf route:', error);
    return new NextResponse('Internal error generating prescription document', { status: 500 });
  }
}
