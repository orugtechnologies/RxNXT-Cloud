import { GET as getOrders, POST as createOrder } from '@/app/api/lab/orders/route';
import { PUT as updateResult } from '@/app/api/lab/results/[id]/route';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    labOrder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    labTestResult: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    queueItem: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-server', () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('Lab Diagnostics API Endpoints', () => {
  const mockUser = {
    id: 'user-tech-1',
    clinicId: 'clinic-123',
    role: 'lab_technician',
    fullName: 'Ramesh Kumar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/lab/orders', () => {
    it('returns 401 if unauthenticated', async () => {
      (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(null);
      const req = { url: 'http://localhost:3000/api/lab/orders' } as any;
      const res = await getOrders(req);
      expect(res.status).toBe(401);
    });

    it('fetches lab orders scoped to the authenticated clinic', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'LAB-20261114-0001',
          clinicId: 'clinic-123',
          patient: { name: 'Rajesh Sharma' },
          tests: [{ id: 'test-1', testName: 'Complete Blood Count (CBC)' }],
        },
      ];

      (prisma.labOrder.findMany as jest.Mock).mockResolvedValueOnce(mockOrders);

      const req = { url: 'http://localhost:3000/api/lab/orders' } as any;
      const res = await getOrders(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(prisma.labOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clinicId: 'clinic-123' }),
        })
      );
    });
  });

  describe('POST /api/lab/orders', () => {
    it('creates a lab order with pre-populated template parameters', async () => {
      (prisma.labOrder.count as jest.Mock).mockResolvedValueOnce(0);
      (prisma.labOrder.create as jest.Mock).mockResolvedValueOnce({
        id: 'order-new',
        orderNumber: 'LAB-20261114-0001',
        clinicId: 'clinic-123',
        patientId: 'patient-1',
        status: 'ORDERED',
        tests: [
          {
            id: 'test-cbc',
            testName: 'Complete Blood Count (CBC)',
            templateType: 'CBC',
            status: 'PENDING',
          },
        ],
      });

      const req = {
        json: async () => ({
          patientId: 'patient-1',
          tests: [{ testName: 'Complete Blood Count (CBC)', category: 'BLOOD' }],
        }),
      } as any;

      const res = await createOrder(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(prisma.labOrder.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/lab/results/[id]', () => {
    it('saves parameter results and updates queue to RETURNED_READY', async () => {
      (prisma.labTestResult.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'test-1',
        testName: 'Complete Blood Count (CBC)',
        labOrder: {
          id: 'order-1',
          clinicId: 'clinic-123',
          patientId: 'patient-1',
          tests: [{ id: 'test-1', status: 'PENDING' }],
        },
      });

      (prisma.labTestResult.update as jest.Mock).mockResolvedValueOnce({
        id: 'test-1',
        testName: 'Complete Blood Count (CBC)',
        status: 'COMPLETED',
        isAbnormal: false,
      });

      (prisma.queueItem.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'q-1',
        status: 'IN_PROCEDURE',
      });

      const req = {
        json: async () => ({
          results: [
            { id: 'hb', name: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '12-17', isAbnormal: false, flag: 'NORMAL' },
          ],
          impression: 'Normal CBC report.',
          technicianName: 'Ramesh Kumar',
        }),
      } as any;

      const res = await updateResult(req, { params: { id: 'test-1' } });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.queueUpdated).toBe(true);
      expect(prisma.queueItem.update).toHaveBeenCalledWith({
        where: { id: 'q-1' },
        data: { status: 'RETURNED_READY' },
      });
    });
  });
});
