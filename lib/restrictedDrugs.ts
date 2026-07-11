// Comprehensive list of commonly abused, highly restricted, Schedule X, and Narcotic drugs
// that are strictly prohibited from being prescribed via telemedicine.
const RESTRICTED_KEYWORDS = [
  'ketamine',
  'morphine',
  'fentanyl',
  'alprazolam',
  'diazepam',
  'clonazepam',
  'lorazepam',
  'codeine',
  'buprenorphine',
  'tramadol',
  'methadone',
  'oxycodone',
  'hydrocodone',
  'phenobarbital',
  'amphetamine',
  'methylphenidate',
  'dexamphetamine',
  'secobarbital',
  'pentobarbital',
  'zolpidem', // Often restricted or highly controlled
  'ephedrine',
  'pseudoephedrine'
];

/**
 * Checks if a custom drug name contains any restricted keywords.
 * @param drugName The custom name typed by the doctor
 * @returns true if the drug name matches a restricted keyword, false otherwise
 */
export function isDrugNameRestricted(drugName: string | null | undefined): boolean {
  if (!drugName) return false;
  
  const normalizedName = drugName.toLowerCase().trim();
  
  // Check if any of the restricted keywords appear as a substring in the custom name
  // e.g. "Syrup Corex" would trigger if "corex" was in the list, but let's say they type "codeine syrup"
  return RESTRICTED_KEYWORDS.some(keyword => normalizedName.includes(keyword));
}
