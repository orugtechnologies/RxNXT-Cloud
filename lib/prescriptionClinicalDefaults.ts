/**
 * Clinical pre-fill intelligence for 15-second zero-typing prescription flow.
 * Detects drug class from name/generic and supplies evidence-based defaults.
 */
export function getSmartClinicalDefaults(name: string, genericName?: string): {
  frequency: string;
  duration: string;
  instructions: string;
} {
  const combined = `${name || ''} ${genericName || ''}`.toLowerCase();

  // 1. PPIs / Antacids (Pan-D, Pantoprazole, Omez, Omeprazole, Rabeprazole, etc.)
  if (/pan[-\s]?d|pantop|omez|omepra|rabepra|esomepra|gelusil|digene|sucra|antacid|rantac|ranitidine/i.test(combined)) {
    return {
      frequency: '1-0-0 (Morning)',
      duration: '5 Days',
      instructions: 'Before Food (Empty Stomach)',
    };
  }

  // 2. Analgesics / Antipyretics (Paracetamol, Dolo, Calpol, Crocin, SOS, Combiflam, etc.)
  if (/paracetamol|dolo|calpol|sos|crocin|pcm|combiflam|ibuprofen|mefenamic|acetaminophen|ketorolac/i.test(combined)) {
    return {
      frequency: 'SOS (As Needed)',
      duration: '3 Days',
      instructions: 'After Food',
    };
  }

  // 3. Standard Evidence-based Default for all other medicines
  return {
    frequency: '1-0-1 (Morning-Night)',
    duration: '5 Days',
    instructions: 'After Food',
  };
}
