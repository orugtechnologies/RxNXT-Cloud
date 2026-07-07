export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  // Create a sanitized phone search string (strip +91, spaces, dashes)
  let cleanPhone = '';
  if (q) {
    cleanPhone = q.replace(/(?!^\+)[^\d]/g, '').replace(/^0+/, '');
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.replace('+91', '');
    }
  }

  const patients = await prisma.patient.findMany({
    where: {
      clinicId: user.clinicId,
      ...(q && {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
          // If the query contains numbers, search against the clean version too
          ...(cleanPhone.length > 0 ? [{ phone: { contains: cleanPhone } }] : []),
        ],
      }),
    },
    orderBy: { name: 'asc' },
    take: 20,
  });

  return NextResponse.json({ data: patients.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone ?? '',
    age: p.age ?? 0,
    gender: p.gender ?? '',
  })) });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, phone, age, gender } = await request.json();
    if (!phone) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });

    let cleanPhone = phone.replace(/(?!^\+)[^\d]/g, '').replace(/^0+/, '');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+91${cleanPhone}`;
    }

    const patient = await prisma.patient.create({
      data: {
        clinicId: user.clinicId,
        name,
        phone: cleanPhone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
      },
    });

    return NextResponse.json({ data: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone ?? '',
      age: patient.age ?? 0,
      gender: patient.gender ?? '',
    }}, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

