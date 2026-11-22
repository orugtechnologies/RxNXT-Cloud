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

  it('correctly resolves clinical instructions and non-standard frequencies (bedtime, lunch, 1-1-0, 0-1-1, 2-0-2)', () => {
    const result = formatPrescriptionSchedule({
      patientName: 'Anita',
      clinicName: 'RxNXT Health',
      medicines: [
        {
          customName: 'Cetirizine',
          strength: '10mg',
          frequency: 'OD',
          instructions: 'At Bedtime',
        },
        {
          customName: 'Calcium',
          strength: '500mg',
          frequency: 'OD',
          instructions: 'After Lunch',
        },
        {
          customName: 'Prednisolone',
          strength: '10mg',
          frequency: '1-1-0',
          instructions: 'After Food',
        },
        {
          customName: 'Metformin',
          strength: '500mg',
          frequency: '0-1-1',
          instructions: 'After Food',
        },
        {
          customName: 'Voveran',
          strength: '50mg',
          frequency: '2-0-2',
          instructions: 'After Food',
        },
        {
          customName: 'Vitamin D3',
          strength: '60000 IU',
          frequency: 'Once a week',
          instructions: 'After Breakfast',
        },
      ],
    });

    // Extract slot sections
    const morningSection = result.templateSummary.split('☀️ Afternoon:')[0] || '';
    const afternoonSection = (result.templateSummary.split('☀️ Afternoon:')[1] || '').split('🌙 Night:')[0] || '';
    const nightSection = result.templateSummary.split('🌙 Night:')[1] || '';

    // Cetirizine (OD + At Bedtime) must be in Night ONLY, never in Morning
    expect(nightSection).toContain('Cetirizine 10mg (At Bedtime)');
    expect(morningSection).not.toContain('Cetirizine');

    // Calcium (OD + After Lunch) must be in Afternoon ONLY, never in Morning
    expect(afternoonSection).toContain('Calcium 500mg (After Lunch)');
    expect(morningSection).not.toContain('Calcium');

    // Prednisolone (1-1-0) must be in Morning AND Afternoon, never in Night
    expect(morningSection).toContain('Prednisolone 10mg (After Food)');
    expect(afternoonSection).toContain('Prednisolone 10mg (After Food)');
    expect(nightSection).not.toContain('Prednisolone');

    // Metformin (0-1-1) must be in Afternoon AND Night, never in Morning
    expect(afternoonSection).toContain('Metformin 500mg (After Food)');
    expect(nightSection).toContain('Metformin 500mg (After Food)');
    expect(morningSection).not.toContain('Metformin');

    // Voveran (2-0-2) must be in Morning AND Night
    expect(morningSection).toContain('Voveran 50mg (After Food)');
    expect(nightSection).toContain('Voveran 50mg (After Food)');

    // Vitamin D3 (Once a week) must NOT be in Morning daily briefing
    expect(morningSection).not.toContain('Vitamin D3');
  });
});
