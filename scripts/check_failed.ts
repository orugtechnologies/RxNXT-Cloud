import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const failed = await prisma.reminder.findMany({
    where: { status: 'FAILED' },
    include: {
      patient: true,
      prescription: {
        include: {
          doctor: true,
          clinic: true,
        },
      },
    },
  });

  console.log('--- FAILED REMINDERS ANALYSIS ---');
  failed.forEach((f, idx) => {
    console.log(`[#${idx+1}] ID: ${f.id}`);
    console.log(`  Patient: ${f.patient.name} | Phone: ${f.patient.phone}`);
    console.log(`  Doctor: ${f.prescription?.doctor?.fullName} (${f.prescription?.doctor?.email})`);
    console.log(`  Type: ${f.messageType} | Scheduled: ${f.scheduledFor.toISOString()}`);
    console.log(`  Attempts: ${f.attempts} | Last Attempt: ${f.lastAttemptAt?.toISOString()}`);
    console.log(`  Provider Message ID: ${f.providerMessageId || 'None'}`);
    console.log(`  Created At: ${f.createdAt.toISOString()}`);
  });
}

main().finally(() => prisma.$disconnect());
