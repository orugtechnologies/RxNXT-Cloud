import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating 3 Dummy Clinic & Doctor Accounts (d1, d2, d3)...\n');

  const dummyClinics = [
    {
      clinicId: 'clinic-d1',
      clinicName: 'RxNXT Health Clinic (D1)',
      address: 'Suite 101, Indiranagar, Bengaluru, Karnataka',
      phone: '+91 80 1111 0001',
      email: 'clinic.d1@rxnxt.com',
      inviteCode: 'INVITE-D1',
      doctorEmail: 'd1@rxnxt.com',
      doctorAltEmail: 'doctor.d1@rxnxt.com',
      doctorName: 'Dr. Shanmukha Datta (D1)',
      specialization: 'General Physician & Diabetologist',
      registrationNumber: 'NMC-D1-10293',
      passwordPlain: 'rxnxt@d1',
    },
    {
      clinicId: 'clinic-d2',
      clinicName: 'RxNXT Health Clinic (D2)',
      address: 'Suite 202, HSR Layout, Bengaluru, Karnataka',
      phone: '+91 80 2222 0002',
      email: 'clinic.d2@rxnxt.com',
      inviteCode: 'INVITE-D2',
      doctorEmail: 'd2@rxnxt.com',
      doctorAltEmail: 'doctor.d2@rxnxt.com',
      doctorName: 'Dr. Rajesh Varma (D2)',
      specialization: 'Consultant Physician (Internal Medicine)',
      registrationNumber: 'NMC-D2-20394',
      passwordPlain: 'rxnxt@d2',
    },
    {
      clinicId: 'clinic-d3',
      clinicName: 'RxNXT Health Clinic (D3)',
      address: 'Suite 303, Jubilee Hills, Hyderabad, Telangana',
      phone: '+91 40 3333 0003',
      email: 'clinic.d3@rxnxt.com',
      inviteCode: 'INVITE-D3',
      doctorEmail: 'd3@rxnxt.com',
      doctorAltEmail: 'doctor.d3@rxnxt.com',
      doctorName: 'Dr. Ananya Reddy (D3)',
      specialization: 'Consultant Cardiologist & Physician',
      registrationNumber: 'NMC-D3-30495',
      passwordPlain: 'rxnxt@d3',
    },
  ];

  for (const item of dummyClinics) {
    const clinic = await prisma.clinic.upsert({
      where: { id: item.clinicId },
      update: {
        name: item.clinicName,
        address: item.address,
        phone: item.phone,
        email: item.email,
        inviteCode: item.inviteCode,
      },
      create: {
        id: item.clinicId,
        name: item.clinicName,
        address: item.address,
        phone: item.phone,
        email: item.email,
        inviteCode: item.inviteCode,
      },
    });

    const hashedPassword = await bcrypt.hash(item.passwordPlain, 12);

    const doctor = await prisma.user.upsert({
      where: { email: item.doctorEmail },
      update: {
        fullName: item.doctorName,
        password: hashedPassword,
        role: 'clinic_admin',
        status: 'ACTIVE',
        specialization: item.specialization,
        registrationNumber: item.registrationNumber,
        medicalCouncil: 'National Medical Commission (NMC)',
        verificationStatus: 'VERIFIED',
        clinicId: clinic.id,
      },
      create: {
        email: item.doctorEmail,
        password: hashedPassword,
        fullName: item.doctorName,
        role: 'clinic_admin',
        status: 'ACTIVE',
        specialization: item.specialization,
        registrationNumber: item.registrationNumber,
        medicalCouncil: 'National Medical Commission (NMC)',
        verificationStatus: 'VERIFIED',
        clinicId: clinic.id,
      },
    });

    await prisma.user.upsert({
      where: { email: item.doctorAltEmail },
      update: {
        fullName: item.doctorName,
        password: hashedPassword,
        role: 'clinic_admin',
        status: 'ACTIVE',
        specialization: item.specialization,
        registrationNumber: item.registrationNumber,
        medicalCouncil: 'National Medical Commission (NMC)',
        verificationStatus: 'VERIFIED',
        clinicId: clinic.id,
      },
      create: {
        email: item.doctorAltEmail,
        password: hashedPassword,
        fullName: item.doctorName,
        role: 'clinic_admin',
        status: 'ACTIVE',
        specialization: item.specialization,
        registrationNumber: item.registrationNumber,
        medicalCouncil: 'National Medical Commission (NMC)',
        verificationStatus: 'VERIFIED',
        clinicId: clinic.id,
      },
    });

    console.log(`✅ Clinic Created: ${clinic.name} (${clinic.id})`);
    console.log(`   Doctor: ${doctor.fullName}`);
    console.log(`   Login Email: ${item.doctorEmail} (or ${item.doctorAltEmail})`);
    console.log(`   Password: ${item.passwordPlain}\n`);
  }

  console.log('✨ All 3 Dummy Clinics & Doctor Logins created successfully without any sample patients.');
}

main()
  .catch((e) => {
    console.error('❌ Error creating dummy accounts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
