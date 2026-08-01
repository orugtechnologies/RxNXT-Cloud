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

    // Auto-backfill missing token numbers for backwards compatibility
    const itemsWithoutToken = queueItems.filter(q => q.tokenNumber === null);
    if (itemsWithoutToken.length > 0) {
      let maxToken = await prisma.queueItem.aggregate({
        where: { clinicId: user.clinicId, createdAt: { gte: today } },
        _max: { tokenNumber: true }
      });
      let currentMax = maxToken._max.tokenNumber || 0;

      // Update them from oldest to newest so they get sequential numbers
      const sortedWithoutToken = itemsWithoutToken.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      for (const item of sortedWithoutToken) {
        currentMax++;
        await prisma.queueItem.update({
          where: { id: item.id },
          data: { tokenNumber: currentMax }
        });
        item.tokenNumber = currentMax; // update in-memory so it returns correctly
      }
    }

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
      tokenNumber: q.tokenNumber,
    }));

    return NextResponse.json({ success: true, data: formattedQueue });
  } catch (error: any) {
    console.error('Queue API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
