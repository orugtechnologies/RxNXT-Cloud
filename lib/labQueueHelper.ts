// lib/labQueueHelper.ts
// Helper to transition patient OPD queue item back to RETURNED_READY for doctor consultation

import { prisma } from './prisma';

export async function transitionPatientQueueToReturnedReady(params: {
  clinicId: string;
  patientId: string;
  doctorId?: string | null;
  queueItemId?: string | null;
}): Promise<boolean> {
  const { clinicId, patientId, doctorId, queueItemId } = params;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. If queueItemId is known, update directly
    if (queueItemId) {
      await prisma.queueItem.update({
        where: { id: queueItemId },
        data: { status: 'RETURNED_READY' },
      });
      return true;
    }

    // 2. Check for active queue item today (IN_PROCEDURE, WAITING, or AWAY)
    const activeQueueItem = await prisma.queueItem.findFirst({
      where: {
        clinicId,
        patientId,
        status: { in: ['IN_PROCEDURE', 'WAITING', 'AWAY'] },
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activeQueueItem) {
      await prisma.queueItem.update({
        where: { id: activeQueueItem.id },
        data: { status: 'RETURNED_READY' },
      });
      return true;
    }

    // 3. Fallback: auto-create a RETURNED_READY queue token for referring or clinic doctor
    let targetDoctorId = doctorId || null;
    if (!targetDoctorId && prisma.user?.findFirst) {
      const clinicDoctor = await prisma.user.findFirst({
        where: {
          clinicId,
          role: { in: ['doctor', 'clinic_admin'] },
        },
        orderBy: { createdAt: 'asc' },
      });
      targetDoctorId = clinicDoctor?.id || null;
    }

    if (targetDoctorId) {
      const todayCount = await prisma.queueItem.count({
        where: { clinicId, createdAt: { gte: today } },
      });
      await prisma.queueItem.create({
        data: {
          clinicId,
          patientId,
          doctorId: targetDoctorId,
          status: 'RETURNED_READY',
          tokenNumber: todayCount + 1,
        },
      });
      return true;
    }
  } catch (err) {
    console.warn('Queue transition error in labQueueHelper:', err);
  }
  return false;
}
