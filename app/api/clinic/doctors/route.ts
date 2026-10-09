export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let doctors = await prisma.user.findMany({
      where: {
        clinicId: user.clinicId,
        role: { in: ['doctor', 'clinic_admin'] },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        specialization: true,
      },
      orderBy: { fullName: 'asc' },
    });

    // If no active doctors are attached to this clinic, automatically assign Dr. Shanmukha Datta
    if (doctors.length === 0) {
      let doc = await prisma.user.findFirst({
        where: {
          OR: [
            { email: 'doctor@rxnxt.com' },
            { fullName: { contains: 'Shanmukha' } },
          ],
        },
      });

      if (doc) {
        // Link existing demo doctor to this clinic
        const updated = await prisma.user.update({
          where: { id: doc.id },
          data: {
            clinicId: user.clinicId,
            status: 'ACTIVE',
            role: 'clinic_admin',
          },
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        });
        doctors = [updated];
      } else {
        // Auto-provision Dr. Shanmukha Datta
        const hashedPassword = await bcrypt.hash('password123', 12);
        const created = await prisma.user.create({
          data: {
            email: 'doctor@rxnxt.com',
            password: hashedPassword,
            fullName: 'Dr. Shanmukha Datta',
            role: 'clinic_admin',
            specialization: 'General Physician & Diabetologist',
            medicalCouncil: 'NMC / Karnataka Medical Council',
            registrationNumber: 'KMC-54912',
            verificationStatus: 'VERIFIED',
            status: 'ACTIVE',
            clinicId: user.clinicId,
          },
          select: {
            id: true,
            fullName: true,
            specialization: true,
          },
        });
        doctors = [created];
      }
    }

    return NextResponse.json({ doctors });
  } catch (error: any) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
