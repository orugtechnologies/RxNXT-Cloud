export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const groups = await prisma.treatmentGroup.findMany({
      where: { clinicId: user.clinicId, doctorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            drug: { select: { genericName: true, brandName: true } },
          },
        },
      },
    });

    const formatted = groups.map((g) => ({
      id: g.id,
      name: g.name,
      created_at: g.createdAt.toISOString(),
      items: g.items.map((item) => ({
        id: item.id,
        drugId: item.drugId,
        generic_id: item.drugId,
        brand_id: item.drugId,
        name: item.customName ?? item.drug?.brandName ?? item.drug?.genericName ?? '',
        dosage_form: item.dosageForm,
        strength: item.strength,
        route: item.route,
        frequency: item.frequency ?? '',
        duration: item.duration ?? '',
        instructions: item.instructions ?? '',
        sort_order: item.sortOrder,
      })),
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    console.error('Templates API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

