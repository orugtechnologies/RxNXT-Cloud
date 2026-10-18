import { POST } from '../../app/api/auth/register/route';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    clinic: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
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

describe('Auth Register API (Without NMC Gating)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects registration when required user credentials are missing', async () => {
    const req = {
      json: async () => ({
        fullName: '',
        email: '',
        password: '',
      }),
    } as any;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Full name, email/User ID, and password are required');
  });

  it('rejects registration when clinic name is missing and no invite code', async () => {
    const req = {
      json: async () => ({
        fullName: 'Dr. Test Doctor',
        email: 'doctor@test.com',
        password: 'password123',
        clinicName: '',
      }),
    } as any;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Clinic name is required');
  });

  it('rejects short passwords under 6 characters', async () => {
    const req = {
      json: async () => ({
        fullName: 'Dr. Test Doctor',
        email: 'doctor@test.com',
        password: '123',
        clinicName: 'Test Clinic',
      }),
    } as any;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Password must be at least 6 characters');
  });

  it('rejects duplicate email registrations', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user-1' });

    const req = {
      json: async () => ({
        fullName: 'Dr. Test Doctor',
        email: 'existing@test.com',
        password: 'password123',
        clinicName: 'Test Clinic',
      }),
    } as any;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toContain('already exists');
  });

  it('successfully creates clinic workspace with user credentials without NMC verification', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.clinic.create as jest.Mock).mockResolvedValue({
      id: 'clinic-created-123',
      name: 'City Health Clinic',
      subscriptionStatus: 'TRIAL',
    });
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-created-456',
      email: 'doctor@cityclinic.com',
      fullName: 'Dr. John Doe',
      role: 'clinic_admin',
      status: 'ACTIVE',
      clinicId: 'clinic-created-123',
    });

    const req = {
      json: async () => ({
        clinicName: 'City Health Clinic',
        clinicAddress: '123 MG Road, Bengaluru',
        clinicPhone: '+91 9876543210',
        fullName: 'Dr. John Doe',
        email: 'doctor@cityclinic.com',
        password: 'securePassword123',
        specialization: 'Cardiologist',
        phone: '+91 9876543210',
      }),
    } as any;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.clinicId).toBe('clinic-created-123');
    expect(data.userId).toBe('user-created-456');
    expect(data.status).toBe('ACTIVE');

    expect(prisma.clinic.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'City Health Clinic',
          address: '123 MG Road, Bengaluru',
          phone: '+91 9876543210',
          email: 'doctor@cityclinic.com',
          subscriptionStatus: 'TRIAL',
          subscriptionPlan: 'TRIAL_14_DAYS',
        }),
      })
    );

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fullName: 'Dr. John Doe',
          email: 'doctor@cityclinic.com',
          role: 'clinic_admin',
          status: 'ACTIVE',
          clinicId: 'clinic-created-123',
          specialization: 'Cardiologist',
        }),
      })
    );
  });
});
