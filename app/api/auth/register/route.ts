export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fullName, email, password, clinicName, specialization, phone, inviteCode } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }
    
    if (!inviteCode && !clinicName) {
      return NextResponse.json({ error: 'Clinic name is required when creating a new clinic.' }, { status: 400 });
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

    // Create clinic (or use existing) + doctor in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let activeClinicId = '';
      let assignedRole = 'clinic_admin';
      let assignedStatus = 'ACTIVE';

      if (inviteCode) {
        const existingClinic = await tx.clinic.findUnique({ where: { inviteCode } });
        if (!existingClinic) {
          throw new Error("Invalid or expired invite link. Please ask your admin for a new link.");
        }
        activeClinicId = existingClinic.id;
        assignedRole = 'doctor';
        assignedStatus = 'PENDING';
      } else {
        const newClinic = await tx.clinic.create({
          data: { name: clinicName },
        });
        activeClinicId = newClinic.id;
      }

      const user = await tx.user.create({
        data: {
          fullName,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: assignedRole,
          status: assignedStatus,
          clinicId: activeClinicId,
          specialization: specialization || null,
          phone: phone || null,
        },
      });

      return { clinicId: activeClinicId, user };
    });

    return NextResponse.json({
      message: 'Account created successfully.',
      clinicId: result.clinicId,
      userId: result.user.id,
      status: result.user.status
    }, { status: 201 });

  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

