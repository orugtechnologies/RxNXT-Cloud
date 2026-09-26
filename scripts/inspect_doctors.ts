import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      specialization: true,
      status: true,
      clinicId: true,
      clinic: { select: { name: true } },
    },
    orderBy: { email: 'asc' },
  });

  console.log(`Total users in database: ${users.length}\n`);
  for (const u of users) {
    console.log(`[${u.role.padEnd(12)}] ${u.email.padEnd(25)} | ${u.fullName.padEnd(30)} | Clinic: ${u.clinicId} (${u.clinic?.name})`);
  }

  const patientCount = await prisma.patient.count();
  const rxCount = await prisma.prescription.count();
  const queueCount = await prisma.queueItem.count();

  console.log(`\nPatients: ${patientCount}, Prescriptions: ${rxCount}, Queue Items: ${queueCount}`);
}

main().finally(() => prisma.$disconnect());
