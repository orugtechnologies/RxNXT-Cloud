import { 
  verifyDoctorCredentials, 
  calculateNameSimilarity, 
  isValidRegistrationFormat,
  MEDICAL_COUNCILS,
  SANDBOX_REGISTRY
} from '../../services/doctorVerificationService';

describe('Doctor Verification Service', () => {
  describe('calculateNameSimilarity', () => {
    it('returns 100 for exact name match', () => {
      expect(calculateNameSimilarity('Dr. Shanmukha Datta', 'Dr. Shanmukha Datta')).toBe(100);
    });

    it('ignores Dr. prefix and degrees', () => {
      expect(calculateNameSimilarity('Shanmukha Datta', 'Dr. Shanmukha Datta MBBS')).toBe(100);
      expect(calculateNameSimilarity('Priya Deshmukh', 'Dr. Priya Deshmukh MBBS DGO')).toBe(100);
    });

    it('returns high score for slight variations or word order', () => {
      const score = calculateNameSimilarity('Dr. Shanmukha Datta', 'Shanmukha Datta');
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('returns low score for completely different names', () => {
      const score = calculateNameSimilarity('Dr. Shivaram', 'Dr. Shanmukha Datta');
      expect(score).toBeLessThan(50);
    });

    it('handles empty strings safely', () => {
      expect(calculateNameSimilarity('', 'Dr. Shanmukha Datta')).toBe(0);
      expect(calculateNameSimilarity('Dr. Test', '')).toBe(0);
    });
  });

  describe('isValidRegistrationFormat', () => {
    it('accepts valid alphanumeric license formats', () => {
      expect(isValidRegistrationFormat('KMC-12345')).toBe(true);
      expect(isValidRegistrationFormat('MCI/2020/9988')).toBe(true);
      expect(isValidRegistrationFormat('123456')).toBe(true);
      expect(isValidRegistrationFormat('TNMC-54321')).toBe(true);
    });

    it('rejects too short or special-character strings', () => {
      expect(isValidRegistrationFormat('A')).toBe(false);
      expect(isValidRegistrationFormat('$$$$')).toBe(false);
      expect(isValidRegistrationFormat('')).toBe(false);
    });
  });

  describe('verifyDoctorCredentials (Sandbox Mode)', () => {
    it('rejects unregistered dummy registration numbers like 123456', async () => {
      const result = await verifyDoctorCredentials({
        fullName: 'shivaram',
        medicalCouncil: 'NMC',
        registrationNumber: '123456',
        registrationYear: 2024,
      });

      expect(result.success).toBe(false);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.message).toContain('not found');
    });

    it('verifies registered test doctors with matching details (KMC)', async () => {
      const result = await verifyDoctorCredentials({
        fullName: 'Dr. Shanmukha Datta',
        medicalCouncil: 'KMC',
        registrationNumber: 'KMC-12345',
        registrationYear: 2018,
      });

      expect(result.success).toBe(true);
      expect(result.verificationStatus).toBe('VERIFIED');
      expect(result.registeredName).toBe('Dr. Shanmukha Datta');
      expect(result.qualification).toBe('MBBS, MD (General Medicine)');
      expect(result.source).toBe('SANDBOX');
    });

    it('verifies registered test doctors across multiple state councils (TNMC, MMC, TSMC)', async () => {
      const tnmcResult = await verifyDoctorCredentials({
        fullName: 'Dr. Karthik Subramanian',
        medicalCouncil: 'TNMC',
        registrationNumber: 'TNMC-54321',
        registrationYear: 2016,
      });
      expect(tnmcResult.success).toBe(true);
      expect(tnmcResult.qualification).toContain('MS (General Surgery)');

      const mmcResult = await verifyDoctorCredentials({
        fullName: 'Dr. Priya Deshmukh',
        medicalCouncil: 'MMC',
        registrationNumber: 'MMC-45678',
        registrationYear: 2020,
      });
      expect(mmcResult.success).toBe(true);
      expect(mmcResult.qualification).toContain('DGO');
    });

    it('rejects when valid registration number is used with completely wrong doctor name', async () => {
      const result = await verifyDoctorCredentials({
        fullName: 'Dr. Shivaram',
        medicalCouncil: 'KMC',
        registrationNumber: 'KMC-12345',
        registrationYear: 2018,
      });

      expect(result.success).toBe(false);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.message).toContain('Name mismatch');
    });

    it('rejects invalid registration years', async () => {
      const result = await verifyDoctorCredentials({
        fullName: 'Dr. Shanmukha Datta',
        medicalCouncil: 'KMC',
        registrationNumber: 'KMC-12345',
        registrationYear: 1940,
      });

      expect(result.success).toBe(false);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.message).toContain('Invalid registration year');
    });

    it('rejects empty or missing doctor full name', async () => {
      const result = await verifyDoctorCredentials({
        fullName: '',
        medicalCouncil: 'KMC',
        registrationNumber: 'KMC-12345',
      });

      expect(result.success).toBe(false);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.message).toContain('full name is required');
    });
  });

  describe('Medical Councils Data Integrity', () => {
    it('has all 24 councils configured with state and short code', () => {
      expect(MEDICAL_COUNCILS.length).toBeGreaterThanOrEqual(24);
      expect(MEDICAL_COUNCILS.some(c => c.id === 'NMC')).toBe(true);
      expect(MEDICAL_COUNCILS.some(c => c.id === 'KMC')).toBe(true);
      expect(MEDICAL_COUNCILS.some(c => c.id === 'DMC')).toBe(true);
      expect(MEDICAL_COUNCILS.some(c => c.id === 'MMC')).toBe(true);
    });
  });
});

