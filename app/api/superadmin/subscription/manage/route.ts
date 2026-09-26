export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { extendClinicTrial, renewClinicSubscription } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'superadmin' && user.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Superadmin privileges required' }, { status: 403 });
  }

  try {
    const { clinicId, action, additionalDays, plan, status } = await request.json();

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    if (action === 'EXTEND_TRIAL') {
      const result = await extendClinicTrial(clinicId, additionalDays || 14);
      return NextResponse.json({ success: true, result });
    }

    if (action === 'ACTIVATE_PRO') {
      const result = await renewClinicSubscription({
        clinicId,
        plan: plan || 'PRO_ANNUAL',
        billingCycle: 'ANNUAL',
        paymentRef: `SUPERADMIN_OVERRIDE_${user.email}`,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === 'SET_STATUS') {
      const updated = await prisma.clinic.update({
        where: { id: clinicId },
        data: {
          subscriptionStatus: status || 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, clinic: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Superadmin Subscription Manage Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
