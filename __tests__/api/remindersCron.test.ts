import { GET } from '../../app/api/cron/reminders/route';
import { prisma } from '../../lib/prisma';
import { sendMedicineReminder } from '../../services/whatsappService';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    reminder: {
      updateMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  },
}));

jest.mock('../../services/whatsappService', () => ({
  sendMedicineReminder: jest.fn(),
  sendFollowUpReminder: jest.fn(),
  sendRefillReminder: jest.fn(),
  isMetaConfigured: jest.fn().mockReturnValue(true),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('GET /api/cron/reminders (Atomic Concurrency & Stalled Recovery)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = () => ({
    headers: {
      get: jest.fn().mockReturnValue(null),
    },
    url: 'http://localhost:3000/api/cron/reminders',
  } as any);

  it('hard-fails abandoned jobs with >= 2 attempts and resets 1-attempt jobs to PENDING', async () => {
    (prisma.reminder.updateMany as jest.Mock)
      .mockResolvedValueOnce({ count: 2 }) // gte 2 attempts -> FAILED
      .mockResolvedValueOnce({ count: 3 }); // lt 2 attempts -> PENDING

    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]); // no new pending to claim

    const req = createMockRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);

    // Verify hard-fail of gte 2 attempts
    expect(prisma.reminder.updateMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PROCESSING',
          attempts: { gte: 2 },
        }),
        data: { status: 'FAILED' },
      })
    );

    // Verify recovery of lt 2 attempts
    expect(prisma.reminder.updateMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PROCESSING',
          attempts: { lt: 2 },
        }),
        data: { status: 'PENDING' },
      })
    );
  });

  it('dispatches claimed reminders and records providerMessageId on success', async () => {
    (prisma.reminder.updateMany as jest.Mock)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 0 });

    // Simulate PostgreSQL SKIP LOCKED claiming reminder_1
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ id: 'reminder_1' }]);

    (prisma.reminder.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'reminder_1',
        messageType: 'MEDICINE_MORNING',
        patient: { id: 'p_1', name: 'John Doe', phone: '9876543210' },
        prescription: {
          id: 'rx_1',
          clinicId: 'clinic_1',
          doctor: { fullName: 'Dr. Shanmukha' },
          clinic: { name: 'City Clinic' },
          medicines: [
            { customName: 'Paracetamol', strength: '650mg', frequency: '1-0-1', instructions: 'After Food' },
          ],
        },
      },
    ]);

    (sendMedicineReminder as jest.Mock).mockResolvedValueOnce({
      success: true,
      messageId: 'wamid.meta_msg_999',
    });

    (prisma.reminder.update as jest.Mock).mockResolvedValueOnce({});

    const req = createMockRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.processedCount).toBe(1);
    expect(data.successCount).toBe(1);

    expect(prisma.reminder.update).toHaveBeenCalledWith({
      where: { id: 'reminder_1' },
      data: expect.objectContaining({
        status: 'SENT',
        providerMessageId: 'wamid.meta_msg_999',
      }),
    });
  });

  it('formats complete day doses (Morning + Afternoon + Night) into single morning briefing without dropping medicines', async () => {
    (prisma.reminder.updateMany as jest.Mock)
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 0 });

    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ id: 'reminder_2' }]);

    (prisma.reminder.findMany as jest.Mock).mockResolvedValueOnce([
      {
        id: 'reminder_2',
        messageType: 'MEDICINE_MORNING',
        patient: { id: 'p_2', name: 'Priya Sharma', phone: '9876543211' },
        prescription: {
          id: 'rx_2',
          clinicId: 'clinic_1',
          doctor: { fullName: 'Dr. Shanmukha' },
          clinic: { name: 'City Clinic' },
          medicines: [
            { customName: 'Pantoprazole', strength: '40mg', frequency: '1-0-0', instructions: 'Before Food' },
            { customName: 'Amoxicillin', strength: '500mg', frequency: '1-1-1', instructions: 'After Food' },
            { customName: 'Cetirizine', strength: '10mg', frequency: '0-0-1', instructions: 'At Bedtime' },
          ],
        },
      },
    ]);

    (sendMedicineReminder as jest.Mock).mockResolvedValueOnce({
      success: true,
      messageId: 'wamid.meta_msg_1000',
    });

    (prisma.reminder.update as jest.Mock).mockResolvedValueOnce({});

    const req = createMockRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);

    // Verify sendMedicineReminder received all three slots (Morning, Afternoon, Night) in the single dispatch
    expect(sendMedicineReminder).toHaveBeenCalledWith(
      '9876543211',
      'Priya Sharma',
      expect.stringContaining('🌅 Morning:'),
      'Dr. Shanmukha',
      'City Clinic',
      'clinic_1',
      'DAILY'
    );

    const callArgs = (sendMedicineReminder as jest.Mock).mock.calls[0];
    const medicineDetailsArg = callArgs[2];

    // Assert Morning contains Pantoprazole & Amoxicillin
    expect(medicineDetailsArg).toContain('🌅 Morning:');
    expect(medicineDetailsArg).toContain('"Pantoprazole 40mg - Before Food"');
    expect(medicineDetailsArg).toContain('"Amoxicillin 500mg - After Food"');

    // Assert Afternoon contains Amoxicillin
    expect(medicineDetailsArg).toContain('☀️ Afternoon:');
    expect(medicineDetailsArg).toContain('"Amoxicillin 500mg - After Food"');

    // Assert Night contains Amoxicillin & Cetirizine (previously Cetirizine was filtered out!)
    expect(medicineDetailsArg).toContain('🌙 Night:');
    expect(medicineDetailsArg).toContain('"Cetirizine 10mg - At Bedtime"');
  });
});
