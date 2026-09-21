import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('================================================================');
  console.log('📊 RxNXT Comprehensive Testing & Clinical Activity Audit Report');
  console.log('================================================================\n');

  // 1. All Users and their roles
  const users = await prisma.user.findMany({
    include: {
      clinic: true,
      _count: {
        select: {
          encounters: true,
          prescriptions: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('--- 👤 USER ACCOUNTS OVERVIEW ---');
  for (const u of users) {
    console.log(`- Doctor/User: ${u.fullName} (${u.email}) [Role: ${u.role}]`);
    console.log(`  Clinic: ${u.clinic?.name} (ID: ${u.clinicId})`);
    console.log(`  Encounters Recorded: ${u._count.encounters} | Prescriptions Created: ${u._count.prescriptions}`);
    console.log('');
  }

  // 2. Total Patients Registered
  const patients = await prisma.patient.findMany({
    include: {
      clinic: true,
      encounters: {
        include: {
          doctor: true,
          prescription: {
            include: {
              medicines: true,
            },
          },
        },
      },
      reminders: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- 🏥 REGISTERED PATIENTS & CLINICAL ACTIVITY ---');
  console.log(`Total Registered Patients: ${patients.length}\n`);

  for (const p of patients) {
    console.log(`• Patient: ${p.name} | Phone: ${p.phone || 'N/A'} | Age: ${p.age || 'N/A'} | Gender: ${p.gender || 'N/A'}`);
    console.log(`  Registered At: ${p.createdAt.toISOString()} | Clinic: ${p.clinic?.name}`);
    console.log(`  Total Encounters: ${p.encounters.length} | Total WhatsApp Reminders Logged: ${p.reminders.length}`);

    if (p.encounters.length > 0) {
      p.encounters.forEach((enc, idx) => {
        const rx = enc.prescription;
        console.log(`    [Encounter #${idx + 1}] ID: ${enc.id} | Date: ${enc.createdAt.toISOString()}`);
        console.log(`      Doctor: Dr. ${enc.doctor?.fullName || 'N/A'} (${enc.doctor?.email})`);
        console.log(`      Chief Complaint: ${enc.chiefComplaint || 'None'}`);
        console.log(`      Diagnosis: ${enc.diagnosis || 'None'}`);
        console.log(`      Follow-up Date: ${enc.followUpDate || 'None'}`);
        if (rx) {
          console.log(`      Prescription ID: ${rx.id}`);
          console.log(`      ⏱️ Time Taken To Create: ${rx.timeTakenSeconds != null ? `${rx.timeTakenSeconds} seconds` : 'Not recorded (Instant / Legacy)'}`);
          console.log(`      Creation Method: ${rx.creationMethod || 'Standard Web UI'}`);
          console.log(`      Medicines Prescribed (${rx.medicines.length}):`);
          rx.medicines.forEach((m, mIdx) => {
            console.log(`        ${mIdx + 1}. ${m.customName || 'Drug'} | Strength: ${m.strength || 'N/A'} | Form: ${m.dosageForm || 'N/A'} | Frequency: ${m.frequency || 'N/A'} | Duration: ${m.duration || 'N/A'} | Notes: ${m.instructions || 'N/A'}`);
          });
        } else {
          console.log(`      Prescription: None attached`);
        }
      });
    }
    console.log('');
  }

  // 3. Prescriptions Summary
  const prescriptions = await prisma.prescription.findMany({
    include: {
      doctor: true,
      patient: true,
      clinic: true,
      medicines: true,
      reminders: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- 💊 ALL PRESCRIPTIONS SUMMARY ---');
  console.log(`Total Prescriptions Generated: ${prescriptions.length}\n`);

  for (const rx of prescriptions) {
    console.log(`Prescription ID: ${rx.id}`);
    console.log(`- Date & Time: ${rx.createdAt.toISOString()}`);
    console.log(`- Doctor: ${rx.doctor?.fullName} (${rx.doctor?.email})`);
    console.log(`- Patient: ${rx.patient?.name} (Phone: ${rx.patient?.phone})`);
    console.log(`- Clinic: ${rx.clinic?.name}`);
    console.log(`- ⏱️ Time Taken: ${rx.timeTakenSeconds != null ? `${rx.timeTakenSeconds}s` : 'N/A'}`);
    console.log(`- Medicines (${rx.medicines.length}): ${rx.medicines.map(m => m.customName || m.dosageForm).join(', ')}`);
    console.log(`- Associated Reminders: ${rx.reminders.length}`);
    console.log('------------------------------------------------------------');
  }

  // 4. WhatsApp Messages & Reminders Delivery Status
  const reminders = await prisma.reminder.findMany({
    include: {
      patient: true,
      prescription: {
        include: {
          doctor: true,
          clinic: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n--- 📱 WHATSAPP MESSAGES & REMINDERS DELIVERY AUDIT ---');
  console.log(`Total Scheduled/Triggered WhatsApp Messages: ${reminders.length}\n`);

  if (reminders.length === 0) {
    console.log('No background reminders found in the Reminder queue.');
  } else {
    for (const r of reminders) {
      console.log(`• Message ID: ${r.id}`);
      console.log(`  Patient: ${r.patient?.name} | Phone: ${r.patient?.phone}`);
      console.log(`  Doctor: ${r.prescription?.doctor?.fullName} | Clinic: ${r.prescription?.clinic?.name}`);
      console.log(`  Type: ${r.messageType} | Status: ${r.status}`);
      console.log(`  Scheduled For: ${r.scheduledFor.toISOString()} | Sent At: ${r.sentAt ? r.sentAt.toISOString() : 'Not yet / In Queue'}`);
      console.log(`  Attempts: ${r.attempts} | Provider Message ID: ${r.providerMessageId || 'N/A'}`);
      console.log(`  Created At: ${r.createdAt.toISOString()} | Updated At: ${r.updatedAt.toISOString()}`);
      console.log('');
    }
  }

  // 5. Queue Activity
  const queueItems = await prisma.queueItem.findMany({
    include: {
      patient: true,
      doctor: true,
      clinic: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- 📋 PATIENT QUEUE AUDIT ---');
  console.log(`Total Queue Items: ${queueItems.length}\n`);
  for (const q of queueItems) {
    console.log(`Token #${q.tokenNumber || 'N/A'} | Status: ${q.status} | Patient: ${q.patient?.name} (${q.patient?.phone}) | Doctor: ${q.doctor?.fullName} | Created: ${q.createdAt.toISOString()}`);
  }

}

main()
  .catch((e) => {
    console.error('Audit Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
