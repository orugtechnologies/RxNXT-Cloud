export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { getClinicSubscription, getClinicWhatsAppUsage, PLAN_PRICING, isDemoClinic } from '@/lib/subscription';

const DEMO_EMAILS = [
  'doctor@rxnxt.com',
  'receptionist@rxnxt.com',
  'pharmacist@rxnxt.com',
  'pharmacy@rxnxt.com',
  'superadmin@rxnxt.com',
  'dev@rxnxt.com',
  'admin@rxnxt.com',
];

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const isDemoUser = DEMO_EMAILS.includes(user.email?.toLowerCase().trim()) || isDemoClinic(user.clinicId);

    const [subscription, whatsAppQuota] = await Promise.all([
      getClinicSubscription(user.clinicId),
      getClinicWhatsAppUsage(user.clinicId),
    ]);

    if (isDemoUser) {
      subscription.allowed = true;
      subscription.status = 'ACTIVE';
      subscription.plan = 'DEMO_LIFETIME';
      subscription.isExpired = false;
      subscription.isExpiringSoon = false;
      subscription.isTrial = false;
      subscription.daysRemaining = 99999;
      subscription.trialEndsAt = null;
      subscription.subscriptionEndsAt = null;
      (subscription as any).isDemo = true;
    }

    return NextResponse.json({
      success: true,
      subscription,
      whatsAppQuota: isDemoUser
        ? { used: 0, cap: null, allowed: true, isTrial: false, isExpired: false }
        : whatsAppQuota,
      plans: PLAN_PRICING,
    });
  } catch (error: any) {
    console.error('Subscription Status Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch subscription status' }, { status: 500 });
  }
}
