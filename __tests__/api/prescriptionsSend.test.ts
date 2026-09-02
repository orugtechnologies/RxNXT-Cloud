import { POST } from '../../app/api/prescriptions/send/route';
import { prisma } from '../../lib/prisma';
import { getAuthenticatedUser } from '../../lib/auth-server';
import { sendPrescriptionPDF } from '../../services/whatsappService';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    prescription: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../lib/auth-server', () => ({
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('../../services/whatsappService', () => ({
  sendPrescriptionPDF: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('POST /api/prescriptions/send (Multi-Tenant Authorization & WhatsApp Dispatch)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => ({
    json: async () => body,
  } as any);

  it('returns 401 Unauthorized if user is not logged in', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce(null);

    const req = createMockRequest({ prescriptionId: 'rx_123' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 if prescription is not found', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce({
      id: 'user_1',
      clinicId: 'clinic_A',
      role: 'doctor',
    });
    (prisma.prescription.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const req = createMockRequest({ prescriptionId: 'rx_nonexistent' });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('blocks cross-tenant access and returns 403 Forbidden if clinicId does not match', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce({
      id: 'doctor_clinic_A',
      clinicId: 'clinic_A',
      role: 'doctor',
    });

    // Prescription belongs to clinic_B
    (prisma.prescription.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'rx_clinic_B',
      clinicId: 'clinic_B',
      patient: { id: 'p_1', name: 'Jane Doe', phone: '9876543210' },
      clinic: { id: 'clinic_B', name: 'Clinic B' },
      medicines: [],
    });

    const req = createMockRequest({ prescriptionId: 'rx_clinic_B' });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Forbidden');
    expect(sendPrescriptionPDF).not.toHaveBeenCalled();
  });

  it('allows send and dispatches WhatsApp message when clinicId matches authenticated user', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValueOnce({
      id: 'doctor_clinic_A',
      clinicId: 'clinic_A',
      role: 'doctor',
    });

    (prisma.prescription.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'rx_clinic_A',
      clinicId: 'clinic_A',
      patient: { id: 'p_1', name: 'Jane Doe', phone: '9876543210' },
      clinic: { id: 'clinic_A', name: 'Clinic A' },
      medicines: [{ customName: 'Paracetamol', strength: '650mg' }],
    });

    (sendPrescriptionPDF as jest.Mock).mockResolvedValueOnce({
      success: true,
      provider: 'meta',
      messageId: 'wamid.123',
    });

    const req = createMockRequest({ prescriptionId: 'rx_clinic_A' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(sendPrescriptionPDF).toHaveBeenCalledWith(
      '9876543210',
      'Jane Doe',
      'Clinic A',
      expect.stringContaining('/patient/prescription/rx_clinic_A/view'),
      undefined,
      'clinic_A',
      expect.any(String)
    );
  });
});
