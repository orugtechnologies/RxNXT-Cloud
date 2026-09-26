export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const filter = searchParams.get('filter'); // 'low_stock' | 'expiring_soon' | 'all'

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const items = await prisma.pharmacyItem.findMany({
      where: {
        clinicId: user.clinicId,
        isActive: true,
        ...(q && {
          OR: [
            { medicineName: { contains: q, mode: 'insensitive' } },
            { genericName: { contains: q, mode: 'insensitive' } },
            { batchNumber: { contains: q, mode: 'insensitive' } },
            { rackLocation: { contains: q, mode: 'insensitive' } },
          ],
        }),
        ...(filter === 'low_stock' && {
          quantityInStock: { lte: 20 },
        }),
        ...(filter === 'expiring_soon' && {
          expiryDate: { lte: thirtyDaysFromNow },
        }),
      },
      orderBy: { medicineName: 'asc' },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Fetch Pharmacy Inventory Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      medicineName,
      genericName,
      dosageForm,
      strength,
      batchNumber,
      expiryDate,
      quantityInStock,
      minReorderLevel,
      unitPrice,
      costPrice,
      rackLocation,
    } = await request.json();

    if (!medicineName) {
      return NextResponse.json({ error: 'Medicine name is required.' }, { status: 400 });
    }

    const item = await prisma.pharmacyItem.create({
      data: {
        clinicId: user.clinicId,
        medicineName,
        genericName: genericName || null,
        dosageForm: dosageForm || 'Tablet',
        strength: strength || null,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quantityInStock: Number(quantityInStock) || 0,
        minReorderLevel: Number(minReorderLevel) || 10,
        unitPrice: Number(unitPrice) || 0.0,
        costPrice: costPrice ? Number(costPrice) : null,
        rackLocation: rackLocation || null,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    console.error('Create Pharmacy Item Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, quantityInStock, unitPrice, costPrice, batchNumber, expiryDate, rackLocation, minReorderLevel } = await request.json();

    if (!id) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    const item = await prisma.pharmacyItem.findFirst({
      where: { id, clinicId: user.clinicId },
    });

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    const updated = await prisma.pharmacyItem.update({
      where: { id },
      data: {
        ...(quantityInStock !== undefined && { quantityInStock: Number(quantityInStock) }),
        ...(unitPrice !== undefined && { unitPrice: Number(unitPrice) }),
        ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
        ...(batchNumber !== undefined && { batchNumber }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(rackLocation !== undefined && { rackLocation }),
        ...(minReorderLevel !== undefined && { minReorderLevel: Number(minReorderLevel) }),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('Update Pharmacy Item Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
