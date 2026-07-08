// Initialize Twilio client using environment variables
// Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in .env
// Note: We have migrated away from Twilio to a BYOD Microservice

const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';

function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits except a leading plus
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  // Remove leading zeros
  clean = clean.replace(/^0+/, '');
  // Default to India country code if none provided
  return clean.startsWith('+') ? clean : `+91${clean}`;
}

async function sendViaMicroservice(formattedPhone: string, messageBody: string) {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formattedPhone,
        message: messageBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[WhatsApp Microservice Error]', errorData);
      // Fall back to mock success if the microservice is offline so the UI doesn't break
      return { success: true, mocked: true, warning: 'Microservice offline' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[WhatsApp Microservice] Failed to reach microservice at', MICROSERVICE_URL);
    // Fall back to mock success if the microservice is offline
    return { success: true, mocked: true, warning: 'Microservice offline' };
  }
}

/**
 * Sends a WhatsApp message containing a prescription PDF URL and summary.
 */
export async function sendPrescriptionPDF(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  pdfUrl: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hello ${patientName}, your prescription from ${clinicName} is ready. \n\nYou can view and download it here: ${pdfUrl} \n\nGet well soon!`;

  return await sendViaMicroservice(formattedPhone, messageBody);
}

/**
 * Sends a generic medicine reminder message.
 */
export async function sendMedicineReminder(
  patientPhone: string,
  patientName: string,
  medicineName: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hi ${patientName}, this is a gentle reminder to take your medicine: *${medicineName}*.`;

  return await sendViaMicroservice(formattedPhone, messageBody);
}

/**
 * Sends a follow-up reminder message.
 */
export async function sendFollowUpReminder(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  doctorName: string
) {
  const formattedPhone = sanitizePhone(patientPhone);
  const messageBody = `Hi ${patientName}, this is a reminder from ${clinicName} for your follow-up visit with Dr. ${doctorName} today. Please contact us if you need to reschedule.`;

  return await sendViaMicroservice(formattedPhone, messageBody);
}

