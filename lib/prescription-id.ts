/**
 * Unified ID Generator and Formatter for RxNXT Cloud
 * Unifies Reception -> Doctor -> Pharmacy into one cohesive, human-friendly ID:
 * Full ID: RX-YYMMDD-### (e.g. RX-260926-001)
 * Short Token: #RX-### (e.g. #RX-001)
 */

export function formatUnifiedRxId(date: Date = new Date(), tokenNumber: number = 1): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const tokenPadded = String(tokenNumber).padStart(3, '0');
  return `RX-${yy}${mm}${dd}-${tokenPadded}`;
}

export function formatShortToken(tokenNumber: number | string | null | undefined): string {
  if (tokenNumber === null || tokenNumber === undefined) return '#RX-001';
  const num = typeof tokenNumber === 'number' ? tokenNumber : parseInt(String(tokenNumber), 10);
  if (isNaN(num)) return String(tokenNumber);
  return `#RX-${String(num).padStart(3, '0')}`;
}

export function formatDisplayRxId(rxId: string | null | undefined, tokenNumber?: number | null): {
  fullId: string;
  shortId: string;
  badgeText: string;
} {
  if (!rxId) {
    const short = formatShortToken(tokenNumber || 1);
    return { fullId: 'RX-NEW', shortId: short, badgeText: short };
  }

  // Check if rxId already follows the standard RX-YYMMDD-### format
  const standardMatch = rxId.match(/^RX-(\d{6})-(\d{3,})/i);
  if (standardMatch) {
    const tokenPart = standardMatch[2];
    const short = `#RX-${tokenPart}`;
    return {
      fullId: rxId.toUpperCase(),
      shortId: short,
      badgeText: `${rxId.toUpperCase()} (${short})`,
    };
  }

  // Fallback for legacy CUIDs or custom strings
  const short = `#${rxId.slice(-6).toUpperCase()}`;
  return {
    fullId: rxId,
    shortId: short,
    badgeText: short,
  };
}
