import { generatePrescriptionPdfToken, verifyPrescriptionPdfToken } from '@/lib/prescriptionToken';
import crypto from 'crypto';

describe('Prescription PDF HMAC Security Tokens', () => {
  const sampleRxId = 'rx_test_abc123';

  it('generates a valid time-bound token with timestamp and signature', () => {
    const token = generatePrescriptionPdfToken(sampleRxId);
    expect(token).toBeDefined();
    expect(token).toContain('.');

    const [expStr, sig] = token.split('.');
    expect(Number(expStr)).toBeGreaterThan(Date.now());
    expect(sig.length).toBe(32);
  });

  it('verifies a freshly generated token successfully', () => {
    const token = generatePrescriptionPdfToken(sampleRxId);
    const isValid = verifyPrescriptionPdfToken(sampleRxId, token);
    expect(isValid).toBe(true);
  });

  it('rejects a token for a different prescription ID (prevents tampering / IDOR)', () => {
    const token = generatePrescriptionPdfToken(sampleRxId);
    const isValid = verifyPrescriptionPdfToken('rx_different_target_999', token);
    expect(isValid).toBe(false);
  });

  it('rejects an expired token', () => {
    const activeSecret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'rxnxt-jest-test-suite-secret-mock';
    const pastTimestamp = Date.now() - 5000; // 5 seconds in the past
    const sig = crypto
      .createHmac('sha256', activeSecret)
      .update(`rx_pdf:${sampleRxId}:${pastTimestamp}`)
      .digest('hex')
      .substring(0, 32);
    const expiredToken = `${pastTimestamp}.${sig}`;

    const isValid = verifyPrescriptionPdfToken(sampleRxId, expiredToken);
    expect(isValid).toBe(false);
  });

  it('rejects a tampered signature', () => {
    const token = generatePrescriptionPdfToken(sampleRxId);
    const [expStr] = token.split('.');
    const forgedToken = `${expStr}.deadbeefcafebabe0123456789abcdef`;
    const isValid = verifyPrescriptionPdfToken(sampleRxId, forgedToken);
    expect(isValid).toBe(false);
  });

  it('rejects empty or null tokens safely without throwing', () => {
    expect(verifyPrescriptionPdfToken(sampleRxId, null)).toBe(false);
    expect(verifyPrescriptionPdfToken(sampleRxId, undefined)).toBe(false);
    expect(verifyPrescriptionPdfToken(sampleRxId, '')).toBe(false);
    expect(verifyPrescriptionPdfToken('', 'some_token')).toBe(false);
  });

  it('strictly rejects legacy permanent tokens without expiration timestamps', () => {
    const activeSecret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'rxnxt-jest-test-suite-secret-mock';
    const legacySig = crypto
      .createHmac('sha256', activeSecret)
      .update(`rx_pdf:${sampleRxId}`)
      .digest('hex')
      .substring(0, 32);

    // Must be rejected because it lacks `<expiresAt>.`
    expect(verifyPrescriptionPdfToken(sampleRxId, legacySig)).toBe(false);

    // Legacy fixed salt must also be rejected
    const saltSig = crypto
      .createHmac('sha256', 'rxnxt-pdf-signature-salt-2026')
      .update(`rx_pdf:${sampleRxId}`)
      .digest('hex')
      .substring(0, 32);

    expect(verifyPrescriptionPdfToken(sampleRxId, saltSig)).toBe(false);
  });

  it('enforces maximum TTL ceiling on generated tokens', () => {
    // Attempting to request a 10-year TTL (3650 days)
    const tenYearsMs = 3650 * 24 * 60 * 60 * 1000;
    const token = generatePrescriptionPdfToken(sampleRxId, tenYearsMs);
    const [expStr] = token.split('.');
    const expiresAt = Number(expStr);

    // Max expiry is 60 days
    const maxAllowedFuture = Date.now() + 61 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeLessThanOrEqual(maxAllowedFuture);
  });
});
