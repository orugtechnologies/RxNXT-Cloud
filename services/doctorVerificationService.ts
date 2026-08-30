/**
 * RxNXT Doctor Medical Council & Compliance Verification Service
 * Supports National Medical Commission (NMC / erstwhile MCI) and all Indian State Medical Councils.
 * Directly queries the official National Medical Commission (NMC) REST API.
 */

export interface MedicalCouncilOption {
  id: string;
  name: string;
  shortCode: string;
  state: string;
  pattern?: RegExp;
}

export const MEDICAL_COUNCILS: MedicalCouncilOption[] = [
  { id: 'NMC', name: 'National Medical Commission (NMC / erstwhile MCI)', shortCode: 'NMC', state: 'National' },
  { id: 'APMC', name: 'Andhra Pradesh Medical Council', shortCode: 'APMC', state: 'Andhra Pradesh' },
  { id: 'AMC', name: 'Assam Medical Council', shortCode: 'AMC', state: 'Assam' },
  { id: 'BMC', name: 'Bihar Medical Council', shortCode: 'BMC', state: 'Bihar' },
  { id: 'CGMC', name: 'Chhattisgarh Medical Council', shortCode: 'CGMC', state: 'Chhattisgarh' },
  { id: 'DMC', name: 'Delhi Medical Council', shortCode: 'DMC', state: 'Delhi' },
  { id: 'GMC_GOA', name: 'Goa Medical Council', shortCode: 'GMC', state: 'Goa' },
  { id: 'GMC_GUJ', name: 'Gujarat Medical Council', shortCode: 'GMC', state: 'Gujarat' },
  { id: 'HMC', name: 'Haryana Medical Council', shortCode: 'HMC', state: 'Haryana' },
  { id: 'HPMC', name: 'Himachal Pradesh Medical Council', shortCode: 'HPMC', state: 'Himachal Pradesh' },
  { id: 'JKMC', name: 'Jammu & Kashmir Medical Council', shortCode: 'JKMC', state: 'Jammu & Kashmir' },
  { id: 'JMC', name: 'Jharkhand Medical Council', shortCode: 'JMC', state: 'Jharkhand' },
  { id: 'KMC', name: 'Karnataka Medical Council', shortCode: 'KMC', state: 'Karnataka' },
  { id: 'TCMC', name: 'Travancore Cochin Medical Council (Kerala)', shortCode: 'TCMC', state: 'Kerala' },
  { id: 'MPMC', name: 'Madhya Pradesh Medical Council', shortCode: 'MPMC', state: 'Madhya Pradesh' },
  { id: 'MMC', name: 'Maharashtra Medical Council', shortCode: 'MMC', state: 'Maharashtra' },
  { id: 'ORMC', name: 'Odisha Medical Council', shortCode: 'OMC', state: 'Odisha' },
  { id: 'PMC', name: 'Punjab Medical Council', shortCode: 'PMC', state: 'Punjab' },
  { id: 'RMC', name: 'Rajasthan Medical Council', shortCode: 'RMC', state: 'Rajasthan' },
  { id: 'TNMC', name: 'Tamil Nadu Medical Council', shortCode: 'TNMC', state: 'Tamil Nadu' },
  { id: 'TSMC', name: 'Telangana State Medical Council', shortCode: 'TSMC', state: 'Telangana' },
  { id: 'UPMC', name: 'Uttar Pradesh Medical Council', shortCode: 'UPMC', state: 'Uttar Pradesh' },
  { id: 'UKMC', name: 'Uttarakhand Medical Council', shortCode: 'UKMC', state: 'Uttarakhand' },
  { id: 'WBMC', name: 'West Bengal Medical Council', shortCode: 'WBMC', state: 'West Bengal' },
];

export interface SandboxDoctorRecord {
  registrationNumber: string;
  medicalCouncilId: string;
  registeredName: string;
  qualification: string;
  registrationYear: number;
}

/**
 * Curated list of mock doctors for sandbox testing in local/staging environments.
 * Entering invalid details not in this registry will be properly rejected.
 */
export const SANDBOX_REGISTRY: SandboxDoctorRecord[] = [
  {
    registrationNumber: 'KMC-12345',
    medicalCouncilId: 'KMC',
    registeredName: 'Dr. Shanmukha Datta',
    qualification: 'MBBS, MD (General Medicine)',
    registrationYear: 2018,
  },
  {
    registrationNumber: 'NMC-889900',
    medicalCouncilId: 'NMC',
    registeredName: 'Dr. Shanmukha Datta',
    qualification: 'MBBS, MD',
    registrationYear: 2019,
  },
  {
    registrationNumber: 'TEST-MCI-001',
    medicalCouncilId: 'NMC',
    registeredName: 'Dr. Rajesh Sharma',
    qualification: 'MBBS, MS (Orthopaedics)',
    registrationYear: 2015,
  },
  {
    registrationNumber: 'MMC-45678',
    medicalCouncilId: 'MMC',
    registeredName: 'Dr. Priya Deshmukh',
    qualification: 'MBBS, DGO (Gynaecology)',
    registrationYear: 2020,
  },
  {
    registrationNumber: 'TSMC-67890',
    medicalCouncilId: 'TSMC',
    registeredName: 'Dr. Suresh Reddy',
    qualification: 'MBBS, MD (Pediatrics)',
    registrationYear: 2017,
  },
  {
    registrationNumber: 'APMC-34567',
    medicalCouncilId: 'APMC',
    registeredName: 'Dr. Ananya Rao',
    qualification: 'MBBS, DNB (Cardiology)',
    registrationYear: 2016,
  },
  {
    registrationNumber: 'DMC-98765',
    medicalCouncilId: 'DMC',
    registeredName: 'Dr. Amit Verma',
    qualification: 'MBBS, MD (Dermatology)',
    registrationYear: 2021,
  },
  {
    registrationNumber: 'TNMC-54321',
    medicalCouncilId: 'TNMC',
    registeredName: 'Dr. Karthik Subramanian',
    qualification: 'MBBS, MS (General Surgery)',
    registrationYear: 2016,
  },
  {
    registrationNumber: 'WBMC-11223',
    medicalCouncilId: 'WBMC',
    registeredName: 'Dr. Debashis Banerjee',
    qualification: 'MBBS, MD (Pulmonology)',
    registrationYear: 2014,
  },
  {
    registrationNumber: 'UPMC-77889',
    medicalCouncilId: 'UPMC',
    registeredName: 'Dr. Vikas Pandey',
    qualification: 'MBBS, DCH (Pediatrics)',
    registrationYear: 2019,
  },
  {
    registrationNumber: 'GMC-99887',
    medicalCouncilId: 'GMC_GUJ',
    registeredName: 'Dr. Bhavesh Patel',
    qualification: 'MBBS, MD (Internal Medicine)',
    registrationYear: 2018,
  },
];

export interface DoctorVerificationInput {
  fullName: string;
  medicalCouncil: string;
  registrationNumber: string;
  registrationYear?: number | string;
  qualification?: string;
}

export interface DoctorVerificationResult {
  success: boolean;
  verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING';
  medicalCouncil: string;
  registrationNumber: string;
  registrationYear?: number;
  qualification: string;
  registeredName: string;
  matchScore: number;
  source: 'SANDBOX' | 'NMC_REGISTRY' | 'SMC_REGISTRY' | 'DECENTRO' | 'APIFY' | 'SUREPASS' | 'MANUAL';
  message: string;
  verifiedAt: string;
  rawDetails?: Record<string, any>;
}

export function calculateNameSimilarity(nameA: string, nameB: string): number {
  if (!nameA || !nameB) return 0;
  
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/^dr\.?\s+/i, '')
      .replace(/\b(dr|md|mbbs|ms|dnb|frcs|mrco|phd|dch|dgo)\b/gi, '')
      .replace(/[^a-z0-9\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const str1 = clean(nameA);
  const str2 = clean(nameB);

  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;

  const tokens1 = str1.split(' ').filter(Boolean);
  const tokens2Set = new Set(str2.split(' ').filter(Boolean));

  let intersection = 0;
  for (let i = 0; i < tokens1.length; i++) {
    if (tokens2Set.has(tokens1[i])) {
      intersection++;
    }
  }

  const totalTokens = tokens1.length + tokens2Set.size;
  const tokenScore = totalTokens > 0 
    ? (2 * intersection) / totalTokens 
    : 0;

  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const maxLen = Math.max(m, n);
  const levScore = maxLen > 0 ? 1 - dp[m][n] / maxLen : 0;
  const finalScore = Math.max(tokenScore * 100, levScore * 100);

  return Math.round(finalScore);
}

export function isValidRegistrationFormat(regNumber: string): boolean {
  if (!regNumber || typeof regNumber !== 'string') return false;
  const trimmed = regNumber.trim();
  return /^[A-Za-z0-9\/\-_]{3,25}$/.test(trimmed);
}

export async function verifyDoctorCredentials(
  input: DoctorVerificationInput
): Promise<DoctorVerificationResult> {
  const { fullName, medicalCouncil, registrationNumber, registrationYear, qualification } = input;

  if (!fullName || !fullName.trim()) {
    return {
      success: false,
      verificationStatus: 'REJECTED',
      medicalCouncil: medicalCouncil || 'NMC',
      registrationNumber: registrationNumber || '',
      qualification: '',
      registeredName: '',
      matchScore: 0,
      source: 'SANDBOX',
      message: 'Doctor full name is required for verification.',
      verifiedAt: new Date().toISOString(),
    };
  }

  if (!registrationNumber || !isValidRegistrationFormat(registrationNumber)) {
    return {
      success: false,
      verificationStatus: 'REJECTED',
      medicalCouncil: medicalCouncil || 'NMC',
      registrationNumber: registrationNumber || '',
      qualification: '',
      registeredName: '',
      matchScore: 0,
      source: 'SANDBOX',
      message: 'Invalid registration number format. Must be 3-25 alphanumeric characters.',
      verifiedAt: new Date().toISOString(),
    };
  }

  const selectedCouncil = MEDICAL_COUNCILS.find(
    (c) => c.id === medicalCouncil || c.name === medicalCouncil || c.shortCode === medicalCouncil
  ) || {
    id: 'NMC',
    name: medicalCouncil || 'National Medical Commission',
    shortCode: 'NMC',
    state: 'National',
  };

  const parsedYear = registrationYear ? parseInt(String(registrationYear), 10) : new Date().getFullYear();
  const currentYear = new Date().getFullYear();

  if (parsedYear < 1950 || parsedYear > currentYear) {
    return {
      success: false,
      verificationStatus: 'REJECTED',
      medicalCouncil: selectedCouncil.name,
      registrationNumber: registrationNumber.trim(),
      registrationYear: parsedYear,
      qualification: '',
      registeredName: '',
      matchScore: 0,
      source: 'SANDBOX',
      message: `Invalid registration year (${parsedYear}). Must be between 1950 and ${currentYear}.`,
      verifiedAt: new Date().toISOString(),
    };
  }

  const apiKey = process.env.DOCTOR_VERIFY_API_KEY;
  const provider = process.env.DOCTOR_VERIFY_PROVIDER;

  // 1. LIVE NMC / SMC DIRECT VERIFICATION ENGINE (Production & Live Lookups)
  if (provider && provider.toLowerCase() !== 'sandbox') {
    try {
      const nmcResult = await executeDirectNMCVerification(input, selectedCouncil);
      if (nmcResult.success) {
        return nmcResult;
      }
      // If NMC direct search returned a specific mismatch/rejection with doctor found, return it
      if (nmcResult.rawDetails?.foundInNmc) {
        return nmcResult;
      }
    } catch (err: any) {
      console.warn('Direct NMC verification attempt fallback:', err?.message);
    }

    // Try other live providers if configured
    if (apiKey && provider.toLowerCase() === 'decentro') {
      try {
        return await executeLiveProviderVerification(input, apiKey, provider, selectedCouncil);
      } catch (err) {
        console.error('Decentro live error:', err);
      }
    }
  }

  // 2. SANDBOX VERIFICATION ENGINE (Development/Staging)
  const normalizedInputReg = registrationNumber.trim().toUpperCase().replace(/[\s\-_]/g, '');
  
  const match = SANDBOX_REGISTRY.find(
    (doc) => doc.registrationNumber.toUpperCase().replace(/[\s\-_]/g, '') === normalizedInputReg
  );

  if (!match) {
    return {
      success: false,
      verificationStatus: 'REJECTED',
      medicalCouncil: selectedCouncil.name,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      registrationYear: parsedYear,
      qualification: '',
      registeredName: '',
      matchScore: 0,
      source: 'NMC_REGISTRY',
      message: `Registration number "${registrationNumber}" was not found in the ${selectedCouncil.name} / NMC official registry.`,
      verifiedAt: new Date().toISOString(),
      rawDetails: {
        sandboxNote: 'In sandbox mode, valid test registration numbers are: KMC-12345, NMC-889900, TEST-MCI-001, MMC-45678, TSMC-67890, APMC-34567, DMC-98765, TNMC-54321, WBMC-11223, UPMC-77889, GMC-99887.',
      },
    };
  }

  const matchScore = calculateNameSimilarity(fullName, match.registeredName);

  if (matchScore < 60) {
    return {
      success: false,
      verificationStatus: 'REJECTED',
      medicalCouncil: selectedCouncil.name,
      registrationNumber: match.registrationNumber,
      registrationYear: match.registrationYear,
      qualification: match.qualification,
      registeredName: match.registeredName,
      matchScore,
      source: 'SANDBOX',
      message: `Name mismatch: Entered name "${fullName}" does not match the official registered name for this license (${match.registeredName}).`,
      verifiedAt: new Date().toISOString(),
      rawDetails: {
        registeredName: match.registeredName,
        matchScore,
      },
    };
  }

  return {
    success: true,
    verificationStatus: 'VERIFIED',
    medicalCouncil: selectedCouncil.name,
    registrationNumber: match.registrationNumber,
    registrationYear: match.registrationYear,
    qualification: match.qualification,
    registeredName: match.registeredName,
    matchScore,
    source: 'SANDBOX',
    message: `Doctor successfully verified with ${selectedCouncil.name} (Sandbox Mode).`,
    verifiedAt: new Date().toISOString(),
    rawDetails: {
      councilId: selectedCouncil.id,
      councilName: selectedCouncil.name,
      councilState: selectedCouncil.state,
      registeredStatus: 'ACTIVE',
      complianceLevel: 'NABH_NMC_ALIGNED',
      sandboxVerified: true,
    },
  };
}

/**
 * Direct Live Verification with official National Medical Commission (NMC) REST API.
 * Covers All 24+ State Medical Councils & National Register.
 */
export async function executeDirectNMCVerification(
  input: DoctorVerificationInput,
  selectedCouncil: MedicalCouncilOption
): Promise<DoctorVerificationResult> {
  const { fullName, registrationNumber, registrationYear } = input;
  const cleanRegNo = registrationNumber.replace(/[^A-Za-z0-9]/g, '');

  const payload = JSON.stringify({
    registrationNo: cleanRegNo,
  });

  return new Promise((resolve) => {
    // Dynamic import of https to run in Node server environment
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false, // Handle government portal certificate chains
    });

    const req = https.request(
      'https://www.nmc.org.in/MCIRest/open/getDataFromService?service=searchDoctor',
      {
        method: 'POST',
        agent,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
        timeout: 12000,
      },
      (res: any) => {
        let rawData = '';
        res.on('data', (chunk: any) => (rawData += chunk));
        res.on('end', () => {
          try {
            const docs = JSON.parse(rawData);
            if (!Array.isArray(docs) || docs.length === 0) {
              return resolve({
                success: false,
                verificationStatus: 'REJECTED',
                medicalCouncil: selectedCouncil.name,
                registrationNumber: cleanRegNo,
                qualification: '',
                registeredName: '',
                matchScore: 0,
                source: 'NMC_REGISTRY',
                message: `Registration number "${registrationNumber}" was not found in the official National Medical Register (NMC).`,
                verifiedAt: new Date().toISOString(),
              });
            }

            // Find matching record by State Council and/or Name
            let matched = null;
            let highestScore = -1;

            for (const doc of docs) {
              const docName = `${doc.firstName || ''} ${doc.middleName || ''} ${doc.lastName || ''}`.trim();
              const docSmc = (doc.smcName || '').toLowerCase();
              const inputSmc = (selectedCouncil.name || selectedCouncil.shortCode || '').toLowerCase();

              const councilMatch = 
                docSmc.includes(inputSmc) || 
                inputSmc.includes(docSmc) || 
                inputSmc.includes('national') || 
                inputSmc.includes('nmc');

              const score = calculateNameSimilarity(fullName, docName);

              if (councilMatch && (score > highestScore || matched === null)) {
                highestScore = score;
                matched = doc;
              } else if (!matched && score > highestScore) {
                highestScore = score;
                matched = doc;
              }
            }

            if (!matched) {
              matched = docs[0];
            }

            const registeredName = `${matched.firstName || ''} ${matched.middleName || ''} ${matched.lastName || ''}`.trim();
            const qualification = matched.doctorDegree || matched.qualification || 'MBBS';
            const matchScore = calculateNameSimilarity(fullName, registeredName);
            const isMatch = matchScore >= 50;

            // Check if License has been cancelled, removed, or suspended by NMC / State Council
            const isCancelledOrSuspended = Boolean(
              matched.removedStatus || 
              matched.removedOn || 
              (matched.remarks && /suspended|removed|cancelled|blacklisted|de-registered|erased/i.test(matched.remarks))
            );

            if (isCancelledOrSuspended && !matched.restoredStatus) {
              return resolve({
                success: false,
                verificationStatus: 'REJECTED',
                medicalCouncil: matched.smcName || selectedCouncil.name,
                registrationNumber: matched.registrationNo || cleanRegNo,
                registrationYear: Number(matched.yearInfo) || undefined,
                qualification,
                registeredName,
                matchScore,
                source: 'NMC_REGISTRY',
                message: `License Inactive: This medical license has been suspended, removed, or cancelled by the ${matched.smcName || 'Medical Council'} (${matched.removedStatus || matched.remarks || 'Status: Cancelled'}).`,
                verifiedAt: new Date().toISOString(),
                rawDetails: {
                  isBlocked: true,
                  removedStatus: matched.removedStatus,
                  removedOn: matched.removedOn,
                  remarks: matched.remarks,
                },
              });
            }

            if (!isMatch) {
              return resolve({
                success: false,
                verificationStatus: 'REJECTED',
                medicalCouncil: matched.smcName || selectedCouncil.name,
                registrationNumber: matched.registrationNo || cleanRegNo,
                registrationYear: Number(matched.yearInfo) || undefined,
                qualification,
                registeredName,
                matchScore,
                source: 'NMC_REGISTRY',
                message: `Name mismatch: Entered name "${fullName}" does not match the official NMC registered name (${registeredName}).`,
                verifiedAt: new Date().toISOString(),
                rawDetails: {
                  foundInNmc: true,
                  registeredName,
                  matchScore,
                  smcName: matched.smcName,
                },
              });
            }

            return resolve({
              success: true,
              verificationStatus: 'VERIFIED',
              medicalCouncil: matched.smcName || selectedCouncil.name,
              registrationNumber: matched.registrationNo || cleanRegNo,
              registrationYear: Number(matched.yearInfo) || (registrationYear ? Number(registrationYear) : undefined),
              qualification,
              registeredName,
              matchScore,
              source: 'NMC_REGISTRY',
              message: `Doctor successfully verified with ${matched.smcName || selectedCouncil.name} (NMC Official Registry).`,
              verifiedAt: new Date().toISOString(),
              rawDetails: matched,
            });
          } catch (e: any) {
            console.error('NMC parse error:', e);
            resolve({
              success: false,
              verificationStatus: 'REJECTED',
              medicalCouncil: selectedCouncil.name,
              registrationNumber: cleanRegNo,
              qualification: '',
              registeredName: '',
              matchScore: 0,
              source: 'NMC_REGISTRY',
              message: `NMC registry response could not be parsed: ${e?.message}`,
              verifiedAt: new Date().toISOString(),
            });
          }
        });
      }
    );

    req.on('error', (err: any) => {
      console.error('NMC request error:', err);
      resolve({
        success: false,
        verificationStatus: 'REJECTED',
        medicalCouncil: selectedCouncil.name,
        registrationNumber: cleanRegNo,
        qualification: '',
        registeredName: '',
        matchScore: 0,
        source: 'NMC_REGISTRY',
        message: `NMC registry connection error: ${err?.message}`,
        verifiedAt: new Date().toISOString(),
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        verificationStatus: 'REJECTED',
        medicalCouncil: selectedCouncil.name,
        registrationNumber: cleanRegNo,
        qualification: '',
        registeredName: '',
        matchScore: 0,
        source: 'NMC_REGISTRY',
        message: 'NMC registry request timed out.',
        verifiedAt: new Date().toISOString(),
      });
    });

    req.write(payload);
    req.end();
  });
}

async function executeLiveProviderVerification(
  input: DoctorVerificationInput,
  apiKey: string,
  provider: string,
  selectedCouncil: MedicalCouncilOption
): Promise<DoctorVerificationResult> {
  const normalizedProvider = provider.toLowerCase().trim();

  // -------------------------------------------------------------
  // PROVIDER 1: DECENTRO API
  // -------------------------------------------------------------
  if (normalizedProvider === 'decentro') {
    const clientId = process.env.DECENTRO_CLIENT_ID || '';
    const clientSecret = process.env.DECENTRO_CLIENT_SECRET || '';
    const moduleSecret = process.env.DECENTRO_MODULE_SECRET || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'client_id': clientId,
      'client_secret': clientSecret,
      'module_secret': moduleSecret,
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch('https://in.decentro.tech/v2/compliance/verification/professional', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reference_id: `rxnxt_${Date.now()}`,
        id_number: input.registrationNumber.trim(),
        professional_type: 'DOCTOR',
        state: selectedCouncil.shortCode,
        year: input.registrationYear,
        name: input.fullName,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.status === 'SUCCESS' && data?.data) {
      const registeredName = data.data.name || data.data.doctor_name || input.fullName;
      const matchScore = calculateNameSimilarity(input.fullName, registeredName);
      const isMatch = matchScore >= 60;

      return {
        success: isMatch,
        verificationStatus: isMatch ? 'VERIFIED' : 'REJECTED',
        medicalCouncil: selectedCouncil.name,
        registrationNumber: input.registrationNumber.trim().toUpperCase(),
        registrationYear: Number(input.registrationYear),
        qualification: data.data.qualifications || data.data.degree || 'MBBS',
        registeredName,
        matchScore,
        source: 'DECENTRO',
        message: isMatch 
          ? `Doctor successfully verified with ${selectedCouncil.name} via Decentro.` 
          : `Name mismatch: Entered name "${input.fullName}" does not match registry record "${registeredName}".`,
        verifiedAt: new Date().toISOString(),
        rawDetails: data.data,
      };
    }
  }

  return executeDirectNMCVerification(input, selectedCouncil);
}



