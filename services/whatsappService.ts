const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';

function sanitizePhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  clean = clean.replace(/^0+/, '');
  return clean.startsWith('+') ? clean : `+91${clean}`;
}

async function sendViaMicroservice(formattedPhone: string, messageBody: string, pdfBase64?: string, clinicId?: string) {
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
 * Sends a WhatsApp message containing a prescription PDF URL and summary.
 */
export async function sendPrescriptionPDF(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  pdfUrl: string,
  pdfBase64?: string,
  clinicId?: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hello ${patientName}, your prescription from ${clinicName} is ready. \n\nYou can view it here: ${pdfUrl} \n\nGet well soon!`;

  return await sendViaMicroservice(formattedPhone, messageBody, pdfBase64, clinicId);
}

/**
 * Sends a generic medicine reminder message.
 */
export async function sendMedicineReminder(
  patientPhone: string,
  patientName: string,
  medicineName: string,
  clinicId?: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hi ${patientName}, this is a gentle reminder to take your medicine: *${medicineName}*.`;

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
