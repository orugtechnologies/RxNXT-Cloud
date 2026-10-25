export interface ProrationCalculation {
  currentPlanPrice: number;
  newPlanPrice: number;
  billingCycleDays: number;
  daysRemaining: number;
  dailyRate: number;
  unusedCredit: number;
  netPayable: number;
}

/**
 * Calculates mid-cycle proration when upgrading between commercial tiers.
 *
 * Formula:
 * Unused Credit = (Current Tier Price / Total Period Days) * Days Remaining
 * Net Payable = max(0, New Tier Price - Unused Credit)
 */
export function calculateTierProration({
  currentPlanPrice,
  newPlanPrice,
  billingCycleDays = 30,
  daysRemaining,
}: {
  currentPlanPrice: number;
  newPlanPrice: number;
  billingCycleDays?: number;
  daysRemaining: number;
}): ProrationCalculation {
  const safeDaysRemaining = Math.max(0, Math.min(daysRemaining, billingCycleDays));
  const dailyRate = currentPlanPrice / Math.max(1, billingCycleDays);
  const unusedCredit = Math.round((currentPlanPrice * safeDaysRemaining) / Math.max(1, billingCycleDays));
  const netPayable = Math.max(0, Math.round(newPlanPrice - unusedCredit));

  return {
    currentPlanPrice,
    newPlanPrice,
    billingCycleDays,
    daysRemaining: safeDaysRemaining,
    dailyRate: Math.round(dailyRate * 100) / 100,
    unusedCredit,
    netPayable,
  };
}

export const SEAT_PRICING = {
  POLYCLINIC_HUB: {
    includedSeats: 3,
    additionalSeatMonthly: 499,
    additionalSeatAnnual: 4990,
  },
};
