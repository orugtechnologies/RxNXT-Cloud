export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const patientId = searchParams.get('patientId');
  const skip = (page - 1) * limit;

  const where: any = { clinicId: user.clinicId };
  if (patientId) where.patientId = patientId;

  const [prescriptions, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        patient: { select: { name: true, age: true, gender: true } },
        encounter: { select: { chiefComplaint: true, diagnosis: true, followUpDate: true } },
        medicines: { select: { id: true } },
      },
    }),
    prisma.prescription.count({ where }),
  ]);

  const formatted = prescriptions.map((rx) => ({
    id: rx.id,
    created_at: rx.createdAt.toISOString(),
    patient_id: rx.patientId,
    patient_name: rx.patient.name,
    patient_age: rx.patient.age,
    patient_gender: rx.patient.gender,
    chief_complaint: rx.encounter?.chiefComplaint ?? null,
    diagnosis: rx.encounter?.diagnosis ?? null,
    follow_up_date: rx.encounter?.followUpDate ?? null,
    medicine_count: rx.medicines.length,
  }));

  return NextResponse.json({
    prescriptions: formatted,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

