// app/api/lab/results/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { evaluateOverallAbnormal, LabParameterResult } from '@/lib/labTemplates';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { results, impression, technicianName } = body;

    const testItem = await prisma.labTestResult.findUnique({
      where: { id },
      include: {
        labOrder: {
          include: {
            tests: true,
          },
        },
      },
    });

    if (!testItem || testItem.labOrder.clinicId !== user.clinicId) {
      return NextResponse.json({ error: 'Lab test item not found' }, { status: 404 });
    }

    const parsedResults: LabParameterResult[] = Array.isArray(results) ? results : [];
    const isAbnormal = evaluateOverallAbnormal(parsedResults);

    const updatedTest = await prisma.labTestResult.update({
      where: { id },
      data: {
        results: JSON.stringify(parsedResults),
        impression: impression || null,
        isAbnormal,
        status: 'COMPLETED',
        technicianId: user.id,
        technicianName: technicianName || user.fullName || 'Lab Technologist',
        completedAt: new Date(),
      },
    });

    // Check parent order completion
    const parentOrder = testItem.labOrder;
    const remainingPending = parentOrder.tests.filter(t => t.id !== id && t.status !== 'COMPLETED');

    let isOrderFullyCompleted = false;
    if (remainingPending.length === 0) {
      isOrderFullyCompleted = true;
      await prisma.labOrder.update({
        where: { id: parentOrder.id },
        data: { status: 'COMPLETED' },
      });
    } else {
      await prisma.labOrder.update({
        where: { id: parentOrder.id },
        data: { status: 'PROCESSING' },
      });
    }

    // Bidirectional Queue Transition:
    // When any lab test report is completed, transition patient to RETURNED_READY so the doctor immediately sees "REPORTS READY" at the top of their queue!
    let queueUpdated = false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check parentOrder.queueItemId first
      if (parentOrder.queueItemId) {
        await prisma.queueItem.update({
          where: { id: parentOrder.queueItemId },
          data: { status: 'RETURNED_READY' },
        });
        queueUpdated = true;
      } else {
        // Check for any active queue item today (IN_PROCEDURE, WAITING, or stepped out)
        const activeQueueItem = await prisma.queueItem.findFirst({
          where: {
            clinicId: parentOrder.clinicId,
            patientId: parentOrder.patientId,
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
          try {
            await prisma.labOrder.update({
              where: { id: parentOrder.id },
              data: { queueItemId: activeQueueItem.id },
            });
          } catch {}
          queueUpdated = true;
        } else {
          // If no active queue item exists today (e.g. direct lab order without receptionist token),
          // auto-create a RETURNED_READY queue item for the referring doctor
          let targetDoctorId = parentOrder.doctorId;
          if (!targetDoctorId && prisma.user?.findFirst) {
            const clinicDoctor = await prisma.user.findFirst({
              where: {
                clinicId: parentOrder.clinicId,
                role: { in: ['doctor', 'clinic_admin'] },
              },
              orderBy: { createdAt: 'asc' },
            });
            targetDoctorId = clinicDoctor?.id || null;
          }

          if (targetDoctorId) {
            const todayCount = await prisma.queueItem.count({
              where: { clinicId: parentOrder.clinicId, createdAt: { gte: today } },
            });
            const createdQueue = await prisma.queueItem.create({
              data: {
                clinicId: parentOrder.clinicId,
                patientId: parentOrder.patientId,
                doctorId: targetDoctorId,
                status: 'RETURNED_READY',
                tokenNumber: todayCount + 1,
              },
            });
            try {
              await prisma.labOrder.update({
                where: { id: parentOrder.id },
                data: {
                  doctorId: targetDoctorId,
                  queueItemId: createdQueue.id,
                },
              });
            } catch {}
            queueUpdated = true;
          }
        }
      }
    } catch (queueErr) {
      console.warn('Queue transition warning on test completion:', queueErr);
    }

    return NextResponse.json({
      success: true,
      test: {
        ...updatedTest,
        results: parsedResults,
      },
      isOrderFullyCompleted,
      queueUpdated,
    });
  } catch (err: any) {
    console.error('Failed to update test results:', err);
    return NextResponse.json({ error: err.message || 'Failed to update test results' }, { status: 500 });
  }
}
