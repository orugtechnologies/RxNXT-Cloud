/**
 * RxNXT WhatsApp Service — 100% Meta WhatsApp Cloud API
 * 
 * Official Enterprise Transport via Meta Graph API.
 * Handles:
 * 1. Instant Prescription PDF Delivery
 * 2. Smart Slot Medicine Dose Reminders (8 AM, 1:30 PM, 8:30 PM)
 * 3. Doctor Follow-up Appointment Reminders
 * 4. Monthly 25-Day Chronic Care Refill Alerts
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalizes phone numbers to standard international E.164 digits format (e.g. 919876543210).
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/(?!^\+)[^\d]/g, '');
  clean = clean.replace(/^0+/, ''); // strip leading zeroes
  clean = clean.replace(/^\+/, ''); // strip leading '+' for Meta payload compatibility

  // If 10 digits (standard Indian mobile number), prepend India country code 91
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

const cleanEnv = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '').trim();

/**
 * Checks if Meta Cloud API is configured in the current environment.
 */
export function isMetaConfigured(): boolean {
  return Boolean(cleanEnv(process.env.META_WA_PHONE_NUMBER_ID) && cleanEnv(process.env.META_WA_ACCESS_TOKEN));
}

/**
 * Backwards compatibility: Meta Cloud API is hosted by Meta and does not require wake-up pings.
 */
export function ensureMicroserviceAwake(): void {
  // No-op
}

/**
 * Dispatches a message via Meta WhatsApp Cloud API with automatic retries for transient errors.
 */
async function sendViaMetaCloudAPI(
  payload: {
    to: string;
    type: 'text' | 'document' | 'template';
    text?: { preview_url?: boolean; body: string };
    document?: { link?: string; id?: string; filename: string; caption?: string };
    template?: { name: string; language: { code: string }; components?: any[] };
  },
  maxRetries = 2
): Promise<any> {
  const phoneNumberId = cleanEnv(process.env.META_WA_PHONE_NUMBER_ID);
  const accessToken = cleanEnv(process.env.META_WA_ACCESS_TOKEN);
  const graphApiVersion = cleanEnv(process.env.META_GRAPH_API_VERSION) || 'v20.0';

  // Fallback to local dev mock if keys are not set
  if (!phoneNumberId || !accessToken) {
    console.log(`[Meta WhatsApp Mock] Dispatched message to +${payload.to}:`, payload);
    return {
      success: true,
      provider: 'meta_mock',
      messageId: `mock_${Date.now()}`,
    };
  }

  const endpoint = `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`;
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          ...payload,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorInfo = data.error || {};
        const isTransient = response.status === 429 || response.status >= 500 || errorInfo.code === 80007;

        if (isTransient && attempt < maxRetries) {
          const backoffMs = (attempt + 1) * 1000;
          console.warn(`[Meta WhatsApp] Transient error (HTTP ${response.status}), retrying in ${backoffMs}ms...`);
          await sleep(backoffMs);
          attempt++;
          continue;
        }

        const errMsg = errorInfo.message || `Meta Cloud API request failed with HTTP status ${response.status}`;
        const finalErr = new Error(`[Meta WhatsApp API Error] ${errMsg} (Status: ${response.status}, Code: ${errorInfo.code}, Subcode: ${errorInfo.error_subcode})`);
        (finalErr as any).isPermanent = !isTransient;
        (finalErr as any).metaDebug = {
          endpoint,
          status: response.status,
          errorInfo,
          tokenLen: accessToken.length,
          tokenPrefix: accessToken.slice(0, 8),
          tokenSuffix: accessToken.slice(-8),
        };
        throw finalErr;
      }


      return {
        success: true,
        provider: 'meta',
        messageId: data.messages?.[0]?.id || 'sent',
        contacts: data.contacts,
      };
    } catch (err: any) {
      lastError = err;
      if (err.isPermanent) {
        throw err;
      }
      if (attempt < maxRetries) {
        attempt++;
        await sleep(attempt * 1000);
      } else {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to send WhatsApp message via Meta Cloud API');
}

/**
 * Uploads a base64 PDF to Meta WhatsApp Cloud API Media endpoint.
 * Returns the assigned Meta media ID.
 */
async function uploadPDFToMetaMedia(pdfBase64: string): Promise<string | null> {
  const phoneNumberId = cleanEnv(process.env.META_WA_PHONE_NUMBER_ID);
  const accessToken = cleanEnv(process.env.META_WA_ACCESS_TOKEN);
  const graphApiVersion = cleanEnv(process.env.META_GRAPH_API_VERSION) || 'v20.0';

  if (!phoneNumberId || !accessToken) return null;

  try {
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'application/pdf');
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'RxNXT_Prescription.pdf');

    const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    return data?.id || null;
  } catch (err) {
    console.warn('[Meta WhatsApp] Media upload failed, falling back to text dispatch:', err);
    return null;
  }
}

/**
 * Unified dispatch router for Meta WhatsApp Cloud API.
 */
async function dispatchWhatsAppMessage(options: {
  phone: string;
  messageBody: string;
  documentUrl?: string;
  documentMediaId?: string;
  clinicId?: string;
}) {
  const cleanPhone = sanitizePhone(options.phone);

  if (options.documentMediaId) {
    try {
      return await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'document',
        document: {
          id: options.documentMediaId,
          filename: 'RxNXT_Prescription.pdf',
          caption: options.messageBody,
        },
      });
    } catch (docErr) {
      console.warn('[Meta WhatsApp] Media ID document dispatch failed, falling back to text:', docErr);
    }
  }

  if (options.documentUrl) {
    try {
      return await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'document',
        document: {
          link: options.documentUrl,
          filename: 'RxNXT_Prescription.pdf',
          caption: options.messageBody,
        },
      });
    } catch (docErr) {
      console.warn('[Meta WhatsApp] Document media dispatch failed, falling back to rich text message:', docErr);
    }
  }

  return await sendViaMetaCloudAPI({
    to: cleanPhone,
    type: 'text',
    text: {
      preview_url: true,
      body: options.messageBody,
    },
  });
}


// ─────────────────────────────────────────────
// APPLICATION-LEVEL PUBLIC INTERFACES
// ─────────────────────────────────────────────

/**
 * Sends a WhatsApp message containing an AI Treatment Plan Summary and prescription PDF via Meta Cloud API.
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
  const messageBody = aiTreatmentSummary
    ? `Hello ${patientName}, your prescription from *${clinicName}* is ready!\n\n` +
      `${aiTreatmentSummary}\n\n` +
      `Get well soon!`
    : `Hello ${patientName}, your prescription from ${clinicName} is ready.\n\nGet well soon!`;

  let documentMediaId: string | undefined;
  if (pdfBase64) {
    const uploadedId = await uploadPDFToMetaMedia(pdfBase64);
    if (uploadedId) {
      documentMediaId = uploadedId;
    }
  }

  // Only attach documentUrl if it points to a direct downloadable .pdf file
  const isDirectPdf = Boolean(pdfUrl && pdfUrl.toLowerCase().endsWith('.pdf'));

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    documentMediaId,
    documentUrl: !documentMediaId && isDirectPdf ? pdfUrl : undefined,
    clinicId,
  });
}



/**
 * Sends a Smart Slot medicine reminder message (Morning, Afternoon, Night) via Meta Cloud API.
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
  const cleanDocName = doctorName
    ? doctorName.trim().toLowerCase().startsWith('dr')
      ? doctorName.trim()
      : `Dr. ${doctorName.trim()}`
    : 'your doctor';
  const docStr = doctorName ? cleanDocName : 'your doctor';
  const clinicStr = clinicName ? `*${clinicName}*` : 'your clinic';

  let headerIcon = '🌅';
  let slotTitle = 'Morning Dose Reminder';
  let foodNote = '🥛 Take medicine as per the direction. Have a healthy day';

  if (slotType === 'AFTERNOON') {
    headerIcon = '☀️';
    slotTitle = 'Afternoon Dose Reminder';
    foodNote = '🍱 Take medicine as per the direction. Have a healthy day';
  } else if (slotType === 'NIGHT') {
    headerIcon = '🌙';
    slotTitle = 'Night Dose Reminder';
    foodNote = '😴 Take medicine as per the direction. Have a healthy day';
  }

  const messageBody =
    `${headerIcon} *${slotTitle}*\n\n` +
    `Hello ${patientName}, health reminder from ${docStr} at ${clinicStr} to take your prescribed doses:\n\n` +
    `${medicineDetails}\n\n` +
    `${foodNote}`;

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    clinicId,
  });
}

/**
 * Sends a follow-up reminder message via Meta Cloud API.
 */
export async function sendFollowUpReminder(
  patientPhone: string,
  patientName: string,
  clinicName: string,
  doctorName: string,
  clinicId?: string
) {
  const messageBody = `Hi ${patientName}, this is a reminder from ${clinicName} for your follow-up visit with Dr. ${doctorName} today. Please contact us if you need to reschedule.`;

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    clinicId,
  });
}

/**
 * Sends a monthly prescription refill reminder message for chronic medications via Meta Cloud API.
 */
export async function sendRefillReminder(
  patientPhone: string,
  patientName: string,
  doctorName?: string,
  clinicName?: string,
  clinicId?: string
) {
  const docStr = doctorName ? `Dr. ${doctorName}` : 'your doctor';
  const clinicStr = clinicName ? `*${clinicName}*` : 'your clinic';

  const messageBody =
    `🏥 *Monthly Care & Refill Reminder*\n\n` +
    `Hello ${patientName}, you have approximately 5 days of your regular prescribed medications remaining.\n\n` +
    `Please schedule your monthly health checkup and prescription refill with ${docStr} at ${clinicStr}.\n\n` +
    `📞 *Please call or visit the clinic to reserve your consultation slot!* 🩺`;

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    clinicId,
  });
}
