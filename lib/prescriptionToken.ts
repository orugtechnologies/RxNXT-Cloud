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

// Expiration policy: default 30 days, maximum allowable TTL is 60 days
const DEFAULT_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_EXPIRY_MS = 60 * 24 * 60 * 60 * 1000;

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

  // Enforce a strict ceiling on TTL to prevent arbitrary permanent tokens
  const safeTtl = Math.min(Math.max(1000, ttlMs), MAX_EXPIRY_MS);
  const expiresAt = Date.now() + safeTtl;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`rx_pdf:${prescriptionId}:${expiresAt}`)
    .digest('hex')
    .substring(0, 32);

  return `${expiresAt}.${signature}`;
}

/**
 * Verifies that the provided token matches the expected signature and has not expired.
 * Strict time-bound enforcement: legacy non-expiring tokens are explicitly rejected.
 */
export function verifyPrescriptionPdfToken(prescriptionId: string, token?: string | null): boolean {
  if (!prescriptionId || !token) return false;
  const secret = getSigningSecret();

  try {
    // Strictly require time-bound format: `<expiresAt>.<signature>`
    if (!token.includes('.')) {
      return false; // Legacy permanent tokens are strictly rejected
    }

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [expStr, tokenSig] = parts;
    const expiresAt = parseInt(expStr, 10);

    // Check timestamp validity and expiration
    const now = Date.now();
    if (isNaN(expiresAt) || now > expiresAt) {
      return false; // Expired token!
    }

    // Reject tokens with timestamps unreasonably far in the future (tamper protection)
    if (expiresAt > now + MAX_EXPIRY_MS + 24 * 60 * 60 * 1000) {
      return false;
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
  } catch {
    return false;
  }
}
