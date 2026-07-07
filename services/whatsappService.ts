import twilio from 'twilio';

// Initialize Twilio client using environment variables
// Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in .env
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'mock_sid_for_development';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'mock_token_for_development';
const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox Number

// Use a mock client if credentials are not provided (so local dev doesn't crash)
const isConfigured = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
const client = isConfigured ? twilio(accountSid, authToken) : null;

function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits except a leading plus
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  // Remove leading zeros
  clean = clean.replace(/^0+/, '');
  // Default to India country code if none provided
  return clean.startsWith('+') ? clean : `+91${clean}`;
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

  if (!client) {
    console.warn('[WhatsApp Mock] Prescription sent to', formattedPhone);
    console.warn('[WhatsApp Mock] Message:', messageBody);
    return { success: true, mocked: true };
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: `whatsapp:${formattedPhone}`,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp prescription:', error);
    throw new Error('Failed to send WhatsApp message');
  }
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

  if (!client) {
    console.warn('[WhatsApp Mock] Reminder sent to', formattedPhone);
    console.warn('[WhatsApp Mock] Message:', messageBody);
    return { success: true, mocked: true };
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: `whatsapp:${formattedPhone}`,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp reminder:', error);
    throw new Error('Failed to send WhatsApp reminder');
  }
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

  if (!client) {
    console.warn('[WhatsApp Mock] Follow-up Reminder sent to', formattedPhone);
    console.warn('[WhatsApp Mock] Message:', messageBody);
    return { success: true, mocked: true };
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: `whatsapp:${formattedPhone}`,
    });
    
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('Error sending WhatsApp follow-up reminder:', error);
    throw new Error('Failed to send WhatsApp follow-up reminder');
  }
}

