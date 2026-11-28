import crypto from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET || 'rxnxt-pdf-signature-salt-2026';

/**
 * Generates an HMAC-SHA256 signature token for public patient access to prescription PDFs.
 */
export function generatePrescriptionPdfToken(prescriptionId: string): string {
  if (!prescriptionId) return '';
  return crypto
    .createHmac('sha256', SECRET)
    .update(`rx_pdf:${prescriptionId}`)
    .digest('hex')
    .substring(0, 32);
}

/**
 * Verifies that the provided token matches the expected signature for this prescription.
 */
export function verifyPrescriptionPdfToken(prescriptionId: string, token?: string | null): boolean {
  if (!prescriptionId || !token) return false;
  const expected = generatePrescriptionPdfToken(prescriptionId);
  try {
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);
    if (tokenBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}
