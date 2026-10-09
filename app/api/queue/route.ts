export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { getClinicSubscription, isDemoEmail } from '@/lib/subscription';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let clinicId = user.clinicId;
    if (!clinicId) {
      const clinic = await prisma.clinic.findFirst();
      if (clinic) clinicId = clinic.id;
    }

    if (!isDemoEmail(user.email)) {
      const sub = await getClinicSubscription(clinicId);
      if (!sub.allowed) {
        return NextResponse.json({
          error: 'SUBSCRIPTION_EXPIRED',
          message: 'Your 14-day trial or subscription has expired. Please renew your subscription to manage patient queue.',
          subscription: sub,
        }, { status: 403 });
      }
    }

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
      let currentToken = existingQueueItem.tokenNumber;
      if (!currentToken) {
        const todayCount = await prisma.queueItem.count({
          where: { clinicId: user.clinicId, createdAt: { gte: today } }
        });
        currentToken = todayCount + 1;
      }

      // Update it to the new doctor and assign token if missing
      const updatedItem = await prisma.queueItem.update({
        where: { id: existingQueueItem.id },
        data: { doctorId, tokenNumber: currentToken },
      });
      return NextResponse.json({ success: true, data: updatedItem });
    }

    const todayCount = await prisma.queueItem.count({
      where: {
        clinicId: user.clinicId,
        createdAt: { gte: today },
      }
    });
    const tokenNumber = todayCount + 1;

    const newQueueItem = await prisma.queueItem.create({
      data: {
        clinicId: user.clinicId,
        doctorId,
        patientId,
        status: 'WAITING',
        tokenNumber,
      },
    });

    return NextResponse.json({ success: true, data: newQueueItem }, { status: 201 });
  } catch (error: any) {
    console.error('Queue error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
