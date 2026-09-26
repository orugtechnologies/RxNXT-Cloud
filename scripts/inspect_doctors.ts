import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { clinicId: 'demo-clinic-002', role: { in: ['doctor', 'clinic_admin'] } },
    include: {
      _count: {
        select: {
          prescriptions: true,
          queueItems: true,
        },
      },
    },
    orderBy: { fullName: 'asc' },
  });

  console.log('Doctors in demo-clinic-002:\n');
  for (const u of users) {
    console.log(`- ${u.fullName} (${u.email}) [Role: ${u.role}] -> Rx: ${u._count.prescriptions}, Queue: ${u._count.queueItems}, ID: ${u.id}`);
  }
}

main().finally(() => prisma.$disconnect());
