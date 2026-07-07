export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fullName, email, password, clinicName, specialization, phone } = await request.json();

    if (!fullName || !email || !password || !clinicName) {
      return NextResponse.json({ error: 'Name, email, password and clinic name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create clinic + doctor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: { name: clinicName },
      });

      const user = await tx.user.create({
        data: {
          fullName,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'clinic_admin',
          clinicId: clinic.id,
          specialization: specialization || null,
          phone: phone || null,
        },
      });

      return { clinic, user };
    });

    return NextResponse.json({
      message: 'Clinic and account created successfully.',
      clinicId: result.clinic.id,
      userId: result.user.id,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

