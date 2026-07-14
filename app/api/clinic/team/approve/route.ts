import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin || admin.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Ensure the user belongs to the same clinic
    const user = await prisma.user.findFirst({
      where: { id: userId, clinicId: admin.clinicId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in this clinic' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });

    return NextResponse.json({ success: true, message: 'User approved successfully' });
  } catch (error: any) {
    console.error('Error approving user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
