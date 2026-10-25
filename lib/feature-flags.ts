export type CommercialTier = 'TRIAL' | 'SOLO_GP' | 'SPECIALIST' | 'POLYCLINIC_HUB';

export type FeatureKey =
  | 'CORE_WORKSPACE'
  | 'TOKEN_QUEUE'
  | 'INSTANT_PDF_WHATSAPP'
  | 'MORNING_ADHERENCE'
  | 'CHRONIC_REFILLS'
  | 'PHARMACY_INVENTORY'
  | 'MULTI_DOCTOR_SEATS';

export interface FeatureMetadata {
  key: FeatureKey;
  name: string;
  description: string;
  requiredTier: CommercialTier;
  benefits: string[];
}

export const FEATURE_METADATA: Record<FeatureKey, FeatureMetadata> = {
  CORE_WORKSPACE: {
    key: 'CORE_WORKSPACE',
    name: 'Clinical Workspace & Scoring Engine',
    description: 'Instant 50ms fuzzy medicine search, 1-click dosage chips, and additive habit scoring.',
    requiredTier: 'SOLO_GP',
    benefits: ['Sub-250ms prescription speed', 'Doctor habit memory', 'Client-side PDF generation'],
  },
  TOKEN_QUEUE: {
    key: 'TOKEN_QUEUE',
    name: 'OPD Token Queue',
    description: 'Front-desk patient reception triage with live vitals and doctor queue sync.',
    requiredTier: 'SOLO_GP',
    benefits: ['Receptionist token management', 'Real-time patient status', 'Vitals collection'],
  },
  INSTANT_PDF_WHATSAPP: {
    key: 'INSTANT_PDF_WHATSAPP',
    name: 'Instant WhatsApp PDF Delivery',
    description: 'Immediate WhatsApp prescription PDF delivery to patients right after OPD consult.',
    requiredTier: 'SOLO_GP',
    benefits: ['Zero paper cost', 'Instant branded delivery', 'Patient contact archiving'],
  },
  MORNING_ADHERENCE: {
    key: 'MORNING_ADHERENCE',
    name: 'Daily Morning WhatsApp Adherence Briefing',
    description: 'Single daily 8:00 AM WhatsApp schedule covering morning, afternoon, and night doses for high patient compliance.',
    requiredTier: 'SPECIALIST',
    benefits: ['Eliminates 3x daily spam', 'Boosts patient medication compliance', 'Automatic course duration tracking'],
  },
  CHRONIC_REFILLS: {
    key: 'CHRONIC_REFILLS',
    name: 'Day-25 Chronic Care Refill Engine',
    description: 'Automated Day-25 refill reminders for hypertension, diabetes, and long-term medications.',
    requiredTier: 'SPECIALIST',
    benefits: ['Recovers 40% of lost chronic follow-ups', 'Automated recurring visits', 'Predictable patient return revenue'],
  },
  PHARMACY_INVENTORY: {
    key: 'PHARMACY_INVENTORY',
    name: 'Integrated Pharmacy & Dispensing Queue',
    description: 'Real-time stock level monitoring, low-stock alerts, expiry tracking, and direct consultation-to-dispense handoff.',
    requiredTier: 'POLYCLINIC_HUB',
    benefits: ['Eliminates dispensing leakage', 'Batch and expiry tracking', 'Direct-to-counter digital queue'],
  },
  MULTI_DOCTOR_SEATS: {
    key: 'MULTI_DOCTOR_SEATS',
    name: 'Multi-Doctor Seat Provisioning',
    description: 'Centralized admin controls for multiple practitioners, role-based access, and shared clinic analytics.',
    requiredTier: 'POLYCLINIC_HUB',
    benefits: ['Add and manage associate doctors', 'Central clinic analytics', 'Independent doctor preference profiles'],
  },
};

export const TIER_PERMISSIONS: Record<CommercialTier, Record<FeatureKey, boolean>> = {
  TRIAL: {
    CORE_WORKSPACE: true,
    TOKEN_QUEUE: true,
    INSTANT_PDF_WHATSAPP: true,
    MORNING_ADHERENCE: true,   // Full features enabled during trial up to 150 prescriptions
    CHRONIC_REFILLS: true,
    PHARMACY_INVENTORY: true,
    MULTI_DOCTOR_SEATS: false, // Multi-seat reserved for Polyclinic Hub
  },
  SOLO_GP: {
    CORE_WORKSPACE: true,
    TOKEN_QUEUE: true,
    INSTANT_PDF_WHATSAPP: true,
    MORNING_ADHERENCE: false,
    CHRONIC_REFILLS: false,
    PHARMACY_INVENTORY: false,
    MULTI_DOCTOR_SEATS: false,
  },
  SPECIALIST: {
    CORE_WORKSPACE: true,
    TOKEN_QUEUE: true,
    INSTANT_PDF_WHATSAPP: true,
    MORNING_ADHERENCE: true,
    CHRONIC_REFILLS: true,
    PHARMACY_INVENTORY: false,
    MULTI_DOCTOR_SEATS: false,
  },
  POLYCLINIC_HUB: {
    CORE_WORKSPACE: true,
    TOKEN_QUEUE: true,
    INSTANT_PDF_WHATSAPP: true,
    MORNING_ADHERENCE: true,
    CHRONIC_REFILLS: true,
    PHARMACY_INVENTORY: true,
    MULTI_DOCTOR_SEATS: true,
  },
};

/**
 * Checks whether a given feature is enabled for a clinic's commercial tier.
 */
export function isFeatureAllowed(
  tier: CommercialTier | string | null | undefined,
  feature: FeatureKey
): boolean {
  if (!tier) return false;
  // Fallbacks for legacy plan names
  if (tier === 'STARTER_MONTHLY') return isFeatureAllowed('SOLO_GP', feature);
  if (tier === 'PRO_ANNUAL') return isFeatureAllowed('SPECIALIST', feature);
  if (tier === 'ENTERPRISE' || tier === 'DEMO_LIFETIME') return true;

  const validTier = (tier as CommercialTier);
  const permissions = TIER_PERMISSIONS[validTier];
  if (!permissions) return false;

  return Boolean(permissions[feature]);
}
