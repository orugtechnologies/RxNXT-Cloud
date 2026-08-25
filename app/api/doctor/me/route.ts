export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await getAuthenticatedUser();
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const doctor = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { clinic: true },
    });

    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    return NextResponse.json({
      doctorName: doctor.fullName,
      doctorSpecialization: doctor.specialization,
      doctorRegNo: doctor.registrationNumber,
      medicalCouncil: doctor.medicalCouncil,
      verificationStatus: doctor.verificationStatus,
      qualification: doctor.qualification,
      clinicName: doctor.clinic?.name,
      clinicAddress: doctor.clinic?.address,
      clinicPhone: doctor.clinic?.phone,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
