/**
 * Prescription Schedule Formatter for RxNXT Super-Prescription WhatsApp Dispatch
 * 
 * Synthesizes a clean, patient-friendly medication routine grouped by time of day
 * (Morning, Afternoon, Night) with food instructions, duration, and follow-up.
 */

export interface FormattedPrescriptionSchedule {
  templateSummary: string;
  richSchedule: string;
  fullMessageBody: string;
  slotDetails?: {
    patientName: string;
    clinicName: string;
    diagnosis: string;
    morningMeds: string;
    afternoonMeds: string;
    nightMeds: string;
    duration: string;
    nextVisit: string;
    doctorAdvice: string;
  };
}

export interface MedicineSlotResolution {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  isSos: boolean;
  specialNote?: string;
}

export function resolveMedicineSlots(
  frequencyRaw?: string | null,
  instructionsRaw?: string | null
): MedicineSlotResolution {
  const freq = (frequencyRaw || '').toLowerCase().trim();
  const inst = (instructionsRaw || '').toLowerCase().trim();
  const combined = `${freq} ${inst}`;

  // 1. SOS / PRN
  if (freq === 'sos' || combined.includes('as needed') || combined.includes('prn') || combined.includes('when needed')) {
    return { morning: false, afternoon: false, night: false, isSos: true };
  }

  // 2. Weekly / Alternate Days (Do NOT send daily doses for weekly pills)
  if (combined.includes('once a week') || combined.includes('weekly') || combined.includes('alternate day')) {
    return { morning: false, afternoon: false, night: false, isSos: true, specialNote: 'Weekly' };
  }

  // 3. Regex match standard Dash Pattern: e.g. "1-0-1", "1-1-1", "0-1-1", "1-1-0", "2-0-2", "1/2-0-1/2", "0-0-1", "0-1-0"
  const dashMatch = freq.match(/^([0-9/.]+)\s*-\s*([0-9/.]+)\s*-\s*([0-9/.]+)$/);
  if (dashMatch) {
    const isNonZero = (val: string) => {
      const v = val.trim();
      return v !== '0' && v !== '0.0';
    };
    return {
      morning: isNonZero(dashMatch[1]),
      afternoon: isNonZero(dashMatch[2]),
      night: isNonZero(dashMatch[3]),
      isSos: false,
    };
  }

  // 4. Four times a day: "1-1-1-1" or "qid"
  if (freq.includes('1-1-1-1') || freq.includes('qid') || freq.includes('four times') || freq.includes('4 times')) {
    return { morning: true, afternoon: true, night: true, isSos: false };
  }

  // 5. Multi-dose text tokens:
  // TDS / Thrice / 3 times a day -> Morning, Afternoon, Night
  if (freq.includes('tds') || freq.includes('thrice') || freq.includes('3 times') || freq.includes('tid')) {
    return { morning: true, afternoon: true, night: true, isSos: false };
  }

  // BD / Twice daily / 2 times a day -> Morning and Night (unless instructions specify afternoon)
  if (freq.includes('bd') || freq.includes('bid') || freq.includes('twice') || freq.includes('2 times')) {
    if (combined.includes('afternoon') || combined.includes('lunch')) {
      return { morning: true, afternoon: true, night: false, isSos: false };
    }
    return { morning: true, afternoon: false, night: true, isSos: false };
  }

  // 6. Once-daily / OD / Single dose tokens (Resolve slot based on combined frequency + instructions)
  const isNightInstruction =
    combined.includes('bedtime') ||
    combined.includes('night') ||
    combined.includes('hs') ||
    combined.includes('sleep') ||
    combined.includes('dinner');

  const isAfternoonInstruction =
    combined.includes('afternoon') ||
    combined.includes('lunch') ||
    combined.includes('midday');

  const isMorningInstruction =
    combined.includes('morning') ||
    combined.includes('breakfast') ||
    combined.includes('empty stomach') ||
    combined.includes('wake up');

  if (isNightInstruction) {
    return { morning: false, afternoon: false, night: true, isSos: false };
  }

  if (isAfternoonInstruction) {
    return { morning: false, afternoon: true, night: false, isSos: false };
  }

  if (isMorningInstruction || freq.includes('od') || freq.includes('once') || freq.includes('daily') || freq.includes('1-0-0')) {
    return { morning: true, afternoon: false, night: false, isSos: false };
  }

  // Fallback: if unclassified
  return { morning: false, afternoon: false, night: false, isSos: true };
}

export function formatPrescriptionSchedule(params: {
  patientName: string;
  clinicName: string;
  medicines: Array<{
    customName?: string | null;
    drug?: { brandName?: string | null; genericName?: string | null } | null;
    strength?: string | null;
    dosageForm?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
  }>;
  diagnosis?: string | null;
  doctorNotes?: string | null;
  followUpDate?: Date | string | null;
  pdfDirectUrl?: string | null;
  labReportCount?: number;
}): FormattedPrescriptionSchedule {
  const { patientName, clinicName, medicines = [], diagnosis, doctorNotes, followUpDate, pdfDirectUrl, labReportCount } = params;

  const cleanInstruction = (raw?: string | null) => {
    const inst = (raw || '').trim();
    if (/after\s+(meals?|food)/i.test(inst)) return 'After Food';
    if (/before\s+(meals?|food)/i.test(inst)) return 'Before Food';
    if (/with\s+(meals?|food)/i.test(inst)) return 'With Food';
    if (/at\s+bedtime|night/i.test(inst)) return 'At Bedtime';
    return inst || '';
  };

  const morningMeds: string[] = [];
  const afternoonMeds: string[] = [];
  const nightMeds: string[] = [];
  const sosMeds: string[] = [];

  const formatItemForSlot = (m: any, slot: 'morning' | 'afternoon' | 'night' | 'sos') => {
    const name = m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine';
    const strength = m.strength ? ` ${m.strength.trim()}` : '';
    let inst = cleanInstruction(m.instructions);

    // Clinical Safeguard: Suppress bedtime instruction in daylight slots to prevent patient confusion
    if ((slot === 'morning' || slot === 'afternoon') && /bedtime|night/i.test(inst)) {
      inst = '';
    }

    return inst ? `${name}${strength} (${inst})` : `${name}${strength}`;
  };

  medicines.forEach((m) => {
    const slots = resolveMedicineSlots(m.frequency, m.instructions);
    if (slots.morning) morningMeds.push(formatItemForSlot(m, 'morning'));
    if (slots.afternoon) afternoonMeds.push(formatItemForSlot(m, 'afternoon'));
    if (slots.night) nightMeds.push(formatItemForSlot(m, 'night'));
    if (slots.isSos || (!slots.morning && !slots.afternoon && !slots.night)) {
      sosMeds.push(formatItemForSlot(m, 'sos'));
    }
  });

  const slotsList: string[] = [];
  if (morningMeds.length > 0) slotsList.push(`🌅 Morning: ${morningMeds.join(', ')}`);
  if (afternoonMeds.length > 0) slotsList.push(`☀️ Afternoon: ${afternoonMeds.join(', ')}`);
  if (nightMeds.length > 0) slotsList.push(`🌙 Night: ${nightMeds.join(', ')}`);

  // Fallback if no specific frequency matches slots
  if (slotsList.length === 0 && medicines.length > 0) {
    const allItems = medicines.map((m) => {
      const name = m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine';
      const strength = m.strength ? ` ${m.strength.trim()}` : '';
      const inst = cleanInstruction(m.instructions);
      return inst ? `${name}${strength} (${inst})` : `${name}${strength}`;
    });
    slotsList.push(`💊 Daily: ${allItems.join(', ')}`);
  }

  // Duration
  let durationStr = '';
  const detectedDuration = medicines.find((m) => m.duration)?.duration;
  if (detectedDuration) {
    durationStr = `⏳ Duration: ${detectedDuration}`;
  }

  // Next Visit
  let followUpStr = '';
  if (followUpDate) {
    try {
      const fDate = new Date(followUpDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      followUpStr = `📅 Next Visit: ${fDate}`;
    } catch {
      // ignore
    }
  }

  // 1. Meta Template Single-Line Parameter (Meta prohibits newlines in template params)
  const templateParts: string[] = [];
  if (diagnosis) templateParts.push(`Diagnosis: ${diagnosis}`);
  templateParts.push(...slotsList);
  if (durationStr) templateParts.push(durationStr);
  if (followUpStr) templateParts.push(followUpStr);

  const templateSummary = templateParts
    .join(' • ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 1024);

  // 2. Rich Multi-Line Schedule
  let richSchedule = '📋 *DAILY MEDICATION SCHEDULE:*\n';
  richSchedule += '──────────────────────────\n';
  if (morningMeds.length > 0) {
    richSchedule += `🌅 *MORNING (After Breakfast):*\n${morningMeds.map((m) => `  • ${m}`).join('\n')}\n\n`;
  }
  if (afternoonMeds.length > 0) {
    richSchedule += `☀️ *AFTERNOON (After Lunch):*\n${afternoonMeds.map((m) => `  • ${m}`).join('\n')}\n\n`;
  }
  if (nightMeds.length > 0) {
    richSchedule += `🌙 *NIGHT (After Dinner):*\n${nightMeds.map((m) => `  • ${m}`).join('\n')}\n\n`;
  }
  richSchedule += '──────────────────────────\n';
  if (durationStr) richSchedule += `${durationStr}\n`;
  if (followUpStr) richSchedule += `${followUpStr}\n`;
  if (doctorNotes) {
    const cleanNotes = doctorNotes
      .split('\n')
      .map((l) => l.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean)
      .join(', ');
    richSchedule += `📝 *Doctor Note:* ${cleanNotes}\n`;
  }
  if (labReportCount && labReportCount > 0) {
    richSchedule += `🧪 *Lab Investigation Reports:* ${labReportCount} Verified Report${labReportCount > 1 ? 's' : ''} attached to PDF\n`;
  }

  // 3. Full WhatsApp Message Body
  const pdfLine = pdfDirectUrl
    ? (labReportCount && labReportCount > 0
        ? `\n📄 *Download Complete Health Dossier (Prescription & Lab Reports):* ${pdfDirectUrl}\n`
        : `\n📄 *Download Official PDF:* ${pdfDirectUrl}\n`)
    : '';
  const fullMessageBody =
    `Hello ${patientName},\n` +
    `Your digital prescription from *${clinicName}* is ready.\n\n` +
    (diagnosis ? `🩺 *Diagnosis:* ${diagnosis}\n\n` : '') +
    `${richSchedule}` +
    `${pdfLine}\n` +
    `🥛 _Please take medicines on time as instructed. Have a healthy day!_`;

  let formattedFollowUp = '';
  if (followUpDate) {
    try {
      formattedFollowUp = new Date(followUpDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      // ignore
    }
  }

  const rawAdvice = doctorNotes
    ? doctorNotes
        .split('\n')
        .map((l) => l.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean)
        .join(', ')
    : 'Take medicines as directed';

  const cleanAdvice = labReportCount && labReportCount > 0
    ? `${rawAdvice} • Attached: ${labReportCount} Verified Lab Report${labReportCount > 1 ? 's' : ''}`
    : rawAdvice;

  const slotDetails = {
    patientName,
    clinicName,
    diagnosis: diagnosis || 'General Consultation',
    morningMeds: morningMeds.length > 0 ? morningMeds.map((m) => `• ${m}`).join(', ') : 'None prescribed',
    afternoonMeds: afternoonMeds.length > 0 ? afternoonMeds.map((m) => `• ${m}`).join(', ') : 'None prescribed',
    nightMeds: nightMeds.length > 0 ? nightMeds.map((m) => `• ${m}`).join(', ') : 'None prescribed',
    duration: detectedDuration || 'As directed',
    nextVisit: formattedFollowUp || 'As advised by doctor',
    doctorAdvice: cleanAdvice,
  };

  return {
    templateSummary,
    richSchedule,
    fullMessageBody,
    slotDetails,
  };
}
