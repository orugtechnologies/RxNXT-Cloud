import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin || admin.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fullName, email, password, role } = await request.json();

    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (role !== 'receptionist' && role !== 'nurse') {
      return NextResponse.json({ error: 'Invalid staff role' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role,
        status: 'ACTIVE',
        clinicId: admin.clinicId,
      }
    });

    return NextResponse.json({ success: true, message: 'Staff member created', user: { id: newUser.id, fullName: newUser.fullName, role: newUser.role } });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
