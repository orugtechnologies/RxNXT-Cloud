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
    // When any lab test report is completed, if the patient is waiting in queue as IN_PROCEDURE,
    // transition them to RETURNED_READY so the doctor immediately sees "REPORTS READY" at the top of their queue!
    let queueUpdated = false;
    try {
      const activeQueueItem = await prisma.queueItem.findFirst({
        where: {
          clinicId: user.clinicId,
          patientId: parentOrder.patientId,
          status: 'IN_PROCEDURE',
        },
      });

      if (activeQueueItem) {
        await prisma.queueItem.update({
          where: { id: activeQueueItem.id },
          data: { status: 'RETURNED_READY' },
        });
        queueUpdated = true;
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
