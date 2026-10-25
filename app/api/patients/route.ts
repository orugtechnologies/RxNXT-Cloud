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
    whatsappConsent: p.whatsappConsent ?? true,
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
          error: sub.isUsageLocked ? 'TRIAL_USAGE_LIMIT_REACHED' : 'SUBSCRIPTION_EXPIRED',
          message: sub.isUsageLocked
            ? `Your 150-prescription free trial has ended (${sub.prescriptionsCount || 150}/${sub.trialPrescriptionCap || 150} used). Please select a subscription plan to continue adding patients.`
            : 'Your subscription has expired. Please renew your subscription to continue adding patients.',
          subscription: sub,
        }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, phone, age, gender, address, whatsappConsent } = body;
    if (!phone) return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });

    let cleanPhone = phone.replace(/(?!^\+)[^\d]/g, '').replace(/^0+/, '');
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+91${cleanPhone}`;
    }

    // Check if a patient with the exact same name and phone already exists in this clinic
    const trimmedName = name.trim();
    let existingPatient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: cleanPhone,
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existingPatient) {
      return NextResponse.json({
        error: 'DUPLICATE_PATIENT',
        message: `A patient named "${existingPatient.name}" is already registered with mobile number ${cleanPhone}. Please select them from the search directory.`,
        patient: {
          id: existingPatient.id,
          name: existingPatient.name,
          phone: existingPatient.phone ?? '',
          age: existingPatient.age ?? 0,
          gender: existingPatient.gender ?? '',
          whatsappConsent: existingPatient.whatsappConsent ?? true,
        }
      }, { status: 409 });
    }

    // Family member sharing phone number or new number: create separate patient record
    const newPatient = await prisma.patient.create({
      data: {
        clinicId,
        name: trimmedName,
        phone: cleanPhone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        address: address || null,
        whatsappConsent: whatsappConsent !== undefined ? Boolean(whatsappConsent) : true,
      },
    });

    return NextResponse.json({ data: {
      id: newPatient.id,
      name: newPatient.name,
      phone: newPatient.phone ?? '',
      age: newPatient.age ?? 0,
      gender: newPatient.gender ?? '',
      whatsappConsent: newPatient.whatsappConsent ?? true,
    }}, { status: 201 });
  } catch (err: any) {
    console.error('Error saving patient:', err);
    return NextResponse.json({ error: err.message || 'Failed to save patient' }, { status: 500 });
  }
}

