import { isFeatureAllowed, TIER_PERMISSIONS, FEATURE_METADATA } from '@/lib/feature-flags';

describe('Epic 2: Tier Management & Feature Flagging System', () => {
  describe('Tier 1: Solo GP (Base Tier)', () => {
    it('flags ON for Core Workspace, Token Queue, and Instant PDF WhatsApp link', () => {
      expect(isFeatureAllowed('SOLO_GP', 'CORE_WORKSPACE')).toBe(true);
      expect(isFeatureAllowed('SOLO_GP', 'TOKEN_QUEUE')).toBe(true);
      expect(isFeatureAllowed('SOLO_GP', 'INSTANT_PDF_WHATSAPP')).toBe(true);
    });

    it('flags OFF for Daily Morning Reminders, Chronic Refills, Pharmacy, and Add-a-Doctor', () => {
      expect(isFeatureAllowed('SOLO_GP', 'MORNING_ADHERENCE')).toBe(false);
      expect(isFeatureAllowed('SOLO_GP', 'CHRONIC_REFILLS')).toBe(false);
      expect(isFeatureAllowed('SOLO_GP', 'PHARMACY_INVENTORY')).toBe(false);
      expect(isFeatureAllowed('SOLO_GP', 'MULTI_DOCTOR_SEATS')).toBe(false);
    });
  });

  describe('Tier 2: Specialist (Patient Adherence)', () => {
    it('flags ON for all Solo GP features plus Patient Adherence module', () => {
      expect(isFeatureAllowed('SPECIALIST', 'CORE_WORKSPACE')).toBe(true);
      expect(isFeatureAllowed('SPECIALIST', 'TOKEN_QUEUE')).toBe(true);
      expect(isFeatureAllowed('SPECIALIST', 'INSTANT_PDF_WHATSAPP')).toBe(true);
      expect(isFeatureAllowed('SPECIALIST', 'MORNING_ADHERENCE')).toBe(true);
      expect(isFeatureAllowed('SPECIALIST', 'CHRONIC_REFILLS')).toBe(true);
    });

    it('flags OFF for Pharmacy and Multi-Doctor seats', () => {
      expect(isFeatureAllowed('SPECIALIST', 'PHARMACY_INVENTORY')).toBe(false);
      expect(isFeatureAllowed('SPECIALIST', 'MULTI_DOCTOR_SEATS')).toBe(false);
    });
  });

  describe('Tier 3: Polyclinic Hub (Pharmacy + Multi-Seat)', () => {
    it('flags ON for all features including Pharmacy and Multi-Doctor provisioning', () => {
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'CORE_WORKSPACE')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'TOKEN_QUEUE')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'INSTANT_PDF_WHATSAPP')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'MORNING_ADHERENCE')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'CHRONIC_REFILLS')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'PHARMACY_INVENTORY')).toBe(true);
      expect(isFeatureAllowed('POLYCLINIC_HUB', 'MULTI_DOCTOR_SEATS')).toBe(true);
    });
  });

  describe('Trial Tier (Unrestricted Feature Experience up to 150 Prescriptions)', () => {
    it('enables core clinical and pharmacy features for trial doctors to experience full value', () => {
      expect(isFeatureAllowed('TRIAL', 'CORE_WORKSPACE')).toBe(true);
      expect(isFeatureAllowed('TRIAL', 'TOKEN_QUEUE')).toBe(true);
      expect(isFeatureAllowed('TRIAL', 'INSTANT_PDF_WHATSAPP')).toBe(true);
      expect(isFeatureAllowed('TRIAL', 'MORNING_ADHERENCE')).toBe(true);
      expect(isFeatureAllowed('TRIAL', 'CHRONIC_REFILLS')).toBe(true);
      expect(isFeatureAllowed('TRIAL', 'PHARMACY_INVENTORY')).toBe(true);
      // Multi-doctor seats remain locked to Polyclinic Hub even in trial
      expect(isFeatureAllowed('TRIAL', 'MULTI_DOCTOR_SEATS')).toBe(false);
    });
  });

  describe('Backward Compatibility & Fallback Mapping', () => {
    it('maps STARTER_MONTHLY to SOLO_GP permissions', () => {
      expect(isFeatureAllowed('STARTER_MONTHLY', 'CORE_WORKSPACE')).toBe(true);
      expect(isFeatureAllowed('STARTER_MONTHLY', 'MORNING_ADHERENCE')).toBe(false);
    });

    it('maps PRO_ANNUAL to SPECIALIST permissions', () => {
      expect(isFeatureAllowed('PRO_ANNUAL', 'MORNING_ADHERENCE')).toBe(true);
      expect(isFeatureAllowed('PRO_ANNUAL', 'PHARMACY_INVENTORY')).toBe(false);
    });

    it('maps ENTERPRISE and DEMO_LIFETIME to full permissions', () => {
      expect(isFeatureAllowed('ENTERPRISE', 'PHARMACY_INVENTORY')).toBe(true);
      expect(isFeatureAllowed('DEMO_LIFETIME', 'MULTI_DOCTOR_SEATS')).toBe(true);
    });
  });
});
