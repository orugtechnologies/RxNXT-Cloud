import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true, role: true } });
  console.log('--- USERS ---');
  console.table(users);

  const patients = await prisma.patient.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, phone: true, createdAt: true } });
  console.log('--- RECENT PATIENTS ---');
  console.table(patients);

  const queue = await prisma.queueItem.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 5,
    include: { doctor: { select: { email: true } }, patient: { select: { name: true } } } 
  });
  console.log('--- RECENT QUEUE ITEMS ---');
  queue.forEach(q => console.log(q.id, q.status, q.createdAt, 'Doc:', q.doctor?.email, 'Pat:', q.patient?.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
