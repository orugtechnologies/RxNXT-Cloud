import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      clinic: true,
      prescriptions: {
        include: {
          patient: true,
          medicines: true,
          reminders: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      encounters: {
        include: {
          patient: true,
        },
      },
    },
  });

  const allReminders = await prisma.reminder.findMany({
    include: {
      patient: true,
      prescription: {
        include: {
          doctor: true,
        },
      },
    },
  });

  console.log('=== DOCTOR-BY-DOCTOR SUMMARY ===');
  for (const u of users) {
    if (u.prescriptions.length === 0 && u.encounters.length === 0) continue;

    console.log(`\n👨‍⚕️ Doctor: ${u.fullName} (${u.email}) [Role: ${u.role}]`);
    console.log(`  Clinic: ${u.clinic?.name}`);
    console.log(`  Total Encounters: ${u.encounters.length}`);
    console.log(`  Total Prescriptions Triggered: ${u.prescriptions.length}`);

    const times = u.prescriptions.map(p => p.timeTakenSeconds).filter((t): t is number => t !== null);
    const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 'N/A';
    console.log(`  Average Prescription Creation Time: ${avgTime}s (Recorded times: ${times.join(', ') || 'N/A'})`);

    console.log('  Prescriptions Detail:');
    u.prescriptions.forEach((p, i) => {
      console.log(`    [#${i+1}] Patient: ${p.patient?.name} (Phone: ${p.patient?.phone})`);
      console.log(`         Created At: ${p.createdAt.toISOString()}`);
      console.log(`         Time Taken: ${p.timeTakenSeconds != null ? `${p.timeTakenSeconds}s` : 'Instant / Legacy'}`);
      console.log(`         Medicines (${p.medicines.length}): ${p.medicines.map(m => m.customName || m.dosageForm).join(', ')}`);
      console.log(`         Reminders Scheduled: ${p.reminders.length} (Statuses: ${p.reminders.map(r => `${r.messageType}:${r.status}`).join(', ')})`);
    });
  }

  console.log('\n=== WHATSAPP REMINDERS ACCURACY & STATUS BREAKDOWN ===');
  const statusCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};

  allReminders.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    typeCounts[r.messageType] = (typeCounts[r.messageType] || 0) + 1;
  });

  console.log('Status Counts:', JSON.stringify(statusCounts, null, 2));
  console.log('Type Counts:', JSON.stringify(typeCounts, null, 2));

  // Check any FAILED reminders
  const failed = allReminders.filter(r => r.status === 'FAILED');
  console.log(`\nFailed Reminders: ${failed.length}`);
  failed.forEach(f => {
    console.log(`- Patient: ${f.patient.name} (${f.patient.phone}) | Type: ${f.messageType} | Attempts: ${f.attempts}`);
  });

  // Check SENT reminders
  const sent = allReminders.filter(r => r.status === 'SENT');
  console.log(`\nSuccessfully Sent Reminders: ${sent.length}`);
  sent.forEach(s => {
    console.log(`- Patient: ${s.patient.name} (${s.patient.phone}) | Type: ${s.messageType} | SentAt: ${s.sentAt?.toISOString()} | ProviderMsgId: ${s.providerMessageId || 'N/A'}`);
  });

  // Check PENDING reminders
  const pending = allReminders.filter(r => r.status === 'PENDING');
  console.log(`\nPending Future Reminders: ${pending.length}`);
  pending.slice(0, 10).forEach(p => {
    console.log(`- Patient: ${p.patient.name} (${p.patient.phone}) | Type: ${p.messageType} | ScheduledFor: ${p.scheduledFor.toISOString()}`);
  });
}

main().finally(() => prisma.$disconnect());
