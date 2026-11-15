// app/api/lab/results/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { evaluateOverallAbnormal, LabParameterResult } from '@/lib/labTemplates';
import { transitionPatientQueueToReturnedReady } from '@/lib/labQueueHelper';

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

    // Smart Gating & Queue Transition:
    // FLOW A: If order is ALREADY PAID (or ₹0), automatically release report to Doctor and transition queue to RETURNED_READY!
    // FLOW B: If order is PAYMENT PENDING, do NOT notify the doctor yet. The report is held at the lab counter until fee is collected.
    const isPaid = parentOrder.paymentStatus === 'PAID' || parentOrder.totalAmount === 0;
    let queueUpdated = false;

    if (isPaid) {
      await prisma.labOrder.update({
        where: { id: parentOrder.id },
        data: {
          releasedToDoctor: true,
          releasedAt: new Date(),
        },
      });

      queueUpdated = await transitionPatientQueueToReturnedReady({
        clinicId: parentOrder.clinicId,
        patientId: parentOrder.patientId,
        doctorId: parentOrder.doctorId,
        queueItemId: parentOrder.queueItemId,
      });
    }

    return NextResponse.json({
      success: true,
      test: {
        ...updatedTest,
        results: parsedResults,
      },
      isOrderFullyCompleted,
      isPaid,
      autoDelivered: isPaid,
      queueUpdated,
    });
  } catch (err: any) {
    console.error('Failed to update test results:', err);
    return NextResponse.json({ error: err.message || 'Failed to update test results' }, { status: 500 });
  }
}
