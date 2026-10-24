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

const GEMINI_SYSTEM_PROMPT = `You are an expert Indian Clinical OPD Assistant for the RxNXT platform.
You will receive an unstructured, out-of-order, or dialect-mixed (English, Hindi, Telugu, Tamil, Hinglish) doctor voice dictation.
Extract and return STRICT JSON matching this schema:
{
  "chiefComplaint": string or null (e.g. "Viral fever with headache"),
  "diagnosis": string or null (e.g. "Acute Febrile Illness / URTI"),
  "medicines": [
    {
      "name": string (canonical Indian brand or generic name e.g. "Dolo 650", "Pantocid 40", "Augmentin 625"),
      "dosage_form": string ("Tablet", "Syrup", "Capsule", "Injection", "Drops", "Gel/Ointment"),
      "strength": string or null (e.g. "650mg", "40mg"),
      "frequency": string (standard medical notation like "1-0-1", "1-0-0", "0-0-1", "1-1-1", "SOS", "0-1-0", "1-1-1-1"),
      "duration": string (e.g. "3 days", "5 days", "1 month"),
      "instructions": string ("After Food", "Before Food", "At bedtime", "With warm water", "With food")
    }
  ],
  "notes": string or null (clinical advice like "Warm saline gargle", "Avoid oily spicy food"),
  "followUpDays": number or null (e.g. 3, 5, 7)
}

Clinical Rules:
1. Indian Regional Dialects:
   - "khali pet" or "parigadupuna" -> "Before Food"
   - "subah sham" or "rendu sarlu" -> "1-0-1"
   - "rat ko" or "padukonetappudu" -> "0-0-1"
   - "teen bar" or "moodu sarlu" -> "1-1-1"
   - "3 din" or "moodu rojulu" -> "3 days"
   - "5 din" or "aidu rojulu" -> "5 days"
2. Fix Speech-to-Text Phonetic Misrecognitions:
   - "tholo" / "dollo" -> "Dolo 650"
   - "pantalos it" / "pantacide" -> "Pantocid 40"
   - "agumentin" / "ogmentin" -> "Augmentin 625"
   - "pcm" / "parasitamol" -> "Paracetamol"
   - "ascoril" -> "Ascoril-D"
   - "setrizin" / "cetricin" -> "Cetirizine 10"
3. Semantic Disentanglement:
   - Match duration and instructions with the correct drug even if the doctor states them out of order or separates them with symptoms/diagnosis sentences.
4. Return pure JSON only without markdown fences.`;

/**
 * Call Google Gemini 3.8 Flash for semantic extraction
 */
async function parseWithGemini(transcript: string, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: transcript }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned empty content');
  }

  return JSON.parse(text);
}

// Fallback regex / phonetic patterns for offline or fallback mode
const PHONETIC_CORRECTIONS = [
  { pattern: /\b(?:tholo|dollo|tolo)\b/gi, replacement: 'Dolo' },
  { pattern: /\b(?:pantalos\s+it|pantalos|pantocide|pantacide|pantocid)\b/gi, replacement: 'Pantocid' },
  { pattern: /\b(?:pantop\s+40|pantop|panto)\b/gi, replacement: 'Pantop' },
  { pattern: /\b(?:agumentin|augumentin|ogmentin)\b/gi, replacement: 'Augmentin' },
  { pattern: /\b(?:ascoril|askoril|ascoril-d)\b/gi, replacement: 'Ascoril-D' },
  { pattern: /\b(?:azithro|azithral|asithral)\b/gi, replacement: 'Azithral' },
  { pattern: /\b(?:parasitamol|paracitamol|pcm)\b/gi, replacement: 'Paracetamol' },
  { pattern: /\b(?:setrizin|cetrizin|cetricin)\b/gi, replacement: 'Cetirizine' },
  { pattern: /\b(?:calpol|kalpol)\b/gi, replacement: 'Calpol' },
];

const FREQ_PATTERNS = [
  { regex: /\b(1-0-1|twice daily|twice a day|two times|bd|bid|subah sham)\b/i, val: '1-0-1' },
  { regex: /\b(1-1-1|thrice daily|thrice a day|three times|tds|tid|teen bar)\b/i, val: '1-1-1' },
  { regex: /\b(1-0-0|once daily|once a day|one time|od|morning|subah)\b/i, val: '1-0-0' },
  { regex: /\b(0-0-1|night only|at bedtime|bedtime|hs|rat ko)\b/i, val: '0-0-1' },
  { regex: /\b(0-1-0|afternoon|dophar)\b/i, val: '0-1-0' },
  { regex: /\b(1-1-1-1|qid|four times)\b/i, val: '1-1-1-1' },
  { regex: /\b(sos|as needed|jab jarurat)\b/i, val: 'SOS' },
];

const INST_PATTERNS = [
  { regex: /\b(before (?:food|meals?|breakfast|lunch|dinner)|empty stomach|khali pet|ac)\b/i, val: 'Before Food' },
  { regex: /\b(after (?:food|meals?|breakfast|lunch|dinner)|khana khane ke baad|pc)\b/i, val: 'After Food' },
  { regex: /\b(with (?:food|meals?))\b/i, val: 'With Food' },
  { regex: /\b(at bedtime|sone se pehle)\b/i, val: 'At bedtime' },
  { regex: /\b(with warm water|garm pani)\b/i, val: 'With warm water' },
];

function parseHeuristicFallback(rawTranscript: string): any {
  let text = rawTranscript;
  for (const item of PHONETIC_CORRECTIONS) {
    text = text.replace(item.pattern, item.replacement);
  }

  let followUpDays: number | undefined;
  const fuMatch = text.match(/\b(?:review|follow[- ]?up|come back|revisit)\s+(?:in|after)?\s*(\d+)\s*(days?|din|weeks?)?\b/i);
  if (fuMatch) {
    const qty = parseInt(fuMatch[1], 10);
    const unit = fuMatch[2] || 'day';
    followUpDays = unit.toLowerCase().startsWith('week') ? qty * 7 : qty;
    text = text.replace(fuMatch[0], ' ');
  }

  let chiefComplaint = '';
  let diagnosis = '';
  const ccMatch = text.match(/\b(?:patient\s+has|complaining of|c\/o|complaints? of|suffering from|having)\s+([^.,;]+?)(?=\bgive\b|\bprescribe\b|\brx\b|\.|$)/i);
  if (ccMatch && ccMatch[1]) {
    chiefComplaint = ccMatch[1].trim();
    text = text.replace(ccMatch[0], ' ');
    if (/fever|pyrexia/i.test(chiefComplaint)) diagnosis = 'Acute Febrile Illness';
    else if (/cough|cold|throat/i.test(chiefComplaint)) diagnosis = 'Upper Respiratory Tract Infection (URTI)';
  }

  const clauses = text
    .split(/(?:[.,;]|\band\b|\balso\b)+/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2);

  const medicines: ParsedMedicine[] = [];

  for (const clause of clauses) {
    let cText = clause;
    const hasFreq = FREQ_PATTERNS.some((fp) => fp.regex.test(cText));
    const hasDur = /\b(?:for\s+)?(\d+)\s*(days?|din|weeks?|months?)\b/i.test(cText);
    const hasDrug = /\b(Dolo|Pantocid|Augmentin|Paracetamol|Pantop|Ascoril|Azithral|Cetirizine|Calpol|Meftal|Telma|Glycomet|Pan)\b/i.test(cText);

    if (!hasFreq && !hasDur && !hasDrug) continue;

    let frequency = '1-0-1';
    for (const fp of FREQ_PATTERNS) {
      if (fp.regex.test(cText)) {
        frequency = fp.val;
        cText = cText.replace(fp.regex, ' ');
        break;
      }
    }

    let duration = '5 days';
    const durMatch = cText.match(/\b(?:for\s+)?(\d+)\s*(days?|din|weeks?|hafta|months?|mahina)\b/i);
    if (durMatch) {
      const num = durMatch[1];
      const unit = durMatch[2].toLowerCase();
      duration = unit.startsWith('week') ? `${parseInt(num, 10) * 7} days` : `${num} days`;
      cText = cText.replace(durMatch[0], ' ');
    }

    let instructions = 'After Food';
    for (const ip of INST_PATTERNS) {
      if (ip.regex.test(cText)) {
        instructions = ip.val;
        cText = cText.replace(ip.regex, ' ');
        break;
      }
    }

    let cleanName = cText
      .replace(/\b(patient|has|complaining|viral|fever|give|prescribe|take|and|also|tab|tablet|cap|capsule|syp|syrup|inj|injection)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    cleanName = cleanName.replace(/(\d+)\s*m\b/gi, '$1mg');

    if (cleanName.length >= 2) {
      medicines.push({
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        dosage_form: 'Tablet',
        frequency,
        duration,
        instructions,
      });
    }
  }

  return { chiefComplaint, diagnosis, medicines, followUpDays };
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

    let parsedResult: any;
    let engineSource = 'heuristic_fallback';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10) {
      try {
        parsedResult = await parseWithGemini(transcript, apiKey);
        engineSource = 'gemini_3.8_flash';
      } catch (geminiErr: any) {
        console.warn('Gemini 3.8 Flash parsing failed, falling back to heuristic:', geminiErr.message);
        parsedResult = parseHeuristicFallback(transcript);
      }
    } else {
      parsedResult = parseHeuristicFallback(transcript);
    }

    const medicines: ParsedMedicine[] = (parsedResult.medicines || []).map((m: any) => ({
      name: m.name || 'Medicine',
      dosage_form: m.dosage_form || 'Tablet',
      strength: m.strength || undefined,
      frequency: m.frequency || '1-0-1',
      duration: m.duration || '5 days',
      instructions: m.instructions || 'After Food',
    }));

    // Cross-reference canonical drugId against PostgreSQL database where available
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
        // Safe if DB query fails in disconnected test environment
      }
    }

    // Filter restricted/narcotic drugs
    const safeMedicines = medicines.filter((m) => !isDrugNameRestricted(m.name));

    // Calculate follow-up ISO string if followUpDays was found
    let followUpDate: string | undefined;
    const followUpDays = parsedResult.followUpDays;
    if (followUpDays && typeof followUpDays === 'number') {
      const d = new Date();
      d.setDate(d.getDate() + followUpDays);
      followUpDate = d.toISOString().split('T')[0];
    }

    const finalResult: VoiceRxResult = {
      transcript,
      chiefComplaint: parsedResult.chiefComplaint || undefined,
      diagnosis: parsedResult.diagnosis || undefined,
      medicines: safeMedicines,
      notes: parsedResult.notes || undefined,
      followUpDays: followUpDays || undefined,
      followUpDate,
    };

    return NextResponse.json({
      success: true,
      data: finalResult,
      source: engineSource,
    });
  } catch (err: any) {
    console.error('Voice Rx parsing error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process voice prescription' },
      { status: 500 }
    );
  }
}
