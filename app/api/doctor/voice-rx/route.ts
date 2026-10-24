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

// Common phonetic speech-to-text misrecognitions for Indian pharmaceutical brands
const PHONETIC_CORRECTIONS = [
  { pattern: /\b(?:tholo|dollo|tolo)\b/gi, replacement: 'Dolo' },
  { pattern: /\b(?:pantalos\s+it|pantalos|pantocide|pantacide|pantocid)\b/gi, replacement: 'Pantocid' },
  { pattern: /\b(?:pantop\s+40|pantop|panto)\b/gi, replacement: 'Pantop' },
  { pattern: /\b(?:agumentin|augumentin|ogmentin|augmentin)\b/gi, replacement: 'Augmentin' },
  { pattern: /\b(?:ascoril|askoril|ascoril-d)\b/gi, replacement: 'Ascoril-D' },
  { pattern: /\b(?:azithro|azithral|asithral|ezithral)\b/gi, replacement: 'Azithral' },
  { pattern: /\b(?:parasitamol|paracitamol|pcm)\b/gi, replacement: 'Paracetamol' },
  { pattern: /\b(?:setrizin|cetrizin|cetricin|cetirizine)\b/gi, replacement: 'Cetirizine' },
  { pattern: /\b(?:calpol|kalpol)\b/gi, replacement: 'Calpol' },
  { pattern: /\b(?:meftal\s+space|meftal\s+spas|meftal)\b/gi, replacement: 'Meftal-Spas' },
  { pattern: /\b(?:montair\s+lc|montek\s+lc)\b/gi, replacement: 'Montair-LC' },
  { pattern: /\b(?:pan\s+40)\b/gi, replacement: 'Pan 40' },
  { pattern: /\b(?:pan\s+d)\b/gi, replacement: 'Pan-D' },
  { pattern: /\b(?:glycomet|glycomit)\b/gi, replacement: 'Glycomet' },
  { pattern: /\b(?:telma|telmikind)\b/gi, replacement: 'Telma' },
];

/**
 * Pre-cleans transcript with Indian medical phonetics
 */
function applyPhoneticCorrections(raw: string): string {
  let cleaned = raw;
  for (const item of PHONETIC_CORRECTIONS) {
    cleaned = cleaned.replace(item.pattern, item.replacement);
  }
  return cleaned;
}

const FREQUENCY_PATTERNS = [
  { regex: /\b(1-0-1|twice daily|twice a day|two times a day|two times|bd|bid|subah sham)\b/i, val: '1-0-1' },
  { regex: /\b(1-1-1|thrice daily|thrice a day|three times a day|three times|tds|tid|teen bar)\b/i, val: '1-1-1' },
  { regex: /\b(1-0-0|once daily|once a day|one time a day|one time|od|morning only|morning|subah)\b/i, val: '1-0-0' },
  { regex: /\b(0-0-1|night only|at bedtime|bedtime only|bedtime|hs|rat ko)\b/i, val: '0-0-1' },
  { regex: /\b(0-1-0|afternoon only|afternoon|dophar)\b/i, val: '0-1-0' },
  { regex: /\b(1-1-1-1|qid|four times a day|four times)\b/i, val: '1-1-1-1' },
  { regex: /\b(sos|as needed|if needed|jab jarurat)\b/i, val: 'SOS' },
];

const INSTRUCTION_PATTERNS = [
  { regex: /\b(before (?:food|meals?|breakfast|lunch|dinner)|empty stomach|khali pet|ac)\b/i, val: 'Before Food' },
  { regex: /\b(after (?:food|meals?|breakfast|lunch|dinner)|khana khane ke baad|pc)\b/i, val: 'After Food' },
  { regex: /\b(with (?:food|meals?))\b/i, val: 'With Food' },
  { regex: /\b(at bedtime|sone se pehle)\b/i, val: 'At bedtime' },
  { regex: /\b(with warm water|garm pani ke sath)\b/i, val: 'With warm water' },
  { regex: /\b(with milk|doodh ke sath)\b/i, val: 'With milk' },
];

/**
 * Robust Clinical Prescription Parser
 */
async function parseClinicalTranscript(rawTranscript: string, clinicId: string): Promise<VoiceRxResult> {
  let text = applyPhoneticCorrections(rawTranscript.trim());

  let chiefComplaint = '';
  let diagnosis = '';
  let notes = '';
  let followUpDays: number | undefined;

  // 1. Extract Follow-up and remove from working text
  const fuMatch = text.match(/\b(?:review|follow[- ]?up|come back|revisit)\s+(?:in|after)?\s*(\d+)\s*(days?|din|weeks?|months?)?\b/i);
  if (fuMatch) {
    const qty = parseInt(fuMatch[1], 10);
    const unit = fuMatch[2] || 'day';
    followUpDays = unit.toLowerCase().startsWith('week') ? qty * 7 : qty;
    text = text.replace(fuMatch[0], ' ');
  }

  // 2. Extract Clinical Advice / Notes and remove from working text
  const adviceMatch = text.match(/\b(?:advise|advice|instructions?|notes?|precautions?)\s*:?\s*([^.]+?)(?=\.|$)/i);
  if (adviceMatch && adviceMatch[1]) {
    notes = adviceMatch[1].trim();
    text = text.replace(adviceMatch[0], ' ');
  } else {
    const foundAdvice: string[] = [];
    if (/warm (?:saline )?water gargle/i.test(text)) {
      foundAdvice.push('Warm saline gargles thrice daily');
      text = text.replace(/warm (?:saline )?water gargle/gi, ' ');
    }
    if (/steam inhalation/i.test(text)) {
      foundAdvice.push('Steam inhalation twice daily');
      text = text.replace(/steam inhalation/gi, ' ');
    }
    if (/drink (?:plenty of )?water|hydration|fluids/i.test(text)) {
      foundAdvice.push('Drink plenty of boiled water and stay hydrated');
      text = text.replace(/drink (?:plenty of )?water|hydration|fluids/gi, ' ');
    }
    if (/avoid (?:oily|spicy|cold)/i.test(text)) {
      foundAdvice.push('Avoid oily, spicy and refrigerated cold food');
      text = text.replace(/avoid (?:oily|spicy|cold)[^,.]*/gi, ' ');
    }
    if (foundAdvice.length > 0) {
      notes = foundAdvice.join('. ');
    }
  }

  // 3. Extract Chief Complaint and remove from working text
  // Looks for patterns like "Patient has viral fever", "complaining of dry cough", "c/o sore throat"
  const ccMatch = text.match(/\b(?:patient\s+has|patient\s+is\s+having|complaining of|c\/o|complaints? of|suffering from|presents with|having)\s+([^.,;]+?)(?=\bgive\b|\bprescribe\b|\brx\b|\btab\b|\bcap\b|\bsyp\b|\b[A-Z][a-z]+\s+\d+|\.|$)/i);
  if (ccMatch && ccMatch[1]) {
    chiefComplaint = ccMatch[1].trim();
    text = text.replace(ccMatch[0], ' ');
  }

  // Infer Diagnosis from complaint or explicit diagnosis statement
  const diagMatch = text.match(/\b(?:diagnos(?:is|ed with)|impression|case of)\s*:?\s*([^.,;]+?)(?=\bgive\b|\bprescribe\b|\brx\b|\.|$)/i);
  if (diagMatch && diagMatch[1]) {
    diagnosis = diagMatch[1].trim();
    text = text.replace(diagMatch[0], ' ');
  } else if (!diagnosis && chiefComplaint) {
    if (/viral fever|fever|pyrexia/i.test(chiefComplaint)) diagnosis = 'Acute Febrile Illness';
    else if (/cough|cold|throat|tonsil|pharyngitis/i.test(chiefComplaint)) diagnosis = 'Upper Respiratory Tract Infection (URTI)';
    else if (/gastric|acidity|heartburn|gas|indigestion/i.test(chiefComplaint)) diagnosis = 'Acute Gastritis / Dyspepsia';
    else if (/diarrhea|loose motion|vomit/i.test(chiefComplaint)) diagnosis = 'Acute Gastroenteritis';
    else if (/body pain|headache|back pain|myalgia/i.test(chiefComplaint)) diagnosis = 'Myalgia / Tension Headache';
  }

  // 4. Split remaining text into distinct medicine clauses
  // Delimited by periods, commas, semicolons, 'and', 'also', 'plus'
  const clauses = text
    .split(/(?:[.,;]|\band\b|\balso\b|\bplus\b)+/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2);

  const medicines: ParsedMedicine[] = [];

  for (const clause of clauses) {
    let cText = clause;

    // Check if this clause contains frequency, duration, or a known medicine
    const hasFreq = FREQUENCY_PATTERNS.some((fp) => fp.regex.test(cText));
    const hasDur = /\b(?:for\s+)?(\d+)\s*(days?|din|weeks?|months?)\b/i.test(cText);
    const hasDrug = /\b(Dolo|Pantocid|Augmentin|Paracetamol|Pantop|Ascoril|Azithral|Cetirizine|Calpol|Meftal|Telma|Glycomet|Pan|Gelusil|Amox|Cifran)\b/i.test(cText);

    if (!hasFreq && !hasDur && !hasDrug) {
      continue; // Skip noise clauses
    }

    // A. Extract Frequency (in ANY position)
    let frequency = '1-0-1';
    for (const fp of FREQUENCY_PATTERNS) {
      if (fp.regex.test(cText)) {
        frequency = fp.val;
        cText = cText.replace(fp.regex, ' ');
        break;
      }
    }

    // B. Extract Duration (in ANY position)
    let duration = '5 days';
    const durMatch = cText.match(/\b(?:for\s+)?(\d+)\s*(days?|din|weeks?|hafta|months?|mahina)\b/i);
    if (durMatch) {
      const num = durMatch[1];
      const unit = durMatch[2].toLowerCase();
      if (unit.startsWith('week') || unit.startsWith('haft')) {
        duration = `${parseInt(num, 10) * 7} days`;
      } else if (unit.startsWith('month') || unit.startsWith('mahin')) {
        duration = num === '1' ? '1 month' : `${num} months`;
      } else {
        duration = `${num} days`;
      }
      cText = cText.replace(durMatch[0], ' ');
    }

    // C. Extract Instructions (in ANY position)
    let instructions = 'After Food';
    for (const ip of INSTRUCTION_PATTERNS) {
      if (ip.regex.test(cText)) {
        instructions = ip.val;
        cText = cText.replace(ip.regex, ' ');
        break;
      }
    }

    // D. Clean remaining words to isolate pure Drug Name + Strength
    let cleanName = cText
      .replace(/\b(patient|has|complaining|viral|fever|diagnosis|give|prescribe|take|and|also|please|tab|tablet|cap|capsule|syp|syrup|inj|injection|for|after|before)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Standardize artifacts like "40m" -> "40mg", "650 m" -> "650mg"
    cleanName = cleanName.replace(/(\d+)\s*m\b/gi, '$1mg');

    if (cleanName.length < 2) continue;

    // Capitalize first letter
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    // Infer dosage form
    let dosageForm = 'Tablet';
    if (/syrup|syp|gelusil|ascoril/i.test(clause) || /syrup|syp/i.test(cleanName)) dosageForm = 'Syrup';
    else if (/cap(?:sule)?/i.test(clause) || /cap\b/i.test(cleanName)) dosageForm = 'Capsule';
    else if (/inj(?:ection)?/i.test(clause)) dosageForm = 'Injection';
    else if (/drop/i.test(clause)) dosageForm = 'Drops';
    else if (/gel|ointment/i.test(clause)) dosageForm = 'Gel/Ointment';

    // Extract strength if present (e.g. "650", "650mg", "40", "40mg")
    const strMatch = cleanName.match(/\b(\d+(?:\.\d+)?\s*(?:mg|ml|gm)?)\b/i);
    const strength = strMatch ? strMatch[1] : undefined;

    medicines.push({
      name: cleanName,
      dosage_form: dosageForm,
      strength: strength,
      frequency,
      duration,
      instructions,
    });
  }

  // Cross-reference with PostgreSQL database to attach canonical drugId where possible
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
      // Continue safely if DB lookup is offline
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
    transcript: rawTranscript,
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
