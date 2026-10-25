export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { renewClinicSubscription } from '@/lib/subscription';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only clinic_admin or doctor can renew
  if (user.role !== 'clinic_admin' && user.role !== 'admin' && user.role !== 'doctor') {
    return NextResponse.json({ error: 'Permission denied. Only Clinic Admins or Doctors can manage subscriptions.' }, { status: 403 });
  }

  try {
    const { plan, tier, billingCycle, paymentRef, amount } = await request.json();

    // Map tier to plan if tier is supplied
    let resolvedPlan = plan;
    if (!resolvedPlan && tier) {
      if (tier === 'SOLO_GP') resolvedPlan = 'STARTER_MONTHLY';
      else if (tier === 'SPECIALIST') resolvedPlan = 'PRO_ANNUAL';
      else if (tier === 'POLYCLINIC_HUB') resolvedPlan = 'ENTERPRISE';
    }

    if (!resolvedPlan || !['STARTER_MONTHLY', 'PRO_ANNUAL', 'ENTERPRISE'].includes(resolvedPlan)) {
      return NextResponse.json({ error: 'Invalid subscription plan selected.' }, { status: 400 });
    }

    const result = await renewClinicSubscription({
      clinicId: user.clinicId,
      plan: resolvedPlan,
      tier,
      billingCycle: billingCycle || (resolvedPlan === 'PRO_ANNUAL' ? 'ANNUAL' : 'MONTHLY'),
      amount,
      paymentRef,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully activated/renewed.',
      subscription: result,
    });
  } catch (error: any) {
    console.error('Subscription Renewal Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to renew subscription' }, { status: 500 });
  }
}
