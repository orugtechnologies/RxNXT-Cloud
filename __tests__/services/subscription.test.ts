import { getClinicSubscription, renewClinicSubscription, extendClinicTrial, PLAN_PRICING } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    clinic: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscriptionPayment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

describe('Subscription & 150-Prescription Free Trial Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('150-Prescription Free Trial Status & Expiry Logic', () => {
    it('initializes 150-prescription trial for clinics without prior trial record', async () => {
      const mockCreatedAt = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-101',
        name: 'City Care Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: null,
        trialEndsAt: null,
        subscriptionEndsAt: null,
        createdAt: mockCreatedAt,
      });

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-101',
        name: 'City Care Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_150_RX',
        subscriptionTier: 'TRIAL',
        subscriptionStartedAt: mockCreatedAt,
        trialPrescriptionCap: 150,
        prescriptionsCount: 0,
        createdAt: mockCreatedAt,
      });

      const sub = await getClinicSubscription('clinic-101');

      expect(sub.allowed).toBe(true);
      expect(sub.isTrial).toBe(true);
      expect(sub.status).toBe('TRIAL');
      expect(sub.prescriptionsRemaining).toBe(150);
      expect(sub.isExpired).toBe(false);
      expect(prisma.clinic.update).toHaveBeenCalled();
    });

    it('keeps trial clinic active regardless of calendar elapsed days until 150 prescriptions are reached', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-102',
        name: 'Apex Health',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_150_RX',
        subscriptionTier: 'TRIAL',
        prescriptionsCount: 40,
        trialPrescriptionCap: 150,
        // Even if clinic registered 30 days ago, trial remains active until 150 Rx!
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      });

      const sub = await getClinicSubscription('clinic-102');

      expect(sub.allowed).toBe(true);
      expect(sub.isTrial).toBe(true);
      expect(sub.prescriptionsCount).toBe(40);
      expect(sub.prescriptionsRemaining).toBe(110);
      expect(sub.isExpired).toBe(false);
      expect(sub.isUsageLocked).toBe(false);
    });

    it('locks trial clinic once the 150 prescription threshold is reached', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-103',
        name: 'High Volume Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_150_RX',
        subscriptionTier: 'TRIAL',
        prescriptionsCount: 150,
        trialPrescriptionCap: 150,
        createdAt: now,
      });

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-103',
        subscriptionStatus: 'EXPIRED',
      });

      const sub = await getClinicSubscription('clinic-103');

      expect(sub.allowed).toBe(false);
      expect(sub.isUsageLocked).toBe(true);
      expect(sub.prescriptionsRemaining).toBe(0);
      expect(prisma.clinic.update).toHaveBeenCalledWith({
        where: { id: 'clinic-103' },
        data: { subscriptionStatus: 'EXPIRED' },
      });
    });
  });

  describe('Subscription Renewal & Continuity', () => {
    it('successfully activates annual plan and adds 365 days', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-104',
        name: 'Metro Care Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        trialEndsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        subscriptionEndsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-104',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: 'PRO_ANNUAL',
      });

      (prisma.subscriptionPayment.create as jest.Mock).mockResolvedValueOnce({
        id: 'pay-001',
        clinicId: 'clinic-104',
        plan: 'PRO_ANNUAL',
        amount: PLAN_PRICING.PRO_ANNUAL.annual,
      });

      const result = await renewClinicSubscription({
        clinicId: 'clinic-104',
        plan: 'PRO_ANNUAL',
        billingCycle: 'ANNUAL',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('ACTIVE');
      expect(result.plan).toBe('PRO_ANNUAL');
      expect(result.validUntil.getTime()).toBeGreaterThan(now.getTime() + 360 * 24 * 60 * 60 * 1000);
    });

    it('extends trial by specified days via superadmin helper', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-105',
        name: 'Global Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        trialEndsAt: now,
        subscriptionEndsAt: now,
        createdAt: new Date(),
      });

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-105',
        subscriptionStatus: 'TRIAL',
      });

      const result = await extendClinicTrial('clinic-105', 14);

      expect(result.success).toBe(true);
      expect(result.status).toBe('TRIAL');
      expect(result.newExpiry.getTime()).toBeGreaterThan(now.getTime() + 13 * 24 * 60 * 60 * 1000);
    });
  });

  describe('Epic 1: The "First 150" Usage-Based Trial Engine', () => {
    it('State 1 (0-120 Prescriptions): provides full, frictionless access without warning or lock', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-trial-01',
        name: 'Green Valley Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionTier: 'TRIAL',
        prescriptionsCount: 45,
        trialPrescriptionCap: 150,
        trialEndsAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        subscriptionEndsAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdAt: now,
      });

      const sub = await getClinicSubscription('clinic-trial-01');

      expect(sub.allowed).toBe(true);
      expect(sub.isTrial).toBe(true);
      expect(sub.prescriptionsCount).toBe(45);
      expect(sub.trialPrescriptionCap).toBe(150);
      expect(sub.prescriptionsRemaining).toBe(105);
      expect(sub.isUsageWarning).toBe(false);
      expect(sub.isUsageLocked).toBe(false);
    });

    it('State 2 (121-149 Prescriptions): flags usage warning banner while keeping access allowed', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-trial-02',
        name: 'Sunrise Care',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionTier: 'TRIAL',
        prescriptionsCount: 135,
        trialPrescriptionCap: 150,
        trialEndsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        subscriptionEndsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        createdAt: now,
      });

      const sub = await getClinicSubscription('clinic-trial-02');

      expect(sub.allowed).toBe(true);
      expect(sub.isTrial).toBe(true);
      expect(sub.prescriptionsCount).toBe(135);
      expect(sub.prescriptionsRemaining).toBe(15);
      expect(sub.isUsageWarning).toBe(true);
      expect(sub.isUsageLocked).toBe(false);
    });

    it('State 3 (150 Prescriptions): activates hard usage lock and disallows prescription generation', async () => {
      const now = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-trial-03',
        name: 'Apex Polyclinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionTier: 'TRIAL',
        prescriptionsCount: 150,
        trialPrescriptionCap: 150,
        trialEndsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        subscriptionEndsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdAt: now,
      });

      const sub = await getClinicSubscription('clinic-trial-03');

      expect(sub.allowed).toBe(false);
      expect(sub.isUsageLocked).toBe(true);
      expect(sub.prescriptionsRemaining).toBe(0);
    });
  });
});
