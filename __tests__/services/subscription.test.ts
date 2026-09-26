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

describe('Subscription & 14-Day Free Trial Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('14-Day Free Trial Status & Expiry Logic', () => {
    it('initializes 14-day trial for clinics without prior trial record', async () => {
      const mockCreatedAt = new Date();
      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-101',
        name: 'City Care Clinic',
        subscriptionStatus: null,
        subscriptionPlan: null,
        trialEndsAt: null,
        subscriptionEndsAt: null,
        createdAt: mockCreatedAt,
      });

      const trialEndExpected = new Date(mockCreatedAt.getTime() + 14 * 24 * 60 * 60 * 1000);

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-101',
        name: 'City Care Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionStartedAt: mockCreatedAt,
        trialEndsAt: trialEndExpected,
        subscriptionEndsAt: trialEndExpected,
        createdAt: mockCreatedAt,
      });

      const sub = await getClinicSubscription('clinic-101');

      expect(sub.allowed).toBe(true);
      expect(sub.isTrial).toBe(true);
      expect(sub.status).toBe('TRIAL');
      expect(sub.daysRemaining).toBeGreaterThanOrEqual(13);
      expect(sub.isExpired).toBe(false);
      expect(prisma.clinic.update).toHaveBeenCalled();
    });

    it('flags clinic as expiring soon when <= 7 days remain', async () => {
      const now = new Date();
      const trialEndsSoon = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-102',
        name: 'Apex Health',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        trialEndsAt: trialEndsSoon,
        subscriptionEndsAt: trialEndsSoon,
        createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      });

      const sub = await getClinicSubscription('clinic-102');

      expect(sub.allowed).toBe(true);
      expect(sub.isExpiringSoon).toBe(true);
      expect(sub.daysRemaining).toBe(5);
      expect(sub.isExpired).toBe(false);
    });

    it('marks and locks expired trial clinics when trial period has ended', async () => {
      const now = new Date();
      const pastTrialEnd = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-103',
        name: 'Lapsed Health Clinic',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        trialEndsAt: pastTrialEnd,
        subscriptionEndsAt: pastTrialEnd,
        createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
      });

      (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({
        id: 'clinic-103',
        subscriptionStatus: 'EXPIRED',
      });

      const sub = await getClinicSubscription('clinic-103');

      expect(sub.allowed).toBe(false);
      expect(sub.isExpired).toBe(true);
      expect(sub.status).toBe('EXPIRED');
      expect(sub.daysRemaining).toBe(0);
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
});
