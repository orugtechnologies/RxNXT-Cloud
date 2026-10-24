import { prisma } from '../../lib/prisma';
import { getAuthenticatedUser } from '../../lib/auth-server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => {
      return {
        status: init?.status || 200,
        json: async () => data,
      };
    }),
  },
}));

jest.mock('../../lib/prisma', () => ({
  prisma: {
    drug: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../lib/auth-server', () => ({
  getAuthenticatedUser: jest.fn(),
}));

// Import after mocking next/server
import { POST } from '../../app/api/doctor/voice-rx/route';

describe('Voice Rx API (/api/doctor/voice-rx)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if doctor is not authenticated', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

    const req = {
      json: async () => ({ transcript: 'Dolo 650 1-0-1 3 days' }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 if transcript is missing or too short', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    const req = {
      json: async () => ({ transcript: '' }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Please provide a valid spoken transcript');
  });

  it('correctly parses clinical transcript into diagnosis, medicines and instructions', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue({
      id: 'drug-dolo-650',
      brandName: 'Dolo 650',
      genericName: 'Paracetamol',
      dosageForm: 'Tablet',
      strength: '650mg',
    });

    const transcript =
      'Patient complaining of fever and cough for 2 days. Give Dolo 650 1-0-1 for 3 days after food. Review in 3 days.';

    const req = {
      json: async () => ({ transcript }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicines.length).toBeGreaterThan(0);

    const dolo = data.data.medicines.find((m: any) => m.name.includes('Dolo'));
    expect(dolo).toBeDefined();
    expect(dolo.frequency).toBe('1-0-1');
    expect(dolo.duration).toBe('3 days');
    expect(dolo.instructions).toBe('After Food');
    expect(data.data.followUpDays).toBe(3);
  });
});
