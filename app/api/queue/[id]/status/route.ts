export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await request.json();

    if (!['WAITING', 'AWAY', 'SKIPPED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedItem = await prisma.queueItem.update({
      where: {
        id: params.id,
        clinicId: user.clinicId,
      },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error('Queue Status Update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
