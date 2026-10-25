import { calculateTierProration } from '@/lib/billing-proration';

describe('Epic 4: Automated Mid-Cycle Tier Proration Engine', () => {
  it('calculates exact prorated upgrade credit when upgrading from Solo GP (₹999) to Polyclinic Hub (₹3,999) mid-cycle', () => {
    // Current plan: Solo GP (₹999 / 30 days = ₹33.30/day)
    // 15 days remaining in billing cycle
    // Unused credit: ₹33.30 * 15 = ₹500
    // New plan: Polyclinic Hub (₹3,999)
    // Net payable: ₹3,999 - ₹500 = ₹3,499
    const calculation = calculateTierProration({
      currentPlanPrice: 999,
      newPlanPrice: 3999,
      billingCycleDays: 30,
      daysRemaining: 15,
    });

    expect(calculation.unusedCredit).toBe(500);
    expect(calculation.netPayable).toBe(3499);
    expect(calculation.daysRemaining).toBe(15);
  });

  it('calculates zero credit when days remaining is 0 (end of cycle renewal)', () => {
    const calculation = calculateTierProration({
      currentPlanPrice: 999,
      newPlanPrice: 1999,
      billingCycleDays: 30,
      daysRemaining: 0,
    });

    expect(calculation.unusedCredit).toBe(0);
    expect(calculation.netPayable).toBe(1999);
  });

  it('handles edge case where unused credit exceeds new plan price gracefully (floors net payable to 0)', () => {
    const calculation = calculateTierProration({
      currentPlanPrice: 4999,
      newPlanPrice: 999,
      billingCycleDays: 30,
      daysRemaining: 25,
    });

    expect(calculation.unusedCredit).toBeGreaterThan(999);
    expect(calculation.netPayable).toBe(0);
  });
});
