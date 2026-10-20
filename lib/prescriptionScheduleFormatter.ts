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
}): FormattedPrescriptionSchedule {
  const { patientName, clinicName, medicines = [], diagnosis, doctorNotes, followUpDate, pdfDirectUrl } = params;

  const isSlot = (freq: string | null | undefined, slot: 'MORNING' | 'AFTERNOON' | 'NIGHT') => {
    const f = (freq || '').toLowerCase().trim();
    if (!f || f === 'sos' || f.includes('as needed') || f.includes('prn')) {
      return false;
    }

    if (slot === 'MORNING') {
      if (f.includes('0-1-0') || f.includes('0-0-1') || f.includes('bedtime') || f.includes('hs') || f.includes('night')) {
        if (!f.includes('1-1-1') && !f.includes('1-0-1') && !f.includes('thrice') && !f.includes('3 times') && !f.includes('twice')) {
          return false;
        }
      }
      return (
        f.includes('1-') ||
        f.includes('2-') ||
        f.includes('morning') ||
        f.includes('od') ||
        f.includes('bd') ||
        f.includes('tds') ||
        f.includes('qid') ||
        f.includes('once') ||
        f.includes('twice') ||
        f.includes('thrice') ||
        f.includes('breakfast') ||
        f.includes('daily')
      );
    }
    if (slot === 'AFTERNOON') {
      return (
        f.includes('1-1-1') ||
        f.includes('0-1-0') ||
        f.includes('thrice') ||
        f.includes('3 times') ||
        f.includes('tds') ||
        f.includes('qid') ||
        f.includes('afternoon') ||
        f.includes('lunch')
      );
    }
    if (slot === 'NIGHT') {
      return (
        f.includes('1-0-1') ||
        f.includes('1-1-1') ||
        f.includes('0-0-1') ||
        f.includes('bedtime') ||
        f.includes('hs') ||
        f.includes('night') ||
        f.includes('dinner') ||
        f.includes('bd') ||
        f.includes('tds') ||
        f.includes('qid') ||
        f.includes('twice') ||
        f.includes('thrice')
      );
    }
    return false;
  };

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

  medicines.forEach((m) => {
    const name = m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine';
    const strength = m.strength ? ` ${m.strength.trim()}` : '';
    const inst = cleanInstruction(m.instructions);
    const itemStr = inst ? `${name}${strength} (${inst})` : `${name}${strength}`;

    if (isSlot(m.frequency, 'MORNING')) morningMeds.push(itemStr);
    if (isSlot(m.frequency, 'AFTERNOON')) afternoonMeds.push(itemStr);
    if (isSlot(m.frequency, 'NIGHT')) nightMeds.push(itemStr);
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

  // 3. Full WhatsApp Message Body
  const pdfLine = pdfDirectUrl ? `\n📄 *Download Official PDF:* ${pdfDirectUrl}\n` : '';
  const fullMessageBody =
    `Hello ${patientName},\n` +
    `Your digital prescription from *${clinicName}* is ready.\n\n` +
    (diagnosis ? `🩺 *Diagnosis:* ${diagnosis}\n\n` : '') +
    `${richSchedule}` +
    `${pdfLine}\n` +
    `🥛 _Please take medicines on time as instructed. Have a healthy day!_`;

  return {
    templateSummary,
    richSchedule,
    fullMessageBody,
  };
}
