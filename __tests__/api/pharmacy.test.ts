import { GET as getInventory, POST as createInventory } from '@/app/api/pharmacy/inventory/route';
import { POST as dispensePrescription } from '@/app/api/pharmacy/dispense/route';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pharmacyItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    prescription: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    dispenseLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
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

describe('Pharmacy & Inventory System API', () => {
  const mockUser = {
    id: 'pharmacist-1',
    clinicId: 'clinic-demo',
    role: 'pharmacist',
    fullName: 'Suresh Sharma',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/pharmacy/inventory', () => {
    it('returns inventory items scoped to clinic', async () => {
      const mockItems = [
        { id: 'item-1', medicineName: 'Paracetamol 650mg', quantityInStock: 200, unitPrice: 30.0 },
      ];
      (prisma.pharmacyItem.findMany as jest.Mock).mockResolvedValueOnce(mockItems);

      const req = { url: 'http://localhost:3000/api/pharmacy/inventory' } as any;
      const res = await getInventory(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toEqual(mockItems);
    });
  });

  describe('POST /api/pharmacy/inventory', () => {
    it('creates a new inventory stock item', async () => {
      const newItem = {
        id: 'item-2',
        medicineName: 'Azithromycin 500mg',
        quantityInStock: 50,
        unitPrice: 120.0,
      };
      (prisma.pharmacyItem.create as jest.Mock).mockResolvedValueOnce(newItem);

      const req = {
        json: async () => ({
          medicineName: 'Azithromycin 500mg',
          quantityInStock: 50,
          unitPrice: 120.0,
        }),
      } as any;

      const res = await createInventory(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.item.medicineName).toBe('Azithromycin 500mg');
    });
  });

  describe('POST /api/pharmacy/dispense', () => {
    it('dispenses prescription, creates dispense log, and decrements stock', async () => {
      (prisma.prescription.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'rx-101',
        clinicId: 'clinic-demo',
        patientId: 'patient-1',
        patient: { name: 'John Doe' },
      });

      const mockDispenseLog = {
        id: 'dispense-log-1',
        prescriptionId: 'rx-101',
        totalAmount: 60.0,
        items: [{ medicineName: 'Paracetamol 650mg', quantity: 2, unitPrice: 30.0 }],
      };

      (prisma.dispenseLog.create as jest.Mock).mockResolvedValueOnce(mockDispenseLog);
      (prisma.pharmacyItem.update as jest.Mock).mockResolvedValueOnce({});
      (prisma.prescription.update as jest.Mock).mockResolvedValueOnce({
        id: 'rx-101',
        dispenseStatus: 'DISPENSED',
      });

      const req = {
        json: async () => ({
          prescriptionId: 'rx-101',
          paymentMode: 'UPI',
          items: [
            {
              pharmacyItemId: 'item-1',
              medicineName: 'Paracetamol 650mg',
              quantity: 2,
              unitPrice: 30.0,
            },
          ],
        }),
      } as any;

      const res = await dispensePrescription(req);
      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(prisma.dispenseLog.create).toHaveBeenCalled();
      expect(prisma.pharmacyItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantityInStock: { decrement: 2 } },
      });
      expect(prisma.prescription.update).toHaveBeenCalledWith({
        where: { id: 'rx-101' },
        data: { dispenseStatus: 'DISPENSED' },
      });
    });
  });
});
