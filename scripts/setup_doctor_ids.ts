import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking and Configuring Doctor Accounts (D1, D2, D3)...\n');

  let clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        id: 'clinic-demo-main',
        name: 'RxNXT Demo Health Center',
        address: '123 Health Street, Bengaluru, Karnataka',
        phone: '+91 80 1234 5678',
        email: 'info@rxnxtdemo.com',
      },
    });
  }

  const doctors = [
    {
      emails: ['d1@rxnxt.com', 'doctor.d1@rxnxt.com'],
      password: 'rxnxt@d1',
      fullName: 'Dr. Shanmukha Datta (D1)',
      specialization: 'General Physician',
      regNo: 'KMC-2021-001',
      council: 'Karnataka Medical Council',
      role: 'doctor',
    },
    {
      emails: ['d2@rxnxt.com', 'doctor.d2@rxnxt.com'],
      password: 'rxnxt@d2',
      fullName: 'Dr. Rajesh Varma (D2)',
      specialization: 'Cardiologist',
      regNo: 'APMC-2019-002',
      council: 'Andhra Pradesh Medical Council',
      role: 'doctor',
    },
    {
      emails: ['d3@rxnxt.com', 'doctor.d3@rxnxt.com'],
      password: 'rxnxt@d3',
      fullName: 'Dr. Ananya Reddy (D3)',
      specialization: 'Pediatrician',
      regNo: 'TSMC-2020-003',
      council: 'Telangana State Medical Council',
      role: 'doctor',
    },
  ];

  for (const doc of doctors) {
    const hashedPassword = await bcrypt.hash(doc.password, 12);

    for (const email of doc.emails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          password: hashedPassword,
          fullName: doc.fullName,
          role: 'doctor',
          status: 'ACTIVE',
          specialization: doc.specialization,
          registrationNumber: doc.regNo,
          medicalCouncil: doc.council,
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          clinicId: clinic.id,
        },
        create: {
          email,
          password: hashedPassword,
          fullName: doc.fullName,
          role: 'doctor',
          status: 'ACTIVE',
          specialization: doc.specialization,
          registrationNumber: doc.regNo,
          medicalCouncil: doc.council,
          verificationStatus: 'VERIFIED',
          verifiedAt: new Date(),
          clinicId: clinic.id,
        },
      });

      // Validate bcrypt compare
      const isMatch = await bcrypt.compare(doc.password, user.password);
      console.log(`✅ ${email} -> Password: "${doc.password}" | Active: ${user.status} | Verified: ${user.verificationStatus} | Bcrypt Check: ${isMatch ? 'PASSED' : 'FAILED'}`);
    }
  }

  console.log('\n✨ All D1, D2, and D3 accounts are verified and active in database!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
