const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRajKumari() {
  console.log('🔍 Checking database records for patient "Raj Kumari" and clinic "orughospital@orug.com"...\n');

  try {
    // 1. Find User / Clinic
    const user = await prisma.user.findFirst({
      where: { email: { contains: 'orughospital', mode: 'insensitive' } },
      include: { clinic: true }
    });
    console.log('User/Clinic:', user ? { id: user.id, email: user.email, clinicName: user.clinic?.name, clinicId: user.clinicId } : 'Not found');

    // 2. Find Patient "Raj Kumari"
    const patients = await prisma.patient.findMany({
      where: {
        name: { contains: 'Raj Kumari', mode: 'insensitive' }
      },
      include: {
        reminders: true,
        prescriptions: {
          include: {
            encounter: true,
            medicines: true
          }
        }
      }
    });

    console.log(`Found ${patients.length} patient records for Raj Kumari:`);
    console.dir(patients, { depth: null });

    // 3. Find all Reminders in the DB
    const allReminders = await prisma.reminder.findMany({
      include: {
        patient: true,
        prescription: {
          include: {
            clinic: true,
            doctor: true
          }
        }
      }
    });
    console.log(`\nTotal Reminders in DB: ${allReminders.length}`);
    console.dir(allReminders, { depth: null });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkRajKumari();
