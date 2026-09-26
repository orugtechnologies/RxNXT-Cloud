import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Syncing demo accounts in PostgreSQL database...\n');

  // Find or create the primary demo clinic
  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    clinic = await prisma.clinic.create({
      data: {
        id: 'demo-clinic-001',
        name: 'RxNXT Demo Clinic',
        address: '123 Health Street, Bengaluru',
        phone: '+91 80 1234 5678',
        email: 'info@rxnxtdemo.com',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionStartedAt: now,
        trialEndsAt: trialEnd,
        subscriptionEndsAt: trialEnd,
      },
    });
  } else {
    // Ensure 14-day trial is active for the existing clinic
    const now = new Date();
    if (!clinic.subscriptionEndsAt || clinic.subscriptionEndsAt < now) {
      const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      clinic = await prisma.clinic.update({
        where: { id: clinic.id },
        data: {
          subscriptionStatus: 'TRIAL',
          subscriptionPlan: 'TRIAL_14_DAYS',
          subscriptionStartedAt: now,
          trialEndsAt: trialEnd,
          subscriptionEndsAt: trialEnd,
        },
      });
    }
  }

  console.log(`🏥 Active Clinic: ${clinic.name} (${clinic.id}) | Sub: ${clinic.subscriptionStatus}`);

  const hashedPassword = await bcrypt.hash('password123', 12);
  const superAdminPassword = await bcrypt.hash('admin123', 12);

  const demoAccounts = [
    {
      email: 'doctor@rxnxt.com',
      password: hashedPassword,
      fullName: 'Dr. Shanmukha Datta',
      role: 'clinic_admin',
      specialization: 'General Physician & Diabetologist',
      medicalCouncil: 'NMC / Karnataka Medical Council',
      registrationNumber: 'KMC-54912',
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
    {
      email: 'receptionist@rxnxt.com',
      password: hashedPassword,
      fullName: 'Pooja Verma (Front Desk)',
      role: 'receptionist',
      specialization: 'OPD Front Desk',
      medicalCouncil: null,
      registrationNumber: null,
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
    {
      email: 'pharmacist@rxnxt.com',
      password: hashedPassword,
      fullName: 'Suresh Sharma (Chief Pharmacist)',
      role: 'pharmacist',
      specialization: 'Dispensing Specialist',
      medicalCouncil: null,
      registrationNumber: null,
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
    {
      email: 'admin@rxnxt.com',
      password: hashedPassword,
      fullName: 'Dr. Shanmukha Datta (Admin)',
      role: 'clinic_admin',
      specialization: 'Clinic Director',
      medicalCouncil: 'NMC',
      registrationNumber: 'KMC-54912',
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
    {
      email: 'dev@rxnxt.com',
      password: hashedPassword,
      fullName: 'Dr. Dev Tester',
      role: 'clinic_admin',
      specialization: 'General Medicine',
      medicalCouncil: 'NMC',
      registrationNumber: 'DEV-12345',
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
    {
      email: 'superadmin@rxnxt.com',
      password: superAdminPassword,
      fullName: 'RxNXT Executive Superadmin',
      role: 'superadmin',
      specialization: 'Platform Administrator',
      medicalCouncil: null,
      registrationNumber: null,
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
  ];

  for (const acc of demoAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        password: acc.password,
        role: acc.role,
        clinicId: acc.clinicId,
        fullName: acc.fullName,
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
      },
      create: {
        email: acc.email,
        password: acc.password,
        fullName: acc.fullName,
        role: acc.role,
        specialization: acc.specialization,
        medicalCouncil: acc.medicalCouncil,
        registrationNumber: acc.registrationNumber,
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
        clinicId: acc.clinicId,
      },
    });
    console.log(`✅ Upserted ${user.email} (${user.role}) - Password set to ${acc.email === 'superadmin@rxnxt.com' ? 'admin123' : 'password123'}`);
  }

  // Seed sample inventory for the clinic if empty
  const stockCount = await prisma.pharmacyItem.count({ where: { clinicId: clinic.id } });
  if (stockCount === 0) {
    const now = new Date();
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

    await prisma.pharmacyItem.createMany({
      data: [
        {
          clinicId: clinic.id,
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
          clinicId: clinic.id,
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
          clinicId: clinic.id,
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
          clinicId: clinic.id,
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
      ],
    });
    console.log(`📦 Seeded sample pharmacy inventory for clinic ${clinic.id}`);
  }

  console.log('\n✨ All demo accounts and pharmacy inventory synchronized successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
