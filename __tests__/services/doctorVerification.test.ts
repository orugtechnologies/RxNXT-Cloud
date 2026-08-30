import { 
  verifyDoctorCredentials, 
  calculateNameSimilarity, 
  isValidRegistrationFormat 
} from '../../services/doctorVerificationService';

describe('Doctor Verification Service', () => {
  describe('calculateNameSimilarity', () => {
    it('returns 100 for exact name match', () => {
      expect(calculateNameSimilarity('Dr. Shanmukha Datta', 'Dr. Shanmukha Datta')).toBe(100);
    });

    it('ignores Dr. prefix and degrees', () => {
      expect(calculateNameSimilarity('Shanmukha Datta', 'Dr. Shanmukha Datta MBBS')).toBe(100);
    });

    it('returns high score for slight variations or word order', () => {
      const score = calculateNameSimilarity('Dr. Shanmukha Datta', 'Shanmukha Datta');
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('returns low score for completely different names', () => {
      const score = calculateNameSimilarity('Dr. Shivaram', 'Dr. Shanmukha Datta');
      expect(score).toBeLessThan(50);
    });
  });

  describe('isValidRegistrationFormat', () => {
    it('accepts valid alphanumeric license formats', () => {
      expect(isValidRegistrationFormat('KMC-12345')).toBe(true);
      expect(isValidRegistrationFormat('MCI/2020/9988')).toBe(true);
      expect(isValidRegistrationFormat('123456')).toBe(true);
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
        registrationYear: 2026,
      });

      expect(result.success).toBe(false);
      expect(result.verificationStatus).toBe('REJECTED');
      expect(result.message).toContain('not found');
    });

    it('verifies registered test doctors with matching details', async () => {
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
  });
});
