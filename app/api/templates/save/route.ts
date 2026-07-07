export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, medicines } = await request.json();

    if (!name || !medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'Template name and medicines are required' }, { status: 400 });
    }

    const group = await prisma.treatmentGroup.create({
      data: {
        name,
        clinicId: user.clinicId,
        doctorId: user.id,
        items: {
          create: medicines.map((med: any, index: number) => ({
            drugId: med.drugId || null,
            customName: med.name || null,
            dosageForm: med.dosage_form || null,
            strength: med.strength || null,
            route: med.route || null,
            frequency: med.frequency || null,
            duration: med.duration || null,
            instructions: med.instructions || null,
            sortOrder: index,
          })),
        },
      },
    });

    // Increment preference scores since creating a template is a very strong usage signal!
    const drugIds = medicines.map((m: any) => m.drugId).filter(Boolean);
    if (drugIds.length > 0) {
      await Promise.all(
        drugIds.map(async (id: string) => {
          // Global
          await prisma.drug.update({
            where: { id },
            data: { prescriptionCount: { increment: 1 } },
          });
          // Doctor Preference
          await prisma.doctorDrugPreference.upsert({
            where: { doctorId_drugId: { doctorId: user.id, drugId: id } },
            update: { count: { increment: 1 } },
            create: { doctorId: user.id, drugId: id, count: 1 },
          });
          // Clinic Preference
          await prisma.clinicDrugPreference.upsert({
            where: { clinicId_drugId: { clinicId: user.clinicId, drugId: id } },
            update: { count: { increment: 1 } },
            create: { clinicId: user.clinicId, drugId: id, count: 1 },
          });
        })
      );
    }

    return NextResponse.json({ data: { id: group.id }, message: 'Treatment group saved' }, { status: 201 });
  } catch (err: any) {
    console.error('Error saving template:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

