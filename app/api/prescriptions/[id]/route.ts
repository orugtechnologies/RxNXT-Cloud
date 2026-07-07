import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const prescription = await prisma.prescription.findFirst({
      where: { id: params.id, clinicId: user.clinicId },
      include: {
        patient: true,
        encounter: true,
        medicines: {
          include: {
            drug: true,
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
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
        id: prescription.id,
        patient: {
          id: prescription.patient.id,
          name: prescription.patient.name,
          phone: prescription.patient.phone,
          age: prescription.patient.age,
          gender: prescription.patient.gender,
        },
        chiefComplaint: prescription.encounter?.chiefComplaint ?? '',
        diagnosis: prescription.encounter?.diagnosis ?? '',
        notes: prescription.encounter?.notes ?? '',
        medicines: formattedMedicines,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
