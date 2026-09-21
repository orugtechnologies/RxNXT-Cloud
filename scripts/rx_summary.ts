import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prescriptions = await prisma.prescription.findMany({
    include: {
      doctor: true,
      patient: true,
      medicines: true,
      reminders: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const reminders = await prisma.reminder.findMany({
    include: {
      patient: true,
      prescription: {
        include: {
          doctor: true,
        },
      },
    },
  });

  console.log('--- PRESCRIPTION TABLE DATA ---');
  console.log(JSON.stringify(prescriptions.map(p => ({
    id: p.id,
    doctor: p.doctor.fullName,
    doctorEmail: p.doctor.email,
    patient: p.patient.name,
    patientPhone: p.patient.phone,
    createdAt: p.createdAt,
    timeTakenSeconds: p.timeTakenSeconds,
    medicineCount: p.medicines.length,
    medicines: p.medicines.map(m => m.customName || m.dosageForm).join(', '),
    remindersCount: p.reminders.length,
    sentReminders: p.reminders.filter(r => r.status === 'SENT').length,
    supersededReminders: p.reminders.filter(r => r.status === 'SUPERSEDED').length,
  })), null, 2));

  const sentCount = reminders.filter(r => r.status === 'SENT').length;
  const supersededCount = reminders.filter(r => r.status === 'SUPERSEDED').length;
  const failedCount = reminders.filter(r => r.status === 'FAILED').length;
  const pendingCount = reminders.filter(r => r.status === 'PENDING').length;

  console.log('\n--- WHATSAPP SUMMARY ---');
  console.log(`Total Reminders Logged: ${reminders.length}`);
  console.log(`Successfully Sent (Meta wamid): ${sentCount}`);
  console.log(`Superseded (Auto-replaced by newer Rx): ${supersededCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Pending: ${pendingCount}`);
}

main().finally(() => prisma.$disconnect());
