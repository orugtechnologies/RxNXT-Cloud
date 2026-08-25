const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function triggerLiveTestReminder() {
  console.log('🚀 Finding latest PENDING reminder for testing...\n');

  const reminder = await prisma.reminder.findFirst({
    where: {
      status: 'PENDING'
    },
    orderBy: {
      createdAt: 'desc'
    },
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

  if (!reminder) {
    console.log('No pending reminder found.');
    return;
  }

  const { patient, prescription } = reminder;
  console.log(`Found Reminder #${reminder.id}`);
  console.log(`Patient: ${patient.name} (${patient.phone})`);
  console.log(`Doctor: Dr. ${prescription.doctor?.fullName} | Clinic: ${prescription.clinic?.name}`);
  console.log(`Type: ${reminder.messageType}\n`);

  const rawDocName = prescription?.doctor?.fullName || 'Kalyan Kumar';
  const cleanDocName = rawDocName.trim().toLowerCase().startsWith('dr') ? rawDocName.trim() : `Dr. ${rawDocName.trim()}`;
  const clinicName = prescription?.clinic?.name || 'Orug Super Specialty Clinic';

  const medicinesList = prescription?.medicines
    ?.map((m) => {
      const name = m.customName || 'Medicine';
      const strength = m.strength ? ` ${m.strength}` : '';
      let rawInst = (m.instructions || '').trim();
      let inst = rawInst;
      if (rawInst) {
        if (/after\s+(meals?|food)/i.test(rawInst)) {
          inst = 'After Food';
        } else if (/before\s+(meals?|food)/i.test(rawInst)) {
          inst = 'Before Food';
        } else if (/with\s+(meals?|food)/i.test(rawInst)) {
          inst = 'With Food';
        }
      }
      const instStr = inst ? ` - ${inst}` : '';
      return `"${name}${strength}${instStr}"`;
    })
    .filter(Boolean)
    .join('\n');

  const formattedPhone = patient.phone.replace(/[^\d]/g, '');
  const cleanPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  const messageBody = `🌅 *Morning Dose Reminder*\n\n` +
    `Hello ${patient.name}, health reminder from ${cleanDocName} at *${clinicName}* to take your prescribed doses:\n\n` +
    `${medicinesList}\n\n` +
    `🥛 Take medicine as per the direction. Have a healthy day`;

  console.log('Sending test Smart Slot WhatsApp message to Render microservice...');

  const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';
  
  const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: cleanPhone,
      message: messageBody,
      clinicId: prescription?.clinicId || 'default'
    }),
  });

  const data = await response.json();
  console.log('✅ WhatsApp Microservice Send Result:', data);
}

triggerLiveTestReminder().finally(() => prisma.$disconnect());
