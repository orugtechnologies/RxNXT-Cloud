export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized. Only clinic admins can upload custom drugs.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { drugs } = body;

    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
      return NextResponse.json({ error: 'No valid drug data provided in the payload' }, { status: 400 });
    }

    // Filter and map the payload to match our schema
    const newDrugsData = drugs
      .filter((d: any) => d.genericName && d.genericName.trim() !== '')
      .map((d: any) => ({
        genericName: d.genericName.trim(),
        brandName: d.brandName?.trim() || null,
        dosageForm: d.dosageForm?.trim() || null,
        strength: d.strength?.trim() || null,
        route: d.route?.trim() || null,
        aliases: d.aliases?.trim() || null,
        clinicId: user.clinicId,
      }));

    if (newDrugsData.length === 0) {
      return NextResponse.json({ error: 'No valid drugs found. genericName is required.' }, { status: 400 });
    }

    const result = await prisma.drug.createMany({
      data: newDrugsData,
    });

    return NextResponse.json({ data: { insertedCount: result.count } });
  } catch (err: any) {
    console.error("CSV Upload Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

