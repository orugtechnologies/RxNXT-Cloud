import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function generateSecureCode() {
  return 'rx_' + crypto.randomBytes(8).toString('hex');
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId }
    });

    if (!clinic) return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });

    // If clinic already has an invite code, return it.
    if (clinic.inviteCode) {
      return NextResponse.json({ inviteCode: clinic.inviteCode });
    }

    // Otherwise, generate one, save it, and return it.
    const newCode = generateSecureCode();
    await prisma.clinic.update({
      where: { id: user.clinicId },
      data: { inviteCode: newCode }
    });

    return NextResponse.json({ inviteCode: newCode });
  } catch (error: any) {
    console.error('Error fetching invite code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Kill-Switch: Regenerate the link
export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== 'clinic_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newCode = generateSecureCode();
    await prisma.clinic.update({
      where: { id: user.clinicId },
      data: { inviteCode: newCode }
    });

    return NextResponse.json({ inviteCode: newCode, message: 'Link regenerated successfully.' });
  } catch (error: any) {
    console.error('Error regenerating invite code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
