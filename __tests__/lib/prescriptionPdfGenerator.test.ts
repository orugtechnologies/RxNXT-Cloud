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

  it('successfully generates unified multi-page PDF dossier when lab reports are attached', () => {
    const mockDataWithLab = {
      rxId: 'RX-260926-003',
      patient: {
        name: 'Manoj Kumar',
        phone: '919052599538',
        age: 30,
        gender: 'Male',
      },
      medicines: [
        {
          name: 'Paracetamol',
          dosage_form: 'Tablet',
          strength: '650mg',
          frequency: '1-0-1',
          duration: '3 days',
        },
      ],
      doctorName: 'Dr. Shanmukha Datta',
      clinicName: 'RxNXT Diagnostics & Clinic',
      labReports: [
        {
          orderNumber: 'LAB-20261114-0002',
          orderDate: '2026-11-14T18:00:00Z',
          clinicName: 'RxNXT Diagnostics & Clinic',
          patient: {
            name: 'Manoj Kumar',
            age: 30,
            gender: 'Male',
            phone: '919052599538',
          },
          doctorName: 'Dr. Shanmukha Datta',
          technicianName: 'Suresh Lab Tech',
          testName: 'Complete Blood Count (CBC)',
          category: 'BLOOD',
          results: [
            { id: '1', name: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false, flag: 'NORMAL' },
            { id: '2', name: 'Total Leukocyte Count (TLC)', value: '12500', unit: '/mcL', referenceRange: '4000 - 11000', isAbnormal: true, flag: 'HIGH' },
          ],
          impression: 'Mild leukocytosis indicating reactive inflammation.',
        },
        {
          orderNumber: 'LAB-20261114-0002',
          orderDate: '2026-11-14T18:00:00Z',
          clinicName: 'RxNXT Diagnostics & Clinic',
          patient: {
            name: 'Manoj Kumar',
            age: 30,
            gender: 'Male',
            phone: '919052599538',
          },
          doctorName: 'Dr. Shanmukha Datta',
          technicianName: 'Suresh Lab Tech',
          testName: 'Random Blood Sugar (RBS)',
          category: 'BLOOD',
          results: [
            { id: '1', name: 'Random Blood Glucose', value: '110', unit: 'mg/dL', referenceRange: '70 - 140', isAbnormal: false, flag: 'NORMAL' },
          ],
          impression: 'Normoglycemic status.',
        },
      ],
    };

    const doc = buildPrescriptionDoc(mockDataWithLab as any);
    expect(doc).toBeDefined();
    // 1 page prescription + 2 lab report pages = at least 3 pages
    expect((doc.internal as any).getNumberOfPages()).toBeGreaterThanOrEqual(3);

    const buffer = generatePrescriptionBuffer(mockDataWithLab as any);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);

    const base64 = generatePrescriptionBase64(mockDataWithLab as any);
    expect(base64).toBeDefined();
    expect(typeof base64).toBe('string');
  });
});
