export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
  }

  try {
    // Get the most recent prescription for this patient with all medicines
    const prescription = await prisma.prescription.findFirst({
      where: { patientId, clinicId: user.clinicId },
      orderBy: { createdAt: 'desc' },
      include: {
        encounter: {
          select: { chiefComplaint: true, diagnosis: true, notes: true },
        },
        medicines: {
          include: {
            drug: { select: { genericName: true, brandName: true } },
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ message: 'No recent prescription found', data: null });
    }

    const formattedMedicines = prescription.medicines.map((m) => ({
      id: m.id,
      drugId: m.drugId,
      name: m.customName ?? m.drug?.brandName ?? m.drug?.genericName ?? 'Unknown',
      dosage_form: m.dosageForm,
      strength: m.strength,
      route: m.route,
      frequency: m.frequency ?? '',
      duration: m.duration ?? '',
      instructions: m.instructions ?? '',
    }));

    return NextResponse.json({
      data: {
        chiefComplaint: prescription.encounter?.chiefComplaint ?? '',
        diagnosis: prescription.encounter?.diagnosis ?? '',
        notes: prescription.encounter?.notes ?? '',
        medicines: formattedMedicines,
      },
    });

  } catch (err: any) {
    console.error('Recent prescription error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

