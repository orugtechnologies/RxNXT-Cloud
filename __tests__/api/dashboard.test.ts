import { GET } from '../../app/api/dashboard/route';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getAuthenticatedUser } from '../../lib/auth-server';

// Mock dependencies
jest.mock('../../lib/prisma', () => ({
  prisma: {
    patient: { count: jest.fn() },
    prescription: { count: jest.fn(), findMany: jest.fn() },
    encounter: { findMany: jest.fn() },
    clinicDrugPreference: { findMany: jest.fn() },
  }
}));

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

jest.mock('../../lib/auth-server', () => ({
  getAuthenticatedUser: jest.fn()
}));

describe('Dashboard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if user is not authenticated', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);
    
    const response = await GET();
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('fetches and aggregates dashboard data for authenticated users', async () => {
    const mockUser = { clinicId: 'clinic-1', id: 'user-1' };
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock Prisma responses
    (prisma.patient.count as jest.Mock).mockResolvedValue(150);
    (prisma.prescription.count as jest.Mock).mockResolvedValue(300);
    
    // Recent Prescriptions Mock
    (prisma.prescription.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'rx-1',
        createdAt: new Date('2024-01-01'),
        patientId: 'p-1',
        patient: { name: 'John', age: 30, gender: 'Male' },
        encounter: { chiefComplaint: 'Fever', diagnosis: 'Flu', followUpDate: null },
        medicines: [{ id: 'm-1' }]
      }
    ]);

    // Followups Mock
    (prisma.encounter.findMany as jest.Mock).mockResolvedValue([]);
    
    // Frequent Meds Mock
    (prisma.clinicDrugPreference.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stats.total_patients).toBe(150);
    expect(data.stats.total_prescriptions).toBe(300);
    expect(data.recentPrescriptions).toHaveLength(1);
    expect(data.recentPrescriptions[0].patient_name).toBe('John');
  });
});
