export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const metrics = await prisma.prescription.groupBy({
      by: ['creationMethod'],
      where: {
        clinicId: user.clinicId,
        doctorId: user.id,
        timeTakenSeconds: { not: null }
      },
      _avg: { timeTakenSeconds: true },
      _count: { _all: true },
    });

    const recentPrescriptions = await prisma.prescription.findMany({
      where: {
        clinicId: user.clinicId,
        doctorId: user.id,
        timeTakenSeconds: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        timeTakenSeconds: true,
        creationMethod: true,
        patient: { select: { name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      metrics,
      recent: recentPrescriptions
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
