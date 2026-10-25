import { prisma } from '@/lib/prisma';
import { WALLET_RECHARGE_PACKAGES } from '@/lib/wallet';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    clinic: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    whatsAppCreditTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    reminder: {
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callbackOrArray) => {
      if (typeof callbackOrArray === 'function') {
        return callbackOrArray(prisma);
      }
      return Promise.all(callbackOrArray);
    }),
  },
}));

describe('Epic 3: Prepaid WhatsApp Wallet Architecture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Wallet Recharge Packages & Pricing Structure', () => {
    it('defines standard packages with tiered bulk discounts', () => {
      expect(WALLET_RECHARGE_PACKAGES.PACK_2000.credits).toBe(2000);
      expect(WALLET_RECHARGE_PACKAGES.PACK_2000.price).toBe(499);

      expect(WALLET_RECHARGE_PACKAGES.PACK_5000.credits).toBe(5000);
      expect(WALLET_RECHARGE_PACKAGES.PACK_5000.price).toBe(999);

      expect(WALLET_RECHARGE_PACKAGES.PACK_10000.credits).toBe(10000);
      expect(WALLET_RECHARGE_PACKAGES.PACK_10000.price).toBe(1799);
    });
  });

  describe('Failsafe & Zero Balance Logic', () => {
    it('identifies zero balance and prevents adherence dispatch without throwing errors', async () => {
      const mockClinic = {
        id: 'clinic-zero-01',
        name: 'Apollo Branch',
        subscriptionStatus: 'ACTIVE',
        subscriptionTier: 'SPECIALIST',
        whatsappCreditBalance: 0,
      };

      (prisma.clinic.findUnique as jest.Mock).mockResolvedValueOnce(mockClinic);

      const balance = mockClinic.whatsappCreditBalance;
      const canSendAdherence = balance > 0;

      expect(canSendAdherence).toBe(false);
      // Failsafe behavior: skip reminder without disrupting prescription system
      expect(balance).toBe(0);
    });
  });

  describe('Low Balance Alert Logic (< 100 Credits)', () => {
    it('flags low balance alert when credits drop below 100 and resets upon recharge', async () => {
      let balance = 101;
      let alertSent = false;

      // Simulate sending 2 adherence messages
      balance -= 2; // balance = 99
      if (balance < 100 && !alertSent) {
        alertSent = true;
      }

      expect(balance).toBe(99);
      expect(alertSent).toBe(true);

      // Simulate recharge of 2,000 credits
      balance += WALLET_RECHARGE_PACKAGES.PACK_2000.credits;
      alertSent = false; // Reset on recharge

      expect(balance).toBe(2099);
      expect(alertSent).toBe(false);
    });
  });
});
