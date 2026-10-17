export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = params;
    const { bp, pulse, temperature, weight, height, spo2 } = await request.json();

    const queueItem = await prisma.queueItem.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!queueItem) {
      return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
    }

    if (queueItem.clinicId !== user.clinicId) {
      return NextResponse.json({ error: 'Unauthorized for this clinic' }, { status: 403 });
    }

    const updated = await prisma.queueItem.update({
      where: { id },
      data: {
        ...(bp !== undefined && { bp: bp ? String(bp).trim() : null }),
        ...(pulse !== undefined && { pulse: pulse ? String(pulse).trim() : null }),
        ...(temperature !== undefined && { temperature: temperature ? String(temperature).trim() : null }),
        ...(weight !== undefined && { weight: weight ? String(weight).trim() : null }),
        ...(height !== undefined && { height: height ? String(height).trim() : null }),
        ...(spo2 !== undefined && { spo2: spo2 ? String(spo2).trim() : null }),
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update vitals error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
