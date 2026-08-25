const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';

function sanitizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  clean = clean.replace(/^0+/, '');
  return clean.startsWith('+') ? clean : `+91${clean}`;
}

async function sendViaMicroservice(formattedPhone, messageBody, clinicId) {
  const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: formattedPhone,
      message: messageBody,
      clinicId: clinicId || 'default'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send WhatsApp message');
  }
  return await response.json();
}

async function triggerPendingReminders() {
  console.log('🚀 Triggering PENDING Reminders now...\n');

  try {
    const now = new Date();
    const dueReminders = await prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now }
      },
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

    console.log(`Found ${dueReminders.length} PENDING reminders due for today:`);

    for (const reminder of dueReminders) {
      console.log(`\nProcessing Reminder for ${reminder.patient.name} (${reminder.patient.phone})...`);

      const formattedPhone = sanitizePhone(reminder.patient.phone);
      const doctorName = reminder.prescription?.doctor?.fullName || 'your doctor';
      const clinicName = reminder.prescription?.clinic?.name || 'the clinic';

      const dateStr = reminder.scheduledFor
        ? new Date(reminder.scheduledFor).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
          })
        : 'today';

      const messageBody = `Hello ${reminder.patient.name}, this is a follow-up reminder from Dr. ${doctorName} at ${clinicName}. Your follow-up appointment is scheduled for ${dateStr}. Please call the clinic if you wish to reschedule.`;

      console.log(`Sending message to ${formattedPhone} via Render microservice...`);

      try {
        const res = await sendViaMicroservice(formattedPhone, messageBody, reminder.prescription?.clinicId);
        console.log(`✅ Success for ${reminder.patient.name}:`, res);

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'SENT', sentAt: new Date() }
        });
      } catch (err) {
        console.error(`❌ Failed for ${reminder.patient.name}:`, err.message);
      }
    }

  } catch (err) {
    console.error('Error triggering reminders:', err);
  } finally {
    await prisma.$disconnect();
  }
}

triggerPendingReminders();
