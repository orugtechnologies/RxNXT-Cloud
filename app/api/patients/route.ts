export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { getClinicSubscription, isDemoEmail } from '@/lib/subscription';

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
    let clinicId = user.clinicId;
    if (!clinicId) {
      const clinic = await prisma.clinic.findFirst();
      if (clinic) clinicId = clinic.id;
    }

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic context not found' }, { status: 400 });
    }

    // Demo accounts have lifetime access and are never blocked by subscription
    if (!isDemoEmail(user.email)) {
      const sub = await getClinicSubscription(clinicId);
      if (!sub.allowed) {
        return NextResponse.json({
          error: 'SUBSCRIPTION_EXPIRED',
          message: 'Your 14-day trial or subscription has expired. Please renew your subscription to continue adding patients.',
          subscription: sub,
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, phone, age, gender, address } = body;
    if (!phone) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });

    let cleanPhone = phone.replace(/(?!^\+)[^\d]/g, '').replace(/^0+/, '');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+91${cleanPhone}`;
    }

    // Check if patient already exists in this clinic by phone
    let patient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: cleanPhone,
      },
    });

    if (patient) {
      // Gracefully update patient details with any newly provided info
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          name: name.trim() || patient.name,
          age: age ? parseInt(age) : patient.age,
          gender: gender || patient.gender,
        },
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          clinicId,
          name: name.trim(),
          phone: cleanPhone,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          address: address || null,
        },
      });
    }

    return NextResponse.json({ data: {
      id: patient.id,
      name: patient.name,
      phone: patient.phone ?? '',
      age: patient.age ?? 0,
      gender: patient.gender ?? '',
    }}, { status: 201 });
  } catch (err: any) {
    console.error('Error saving patient:', err);
    return NextResponse.json({ error: err.message || 'Failed to save patient' }, { status: 500 });
  }
}

