import crypto from 'crypto';

/**
 * Returns the cryptographically secure signing secret.
 * Fails loudly in production if environment secrets are missing.
 */
function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'test') {
      return 'rxnxt-jest-test-suite-secret-mock';
    }
    throw new Error('CRITICAL CONFIGURATION ERROR: NEXTAUTH_SECRET is required for security token generation.');
  }
  return secret;
}

// Default 30 days expiration for WhatsApp prescription access links
const DEFAULT_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Generates a time-bound, cryptographically signed HMAC-SHA256 token
 * for public patient access to prescription PDFs.
 *
 * Format: `<expiresAtTimestamp>.<32-char-hmac-signature>`
 */
export function generatePrescriptionPdfToken(
  prescriptionId: string,
  ttlMs: number = DEFAULT_EXPIRY_MS
): string {
  if (!prescriptionId) return '';
  const secret = getSigningSecret();
  const expiresAt = Date.now() + ttlMs;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`rx_pdf:${prescriptionId}:${expiresAt}`)
    .digest('hex')
    .substring(0, 32);

  return `${expiresAt}.${signature}`;
}

/**
 * Verifies that the provided token matches the expected signature and has not expired.
 * Also maintains backwards-compatibility for tokens generated prior to timestamping.
 */
export function verifyPrescriptionPdfToken(prescriptionId: string, token?: string | null): boolean {
  if (!prescriptionId || !token) return false;
  const secret = getSigningSecret();

  try {
    // 1. New Format: `<expiresAt>.<signature>`
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length !== 2) return false;

      const [expStr, tokenSig] = parts;
      const expiresAt = parseInt(expStr, 10);

      // Check timestamp validity and expiration
      if (isNaN(expiresAt) || Date.now() > expiresAt) {
        return false; // Expired token!
      }

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`rx_pdf:${prescriptionId}:${expStr}`)
        .digest('hex')
        .substring(0, 32);

      const tokenBuf = Buffer.from(tokenSig);
      const expectedBuf = Buffer.from(expectedSig);
      if (tokenBuf.length !== expectedBuf.length) return false;

      return crypto.timingSafeEqual(tokenBuf, expectedBuf);
    }

    // 2. Legacy fallback for smooth migration of existing tokens
    const legacyExpected = crypto
      .createHmac('sha256', secret)
      .update(`rx_pdf:${prescriptionId}`)
      .digest('hex')
      .substring(0, 32);

    const tokenBuf = Buffer.from(token);
    const legacyBuf = Buffer.from(legacyExpected);
    if (tokenBuf.length === legacyBuf.length && crypto.timingSafeEqual(tokenBuf, legacyBuf)) {
      return true;
    }

    // Backwards compatibility with initial legacy salt for any links issued earlier
    const saltLegacy = crypto
      .createHmac('sha256', 'rxnxt-pdf-signature-salt-2026')
      .update(`rx_pdf:${prescriptionId}`)
      .digest('hex')
      .substring(0, 32);
    const saltBuf = Buffer.from(saltLegacy);
    if (tokenBuf.length === saltBuf.length && crypto.timingSafeEqual(tokenBuf, saltBuf)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
