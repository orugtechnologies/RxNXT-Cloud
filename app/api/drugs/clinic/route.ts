export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const drugs = await prisma.drug.findMany({
      where: { clinicId: user.clinicId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: drugs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized. Only clinic admins can add custom drugs.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { genericName, brandName, dosageForm, strength, route, aliases } = body;

    if (!genericName) {
      return NextResponse.json({ error: 'Generic Name is required' }, { status: 400 });
    }

    const newDrug = await prisma.drug.create({
      data: {
        genericName,
        brandName: brandName || null,
        dosageForm: dosageForm || null,
        strength: strength || null,
        route: route || null,
        aliases: aliases || null,
        clinicId: user.clinicId,
      }
    });

    return NextResponse.json({ data: newDrug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing drug ID' }, { status: 400 });
  }

  try {
    // Only delete if it belongs to this clinic
    const deleted = await prisma.drug.deleteMany({
      where: {
        id: id,
        clinicId: user.clinicId
      }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Drug not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

