import { GET } from '@/app/api/cron/subscription-check/route';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionExpiryNotice } from '@/services/whatsappService';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    clinic: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/services/whatsappService', () => ({
  sendSubscriptionExpiryNotice: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('GET /api/cron/subscription-check (7-Day Prior Expiry Alerts & Auto-Expiration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = () => ({
    url: 'http://localhost:3000/api/cron/subscription-check',
    headers: {
      get: (header: string) => null,
    },
  } as any);

  it('auto-expires clinics with past expiry dates and sends WhatsApp alerts to clinics expiring in <= 7 days', async () => {
    (prisma.clinic.updateMany as jest.Mock).mockResolvedValueOnce({ count: 2 });

    const now = new Date();
    const expirySoon = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days left

    (prisma.clinic.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'clinic-expiring-1',
        name: 'Apollo Family Clinic',
        phone: '9876543210',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionEndsAt: expirySoon,
        users: [
          {
            fullName: 'Dr. Ramesh Kumar',
            phone: '9876543210',
          },
        ],
      },
    ]);

    (sendSubscriptionExpiryNotice as jest.Mock).mockResolvedValueOnce({ success: true });
    (prisma.clinic.update as jest.Mock).mockResolvedValueOnce({});

    const res = await GET(createMockRequest());
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.autoExpiredCount).toBe(2);
    expect(json.expiringCount).toBe(1);
    expect(json.notifiedCount).toBe(1);

    expect(sendSubscriptionExpiryNotice).toHaveBeenCalledWith(
      '9876543210',
      'Dr. Ramesh Kumar',
      'Apollo Family Clinic',
      '14-Day Free Trial',
      expect.any(String),
      expect.any(Number)
    );

    expect(prisma.clinic.update).toHaveBeenCalledWith({
      where: { id: 'clinic-expiring-1' },
      data: { renewalReminderSentAt: expect.any(Date) },
    });
  });
});
