import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const team = await prisma.user.findMany({
      where: { clinicId: user.clinicId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        specialization: true,
        qualification: true,
        registrationNumber: true,
        medicalCouncil: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ team });
  } catch (error: any) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin || admin.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      fullName,
      email,
      password,
      phone,
      specialization,
      qualification,
      registrationNumber,
      medicalCouncil,
    } = await request.json();

    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Doctor Name, Email, and Password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Format doctor name with "Dr." prefix if not present
    let formattedName = fullName.trim();
    if (!formattedName.toLowerCase().startsWith('dr.') && !formattedName.toLowerCase().startsWith('dr ')) {
      formattedName = `Dr. ${formattedName}`;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newDoctor = await prisma.user.create({
      data: {
        fullName: formattedName,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: 'doctor',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        specialization: specialization?.trim() || 'General Physician',
        qualification: qualification?.trim() || null,
        registrationNumber: registrationNumber?.trim() || null,
        medicalCouncil: medicalCouncil?.trim() || null,
        clinicId: admin.clinicId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        specialization: true,
        qualification: true,
        registrationNumber: true,
        medicalCouncil: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor account created successfully',
      doctor: newDoctor
    });
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { error: 'Failed to create doctor account: ' + (error.message || 'Internal error') },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin || admin.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { doctorId, status } = await request.json();

    if (!doctorId || !status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json({ error: 'Valid Doctor ID and Status are required' }, { status: 400 });
    }

    // Ensure doctor belongs to this clinic
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, clinicId: admin.clinicId }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found or does not belong to your clinic' }, { status: 404 });
    }

    // Prevent admin from deactivating their own account
    if (doctor.id === admin.id) {
      return NextResponse.json({ error: 'You cannot change your own admin account status' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: doctorId },
      data: { status }
    });

    return NextResponse.json({ success: true, doctor: updated });
  } catch (error: any) {
    console.error('Error updating doctor status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
