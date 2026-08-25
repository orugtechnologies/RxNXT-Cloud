const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reminders = await prisma.reminder.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      patient: true,
      prescription: {
        include: {
          doctor: true,
          clinic: true,
          medicines: true
        }
      }
    }
  });

  console.log('--- LATEST REMINDERS GENERATED IN DATABASE ---');
  if (reminders.length === 0) {
    console.log('No reminders found in database.');
    return;
  }

  reminders.forEach((r, idx) => {
    console.log(`${idx + 1}. Patient: ${r.patient?.name} (${r.patient?.phone})`);
    console.log(`   Doctor: Dr. ${r.prescription?.doctor?.fullName} | Clinic: ${r.prescription?.clinic?.name}`);
    console.log(`   Type: ${r.messageType} | Status: ${r.status}`);
    console.log(`   Scheduled For (IST): ${new Date(r.scheduledFor).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`   Medicines (${r.prescription?.medicines?.length}): ${r.prescription?.medicines?.map(m => m.customName).join(', ')}\n`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
