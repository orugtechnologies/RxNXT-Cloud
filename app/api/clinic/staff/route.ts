export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== 'clinic_admin' && user.role !== 'doctor' && user.role !== 'superadmin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check existing staff
    const existingStaff = await prisma.user.findMany({
      where: { 
        clinicId: user.clinicId,
        role: { in: ['receptionist', 'nurse', 'pharmacist'] }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const hasReceptionist = existingStaff.some(s => s.role === 'receptionist');
    const hasPharmacist = existingStaff.some(s => s.role === 'pharmacist');

    // Auto-attach or provision Receptionist if missing
    if (!hasReceptionist) {
      const rec = await prisma.user.findFirst({
        where: { email: 'receptionist@rxnxt.com' },
      });
      if (rec) {
        await prisma.user.update({
          where: { id: rec.id },
          data: { clinicId: user.clinicId, status: 'ACTIVE' },
        });
      } else {
        const hashedPassword = await bcrypt.hash('password123', 12);
        await prisma.user.create({
          data: {
            email: 'receptionist@rxnxt.com',
            password: hashedPassword,
            fullName: 'Pooja Verma (Front Desk)',
            role: 'receptionist',
            specialization: 'OPD Reception & Patient Onboarding',
            status: 'ACTIVE',
            clinicId: user.clinicId,
          },
        });
      }
    }

    // Auto-attach or provision Pharmacist if missing
    if (!hasPharmacist) {
      const pharm = await prisma.user.findFirst({
        where: {
          OR: [
            { email: 'pharmacist@rxnxt.com' },
            { email: 'pharmacy@rxnxt.com' },
          ],
        },
      });
      if (pharm) {
        await prisma.user.update({
          where: { id: pharm.id },
          data: { clinicId: user.clinicId, status: 'ACTIVE' },
        });
      } else {
        const hashedPassword = await bcrypt.hash('password123', 12);
        await prisma.user.create({
          data: {
            email: 'pharmacist@rxnxt.com',
            password: hashedPassword,
            fullName: 'Suresh Sharma (Chief Pharmacist)',
            role: 'pharmacist',
            specialization: 'Dispensing & Inventory Specialist',
            status: 'ACTIVE',
            clinicId: user.clinicId,
          },
        });
      }

      // Seed initial sample inventory for the clinic pharmacy if empty
      const existingItems = await prisma.pharmacyItem.count({ where: { clinicId: user.clinicId } });
      if (existingItems === 0) {
        const now = new Date();
        const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        const nextMonth = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

        await prisma.pharmacyItem.createMany({
          data: [
            {
              clinicId: user.clinicId,
              medicineName: 'Paracetamol 650mg (Dolo)',
              genericName: 'Paracetamol',
              dosageForm: 'Tablet',
              strength: '650mg',
              batchNumber: 'DL-2026-A1',
              expiryDate: nextYear,
              quantityInStock: 250,
              minReorderLevel: 50,
              unitPrice: 32.0,
              costPrice: 22.0,
              rackLocation: 'Rack A-1',
            },
            {
              clinicId: user.clinicId,
              medicineName: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)',
              genericName: 'Amoxicillin + Clavulanic Acid',
              dosageForm: 'Tablet',
              strength: '625mg',
              batchNumber: 'AUG-8891',
              expiryDate: nextYear,
              quantityInStock: 80,
              minReorderLevel: 20,
              unitPrice: 195.0,
              costPrice: 150.0,
              rackLocation: 'Rack B-3',
            },
            {
              clinicId: user.clinicId,
              medicineName: 'Pantoprazole 40mg (Pan-40)',
              genericName: 'Pantoprazole',
              dosageForm: 'Tablet',
              strength: '40mg',
              batchNumber: 'PAN-7721',
              expiryDate: nextYear,
              quantityInStock: 140,
              minReorderLevel: 30,
              unitPrice: 110.0,
              costPrice: 85.0,
              rackLocation: 'Rack A-4',
            },
            {
              clinicId: user.clinicId,
              medicineName: 'Cetirizine 10mg (Cetzine)',
              genericName: 'Cetirizine',
              dosageForm: 'Tablet',
              strength: '10mg',
              batchNumber: 'CTZ-4410',
              expiryDate: nextMonth,
              quantityInStock: 15,
              minReorderLevel: 25,
              unitPrice: 45.0,
              costPrice: 30.0,
              rackLocation: 'Rack C-2',
            },
            {
              clinicId: user.clinicId,
              medicineName: 'Azithromycin 500mg (Azithral)',
              genericName: 'Azithromycin',
              dosageForm: 'Tablet',
              strength: '500mg',
              batchNumber: 'AZT-9002',
              expiryDate: nextYear,
              quantityInStock: 60,
              minReorderLevel: 15,
              unitPrice: 125.0,
              costPrice: 95.0,
              rackLocation: 'Rack B-1',
            },
          ],
        });
      }
    }

    // Refetch the complete list of staff
    const staff = await prisma.user.findMany({
      where: { 
        clinicId: user.clinicId,
        role: { in: ['receptionist', 'nurse', 'pharmacist'] }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
