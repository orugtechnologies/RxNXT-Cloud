import { POST } from '../../app/api/prescriptions/save/route';
import { prisma } from '../../lib/prisma';
import { getAuthenticatedUser } from '../../lib/auth-server';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    patient: {
      findFirst: jest.fn(),
    },
    drug: {
      findMany: jest.fn(),
    },
    prescription: {
      findMany: jest.fn(),
    },
    reminder: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock('../../lib/auth-server', () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('../../lib/subscription', () => ({
  getClinicSubscription: jest.fn().mockResolvedValue({
    allowed: true,
    status: 'TRIAL',
    plan: 'TRIAL_14_DAYS',
    daysRemaining: 14,
    isExpired: false,
  }),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('Smart Superseding in Prescription Save API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('supersedes only the active doctor acute reminders while protecting other doctors and REFILL reminders', async () => {
    const mockDoctor = {
      id: 'doc_cardio_1',
      clinicId: 'clinic_main',
      fullName: 'Dr. Shanmukha',
      role: 'doctor',
    };

    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockDoctor);

    (prisma.patient.findFirst as jest.Mock).mockResolvedValue({
      id: 'patient_rahul_1',
      clinicId: 'clinic_main',
      name: 'Rahul',
    });

    (prisma.drug.findMany as jest.Mock).mockResolvedValue([]);

    const mockTx = {
      encounter: {
        create: jest.fn().mockResolvedValue({ id: 'enc_new_1' }),
      },
      prescription: {
        create: jest.fn().mockResolvedValue({ id: 'rx_new_1' }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'rx_cardio_old_1' }, // belongs to doc_cardio_1
        ]),
      },
      prescriptionMedicine: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      reminder: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
        createMany: jest.fn().mockResolvedValue({ count: 5 }),
      },
      queueItem: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      drug: {
        update: jest.fn(),
      },
      doctorDrugPreference: {
        upsert: jest.fn(),
      },
      clinicDrugPreference: {
        upsert: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return await callback(mockTx);
    });

    const req = {
      json: async () => ({
        patientId: 'patient_rahul_1',
        medicines: [
          {
            drugId: 'drug_dolo',
            name: 'Dolo 650',
            dosage_form: 'Tablet',
            strength: '650mg',
            frequency: '1-0-1',
            duration: '3 days',
            instructions: 'After Food',
          },
        ],
        chiefComplaint: 'Headache and fever',
      }),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(201);

    // 1. Must query previous prescriptions belonging strictly to THIS DOCTOR (doc_cardio_1)
    expect(mockTx.prescription.findMany).toHaveBeenCalledWith({
      where: {
        patientId: 'patient_rahul_1',
        doctorId: 'doc_cardio_1',
      },
      select: { id: true },
    });

    // 2. Must only supersede reminders linked to rx_cardio_old_1 (this doctor) and only acute message types
    expect(mockTx.reminder.updateMany).toHaveBeenCalledWith({
      where: {
        patientId: 'patient_rahul_1',
        prescriptionId: { in: ['rx_cardio_old_1'] },
        status: 'PENDING',
        messageType: {
          in: ['MEDICINE', 'MEDICINE_MORNING', 'MEDICINE_AFTERNOON', 'MEDICINE_NIGHT', 'FOLLOW_UP'],
        },
      },
      data: {
        status: 'SUPERSEDED',
      },
    });
  });
});
