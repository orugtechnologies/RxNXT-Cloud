import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up duplicate and legacy doctor accounts in demo-clinic-002...\n');

  const clinicId = 'demo-clinic-002';
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Find or verify the primary doctor
  const primaryDoctor = await prisma.user.findUnique({
    where: { email: 'doctor@rxnxt.com' },
  });

  if (!primaryDoctor) {
    console.error('Primary doctor doctor@rxnxt.com not found!');
    return;
  }

  const redundantEmails = [
    'doctor.d1@rxnxt.com',
    'd1@rxnxt.com',
    'doctor.d2@rxnxt.com',
    'doctor.d3@rxnxt.com',
    'orughospital@orug.com',
    'admin@rxnxt.com',
    'dev@rxnxt.com',
  ];

  for (const email of redundantEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.id !== primaryDoctor.id) {
      // Re-link prescriptions
      await prisma.prescription.updateMany({
        where: { doctorId: user.id },
        data: { doctorId: primaryDoctor.id },
      });

      // Re-link queue items
      await prisma.queueItem.updateMany({
        where: { doctorId: user.id },
        data: { doctorId: primaryDoctor.id },
      });

      // Re-link encounters
      await prisma.encounter.updateMany({
        where: { doctorId: user.id },
        data: { doctorId: primaryDoctor.id },
      });

      // Delete/re-link treatmentGroups and doctorDrugPreferences
      await prisma.treatmentGroup.deleteMany({
        where: { doctorId: user.id },
      });

      await prisma.doctorDrugPreference.deleteMany({
        where: { doctorId: user.id },
      });

      // Delete the duplicate user
      await prisma.user.delete({ where: { id: user.id } });
      console.log(`🗑️ Removed duplicate user: ${email} (${user.fullName})`);
    }
  }

  // Ensure clean, distinct roster for multi-doctor OPD
  const cleanRoster = [
    {
      email: 'doctor@rxnxt.com',
      fullName: 'Dr. Shanmukha Datta',
      specialization: 'General Physician & Diabetologist',
      role: 'clinic_admin',
    },
    {
      email: 'd2@rxnxt.com',
      fullName: 'Dr. Rajesh Varma',
      specialization: 'Cardiologist',
      role: 'doctor',
    },
    {
      email: 'd3@rxnxt.com',
      fullName: 'Dr. Ananya Reddy',
      specialization: 'Pediatrician',
      role: 'doctor',
    },
  ];

  for (const doc of cleanRoster) {
    await prisma.user.upsert({
      where: { email: doc.email },
      update: {
        fullName: doc.fullName,
        specialization: doc.specialization,
        role: doc.role,
        clinicId,
        password: hashedPassword,
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      create: {
        email: doc.email,
        fullName: doc.fullName,
        specialization: doc.specialization,
        role: doc.role,
        clinicId,
        password: hashedPassword,
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
    });
    console.log(`✅ Clean Doctor Roster: ${doc.fullName} (${doc.specialization}) - [${doc.email}]`);
  }

  console.log('\n✨ Database doctor roster successfully cleaned and streamlined!');
}

main().finally(() => prisma.$disconnect());
