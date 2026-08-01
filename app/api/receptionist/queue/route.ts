export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queueItems = await prisma.queueItem.findMany({
      where: {
        clinicId: user.clinicId,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, phone: true, age: true, gender: true } },
        doctor: { select: { fullName: true, specialization: true } },
      },
    });

    const formattedQueue = queueItems.map((q) => ({
      id: q.id,
      patient_id: q.patientId,
      patient_name: q.patient.name,
      patient_phone: q.patient.phone,
      patient_age: q.patient.age,
      patient_gender: q.patient.gender,
      doctor_name: q.doctor.fullName,
      doctor_specialization: q.doctor.specialization,
      waiting_since: q.createdAt.toISOString(),
      status: q.status,
    }));

    return NextResponse.json({ success: true, data: formattedQueue });
  } catch (error: any) {
    console.error('Queue API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
