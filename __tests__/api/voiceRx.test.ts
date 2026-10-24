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

  it('resolves candidate medicines against the drug database and rejects non-drug speech', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    // Mock Gemini fetch response returning Dolo and Pantocid
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

    // Both Dolo and Pantocid resolved against the catalog
    const dolo = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('dolo'));
    expect(dolo).toBeDefined();
    expect(dolo.frequency).toBe('1-0-1');
    expect(dolo.duration).toBe('3 days');
    expect(dolo.instructions).toBe('After Food');

    const panto = data.data.medicines.find((m: any) => m.name.toLowerCase().includes('pan'));
    expect(panto).toBeDefined();
    expect(panto.frequency).toBe('1-0-0');
    expect(panto.duration).toBe('5 days');
  });

  it('rejects garbled speech like "As 658 wise daily" when not found in the drug database', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock Gemini returning an unrecognized word
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
                    chiefComplaint: null,
                    diagnosis: null,
                    medicines: [
                      {
                        name: 'As 658 wise daily',
                        dosage_form: 'Tablet',
                        frequency: '1-0-1',
                        duration: '3 days',
                        instructions: 'After Food',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
    }) as any;

    const req = {
      json: async () => ({ transcript: 'As 658 wise daily for 3 days' }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    // Must return 422 Unprocessable Entity and NOT add the gibberish to the cart
    expect(res.status).toBe(422);
    expect(data.error).toContain('Could not match any valid medicine from your speech in the drug database');
  });

  it('processes direct base64 audio payload via Gemini Flash multimodal audio', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

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
                    transcript: 'Patient has viral fever. Give Dolo 650 twice daily after food for 3 days.',
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

    const req = {
      json: async () => ({
        audio: 'GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwEAAAAAA...',
        mimeType: 'audio/webm;codecs=opus',
      }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.source).toBe('gemini_3.8_flash_audio');
    expect(data.data.medicines.length).toBe(1);
    expect(data.data.medicines[0].name).toContain('Dolo');
    expect(data.data.transcript).toContain('viral fever');
  });

  it('correctly maps "patient as viral fever give Dolo 650" to Dolo and NOT Glipizide', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue(null);

    // Simulate fallback parsing (no Gemini API call or fetch error)
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const req = {
      json: async () => ({
        transcript:
          'patient as viral fever give Dolo 650 twice daily after food for 3 days and fantastic 41 stayly before food for 5 days review in 3 days',
      }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // Must resolve Dolo and Pantocid, definitely NOT Glipizide!
    const names = data.data.medicines.map((m: any) => m.name.toLowerCase());
    expect(names.some((n: string) => n.includes('dolo'))).toBe(true);
    expect(names.some((n: string) => n.includes('pan'))).toBe(true);
    expect(names.some((n: string) => n.includes('glipizide'))).toBe(false);
  });

  it('correctly extracts Dolo 650 and Azithral from Telugu OPD dictation', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      id: 'doc-1',
      clinicId: 'clinic-1',
    });

    (prisma.drug.findFirst as jest.Mock).mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const req = {
      json: async () => ({
        transcript:
          'and body pencil nayi first one clear two days and body pains on my Dolo 650 mg morning and night was calling and azithrol morning was calling',
      }),
    } as any;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const meds = data.data.medicines;
    expect(meds.length).toBeGreaterThanOrEqual(2);

    const dolo = meds.find((m: any) => m.name.toLowerCase().includes('dolo'));
    expect(dolo).toBeDefined();
    expect(dolo.frequency).toBe('1-0-1');

    const azithral = meds.find((m: any) => m.name.toLowerCase().includes('azithral'));
    expect(azithral).toBeDefined();
  });
});
