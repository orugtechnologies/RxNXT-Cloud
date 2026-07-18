export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const doctors = await prisma.user.findMany({
      where: {
        clinicId: user.clinicId,
        role: 'doctor',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        specialization: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ doctors });
  } catch (error: any) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
