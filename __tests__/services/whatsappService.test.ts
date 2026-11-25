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
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
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

  describe('Live Meta Graph API Dispatching & Resilience', () => {
    beforeEach(() => {
      process.env.META_WA_ACCESS_TOKEN = 'test_meta_token_xyz';
      process.env.META_WA_PHONE_NUMBER_ID = 'phone_102938';
      process.env.META_GRAPH_API_VERSION = 'v19.0';
    });

    it('sends correctly structured payload and auth header to Meta Graph API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messaging_product: 'whatsapp',
          contacts: [{ input: '919876543210', wa_id: '919876543210' }],
          messages: [{ id: 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSR' }],
        }),
      });

      const result = await sendPrescriptionPDF(
        '9876543210',
        'John Doe',
        'City Clinic',
        'https://app.rxnxt.in/p/123/view',
        undefined,
        'clinic_1',
        'Take Paracetamol 650mg twice daily'
      );

      expect(result.success).toBe(true);
      expect(result.provider).toBe('meta');
      expect(result.messageId).toBe('wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSR');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v19.0/phone_102938/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test_meta_token_xyz',
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"to":"919876543210"'),
        })
      );
    });

    it('retries on HTTP 429 rate limit and succeeds on second attempt', async () => {
      // 1st attempt: 429 Too Many Requests
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded', code: 80007 } }),
      });
      // 2nd attempt (template retry): 200 OK
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messages: [{ id: 'wamid.retry_success_123' }],
        }),
      });
      // 3rd attempt (optional text summary): 200 OK
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messages: [{ id: 'wamid.text_summary_123' }],
        }),
      });

      const result = await sendMedicineReminder(
        '9876543210',
        'John Doe',
        'Paracetamol 650mg - After Food',
        'Dr. Shanmukha',
        'City Clinic',
        'clinic_1',
        'MORNING'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('retries on HTTP 500 server error and succeeds', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal server error' } }),
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messages: [{ id: 'wamid.server_retry_success' }],
        }),
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messages: [{ id: 'wamid.server_text_success' }],
        }),
      });

      const result = await sendFollowUpReminder(
        '9876543210',
        'John Doe',
        'City Clinic',
        'Dr. Shanmukha',
        'clinic_1'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('formats Day of Week, full date with year in slotLabel parameter {{3}}', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          messages: [{ id: 'wamid.day_progress_test_123' }],
        }),
      });

      const testDate = new Date('2026-11-24T02:30:00.000Z'); // Tuesday, 24 Nov 2026

      const result = await sendMedicineReminder(
        '9876543210',
        'Hanumad',
        'Azithral 500mg, Pan 40mg',
        'Dr. Shanmukha',
        'RxNXT Health Clinic (D3)',
        'clinic_d3',
        'DAILY',
        {
          currentDay: 2,
          totalDays: 3,
          date: testDate,
        }
      );

      expect(result.success).toBe(true);

      const call = (global.fetch as jest.Mock).mock.calls[0];
      const payload = JSON.parse(call[1].body);
      const params = payload.template.components[0].parameters;

      expect(params[0].text).toBe('Hanumad');
      expect(params[1].text).toBe('RxNXT Health Clinic (D3)');
      expect(params[2].text).toBe("Tue, 24 Nov 2026 • Today's Schedule");
      expect(params[3].text).toBe('Azithral 500mg, Pan 40mg');
    });

    it('throws error when retries are exhausted on permanent 400 Bad Request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Invalid recipient phone number' } }),
      });

      await expect(
        sendRefillReminder('9876543210', 'John Doe', 'Dr. Shanmukha', 'City Clinic', 'clinic_1')
      ).rejects.toThrow('[Meta WhatsApp API Error] Invalid recipient phone number');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mock Mode (when credentials not configured)', () => {
    beforeEach(() => {
      delete process.env.META_WA_ACCESS_TOKEN;
      delete process.env.META_WA_PHONE_NUMBER_ID;
    });

    it('falls back to mock without failing when credentials are missing', async () => {
      const result = await sendMedicineReminder(
        '9876543210',
        'John Doe',
        'Pantoprazole 40mg - Before Food',
        'Dr. Shanmukha',
        'City Clinic',
        'clinic_1',
        'NIGHT'
      );

      expect(result.success).toBe(true);
      expect(result.provider).toBe('meta_mock');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
