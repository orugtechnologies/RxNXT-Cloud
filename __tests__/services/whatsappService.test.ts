import {
  isMetaConfigured,
  sanitizePhone,
  sendPrescriptionPDF,
  sendMedicineReminder,
  sendFollowUpReminder,
  sendRefillReminder,
} from '../../services/whatsappService';

describe('Meta WhatsApp Cloud API Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Configuration Detection', () => {
    it('detects when Meta credentials are not configured', () => {
      delete process.env.META_WA_ACCESS_TOKEN;
      delete process.env.META_WA_PHONE_NUMBER_ID;

      expect(isMetaConfigured()).toBe(false);
    });

    it('detects when Meta credentials are fully configured', () => {
      process.env.META_WA_ACCESS_TOKEN = 'test_token_123';
      process.env.META_WA_PHONE_NUMBER_ID = '1092837465';

      expect(isMetaConfigured()).toBe(true);
    });
  });

  describe('Phone Number Sanitization (E.164 standard)', () => {
    it('sanitizes 10-digit Indian phone numbers with 91 prefix', () => {
      expect(sanitizePhone('9876543210')).toBe('919876543210');
      expect(sanitizePhone('09876543210')).toBe('919876543210');
      expect(sanitizePhone('+91 98765 43210')).toBe('919876543210');
      expect(sanitizePhone('+91-98765-43210')).toBe('919876543210');
    });

    it('handles numbers already containing international country code', () => {
      expect(sanitizePhone('919876543210')).toBe('919876543210');
      expect(sanitizePhone('+919876543210')).toBe('919876543210');
      expect(sanitizePhone('+14155552671')).toBe('14155552671');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('Message Dispatching', () => {
    it('dispatches prescription PDF without errors', async () => {
      const result = await sendPrescriptionPDF(
        '9876543210',
        'John Doe',
        'City Health Clinic',
        'https://app.rxnxt.in/p/123/view',
        undefined,
        'clinic_1',
        'Take Paracetamol 650mg twice daily'
      );

      expect(result.success).toBe(true);
    });

    it('dispatches smart slot medicine reminders', async () => {
      const morningRes = await sendMedicineReminder(
        '9876543210',
        'John Doe',
        'Paracetamol 650mg - After Food',
        'Dr. Shanmukha',
        'City Health Clinic',
        'clinic_1',
        'MORNING'
      );
      expect(morningRes.success).toBe(true);

      const nightRes = await sendMedicineReminder(
        '9876543210',
        'John Doe',
        'Pantoprazole 40mg - Before Food',
        'Dr. Shanmukha',
        'City Health Clinic',
        'clinic_1',
        'NIGHT'
      );
      expect(nightRes.success).toBe(true);
    });

    it('dispatches follow-up reminders', async () => {
      const result = await sendFollowUpReminder(
        '9876543210',
        'John Doe',
        'City Health Clinic',
        'Dr. Shanmukha',
        'clinic_1'
      );

      expect(result.success).toBe(true);
    });

    it('dispatches chronic care refill reminders', async () => {
      const result = await sendRefillReminder(
        '9876543210',
        'John Doe',
        'Dr. Shanmukha',
        'City Health Clinic',
        'clinic_1'
      );

      expect(result.success).toBe(true);
    });
  });
});
