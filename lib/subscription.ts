import { prisma } from '@/lib/prisma';

export interface SubscriptionInfo {
  allowed: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  plan: string;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  subscriptionStartedAt: Date | null;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // 7 days or less remaining
  isTrial: boolean;
  renewalReminderSentAt: Date | null;
  clinicId: string;
  clinicName: string;
}

export const PLAN_PRICING: Record<string, { name: string; monthly: number; annual: number; features: string[] }> = {
  STARTER_MONTHLY: {
    name: 'Starter Monthly',
    monthly: 1499,
    annual: 14990,
    features: [
      'Unlimited Digital Prescriptions',
      'Fuzzy Medicine Search & 1-Click Dosage Chips',
      'OPD Front-Desk Token Queue System',
      'Meta WhatsApp Prescription Delivery',
      '3-Window Smart Slot Medicine Reminders',
    ],
  },
  PRO_ANNUAL: {
    name: 'Clinic Pro Annual',
    monthly: 1249, // Effective monthly price
    annual: 14999, // 20% discount applied
    features: [
      'Everything in Starter',
      'Multi-Doctor & Support Staff Accounts',
      'Custom Treatment Group Templates',
      'Doctor & Clinic Analytics Dashboard',
      'Day 25 Monthly Chronic Care Refill Engine',
      'Priority Meta WhatsApp SLA',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise Multi-Branch',
    monthly: 4999,
    annual: 49999,
    features: [
      'Everything in Pro',
      'Multi-Branch Clinic Network',
      'Dedicated Medical Council Compliance Audit',
      'Custom Electronic Health Record (EHR) Sync',
      '24/7 Dedicated Account Manager',
    ],
  },
};

/**
 * Retrieves the current subscription state of a clinic and ensures expiry status is accurately reflected.
 */
export async function getClinicSubscription(clinicId: string): Promise<SubscriptionInfo> {
  let clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      name: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionStartedAt: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      renewalReminderSentAt: true,
      createdAt: true,
    },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const now = new Date();

  // If clinic does not have trial dates initialized (e.g. legacy/seed records), initialize 14-day trial
  if (!clinic.trialEndsAt && !clinic.subscriptionEndsAt) {
    const trialEnd = new Date(clinic.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isPast = now > trialEnd;
    const initialStatus = isPast ? 'EXPIRED' : 'TRIAL';

    clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        subscriptionStatus: initialStatus,
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionStartedAt: clinic.createdAt,
        trialEndsAt: trialEnd,
        subscriptionEndsAt: trialEnd,
      },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionStartedAt: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        renewalReminderSentAt: true,
        createdAt: true,
      },
    });
  }

  const expiryDate = clinic.subscriptionEndsAt || clinic.trialEndsAt || new Date(clinic.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  const diffMs = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const isExpired = now > expiryDate;
  const isExpiringSoon = !isExpired && daysRemaining <= 7;
  const isTrial = clinic.subscriptionPlan === 'TRIAL_14_DAYS' || clinic.subscriptionStatus === 'TRIAL';

  let currentStatus = clinic.subscriptionStatus as 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

  // Automatically update status to EXPIRED if past validity
  if (isExpired && currentStatus !== 'EXPIRED' && currentStatus !== 'CANCELLED') {
    await prisma.clinic.update({
      where: { id: clinicId },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    currentStatus = 'EXPIRED';
  }

  const allowed = !isExpired && (currentStatus === 'TRIAL' || currentStatus === 'ACTIVE');

  return {
    allowed,
    status: currentStatus,
    plan: clinic.subscriptionPlan || (isTrial ? 'TRIAL_14_DAYS' : 'PRO_ANNUAL'),
    trialEndsAt: clinic.trialEndsAt,
    subscriptionEndsAt: clinic.subscriptionEndsAt,
    subscriptionStartedAt: clinic.subscriptionStartedAt,
    daysRemaining,
    isExpired,
    isExpiringSoon,
    isTrial,
    renewalReminderSentAt: clinic.renewalReminderSentAt,
    clinicId: clinic.id,
    clinicName: clinic.name,
  };
}

/**
 * Renews or upgrades a clinic's subscription.
 */
export async function renewClinicSubscription({
  clinicId,
  plan,
  billingCycle = 'MONTHLY',
  amount,
  paymentRef,
}: {
  clinicId: string;
  plan: 'STARTER_MONTHLY' | 'PRO_ANNUAL' | 'ENTERPRISE';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amount?: number;
  paymentRef?: string;
}) {
  const currentSub = await getClinicSubscription(clinicId);
  const now = new Date();

  // If current subscription is still active, extend from the current expiry; otherwise start from now
  const baseDate = currentSub.subscriptionEndsAt && currentSub.subscriptionEndsAt > now
    ? currentSub.subscriptionEndsAt
    : now;

  const additionalDays = billingCycle === 'ANNUAL' ? 365 : 30;
  const newExpiry = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

  const planDetails = PLAN_PRICING[plan] || PLAN_PRICING.STARTER_MONTHLY;
  const finalAmount = amount ?? (billingCycle === 'ANNUAL' ? planDetails.annual : planDetails.monthly);
  const finalRef = paymentRef || `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const updatedClinic = await tx.clinic.update({
      where: { id: clinicId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: plan,
        subscriptionEndsAt: newExpiry,
        renewalReminderSentAt: null, // Reset reminder flag for the new cycle
        lastPaymentAmount: finalAmount,
        lastPaymentRef: finalRef,
      },
    });

    const payment = await tx.subscriptionPayment.create({
      data: {
        clinicId,
        plan,
        amount: finalAmount,
        billingCycle,
        status: 'COMPLETED',
        paymentRef: finalRef,
        validFrom: baseDate,
        validUntil: newExpiry,
      },
    });

    return { updatedClinic, payment };
  });

  return {
    success: true,
    status: 'ACTIVE',
    plan,
    validUntil: newExpiry,
    payment: result.payment,
  };
}

/**
 * Admin / Superadmin trial extension helper.
 */
export async function extendClinicTrial(clinicId: string, additionalDays: number = 14) {
  const current = await getClinicSubscription(clinicId);
  const now = new Date();

  const baseDate = current.subscriptionEndsAt && current.subscriptionEndsAt > now
    ? current.subscriptionEndsAt
    : now;

  const newExpiry = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

  const updatedClinic = await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      subscriptionStatus: current.isTrial ? 'TRIAL' : 'ACTIVE',
      subscriptionEndsAt: newExpiry,
      trialEndsAt: current.isTrial ? newExpiry : current.trialEndsAt,
      renewalReminderSentAt: null,
    },
  });

  return {
    success: true,
    newExpiry,
    status: updatedClinic?.subscriptionStatus || (current.isTrial ? 'TRIAL' : 'ACTIVE'),
  };
}
