export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { 
      fullName, 
      email, 
      password, 
      clinicName, 
      clinicAddress, 
      clinicPhone, 
      specialization, 
      phone, 
      inviteCode 
    } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email/User ID, and password are required.' }, { status: 400 });
    }
    
    if (!inviteCode && !clinicName) {
      return NextResponse.json({ error: 'Clinic name is required when creating a new clinic.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email/User ID already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create clinic (or link to existing) + user account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let activeClinicId = '';
      let assignedRole = 'clinic_admin';
      let assignedStatus = 'ACTIVE';

      if (inviteCode) {
        const existingClinic = await tx.clinic.findUnique({ where: { inviteCode } });
        if (!existingClinic) {
          throw new Error("Invalid or expired invite link. Please ask your clinic administrator for a new link.");
        }
        activeClinicId = existingClinic.id;
        assignedRole = 'doctor';
        assignedStatus = 'ACTIVE';
      } else {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        const newClinic = await tx.clinic.create({
          data: {
            name: clinicName.trim(),
            address: clinicAddress?.trim() || null,
            phone: clinicPhone?.trim() || phone?.trim() || null,
            email: cleanEmail,
            subscriptionStatus: 'TRIAL',
            subscriptionPlan: 'TRIAL_14_DAYS',
            subscriptionStartedAt: now,
            trialEndsAt: trialEnd,
            subscriptionEndsAt: trialEnd,
          },
        });
        activeClinicId = newClinic.id;
      }

      // Format doctor/user display name cleanly
      let formattedName = fullName.trim();

      const user = await tx.user.create({
        data: {
          fullName: formattedName,
          email: cleanEmail,
          password: hashedPassword,
          role: assignedRole,
          status: assignedStatus,
          clinicId: activeClinicId,
          specialization: specialization?.trim() || 'General Physician',
          phone: phone?.trim() || clinicPhone?.trim() || null,
          verificationStatus: 'VERIFIED',
        },
      });

      return { clinicId: activeClinicId, user };
    });

    return NextResponse.json({
      message: 'Clinic workspace and account created successfully.',
      clinicId: result.clinicId,
      userId: result.user.id,
      status: result.user.status,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
