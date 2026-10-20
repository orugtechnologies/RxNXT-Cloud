import { formatPrescriptionSchedule } from '@/lib/prescriptionScheduleFormatter';

describe('formatPrescriptionSchedule', () => {
  it('correctly organizes medicines into morning, afternoon, and night slots with instructions', () => {
    const result = formatPrescriptionSchedule({
      patientName: 'Swamiji',
      clinicName: 'RxNXT Health Clinic',
      diagnosis: 'Hypertension',
      doctorNotes: 'No oily food',
      followUpDate: '2026-10-27',
      pdfDirectUrl: 'https://app.rxnxt.in/api/prescriptions/RX-001/pdf',
      medicines: [
        {
          customName: 'Telmisartan',
          strength: '40mg',
          frequency: '1-0-0',
          duration: '14 days',
          instructions: 'After Food',
        },
        {
          customName: 'Ivabradin',
          strength: '5mg',
          frequency: '1-0-1',
          duration: '14 days',
          instructions: 'After Food',
        },
        {
          customName: 'Rosuvastatin',
          strength: '10mg',
          frequency: '1-0-1',
          duration: '14 days',
          instructions: 'After Food',
        },
      ],
    });

    // Check Meta template parameter format (single line, no newlines)
    expect(result.templateSummary).not.toContain('\n');
    expect(result.templateSummary).toContain('🌅 Morning: Telmisartan 40mg (After Food), Ivabradin 5mg (After Food), Rosuvastatin 10mg (After Food)');
    expect(result.templateSummary).toContain('🌙 Night: Ivabradin 5mg (After Food), Rosuvastatin 10mg (After Food)');
    expect(result.templateSummary).toContain('⏳ Duration: 14 days');

    // Check full rich text layout
    expect(result.richSchedule).toContain('🌅 *MORNING (After Breakfast):*');
    expect(result.richSchedule).toContain('🌙 *NIGHT (After Dinner):*');
    expect(result.richSchedule).toContain('📝 *Doctor Note:* No oily food');
    expect(result.fullMessageBody).toContain('Hello Swamiji');
    expect(result.fullMessageBody).toContain('https://app.rxnxt.in/api/prescriptions/RX-001/pdf');
  });

  it('handles edge case with no specific slot detected gracefully', () => {
    const result = formatPrescriptionSchedule({
      patientName: 'John Doe',
      clinicName: 'City Clinic',
      medicines: [
        {
          customName: 'Ointment',
          strength: '10g',
          frequency: 'SOS',
          duration: '3 days',
          instructions: 'Apply on skin',
        },
      ],
    });

    expect(result.templateSummary).toContain('💊 Daily: Ointment 10g (Apply on skin)');
    expect(result.templateSummary).not.toContain('\n');
  });
});
