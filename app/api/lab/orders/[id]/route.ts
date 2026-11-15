// app/api/lab/orders/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { transitionPatientQueueToReturnedReady } from '@/lib/labQueueHelper';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const order = await prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            registrationNumber: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            logoUrl: true,
          },
        },
        tests: true,
      },
    });

    if (!order || order.clinicId !== user.clinicId) {
      return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
    }

    // Safely parse JSON results for frontend consumption
    const parsedTests = order.tests.map(t => {
      let parsedResults = [];
      try {
        parsedResults = t.results ? JSON.parse(t.results) : [];
      } catch {
        parsedResults = [];
      }
      return {
        ...t,
        results: parsedResults,
      };
    });

    return NextResponse.json({
      data: {
        ...order,
        tests: parsedTests,
      },
    });
  } catch (err: any) {
    console.error('Failed to get lab order:', err);
    return NextResponse.json({ error: err.message || 'Failed to get lab order' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { status, notes, priority, action, paymentMethod = 'UPI', amount } = body;

    const existing = await prisma.labOrder.findUnique({
      where: { id },
      include: { tests: true },
    });
    if (!existing || existing.clinicId !== user.clinicId) {
      return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
    }

    let updateData: any = {};
    let shouldRelease = false;

    if (action === 'COLLECT_PAYMENT') {
      const finalAmount = typeof amount === 'number' && amount > 0 ? amount : existing.totalAmount;
      updateData.paymentStatus = 'PAID';
      updateData.paymentMethod = paymentMethod;
      updateData.paidAt = new Date();
      updateData.totalAmount = finalAmount;

      // Auto-release if tests are already completed
      const allDone = existing.tests.length > 0 && existing.tests.every(t => t.status === 'COMPLETED');
      if (allDone || existing.status === 'COMPLETED') {
        updateData.releasedToDoctor = true;
        updateData.releasedAt = new Date();
        shouldRelease = true;
      }

      // Sync central billing record
      try {
        if (prisma.bill?.updateMany) {
          await prisma.bill.updateMany({
            where: {
              patientId: existing.patientId,
              clinicId: existing.clinicId,
              paymentStatus: 'PENDING',
            },
            data: {
              paymentStatus: 'PAID',
              paymentMode: paymentMethod,
            },
          });
        }
      } catch {}
    } else if (action === 'COLLECT_AND_RELEASE') {
      const finalAmount = typeof amount === 'number' && amount > 0 ? amount : existing.totalAmount;
      updateData.paymentStatus = 'PAID';
      updateData.paymentMethod = paymentMethod;
      updateData.paidAt = new Date();
      updateData.totalAmount = finalAmount;
      updateData.releasedToDoctor = true;
      updateData.releasedAt = new Date();
      shouldRelease = true;

      // Sync central billing record
      try {
        if (prisma.bill?.updateMany) {
          await prisma.bill.updateMany({
            where: {
              patientId: existing.patientId,
              clinicId: existing.clinicId,
              paymentStatus: 'PENDING',
            },
            data: {
              paymentStatus: 'PAID',
              paymentMode: paymentMethod,
            },
          });
        }
      } catch {}
    } else if (action === 'RELEASE_TO_DOCTOR') {
      updateData.releasedToDoctor = true;
      updateData.releasedAt = new Date();
      shouldRelease = true;
    } else {
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (priority) updateData.priority = priority;
    }

    const updated = await prisma.labOrder.update({
      where: { id },
      data: updateData,
      include: {
        tests: true,
        patient: true,
        doctor: true,
      },
    });

    let queueUpdated = false;
    if (shouldRelease) {
      queueUpdated = await transitionPatientQueueToReturnedReady({
        clinicId: existing.clinicId,
        patientId: existing.patientId,
        doctorId: existing.doctorId,
        queueItemId: existing.queueItemId,
      });
    }

    return NextResponse.json({
      success: true,
      order: updated,
      releasedToDoctor: updated.releasedToDoctor,
      queueUpdated,
    });
  } catch (err: any) {
    console.error('Failed to update lab order:', err);
    return NextResponse.json({ error: err.message || 'Failed to update lab order' }, { status: 500 });
  }
}
