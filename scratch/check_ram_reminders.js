const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTodaySent() {
  const sentToday = await prisma.reminder.findMany({
    where: {
      patient: {
        name: { contains: 'Ram' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      prescription: {
        include: {
          medicines: true
        }
      }
    }
  });

  console.log('--- ALL REMINDERS FOR RAM ---');
  sentToday.forEach((r) => {
    console.log(`ID: ${r.id} | Type: ${r.messageType} | Status: ${r.status}`);
    console.log(`Scheduled: ${new Date(r.scheduledFor).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`SentAt: ${r.sentAt ? new Date(r.sentAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'NOT SENT'}`);
    console.log(`Created: ${new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`);
  });
}

checkTodaySent().catch(console.error).finally(() => prisma.$disconnect());
