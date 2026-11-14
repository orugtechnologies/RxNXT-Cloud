// app/api/lab/orders/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

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
    const { status, notes, priority } = body;

    const existing = await prisma.labOrder.findUnique({ where: { id } });
    if (!existing || existing.clinicId !== user.clinicId) {
      return NextResponse.json({ error: 'Lab order not found' }, { status: 404 });
    }

    const updated = await prisma.labOrder.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(priority ? { priority } : {}),
      },
      include: {
        tests: true,
        patient: true,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Failed to update lab order:', err);
    return NextResponse.json({ error: err.message || 'Failed to update lab order' }, { status: 500 });
  }
}
