const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendingReminders() {
  console.log('🔍 Checking for PENDING reminders in the database...\n');

  try {
    const now = new Date();
    const allPending = await prisma.reminder.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        patient: true,
        prescription: {
          include: {
            clinic: true,
            doctor: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });

    console.log(`Total PENDING Reminders in DB: ${allPending.length}\n`);

    if (allPending.length === 0) {
      console.log('✅ No PENDING reminders left for today. All due reminders have been processed!');
    } else {
      allPending.forEach((rem, idx) => {
        const schedDate = new Date(rem.scheduledFor).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`${idx + 1}. Patient: ${rem.patient?.name} (${rem.patient?.phone})`);
        console.log(`   Clinic: ${rem.prescription?.clinic?.name} | Doctor: ${rem.prescription?.doctor?.fullName}`);
        console.log(`   Type: ${rem.messageType} | Scheduled For: ${schedDate} IST`);
        console.log(`   Status: ${rem.status}\n`);
      });
    }

  } catch (err) {
    console.error('Error checking reminders:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingReminders();
