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

import { POST } from '../../app/api/doctor/voice-rx/route';

describe('Voice Rx API (/api/doctor/voice-rx)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
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

  it('correctly parses user clinical prompt with separate durations and meal instructions in any order', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock Gemini fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    chiefComplaint: 'Viral fever',
                    diagnosis: 'Acute Febrile Illness',
                    medicines: [
                      {
                        name: 'Dolo 650',
                        dosage_form: 'Tablet',
                        strength: '650mg',
                        frequency: '1-0-1',
                        duration: '3 days',
                        instructions: 'After Food',
                      },
                      {
                        name: 'Pantocid 40',
                        dosage_form: 'Tablet',
                        strength: '40mg',
                        frequency: '1-0-0',
                        duration: '5 days',
                        instructions: 'Before Food',
                      },
                    ],
                    followUpDays: 3,
                  }),
                },
              ],
            },
          },
        ],
      }),
    }) as any;

    const transcript =
      'Patient has viral fever. Give Dolo 650 twice daily after food for 3 days, and Pantocid 40 once daily before food for 5 days. Review in 3 days.';

    const req = {
      json: async () => ({ transcript }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicines.length).toBe(2);

    // Medicine 1: Dolo 650
    const dolo = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('dolo'));
    expect(dolo).toBeDefined();
    expect(dolo.name).toBe('Dolo 650');
    expect(dolo.frequency).toBe('1-0-1');
    expect(dolo.duration).toBe('3 days');
    expect(dolo.instructions).toBe('After Food');

    // Medicine 2: Pantocid 40
    const pantocid = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('pantocid'));
    expect(pantocid).toBeDefined();
    expect(pantocid.name).toBe('Pantocid 40');
    expect(pantocid.frequency).toBe('1-0-0');
    expect(pantocid.duration).toBe('5 days');
    expect(pantocid.instructions).toBe('Before Food');

    expect(data.data.chiefComplaint).toBe('Viral fever');
    expect(data.data.followUpDays).toBe(3);
  });

  it('correctly auto-corrects browser speech recognition phonetics like "tholo" and "pantalos it"', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue(null);

    // Test fallback parsing when Gemini fetch is not mocked or fails
    global.fetch = jest.fn().mockRejectedValue(new Error('Network offline'));

    const speechTranscript =
      'Patient has viral fever give tholo 650 twice daily after food for 3 days and pantalos it 40m once daily before food for 5 days review in 3 days';

    const req = {
      json: async () => ({ transcript: speechTranscript }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.medicines.length).toBe(2);

    const dolo = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('dolo'));
    expect(dolo).toBeDefined();
    expect(dolo.duration).toBe('3 days');

    const pantocid = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('pantocid'));
    expect(pantocid).toBeDefined();
    expect(pantocid.duration).toBe('5 days');
    expect(pantocid.instructions).toBe('Before Food');
  });
});
