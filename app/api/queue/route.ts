export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { patientId, doctorId } = await request.json();

    if (!patientId || !doctorId) {
      return NextResponse.json({ error: 'Patient ID and Doctor ID are required' }, { status: 400 });
    }

    // Check if there is already a WAITING queue item for this patient today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingQueueItem = await prisma.queueItem.findFirst({
      where: {
        clinicId: user.clinicId,
        patientId,
        status: 'WAITING',
        createdAt: { gte: today },
      },
    });

    if (existingQueueItem) {
      // Update it to the new doctor if it exists
      const updatedItem = await prisma.queueItem.update({
        where: { id: existingQueueItem.id },
        data: { doctorId },
      });
      return NextResponse.json({ success: true, data: updatedItem });
    }

    const newQueueItem = await prisma.queueItem.create({
      data: {
        clinicId: user.clinicId,
        doctorId,
        patientId,
        status: 'WAITING',
      },
    });

    return NextResponse.json({ success: true, data: newQueueItem }, { status: 201 });
  } catch (error: any) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
