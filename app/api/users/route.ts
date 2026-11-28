export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      where: { clinicId: user.clinicId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        specialization: true,
        phone: true,
        createdAt: true,
      }
    });
    return NextResponse.json({ data: users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only clinic administrators and doctors can add clinic staff
  const allowedRoles = ['clinic_admin', 'admin', 'doctor', 'superadmin'];
  if (!allowedRoles.includes(user.role.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden: Admin access required to add staff.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.email?.trim() || !body.fullName?.trim()) {
      return NextResponse.json({ error: 'Email and full name are required.' }, { status: 400 });
    }

    const cleanEmail = body.email.toLowerCase().trim();

    // Check if email already in use
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const rawPassword = body.password?.trim() || 'StaffRx@2026!';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        fullName: body.fullName.trim(),
        role: body.role || 'doctor',
        specialization: body.specialization || null,
        phone: body.phone || null,
        clinicId: user.clinicId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        specialization: true,
        phone: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json({ success: true, data: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
