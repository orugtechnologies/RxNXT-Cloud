export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

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

  try {
    const body = await request.json();
    
    // In a real app you'd hash the password, check for existing email, etc.
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        password: 'tempPassword123', // Demo placeholder
        fullName: body.fullName,
        role: body.role || 'doctor',
        specialization: body.specialization || null,
        phone: body.phone || null,
        clinicId: user.clinicId,
      }
    });
    
    return NextResponse.json({ success: true, data: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

