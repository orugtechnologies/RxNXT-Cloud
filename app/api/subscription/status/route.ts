export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { getClinicSubscription, getClinicWhatsAppUsage, PLAN_PRICING } from '@/lib/subscription';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [subscription, whatsAppQuota] = await Promise.all([
      getClinicSubscription(user.clinicId),
      getClinicWhatsAppUsage(user.clinicId),
    ]);

    return NextResponse.json({
      success: true,
      subscription,
      whatsAppQuota,
      plans: PLAN_PRICING,
    });
  } catch (error: any) {
    console.error('Subscription Status Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch subscription status' }, { status: 500 });
  }
}
