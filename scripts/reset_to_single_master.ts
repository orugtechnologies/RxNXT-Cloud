import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting full database cleanup...\n');

  // 1. Delete all patient clinical data and transactions
  console.log('🗑️  Deleting all patient-related transactions and records...');
  await prisma.dispensedItem.deleteMany({});
  await prisma.dispenseLog.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.prescriptionMedicine.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.encounter.deleteMany({});
  await prisma.queueItem.deleteMany({});
  await prisma.patient.deleteMany({});
  console.log('✅ Patient records, queue items, encounters, reminders, and prescriptions cleared.');

  // 2. Delete templates and preference records
  await prisma.treatmentGroupItem.deleteMany({});
  await prisma.treatmentGroup.deleteMany({});
  await prisma.doctorDrugPreference.deleteMany({});

  // 3. Find or create the primary clinic
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        id: 'demo-clinic-001',
        name: 'RxNXT Clinic',
        address: '123 Health Street, Bengaluru',
        phone: '+91 80 1234 5678',
        email: 'info@rxnxtclinic.com',
        subscriptionStatus: 'TRIAL',
        subscriptionPlan: 'TRIAL_14_DAYS',
        subscriptionStartedAt: now,
        trialEndsAt: trialEnd,
        subscriptionEndsAt: trialEnd,
      },
    });
  } else {
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
  console.log(`🏥 Clinic: ${clinic.name} (${clinic.id}) with 14-day trial active until ${trialEnd.toLocaleDateString()}`);

  // 4. Delete all existing non-superadmin accounts
  console.log('🗑️  Removing all old demo staff and doctor accounts...');
  await prisma.user.deleteMany({
    where: {
      role: { not: 'superadmin' }
    }
  });

  // 5. Create ONLY ONE single master clinic account (Doctor + Clinic Admin)
  const hashedPassword = await bcrypt.hash('password123', 12);

  const masterAccount = await prisma.user.create({
    data: {
      email: 'doctor@rxnxt.com',
      password: hashedPassword,
      fullName: 'Dr. Shanmukha Datta',
      role: 'clinic_admin',
      specialization: 'General Physician & Diabetologist',
      medicalCouncil: 'Karnataka Medical Council',
      registrationNumber: 'KMC-54912',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      clinicId: clinic.id,
    },
  });

  console.log(`\n👑 Single Master Account Created:`);
  console.log(`   - Name: ${masterAccount.fullName}`);
  console.log(`   - Email: ${masterAccount.email}`);
  console.log(`   - Password: password123`);
  console.log(`   - Role: ${masterAccount.role} (Full Access to Consultations, Prescriptions, Staff, Doctors, Pharmacists, Inventory, and Settings)`);

  // 6. Ensure sample pharmacy stock exists in the clinic for testing dispensing
  const stockCount = await prisma.pharmacyItem.count({ where: { clinicId: clinic.id } });
  if (stockCount === 0) {
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
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
      ],
    });
    console.log(`📦 Seeded sample pharmacy stock.`);
  }

  console.log('\n✨ Database successfully reset to pristine state with 1 master account!');
}

main().finally(() => prisma.$disconnect());
