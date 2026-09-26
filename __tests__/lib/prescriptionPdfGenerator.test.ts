import {
  buildPrescriptionDoc,
  generatePrescriptionBuffer,
  generatePrescriptionBase64,
  formatScheduleDescription,
} from '@/lib/prescriptionPdfGenerator';

describe('prescriptionPdfGenerator', () => {
  it('correctly formats schedule descriptions', () => {
    expect(formatScheduleDescription('1-0-1')).toBe('1-0-1 (1 Morn + 1 Night)');
    expect(formatScheduleDescription('1-1-1')).toBe('1-1-1 (1 Morn + 1 Aft + 1 Night)');
    expect(formatScheduleDescription('OD')).toBe('OD (Once Daily)');
    expect(formatScheduleDescription('BD')).toBe('BD (Twice Daily)');
  });

  it('successfully generates PDF buffer with unified Rx ID without runtime errors', () => {
    const mockData = {
      rxId: 'RX-260926-002',
      patient: {
        id: 'patient-123',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        age: 35,
        gender: 'Male',
        address: 'Hyderabad, Telangana',
      },
      medicines: [
        {
          name: 'Paracetamol',
          dosage_form: 'Tablet',
          strength: '650mg',
          frequency: '1-0-1',
          duration: '5 days',
          instructions: 'After Food',
        },
        {
          name: 'Amoxicillin',
          dosage_form: 'Capsule',
          strength: '500mg',
          frequency: '1-1-1',
          duration: '7 days',
          instructions: 'After Food',
        },
      ],
      chiefComplaint: 'Fever and body ache for 3 days',
      diagnosis: 'Acute Viral Pharyngitis',
      notes: 'Drink plenty of warm fluids and rest well.',
      followUpDate: '2026-10-03',
      doctorName: 'Shanmukha Datta',
      clinicName: 'RxNXT Health Clinic',
      clinicAddress: 'Banjara Hills, Hyderabad',
      clinicPhone: '+91 9966773614',
      doctorRegNo: 'TSMC-88291',
      doctorSpecialization: 'General Physician',
      verificationStatus: 'VERIFIED',
      medicalCouncil: 'Telangana State Medical Council',
    };

    const doc = buildPrescriptionDoc(mockData);
    expect(doc).toBeDefined();

    const buffer = generatePrescriptionBuffer(mockData);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);

    const base64 = generatePrescriptionBase64(mockData);
    expect(base64).toBeDefined();
    expect(typeof base64).toBe('string');
  });
});
