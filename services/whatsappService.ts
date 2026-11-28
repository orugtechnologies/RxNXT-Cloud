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

import { generatePrescriptionPdfToken } from '@/lib/prescriptionToken';

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

/**
 * Normalizes text for Meta WhatsApp Template parameters.
 * Meta strictly forbids newlines (\n), tabs, or more than 4 consecutive spaces in template parameters.
 */
export function sanitizeTemplateParam(val?: string, maxLen = 1024): string {
  if (!val) return '';
  return val
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '  ───  ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^(\s*[•─\s]+)+|([•─\s]+)$/g, '')
    .trim()
    .slice(0, maxLen);
}

export function getPublicAppUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/^["']|["']$/g, '').trim();
  if (!raw || raw.includes('localhost') || raw.includes('127.0.0.1')) {
    return 'https://app.rxnxt.in';
  }
  return raw.replace(/\/$/, '');
}

const cleanEnv = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '').trim();

export function getEffectiveMetaToken(): string {
  return cleanEnv(process.env.META_WA_ACCESS_TOKEN);
}

export function getEffectivePhoneNumberId(): string {
  return cleanEnv(process.env.META_WA_PHONE_NUMBER_ID);
}

/**
 * Checks if Meta Cloud API is configured in the current environment.
 */
export function isMetaConfigured(): boolean {
  return Boolean(getEffectivePhoneNumberId() && getEffectiveMetaToken());
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
  const phoneNumberId = getEffectivePhoneNumberId();
  const accessToken = getEffectiveMetaToken();
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

      if (!response) {
        throw new Error('No response received from Meta Graph API');
      }

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

        let errMsg = errorInfo.message || `Meta Cloud API request failed with HTTP status ${response.status}`;
        if (response.status === 401 || errorInfo.code === 190) {
          errMsg = `Authentication Error: Meta Access Token has expired or is invalid. Please update META_WA_ACCESS_TOKEN with a Permanent System User Token in Vercel settings.`;
        }
        const finalErr = new Error(`[Meta WhatsApp API Error] ${errMsg} (Status: ${response.status}, Code: ${errorInfo.code}, Subcode: ${errorInfo.error_subcode})`);
        (finalErr as any).isPermanent = !isTransient;
        (finalErr as any).isTemplateError =
          errorInfo.code === 131058 ||
          errorInfo.code === 132000 ||
          errorInfo.code === 132001 ||
          Boolean(errorInfo.message && errorInfo.message.toLowerCase().includes('template'));
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
  const phoneNumberId = getEffectivePhoneNumberId();
  const accessToken = getEffectiveMetaToken();
  const graphApiVersion = cleanEnv(process.env.META_GRAPH_API_VERSION) || 'v20.0';


  if (!phoneNumberId || !accessToken) return null;

  try {
    let cleanBase64 = pdfBase64;
    if (cleanBase64.includes('base64,')) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    } else {
      cleanBase64 = cleanBase64.replace(/^data:application\/pdf.*?;base64,/, '');
    }
    cleanBase64 = cleanBase64.trim();
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

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok || !data?.id) {
      console.error('[Meta WhatsApp Media Upload Error]:', response.status, data);
      return null;
    }
    return data.id;
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
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}) {
  const cleanPhone = sanitizePhone(options.phone);

  let templateResult: any = null;

  // 1. If an approved template is specified, try template delivery first (unlocks cold patient reach)
  if (options.template) {
    try {
      templateResult = await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'template',
        template: options.template,
      });
      if (templateResult?.success) {
        return templateResult;
      }
    } catch (tmplErr: any) {
      if (tmplErr.isTemplateError) {
        console.warn(`[Meta WhatsApp] Template '${options.template.name}' pending/unavailable, falling back to direct delivery:`, tmplErr.message);
      } else {
        throw tmplErr;
      }
    }
  }

  let docResult: any = null;

  // 2. If PDF media was uploaded to Meta, dispatch official PDF document
  if (options.documentMediaId) {
    try {
      docResult = await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'document',
        document: {
          id: options.documentMediaId,
          filename: 'RxNXT_Prescription.pdf',
          caption: '📄 Official Prescription PDF (NMC 2023 Compliant)',
        },
      });
    } catch (docErr) {
      console.warn('[Meta WhatsApp] Media ID document dispatch failed, falling back to text:', docErr);
    }
  }

  // 3. Fallback to direct download link if available and mediaId was not used or failed
  if (!docResult && options.documentUrl) {
    try {
      docResult = await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'document',
        document: {
          link: options.documentUrl,
          filename: 'RxNXT_Prescription.pdf',
          caption: '📄 Official Prescription PDF (NMC 2023 Compliant)',
        },
      });
    } catch (docErr) {
      console.warn('[Meta WhatsApp] Document direct link dispatch failed, falling back to rich text message:', docErr);
    }
  }

  // 4. Also dispatch the rich treatment summary text message so the patient receives both the PDF document AND their dosage instructions!
  try {
    const textResult = await sendViaMetaCloudAPI({
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: options.messageBody,
      },
    });
    return docResult || textResult || templateResult;
  } catch (textErr) {
    if (docResult || templateResult) return docResult || templateResult;
    throw textErr;
  }
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
  aiTreatmentSummary?: string,
  prescriptionId?: string,
  options?: {
    templateSummary?: string;
    fullMessageBody?: string;
    slotDetails?: any;
  }
) {
  // Construct official direct downloadable PDF link with secure HMAC token
  // Ensure public HTTPS domain is always used so Meta Cloud servers can download the PDF document
  const appBaseUrl = getPublicAppUrl();
  const pdfToken = prescriptionId ? generatePrescriptionPdfToken(prescriptionId) : '';
  const tokenQuery = pdfToken ? `?token=${pdfToken}` : '';
  let directPdfUrl = prescriptionId
    ? `${appBaseUrl}/api/prescriptions/${prescriptionId}/pdf${tokenQuery}`
    : (pdfUrl || `${appBaseUrl}/api/prescriptions`);

  // Extra safeguard: under no circumstances can a localhost URL be dispatched to Meta
  if (directPdfUrl.includes('localhost') || directPdfUrl.includes('127.0.0.1')) {
    directPdfUrl = prescriptionId
      ? `https://app.rxnxt.in/api/prescriptions/${prescriptionId}/pdf${tokenQuery}`
      : 'https://app.rxnxt.in';
  }

  const messageBody = options?.fullMessageBody
    ? options.fullMessageBody
    : aiTreatmentSummary
    ? `Hello ${patientName}, your prescription from *${clinicName}* is ready!\n\n` +
      `${aiTreatmentSummary}\n\n` +
      `📄 *Official Prescription PDF:* ${directPdfUrl}\n\n` +
      `Get well soon!`
    : `Hello ${patientName}, your prescription from ${clinicName} is ready.\n\n` +
      `📄 *Official Prescription PDF:* ${directPdfUrl}\n\n` +
      `Get well soon!`;

  let documentMediaId: string | undefined;

  // 🚀 Upfront Direct Media API Upload:
  // Instead of passing a dynamic URL that causes Meta's crawler to time out (>10s) on heavy PDFs
  // (with high-res clinic letterheads, stamps, multi-page lab reports, or invoices),
  // directly upload the PDF binary into Meta's Media API up to 100MB.
  if (pdfBase64 && pdfBase64.length > 50) {
    try {
      const uploadedId = await uploadPDFToMetaMedia(pdfBase64);
      if (uploadedId) {
        documentMediaId = uploadedId;
      }
    } catch (uploadErr) {
      console.warn('[Meta WhatsApp] Upfront media upload failed, falling back to URL dispatch:', uploadErr);
    }
  }

  // Fallback: If pdfBase64 was not provided directly, attempt to fetch from directPdfUrl and upload to Meta Media API
  if (
    !documentMediaId &&
    process.env.NODE_ENV !== 'test' &&
    directPdfUrl &&
    directPdfUrl.startsWith('https://') &&
    !directPdfUrl.includes('localhost')
  ) {
    try {
      const pdfFetch = await fetch(directPdfUrl);
      if (pdfFetch.ok) {
        const ab = await pdfFetch.arrayBuffer();
        if (ab.byteLength > 100) {
          const b64 = Buffer.from(ab).toString('base64');
          const uploadedId = await uploadPDFToMetaMedia(b64);
          if (uploadedId) {
            documentMediaId = uploadedId;
          }
        }
      }
    } catch (fetchErr) {
      console.warn('[Meta WhatsApp] Direct PDF fetch-and-upload fallback warning:', fetchErr);
    }
  }

  const cleanPhone = sanitizePhone(patientPhone);
  const safePatientName = sanitizeTemplateParam(patientName).replace(/[^a-zA-Z0-9]/g, '_') || 'Patient';
  const docFilename = `RxNXT_Prescription_${safePatientName}.pdf`;

  // Use pre-uploaded Meta Media ID when available for guaranteed instant delivery without crawler timeouts
  const documentPayload = documentMediaId
    ? { id: documentMediaId, filename: docFilename }
    : { link: directPdfUrl, filename: docFilename };

  // Meta Cloud API Policy: For business-initiated messages outside the 24-hour customer window,
  // Meta strictly requires an APPROVED Message Template.
  const effectiveSummary = options?.templateSummary || aiTreatmentSummary || 'Prescription ready.';

  // 1. Try Candidate 1: rxnxt_super_prescription (Language: 'en') - Dedicated 9-slot multi-line template with attached PDF
  if (options?.slotDetails) {
    try {
      const superResult = await sendViaMetaCloudAPI({
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'rxnxt_super_prescription',
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'document',
                  document: documentPayload,
                },
              ],
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.patientName) || 'Patient' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.clinicName) || 'Clinic' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.diagnosis) || 'General Consultation' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.morningMeds) || 'None prescribed' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.afternoonMeds) || 'None prescribed' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.nightMeds) || 'None prescribed' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.duration) || 'As directed' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.nextVisit) || 'As advised' },
                { type: 'text', text: sanitizeTemplateParam(options.slotDetails.doctorAdvice) || 'Take medicines as directed' },
              ],
            },
          ],
        },
      });

      if (superResult?.success || superResult?.messages?.[0]?.id) {
        console.log(`[Meta WhatsApp] Successfully delivered Multi-Line rxnxt_super_prescription to ${cleanPhone}`);
        return {
          success: true,
          provider: 'meta',
          messageId: superResult?.messages?.[0]?.id || superResult?.messageId,
          template: 'rxnxt_super_prescription',
        };
      }
    } catch (superErr: any) {
      console.warn('[Meta WhatsApp] rxnxt_super_prescription unavailable/in-review, falling back to rxnxt_prescription_doc:', superErr.message);
    }
  }

  // 2. Try Candidate 2: rxnxt_prescription_doc (Language: 'en') - Approved active template with attached PDF
  try {
    const docResult = await sendViaMetaCloudAPI({
      to: cleanPhone,
      type: 'template',
      template: {
        name: 'rxnxt_prescription_doc',
        language: { code: 'en' },
        components: [
          {
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: documentPayload,
              },
            ],
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: sanitizeTemplateParam(patientName) || 'Patient' },
              { type: 'text', text: sanitizeTemplateParam(clinicName) || 'Clinic' },
              { type: 'text', text: sanitizeTemplateParam(effectiveSummary) || 'Prescription ready.' },
            ],
          },
        ],
      },
    });

    if (docResult?.success || docResult?.messages?.[0]?.id) {
      console.log(`[Meta WhatsApp] Successfully delivered attached PDF via rxnxt_prescription_doc to ${cleanPhone}`);
      return {
        success: true,
        provider: 'meta',
        messageId: docResult?.messages?.[0]?.id || docResult?.messageId,
        template: 'rxnxt_prescription_doc',
      };
    }
  } catch (docErr: any) {
    console.warn('[Meta WhatsApp] rxnxt_prescription_doc failed, falling back to rxnxt_prescription_ready:', docErr.message);
  }

  // 3. Fallback: rxnxt_prescription_ready (Language: 'en_US')
  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    documentMediaId,
    documentUrl: directPdfUrl,
    clinicId,
    template: {
      name: 'rxnxt_prescription_ready',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: sanitizeTemplateParam(patientName) || 'Patient' },
            { type: 'text', text: sanitizeTemplateParam(clinicName) || 'Clinic' },
            { type: 'text', text: sanitizeTemplateParam(effectiveSummary) || 'Prescription ready.' },
          ],
        },
      ],
    },
  });
}

/**
 * Sends a Smart Slot medicine reminder message (Morning, Afternoon, Night) via Meta Cloud API.
 */
export interface MedicineReminderDayContext {
  currentDay?: number;
  totalDays?: number;
  date?: Date;
}

export async function sendMedicineReminder(
  patientPhone: string,
  patientName: string,
  medicineDetails: string,
  doctorName?: string,
  clinicName?: string,
  clinicId?: string,
  slotType: string = 'MORNING',
  dayContext?: MedicineReminderDayContext
) {
  const cleanDocName = doctorName
    ? doctorName.trim().toLowerCase().startsWith('dr')
      ? doctorName.trim()
      : `Dr. ${doctorName.trim()}`
    : 'your doctor';
  const docStr = doctorName ? cleanDocName : 'your doctor';
  const clinicStr = clinicName ? `*${clinicName}*` : 'your clinic';

  // 🌅 Day of the Week + Full Date with Year (e.g. "Thu, 26 Nov 2026 • Today's Schedule")
  const refDate = dayContext?.date ? new Date(dayContext.date) : new Date();
  const dateFormatted = refDate.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }); // e.g. "Thu, 26 Nov 2026"

  let headerIcon = '🌅';
  let slotTitle = `Today's Medication Schedule • ${dateFormatted}`;
  let foodNote = '🥛 Take medicine as per the direction. Have a healthy day';

  if (slotType === 'AFTERNOON') {
    headerIcon = '☀️';
    slotTitle = `Afternoon Dose Reminder • ${dateFormatted}`;
    foodNote = '🍱 Take medicine as per the direction. Have a healthy day';
  } else if (slotType === 'NIGHT') {
    headerIcon = '🌙';
    slotTitle = `Night Dose Reminder • ${dateFormatted}`;
    foodNote = '😴 Take medicine as per the direction. Have a healthy day';
  } else if (slotType === 'DAILY' || slotType === 'TODAY') {
    headerIcon = '🌅';
    slotTitle = `Today's Medication Schedule • ${dateFormatted}`;
    foodNote = '🥛 Take medicine as per the direction. Have a healthy day';
  }

  const messageBody =
    `${headerIcon} *${slotTitle}*\n\n` +
    `Hello ${patientName}, health reminder from ${docStr} at ${clinicStr} to take your prescribed doses:\n\n` +
    `${medicineDetails}\n\n` +
    `${foodNote}\n\n` +
    `_To pause reminders, reply STOP_`;

  let slotLabel = `${dateFormatted} • Today's Schedule`;
  if (slotType === 'AFTERNOON') {
    slotLabel = `${dateFormatted} • Afternoon Dose`;
  } else if (slotType === 'NIGHT') {
    slotLabel = `${dateFormatted} • Night Dose`;
  }

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    clinicId,
    template: {
      name: 'rxnxt_dose_reminder',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: sanitizeTemplateParam(patientName) || 'Patient' },
            { type: 'text', text: sanitizeTemplateParam(clinicName) || 'Clinic' },
            { type: 'text', text: sanitizeTemplateParam(slotLabel) },
            { type: 'text', text: sanitizeTemplateParam(medicineDetails) || 'Prescribed doses' },
          ],
        },
      ],
    },
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
    template: {
      name: 'rxnxt_followup_reminder',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: sanitizeTemplateParam(patientName) || 'Patient' },
            { type: 'text', text: sanitizeTemplateParam(clinicName) || 'Clinic' },
            { type: 'text', text: sanitizeTemplateParam(doctorName) || 'Doctor' },
          ],
        },
      ],
    },
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
    `📞 *Please call or visit the clinic to reserve your consultation slot!* 🩺\n\n` +
    `_To pause reminders, reply STOP_`;

  return await dispatchWhatsAppMessage({
    phone: patientPhone,
    messageBody,
    clinicId,
    template: {
      name: 'rxnxt_refill_reminder',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: sanitizeTemplateParam(patientName) || 'Patient' },
            { type: 'text', text: sanitizeTemplateParam(doctorName) || 'Doctor' },
            { type: 'text', text: sanitizeTemplateParam(clinicName) || 'Clinic' },
          ],
        },
      ],
    },
  });
}

/**
 * Sends a 7-day prior subscription / trial expiry warning notice to the clinic doctor / admin.
 */
export async function sendSubscriptionExpiryNotice(
  doctorPhone: string,
  doctorName: string,
  clinicName: string,
  planName: string,
  expiryDateStr: string,
  daysRemaining: number,
  renewalUrl?: string
) {
  const docStr = doctorName.trim().toLowerCase().startsWith('dr') ? doctorName.trim() : `Dr. ${doctorName.trim()}`;
  const appBaseUrl = getPublicAppUrl();
  const renewLink = renewalUrl || `${appBaseUrl}/admin/subscription`;

  const messageBody =
    `⚠️ *RxNXT Subscription Expiry Notice*\n\n` +
    `Hello ${docStr},\n\n` +
    `Your RxNXT *${planName}* for *${clinicName}* will expire in *${daysRemaining} days* on *${expiryDateStr}*.\n\n` +
    `To ensure uninterrupted clinical operations, patient token queues, and automated WhatsApp dose reminders, please renew your subscription before expiry.\n\n` +
    `💳 *Renew Instantly Here:* ${renewLink}\n\n` +
    `Thank you for choosing RxNXT for your digital clinic! 🩺`;

  return await dispatchWhatsAppMessage({
    phone: doctorPhone,
    messageBody,
    template: {
      name: 'rxnxt_subscription_expiry',
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: sanitizeTemplateParam(docStr) },
            { type: 'text', text: sanitizeTemplateParam(clinicName) },
            { type: 'text', text: sanitizeTemplateParam(String(daysRemaining)) },
            { type: 'text', text: sanitizeTemplateParam(expiryDateStr) },
            { type: 'text', text: sanitizeTemplateParam(renewLink) },
          ],
        },
      ],
    },
  });
}

