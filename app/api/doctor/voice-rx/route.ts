export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isDrugNameRestricted } from '@/lib/restrictedDrugs';

interface ParsedMedicine {
  name: string;
  dosage_form?: string;
  strength?: string;
  frequency: string;
  duration: string;
  instructions: string;
  generic_id?: string;
  drugId?: string;
}

interface VoiceRxResult {
  transcript: string;
  chiefComplaint?: string;
  diagnosis?: string;
  medicines: ParsedMedicine[];
  notes?: string;
  followUpDays?: number;
  followUpDate?: string;
}

/**
 * Normalizes frequency terms commonly used in Indian OPD prescriptions
 */
function normalizeFrequency(freqStr: string): string {
  const f = freqStr.toLowerCase().trim();
  if (f.includes('1-0-1') || f.includes('twice') || f.includes('bd') || f.includes('bid') || f.includes('subah sham')) return '1-0-1';
  if (f.includes('1-1-1') || f.includes('thrice') || f.includes('tds') || f.includes('tid') || f.includes('teen bar')) return '1-1-1';
  if (f.includes('1-0-0') || f.includes('morning') || f.includes('subah') || f.includes('od') || f.includes('once')) return '1-0-0';
  if (f.includes('0-0-1') || f.includes('night') || f.includes('bedtime') || f.includes('hs') || f.includes('rat ko')) return '0-0-1';
  if (f.includes('0-1-0') || f.includes('afternoon') || f.includes('dophar')) return '0-1-0';
  if (f.includes('sos') || f.includes('as needed') || f.includes('jab jarurat')) return 'SOS';
  if (f.includes('1-1-1-1') || f.includes('qid') || f.includes('four times')) return '1-1-1-1';
  return '1-0-1'; // Safe default
}

/**
 * Normalizes duration terms
 */
function normalizeDuration(durStr: string): string {
  const d = durStr.toLowerCase().trim();
  const numMatch = d.match(/\b(\d+)\s*(days?|din|weeks?|hafta|months?|mahina)?\b/);
  if (numMatch) {
    const num = numMatch[1];
    const unit = numMatch[2] || '';
    if (unit.startsWith('week') || unit.startsWith('haft')) {
      const days = parseInt(num, 10) * 7;
      return `${days} days`;
    }
    if (unit.startsWith('month') || unit.startsWith('mahin')) {
      return num === '1' ? '1 month' : `${num} months`;
    }
    return `${num} days`;
  }
  if (d.includes('sos') || d.includes('as needed')) return 'SOS';
  if (d.includes('review') || d.includes('ongoing')) return 'Till review';
  return '5 days'; // Default OPD course
}

/**
 * Normalizes instructions
 */
function normalizeInstructions(instStr: string): string {
  const inst = instStr.toLowerCase().trim();
  if (inst.includes('before') || inst.includes('empty') || inst.includes('khali pet') || inst.includes('ac')) return 'Before Food';
  if (inst.includes('bedtime') || inst.includes('night') || inst.includes('sone se pehle')) return 'At bedtime';
  if (inst.includes('warm water') || inst.includes('garm pani')) return 'With warm water';
  if (inst.includes('milk') || inst.includes('doodh')) return 'With milk';
  return 'After Food'; // Default
}

/**
 * Intelligent Rule-Based Clinical Parser for Indian OPD Prescriptions
 * Extracts Chief Complaint, Diagnosis, Medicines, Notes, and Follow-up.
 */
async function parseClinicalTranscript(transcript: string, clinicId: string): Promise<VoiceRxResult> {
  const text = transcript.replace(/\r?\n/g, ' ').trim();
  
  let chiefComplaint = '';
  let diagnosis = '';
  let notes = '';
  let followUpDays: number | undefined;

  // 1. Extract Chief Complaint (e.g. "complaining of fever and cough for 2 days", "c/o body ache")
  const ccMatch = text.match(/(?:complaining of|c\/o|complaints? of|suffering from|presents with|having)\s+([^.]+?)(?=\.\s|diagnosis|give|prescribe|rx|take|\band\b\s+(?:diagnosed|give)|$)/i);
  if (ccMatch && ccMatch[1]) {
    chiefComplaint = ccMatch[1].trim();
  }

  // 2. Extract Diagnosis (e.g. "diagnosed with acute pharyngitis", "impression: viral fever", "diagnosis: typhoid")
  const diagMatch = text.match(/(?:diagnos(?:is|ed with)|impression|case of)\s*:?\s*([^.]+?)(?=\.\s|give|prescribe|rx|medicines?|treatment|take|$)/i);
  if (diagMatch && diagMatch[1]) {
    diagnosis = diagMatch[1].trim();
  } else if (!diagnosis && chiefComplaint) {
    // If complaint exists and contains clear clinical conditions, infer diagnosis
    if (/fever|pyrexia/i.test(chiefComplaint)) diagnosis = 'Acute Febrile Illness';
    else if (/cough|cold|throat|tonsil/i.test(chiefComplaint)) diagnosis = 'Upper Respiratory Tract Infection (URTI)';
    else if (/gastric|acidity|heartburn|gas/i.test(chiefComplaint)) diagnosis = 'Acute Gastritis / Dyspepsia';
    else if (/diarrhea|loose motion|vomit/i.test(chiefComplaint)) diagnosis = 'Acute Gastroenteritis';
    else if (/body pain|headache|back pain/i.test(chiefComplaint)) diagnosis = 'Myalgia / Tension Headache';
  }

  // 3. Extract Follow-up (e.g. "review in 3 days", "follow up after 5 days", "review on monday")
  const fuMatch = text.match(/(?:review|follow[- ]?up|come back|revisit)\s+(?:in|after)?\s*(\d+)\s*(days?|din|weeks?)?/i);
  if (fuMatch && fuMatch[1]) {
    const qty = parseInt(fuMatch[1], 10);
    const unit = fuMatch[2] || 'day';
    followUpDays = unit.toLowerCase().startsWith('week') ? qty * 7 : qty;
  }

  // 4. Extract Clinical Advice / Notes (e.g. "advise warm water gargle", "avoid oily food", "drink fluids")
  const adviceMatch = text.match(/(?:advise|advice|instructions?|notes?|precautions?)\s*:?\s*([^.]+?)(?=\.|$)/i);
  if (adviceMatch && adviceMatch[1]) {
    notes = adviceMatch[1].trim();
  } else {
    // Common advice phrases
    const foundAdvice: string[] = [];
    if (/warm (?:saline )?water gargle/i.test(text)) foundAdvice.push('Warm saline gargles thrice daily');
    if (/steam inhalation/i.test(text)) foundAdvice.push('Steam inhalation twice daily');
    if (/drink (?:plenty of )?water|hydration|fluids/i.test(text)) foundAdvice.push('Drink plenty of boiled water and stay hydrated');
    if (/avoid (?:oily|spicy|cold)/i.test(text)) foundAdvice.push('Avoid oily, spicy and refrigerated cold food');
    if (/light diet|soft diet|khichdi/i.test(text)) foundAdvice.push('Take light home-cooked diet (Khichdi/dal-rice)');
    if (foundAdvice.length > 0) {
      notes = foundAdvice.join('. ');
    }
  }

  // 5. Extract Medicines
  // Split candidate segments by medicine delimiters (numbers, bullet points, commas, periods, or "give/prescribe/and")
  const medicines: ParsedMedicine[] = [];

  // Patterns for medicine line items:
  // e.g. "Dolo 650 1-0-1 for 3 days after food"
  // e.g. "Tab Augmentin 625 BD 5 days"
  // e.g. "Syrup Ascoril-D 10ml TDS"
  // e.g. "Pantop 40 OD before breakfast 5 days"
  const medSentenceRegex = /(?:tab(?:let)?|cap(?:sule)?|syp|syrup|inj(?:ection)?|ointment|gel|drops?)?\s*([a-zA-Z0-9\-\+\s]{3,30}?)\s+(?:(\d+\s*mg|\d+\s*ml|\d+\s*gm)\s+)?(1-0-1|1-1-1|1-0-0|0-0-1|0-1-0|od|bd|tds|qid|sos|hs|twice daily|once daily|thrice daily|subah sham|rat ko)(?:\s+(?:for\s+)?(\d+\s*(?:days?|din|weeks?|months?)))?(?:\s+(after food|before food|empty stomach|khali pet|khana khane ke baad|at bedtime))?/gi;

  let match: RegExpExecArray | null;
  while ((match = medSentenceRegex.exec(text)) !== null) {
    const rawName = match[1]?.trim();
    if (!rawName) continue;

    // Filter out common english words that might match
    const lowerName = rawName.toLowerCase();
    if (['patient', 'complaining', 'diagnosis', 'review', 'follow', 'advice', 'give', 'take', 'and', 'with', 'for'].includes(lowerName)) {
      continue;
    }

    const strength = match[2]?.trim() || '';
    const frequency = normalizeFrequency(match[3] || '1-0-1');
    const duration = normalizeDuration(match[4] || '5 days');
    const instructions = normalizeInstructions(match[5] || 'After Food');

    // Clean drug name
    let cleanName = rawName
      .replace(/^(give|prescribe|take|and|also|tab|tablet|cap|capsule|syp|syrup)\s+/i, '')
      .replace(/\s+(give|prescribe|take|and)$/i, '')
      .trim();

    if (cleanName.length < 2) continue;

    // Capitalize first letters
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (strength && !cleanName.toLowerCase().includes(strength.toLowerCase())) {
      cleanName = `${cleanName} ${strength}`.trim();
    }

    // Infer dosage form
    let dosageForm = 'Tablet';
    if (/syrup|syp|suspension/i.test(text) || /syrup|syp/i.test(match[0])) dosageForm = 'Syrup';
    else if (/cap(?:sule)?/i.test(match[0])) dosageForm = 'Capsule';
    else if (/inj(?:ection)?/i.test(match[0])) dosageForm = 'Injection';
    else if (/drop/i.test(match[0])) dosageForm = 'Drops';
    else if (/ointment|gel|cream/i.test(match[0])) dosageForm = 'Gel/Ointment';

    medicines.push({
      name: cleanName,
      dosage_form: dosageForm,
      strength: strength || undefined,
      frequency,
      duration,
      instructions,
    });
  }

  // Fallback: If regex didn't catch, search for well-known Indian drugs in transcript
  if (medicines.length === 0) {
    const knownDrugs = [
      { name: 'Dolo 650', form: 'Tablet', strength: '650mg', freq: '1-0-1', dur: '3 days', inst: 'After Food' },
      { name: 'Paracetamol 650', form: 'Tablet', strength: '650mg', freq: '1-0-1', dur: '3 days', inst: 'After Food' },
      { name: 'Augmentin 625', form: 'Tablet', strength: '625mg', freq: '1-0-1', dur: '5 days', inst: 'After Food' },
      { name: 'Azithral 500', form: 'Tablet', strength: '500mg', freq: '1-0-0', dur: '3 days', inst: 'Before Food' },
      { name: 'Pantocid 40', form: 'Tablet', strength: '40mg', freq: '1-0-0', dur: '5 days', inst: 'Before Food' },
      { name: 'Pantop 40', form: 'Tablet', strength: '40mg', freq: '1-0-0', dur: '5 days', inst: 'Before Food' },
      { name: 'Cetirizine 10', form: 'Tablet', strength: '10mg', freq: '0-0-1', dur: '5 days', inst: 'At bedtime' },
      { name: 'Montair LC', form: 'Tablet', strength: '10mg/5mg', freq: '0-0-1', dur: '7 days', inst: 'At bedtime' },
      { name: 'Ascoril-D', form: 'Syrup', strength: '10ml', freq: '1-1-1', dur: '5 days', inst: 'After Food' },
      { name: 'Cifran 500', form: 'Tablet', strength: '500mg', freq: '1-0-1', dur: '5 days', inst: 'After Food' },
      { name: 'Telma 40', form: 'Tablet', strength: '40mg', freq: '1-0-0', dur: '30 days', inst: 'After Food' },
      { name: 'Glycomet 500', form: 'Tablet', strength: '500mg', freq: '1-0-1', dur: '30 days', inst: 'After Food' },
    ];

    for (const kd of knownDrugs) {
      const regex = new RegExp(`\\b${kd.name.split(' ')[0]}\\b`, 'i');
      if (regex.test(text)) {
        medicines.push({
          name: kd.name,
          dosage_form: kd.form,
          strength: kd.strength,
          frequency: kd.freq,
          duration: kd.dur,
          instructions: kd.inst,
        });
      }
    }
  }

  // Cross-reference with database to attach canonical drugId where possible
  for (const med of medicines) {
    try {
      const dbDrug = await prisma.drug.findFirst({
        where: {
          OR: [
            { brandName: { contains: med.name.split(' ')[0], mode: 'insensitive' } },
            { genericName: { contains: med.name.split(' ')[0], mode: 'insensitive' } },
          ],
        },
        select: { id: true, brandName: true, genericName: true, dosageForm: true, strength: true },
      });

      if (dbDrug) {
        med.drugId = dbDrug.id;
        med.generic_id = dbDrug.id;
        if (dbDrug.dosageForm) med.dosage_form = dbDrug.dosageForm;
        if (dbDrug.strength && !med.strength) med.strength = dbDrug.strength;
      }
    } catch {
      // Continue safely if lookup fails
    }
  }

  // Calculate follow-up ISO string if followUpDays was found
  let followUpDate: string | undefined;
  if (followUpDays) {
    const d = new Date();
    d.setDate(d.getDate() + followUpDays);
    followUpDate = d.toISOString().split('T')[0];
  }

  return {
    transcript,
    chiefComplaint: chiefComplaint || undefined,
    diagnosis: diagnosis || undefined,
    medicines,
    notes: notes || undefined,
    followUpDays,
    followUpDate,
  };
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const transcript = (body.transcript || '').trim();

    if (!transcript || transcript.length < 3) {
      return NextResponse.json(
        { error: 'Please provide a valid spoken transcript or audio text.' },
        { status: 400 }
      );
    }

    // Process transcript through clinical parser
    const result = await parseClinicalTranscript(transcript, user.clinicId);

    // Filter out any restricted Schedule X / narcotic drugs
    result.medicines = result.medicines.filter((m) => !isDrugNameRestricted(m.name));

    return NextResponse.json({
      success: true,
      data: result,
      source: 'voice_rx_engine',
    });
  } catch (err: any) {
    console.error('Voice Rx parsing error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process voice prescription' },
      { status: 500 }
    );
  }
}
