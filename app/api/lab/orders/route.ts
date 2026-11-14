// app/api/lab/orders/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { getTemplateForTest } from '@/lib/labTemplates';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const patientId = searchParams.get('patientId');
  const search = searchParams.get('search');

  try {
    const whereClause: any = {
      clinicId: user.clinicId,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (patientId) {
      whereClause.patientId = patientId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { patient: { name: { contains: q, mode: 'insensitive' } } },
        { patient: { phone: { contains: q } } },
      ];
    }

    const orders = await prisma.labOrder.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            age: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        },
        tests: {
          select: {
            id: true,
            testName: true,
            category: true,
            templateType: true,
            status: true,
            isAbnormal: true,
            completedAt: true,
            impression: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ data: orders });
  } catch (err: any) {
    console.error('Failed to fetch lab orders:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch lab orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, doctorId, queueItemId, encounterId, tests, priority = 'NORMAL', notes } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    if (!tests || !Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json({ error: 'At least one test must be specified' }, { status: 400 });
    }

    // Generate unique sequential order number: LAB-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.labOrder.count({
      where: {
        clinicId: user.clinicId,
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });
    const orderNumber = `LAB-${dateStr}-${String(countToday + 1).padStart(4, '0')}`;

    // Prepare test items with their default template parameters pre-populated
    const testItemsData = tests.map((t: any) => {
      const template = getTemplateForTest(t.testName || t.name);
      const defaultParamResults = template.parameters.map(p => ({
        id: p.id,
        name: p.name,
        value: p.defaultValue || '',
        unit: p.unit || '',
        referenceRange: p.referenceRange || '',
        isAbnormal: false,
        flag: 'NORMAL',
      }));

      return {
        testName: t.testName || t.name,
        category: t.category || template.category,
        templateType: template.type,
        status: 'PENDING',
        results: JSON.stringify(defaultParamResults),
        impression: template.defaultImpression || '',
        isAbnormal: false,
      };
    });

    // Queue Synchronization:
    // If patient already has a queue item today, transition it to IN_PROCEDURE and link it.
    // If no queue item exists today (e.g. doctor consulted directly without front desk token),
    // auto-create a QueueItem with status IN_PROCEDURE so the return loop works seamlessly!
    let resolvedQueueItemId = queueItemId || null;
    let targetDoctorId = doctorId || null;
    if (!targetDoctorId && (user.role === 'doctor' || user.role === 'clinic_admin' || user.role === 'admin')) {
      targetDoctorId = user.id;
    }
    if (!targetDoctorId && prisma.user?.findFirst) {
      const clinicDoctor = await prisma.user.findFirst({
        where: {
          clinicId: user.clinicId,
          role: { in: ['doctor', 'clinic_admin'] },
        },
        orderBy: { createdAt: 'asc' },
      });
      targetDoctorId = clinicDoctor?.id || null;
    }
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (resolvedQueueItemId) {
        try {
          await prisma.queueItem.update({
            where: { id: resolvedQueueItemId },
            data: { status: 'IN_PROCEDURE' },
          });
        } catch {}
      } else {
        const activeQueueItem = await prisma.queueItem.findFirst({
          where: {
            clinicId: user.clinicId,
            patientId,
            status: { in: ['WAITING', 'IN_CONSULTATION', 'IN_PROCEDURE', 'AWAY'] },
            createdAt: { gte: today },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (activeQueueItem) {
          await prisma.queueItem.update({
            where: { id: activeQueueItem.id },
            data: { status: 'IN_PROCEDURE' },
          });
          resolvedQueueItemId = activeQueueItem.id;
        } else if (targetDoctorId) {
          const todayCount = await prisma.queueItem.count({
            where: { clinicId: user.clinicId, createdAt: { gte: today } },
          });
          const newQueue = await prisma.queueItem.create({
            data: {
              clinicId: user.clinicId,
              patientId,
              doctorId: targetDoctorId,
              status: 'IN_PROCEDURE',
              tokenNumber: todayCount + 1,
            },
          });
          resolvedQueueItemId = newQueue.id;
        }
      }
    } catch (qErr) {
      console.warn('Queue linking warning in lab order creation:', qErr);
    }

    const newOrder = await prisma.labOrder.create({
      data: {
        orderNumber,
        clinicId: user.clinicId,
        patientId,
        doctorId: targetDoctorId,
        queueItemId: resolvedQueueItemId,
        encounterId: encounterId || null,
        status: 'ORDERED',
        priority,
        notes: notes || null,
        tests: {
          create: testItemsData,
        },
      },
      include: {
        tests: true,
        patient: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create lab order:', err);
    return NextResponse.json({ error: err.message || 'Failed to create lab order' }, { status: 500 });
  }
}
