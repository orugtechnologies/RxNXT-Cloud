import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating / Updating Test Users in Supabase PostgreSQL...\n');

  // 1. Ensure Demo Clinic exists
  let clinic = await prisma.clinic.findFirst();

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        id: 'clinic-demo-main',
        name: 'RxNXT Model Clinic & Research Center',
        address: 'Plot 42, HSR Layout, Sector 2, Bengaluru, Karnataka 560102',
        phone: '+91 98765 43210',
        email: 'contact@rxnxtmodelclinic.com',
        inviteCode: 'RXNXT2026',
      },
    });
    console.log(`✅ Created Primary Clinic: ${clinic.name} (ID: ${clinic.id})`);
  } else {
    console.log(`🏢 Using Clinic: ${clinic.name} (ID: ${clinic.id})`);
  }

  const defaultPasswordHash = (pwd: string) => bcrypt.hash(pwd, 12);

  // 2. User 1: DOCTOR
  const doctorPwd = await defaultPasswordHash('Doctor@123');
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@rxnxt.com' },
    update: {
      password: doctorPwd,
      fullName: 'Dr. Shanmukha Datta',
      role: 'doctor',
      status: 'ACTIVE',
      specialization: 'General Physician & Diabetologist',
      registrationNumber: 'KMC-2021-88492',
      medicalCouncil: 'Karnataka Medical Council',
      registrationYear: 2021,
      qualification: 'MBBS, MD (General Medicine)',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
    create: {
      email: 'doctor@rxnxt.com',
      password: doctorPwd,
      fullName: 'Dr. Shanmukha Datta',
      role: 'doctor',
      status: 'ACTIVE',
      specialization: 'General Physician & Diabetologist',
      registrationNumber: 'KMC-2021-88492',
      medicalCouncil: 'Karnataka Medical Council',
      registrationYear: 2021,
      qualification: 'MBBS, MD (General Medicine)',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
  });
  console.log(`👨‍⚕️ 1. Doctor Account Ready: ${doctor.email} | Name: ${doctor.fullName}`);

  // 3. User 2: RECEPTIONIST
  const receptionistPwd = await defaultPasswordHash('Reception@123');
  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@rxnxt.com' },
    update: {
      password: receptionistPwd,
      fullName: 'Priya Patel',
      role: 'receptionist',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
    create: {
      email: 'receptionist@rxnxt.com',
      password: receptionistPwd,
      fullName: 'Priya Patel',
      role: 'receptionist',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
  });
  console.log(`👩‍💼 2. Receptionist Account Ready: ${receptionist.email} | Name: ${receptionist.fullName}`);

  // 4. User 3: CLINIC ADMIN
  const adminPwd = await defaultPasswordHash('Admin@123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rxnxt.com' },
    update: {
      password: adminPwd,
      fullName: 'Dr. Orug Admin (Clinic Director)',
      role: 'clinic_admin',
      status: 'ACTIVE',
      specialization: 'Clinic Administration & Surgery',
      registrationNumber: 'NMC-2018-44219',
      medicalCouncil: 'National Medical Commission',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
    create: {
      email: 'admin@rxnxt.com',
      password: adminPwd,
      fullName: 'Dr. Orug Admin (Clinic Director)',
      role: 'clinic_admin',
      status: 'ACTIVE',
      specialization: 'Clinic Administration & Surgery',
      registrationNumber: 'NMC-2018-44219',
      medicalCouncil: 'National Medical Commission',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
  });
  console.log(`🏛️ 3. Clinic Admin Account Ready: ${admin.email} | Name: ${admin.fullName}`);

  // Bonus: NURSE
  const nursePwd = await defaultPasswordHash('Nurse@123');
  const nurse = await prisma.user.upsert({
    where: { email: 'nurse@rxnxt.com' },
    update: {
      password: nursePwd,
      fullName: 'Sister Anjali Nair',
      role: 'nurse',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
    create: {
      email: 'nurse@rxnxt.com',
      password: nursePwd,
      fullName: 'Sister Anjali Nair',
      role: 'nurse',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      clinicId: clinic.id,
    },
  });
  console.log(`🩺 4. (Bonus) Nurse Account Ready: ${nurse.email} | Name: ${nurse.fullName}`);

  // 5. Ensure sample patient queue items for immediate testing
  let testPatient = await prisma.patient.findFirst({ where: { clinicId: clinic.id } });
  if (!testPatient) {
    testPatient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        name: 'Ramesh Sharma',
        phone: '+919876543210',
        age: 45,
        gender: 'Male',
        address: 'HSR Layout, Bengaluru',
      },
    });
  }

  // Create an active waiting queue item for the doctor
  const existingQueue = await prisma.queueItem.findFirst({
    where: { patientId: testPatient.id, status: 'WAITING' },
  });

  if (!existingQueue) {
    await prisma.queueItem.create({
      data: {
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientId: testPatient.id,
        status: 'WAITING',
        tokenNumber: 101,
      },
    });
    console.log(`📋 Created Test Queue Item (Token #101) for Dr. ${doctor.fullName}`);
  }

  console.log('\n======================================================');
  console.log('✨ All 3 Dummy Users Created and Verified Successfully!');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error creating dummy users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
