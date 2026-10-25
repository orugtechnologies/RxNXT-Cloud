import { prisma } from '@/lib/prisma';

export interface SubscriptionInfo {
  allowed: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  plan: string;
  tier: 'TRIAL' | 'SOLO_GP' | 'SPECIALIST' | 'POLYCLINIC_HUB';
  prescriptionsCount: number;
  trialPrescriptionCap: number;
  prescriptionsRemaining: number;
  isUsageLocked: boolean;
  isUsageWarning: boolean; // Between 121 and 149 prescriptions
  whatsappCreditBalance: number;
  baseSeats: number;
  additionalSeats: number;
  totalSeats: number;
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

export const COMMERCIAL_TIERS = {
  SOLO_GP: {
    id: 'SOLO_GP',
    name: 'Solo GP',
    monthly: 999,
    annual: 9990,
    description: 'Core OPD Workspace & Token Queue for Individual Practitioners',
    seatsIncluded: 1,
    features: [
      'Core Clinical Workspace & Fuzzy Search',
      'Additive Clinical Habit Engine',
      'OPD Front-Desk Token Queue',
      'Instant Patient WhatsApp Prescription PDF Link',
      'Unlimited Prescription Generation',
    ],
  },
  SPECIALIST: {
    id: 'SPECIALIST',
    name: 'Specialist',
    monthly: 1999,
    annual: 19990,
    description: 'Full Clinical Intelligence & Patient Adherence Ecosystem',
    seatsIncluded: 1,
    features: [
      'Everything in Solo GP',
      'Automated Morning Dose Briefings (8:00 AM WhatsApp)',
      'Day 25 Monthly Chronic Refill Alerts',
      'Post-Visit Follow-Up Appointment Reminders',
      'Patient Adherence Telemetry & Analytics',
    ],
  },
  POLYCLINIC_HUB: {
    id: 'POLYCLINIC_HUB',
    name: 'Polyclinic Hub',
    monthly: 3999,
    annual: 39990,
    description: 'Multi-Doctor Clinic with Integrated In-House Pharmacy',
    seatsIncluded: 3,
    additionalSeatPrice: 499, // ₹499/mo per extra doctor
    features: [
      'Everything in Specialist',
      'Pharmacy Inventory & Real-Time Stock Alerts',
      'Direct-to-Pharmacy Dispensing Queue & Billing',
      'Multi-Doctor & Staff Access Provisioning',
      'Clinic Admin Central Billing & Multi-Seat Management',
    ],
  },
} as const;

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

export const DEMO_CLINIC_ID = 'demo-clinic-001';

export const DEMO_EMAILS = [
  'doctor@rxnxt.com',
  'receptionist@rxnxt.com',
  'pharmacist@rxnxt.com',
  'pharmacy@rxnxt.com',
  'superadmin@rxnxt.com',
  'dev@rxnxt.com',
  'admin@rxnxt.com',
  'd2@rxnxt.com',
  'd3@rxnxt.com',
];

export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  return DEMO_EMAILS.includes(email.toLowerCase().trim());
}

export function isDemoClinic(clinicId?: string | null, clinicName?: string | null): boolean {
  if (!clinicId) return true; // Safe fallback for demo sessions
  if (clinicId === DEMO_CLINIC_ID) return true;
  if (clinicName && clinicName.toLowerCase().includes('demo')) return true;
  return false;
}

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
      subscriptionTier: true,
      prescriptionsCount: true,
      trialPrescriptionCap: true,
      whatsappCreditBalance: true,
      baseSeats: true,
      additionalSeats: true,
      subscriptionStartedAt: true,
      trialEndsAt: true,
      subscriptionEndsAt: true,
      renewalReminderSentAt: true,
      createdAt: true,
      users: {
        select: { email: true },
      },
    },
  });

  if (!clinic) {
    // If clinic is not found, treat as lifetime active demo clinic rather than crashing
    return {
      allowed: true,
      status: 'ACTIVE',
      plan: 'DEMO_LIFETIME',
      tier: 'POLYCLINIC_HUB',
      prescriptionsCount: 0,
      trialPrescriptionCap: 999999,
      prescriptionsRemaining: 999999,
      isUsageLocked: false,
      isUsageWarning: false,
      whatsappCreditBalance: 99999,
      baseSeats: 99,
      additionalSeats: 0,
      totalSeats: 99,
      trialEndsAt: null,
      subscriptionEndsAt: null,
      subscriptionStartedAt: new Date(),
      daysRemaining: 99999,
      isExpired: false,
      isExpiringSoon: false,
      isTrial: false,
      renewalReminderSentAt: null,
      clinicId: clinicId || DEMO_CLINIC_ID,
      clinicName: 'RxNXT Demo Clinic',
    };
  }

  const hasDemoUser = clinic.users?.some(u => isDemoEmail(u.email));

  // Demo Clinics / Demo Accounts: Permanent Lifetime Unrestricted Access (No subscription banners or expiries)
  if (isDemoClinic(clinic.id, clinic.name) || hasDemoUser) {
    if (clinic.subscriptionStatus !== 'ACTIVE' || clinic.subscriptionPlan !== 'DEMO_LIFETIME') {
      try {
        await prisma.clinic.update({
          where: { id: clinicId },
          data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionPlan: 'DEMO_LIFETIME',
            trialEndsAt: null,
            subscriptionEndsAt: null,
          },
        });
      } catch (e) {
        // Ignore update error in read-only setups
      }
    }

    return {
      allowed: true,
      status: 'ACTIVE',
      plan: 'DEMO_LIFETIME',
      tier: 'POLYCLINIC_HUB',
      prescriptionsCount: 0,
      trialPrescriptionCap: 999999,
      prescriptionsRemaining: 999999,
      isUsageLocked: false,
      isUsageWarning: false,
      whatsappCreditBalance: 99999,
      baseSeats: 99,
      additionalSeats: 0,
      totalSeats: 99,
      trialEndsAt: null,
      subscriptionEndsAt: null,
      subscriptionStartedAt: clinic.createdAt,
      daysRemaining: 99999,
      isExpired: false,
      isExpiringSoon: false,
      isTrial: false,
      renewalReminderSentAt: null,
      clinicId: clinic.id,
      clinicName: clinic.name,
    };
  }

  const now = new Date();

  let activeClinic = clinic;

  // Initialize trial clinic with 150-prescription quota if not initialized
  if (!activeClinic.subscriptionPlan && !activeClinic.subscriptionEndsAt) {
    try {
      const updated = await prisma.clinic.update({
        where: { id: clinicId },
        data: {
          subscriptionStatus: activeClinic.subscriptionStatus || 'TRIAL',
          subscriptionPlan: 'TRIAL_150_RX',
          subscriptionTier: 'TRIAL',
          subscriptionStartedAt: activeClinic.createdAt || now,
          trialPrescriptionCap: 150,
        },
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
          subscriptionTier: true,
          prescriptionsCount: true,
          trialPrescriptionCap: true,
          whatsappCreditBalance: true,
          baseSeats: true,
          additionalSeats: true,
          subscriptionStartedAt: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          renewalReminderSentAt: true,
          createdAt: true,
          users: {
            select: { email: true },
          },
        },
      });
      if (updated) activeClinic = updated;
    } catch (e) {
      // Ignore update errors in mock/read-only test runs
    }
  }

  const isTrial = activeClinic.subscriptionPlan === 'TRIAL_150_RX' || activeClinic.subscriptionPlan === 'TRIAL_14_DAYS' || activeClinic.subscriptionStatus === 'TRIAL' || (activeClinic as any).subscriptionTier === 'TRIAL';

  const prescriptionsCount = (activeClinic as any).prescriptionsCount ?? 0;
  const trialPrescriptionCap = (activeClinic as any).trialPrescriptionCap ?? 150;
  const tier = (((activeClinic as any).subscriptionTier) || (isTrial ? 'TRIAL' : 'SOLO_GP')) as 'TRIAL' | 'SOLO_GP' | 'SPECIALIST' | 'POLYCLINIC_HUB';
  const whatsappCreditBalance = (activeClinic as any).whatsappCreditBalance ?? 0;
  const baseSeats = (activeClinic as any).baseSeats ?? 1;
  const additionalSeats = (activeClinic as any).additionalSeats ?? 0;
  const totalSeats = baseSeats + additionalSeats;

  // 150-Prescription Free Trial:
  // Gated purely by volume (prescriptions completed). Trials NEVER expire by calendar countdown.
  const isUsageLocked = isTrial && prescriptionsCount >= trialPrescriptionCap;
  const isUsageWarning = isTrial && prescriptionsCount >= 121 && prescriptionsCount < trialPrescriptionCap;
  const prescriptionsRemaining = Math.max(0, trialPrescriptionCap - prescriptionsCount);

  // Calendar expiry applies exclusively to paid recurring subscriptions
  const expiryDate = activeClinic.subscriptionEndsAt;
  const diffMs = expiryDate ? expiryDate.getTime() - now.getTime() : 0;
  const daysRemaining = isTrial ? 99999 : Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const isExpired = isTrial ? isUsageLocked : (expiryDate ? now > expiryDate : false);
  const isExpiringSoon = !isTrial && !isExpired && daysRemaining <= 7;

  let currentStatus = activeClinic.subscriptionStatus as 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

  // Automatically update status to EXPIRED if usage cap reached or subscription ended
  if (isExpired && currentStatus !== 'EXPIRED' && currentStatus !== 'CANCELLED') {
    await prisma.clinic.update({
      where: { id: clinicId },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    currentStatus = 'EXPIRED';
  }

  const allowed = !isExpired && !isUsageLocked && (currentStatus === 'TRIAL' || currentStatus === 'ACTIVE');

  return {
    allowed,
    status: currentStatus,
    plan: activeClinic.subscriptionPlan || (isTrial ? 'TRIAL_150_RX' : 'PRO_ANNUAL'),
    tier,
    prescriptionsCount,
    trialPrescriptionCap,
    prescriptionsRemaining,
    isUsageLocked,
    isUsageWarning,
    whatsappCreditBalance,
    baseSeats,
    additionalSeats,
    totalSeats,
    trialEndsAt: activeClinic.trialEndsAt,
    subscriptionEndsAt: activeClinic.subscriptionEndsAt,
    subscriptionStartedAt: activeClinic.subscriptionStartedAt,
    daysRemaining,
    isExpired,
    isExpiringSoon,
    isTrial,
    renewalReminderSentAt: activeClinic.renewalReminderSentAt,
    clinicId: activeClinic.id,
    clinicName: activeClinic.name,
  };
}

/**
 * Renews or upgrades a clinic's subscription.
 */
export async function renewClinicSubscription({
  clinicId,
  plan,
  tier,
  billingCycle = 'MONTHLY',
  amount,
  paymentRef,
}: {
  clinicId: string;
  plan: 'STARTER_MONTHLY' | 'PRO_ANNUAL' | 'ENTERPRISE';
  tier?: 'SOLO_GP' | 'SPECIALIST' | 'POLYCLINIC_HUB';
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

  const mappedTier = tier || (plan === 'STARTER_MONTHLY' ? 'SOLO_GP' : plan === 'PRO_ANNUAL' ? 'SPECIALIST' : 'POLYCLINIC_HUB');
  const baseSeats = mappedTier === 'POLYCLINIC_HUB' ? 3 : 1;

  const result = await prisma.$transaction(async (tx) => {
    const updatedClinic = await tx.clinic.update({
      where: { id: clinicId },
      data: {
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: plan,
        subscriptionTier: mappedTier,
        baseSeats,
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

/**
 * Free Trial WhatsApp Guard Rail: Caps free trials at 500 WhatsApp messages (~200 consultations).
 */
export const TRIAL_WHATSAPP_CAP = 500;

export async function getClinicWhatsAppUsage(clinicId: string): Promise<{
  used: number;
  cap: number | null;
  allowed: boolean;
  isTrial: boolean;
  isExpired: boolean;
}> {
  const sub = await getClinicSubscription(clinicId);

  // Demo accounts have lifetime unrestricted WhatsApp messaging
  if (isDemoClinic(clinicId, sub.clinicName) || sub.plan === 'DEMO_LIFETIME') {
    return {
      used: 0,
      cap: null,
      allowed: true,
      isTrial: false,
      isExpired: false,
    };
  }

  if (!sub.allowed) {
    return {
      used: 0,
      cap: sub.isTrial ? TRIAL_WHATSAPP_CAP : null,
      allowed: false,
      isTrial: sub.isTrial,
      isExpired: sub.isExpired,
    };
  }

  // Count WhatsApp messages sent during current cycle
  const startDate = sub.isTrial
    ? (sub.subscriptionStartedAt || sub.trialEndsAt ? new Date(sub.trialEndsAt!.getTime() - 14 * 24 * 60 * 60 * 1000) : new Date(0))
    : (sub.subscriptionStartedAt || new Date(0));

  const sentCount = await prisma.reminder.count({
    where: {
      prescription: { clinicId },
      status: 'SENT',
      createdAt: { gte: startDate },
    },
  });

  if (sub.isTrial) {
    const allowed = sentCount < TRIAL_WHATSAPP_CAP;
    return {
      used: sentCount,
      cap: TRIAL_WHATSAPP_CAP,
      allowed,
      isTrial: true,
      isExpired: false,
    };
  }

  // Paid active subscription
  return {
    used: sentCount,
    cap: null,
    allowed: true,
    isTrial: false,
    isExpired: false,
  };
}

