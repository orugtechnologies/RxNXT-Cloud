export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: {
        subscriptionTier: true,
        baseSeats: true,
        additionalSeats: true,
      },
    });

    const activeDoctorCount = await prisma.user.count({
      where: {
        clinicId: user.clinicId,
        role: { in: ['doctor', 'clinic_admin'] },
        status: 'ACTIVE',
      },
    });

    const totalSeats = (clinic?.baseSeats || 1) + (clinic?.additionalSeats || 0);

    return NextResponse.json({
      success: true,
      tier: clinic?.subscriptionTier || 'SOLO_GP',
      baseSeats: clinic?.baseSeats || 1,
      additionalSeats: clinic?.additionalSeats || 0,
      totalSeats,
      activeDoctorCount,
      availableSeats: Math.max(0, totalSeats - activeDoctorCount),
      seatPriceMonthly: 499,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch seats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { seatsToAdd = 1, paymentRef } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.clinic.update({
        where: { id: user.clinicId },
        data: {
          additionalSeats: { increment: Number(seatsToAdd) },
        },
        select: {
          id: true,
          baseSeats: true,
          additionalSeats: true,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${seatsToAdd} additional doctor seat(s).`,
      totalSeats: result.baseSeats + result.additionalSeats,
      additionalSeats: result.additionalSeats,
    });
  } catch (err: any) {
    console.error('Error adding seats:', err);
    return NextResponse.json({ error: err.message || 'Failed to purchase seat' }, { status: 500 });
  }
}
