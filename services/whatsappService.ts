const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';

/**
 * Fires a non-blocking background ping to wake up the Render microservice if sleeping.
 */
export function ensureMicroserviceAwake(clinicId?: string) {
  try {
    fetch(`${MICROSERVICE_URL}/api/whatsapp/status?clinicId=${clinicId || 'default'}`).catch(() => {});
  } catch (e) {
    // Ignore error - background warm up
  }
}

function sanitizePhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  clean = clean.replace(/^0+/, '');
  return clean.startsWith('+') ? clean : `+91${clean}`;
}

async function sendViaMicroservice(
  formattedPhone: string, 
  messageBody: string, 
  pdfBase64?: string, 
  clinicId?: string
) {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formattedPhone,
        message: messageBody,
        pdfBase64: pdfBase64,
        clinicId: clinicId || 'default'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[WhatsApp Microservice Error]', errorData);
      
      let errMsg = errorData.error || 'Failed to send WhatsApp message via microservice';
      if (errorData.details) {
        errMsg += ` (Details: ${errorData.details})`;
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.warn('[WhatsApp Microservice] Failed to reach microservice:', error);
    throw new Error(error.message || 'WhatsApp microservice is offline or unreachable');
  }
}

/**
 * Sends a WhatsApp message containing an AI Treatment Plan Summary and prescription PDF URL.
 */
export async function sendPrescriptionPDF(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  pdfUrl: string,
  pdfBase64?: string,
  clinicId?: string,
  aiTreatmentSummary?: string
) {
  const formattedPhone = sanitizePhone(patientPhone);

  const messageBody = aiTreatmentSummary
    ? `Hello ${patientName}, your prescription from *${clinicName}* is ready!\n\n` +
      `${aiTreatmentSummary}\n\n` +
      `📄 *View / Download Official PDF Prescription:*\n${pdfUrl}\n\n` +
      `Get well soon!`
    : `Hello ${patientName}, your prescription from ${clinicName} is ready. \n\nYou can view it here: ${pdfUrl} \n\nGet well soon!`;

  return await sendViaMicroservice(formattedPhone, messageBody, pdfBase64, clinicId);
}

/**
 * Sends a Smart Slot medicine reminder message (Morning, Afternoon, Night).
 */
export async function sendMedicineReminder(
  patientPhone: string,
  patientName: string,
  medicineDetails: string,
  doctorName?: string,
  clinicName?: string,
  clinicId?: string,
  slotType: string = 'MORNING'
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const docStr = doctorName ? `Dr. ${doctorName}` : 'your doctor';
  const clinicStr = clinicName ? `*${clinicName}*` : 'your clinic';

  let headerIcon = '🌅';
  let slotTitle = 'Morning Dose Reminder';
  let foodNote = '🥛 Take with water as directed. Have a healthy day!';

  if (slotType === 'AFTERNOON') {
    headerIcon = '☀️';
    slotTitle = 'Afternoon Dose Reminder';
    foodNote = '🍱 Take after lunch as directed. Stay active!';
  } else if (slotType === 'NIGHT') {
    headerIcon = '🌙';
    slotTitle = 'Night Dose Reminder';
    foodNote = '😴 Take after dinner/bedtime as directed. Rest well tonight!';
  }

  const messageBody = `${headerIcon} *${slotTitle}*\n\n` +
    `Hello ${patientName}, health reminder from ${docStr} at ${clinicStr} to take your prescribed doses:\n\n` +
    `${medicineDetails}\n\n` +
    `${foodNote} 🩺`;

  return await sendViaMicroservice(formattedPhone, messageBody, undefined, clinicId);
}

/**
 * Sends a follow-up reminder message.
 */
export async function sendFollowUpReminder(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  doctorName: string,
  clinicId?: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hi ${patientName}, this is a reminder from ${clinicName} for your follow-up visit with Dr. ${doctorName} today. Please contact us if you need to reschedule.`;

  return await sendViaMicroservice(formattedPhone, messageBody, undefined, clinicId);
}

/**
 * Sends a monthly prescription refill reminder message for chronic medications.
 */
export async function sendRefillReminder(
  patientPhone: string,
  patientName: string,
  doctorName?: string,
  clinicName?: string,
  clinicId?: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const docStr = doctorName ? `Dr. ${doctorName}` : 'your doctor';
  const clinicStr = clinicName ? `*${clinicName}*` : 'your clinic';

  const messageBody = `🏥 *Monthly Care & Refill Reminder*\n\n` +
    `Hello ${patientName}, you have approximately 5 days of your regular prescribed medications remaining.\n\n` +
    `Please schedule your monthly health checkup and prescription refill with ${docStr} at ${clinicStr}.\n\n` +
    `📞 *Please call or visit the clinic to reserve your consultation slot!* 🩺`;

  return await sendViaMicroservice(formattedPhone, messageBody, undefined, clinicId);
}
