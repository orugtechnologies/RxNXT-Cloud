'use client';

import { Patient } from '../patients/PatientSearchUI';
import { PrescribedMedicine } from './PrescriptionCart';
import { buildPrescriptionDoc, formatScheduleDescription } from '@/lib/prescriptionPdfGenerator';

export interface PrintViewProps {
  patient: Patient;
  medicines: PrescribedMedicine[];
  chiefComplaint?: string;
  diagnosis?: string;
  notes?: string;
  followUpDate?: string;
  doctorName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  doctorRegNo?: string;
  doctorSpecialization?: string;
  verificationStatus?: string;
  medicalCouncil?: string;
}

export { formatScheduleDescription };

export const generatePrescriptionPDF = (data: PrintViewProps, asBase64 = false): string | void => {
  const doc = buildPrescriptionDoc(data as any);

  // Return base64 string or trigger browser download
  if (asBase64) {
    return doc.output('datauristring').split(',')[1];
  } else {
    const filename = `Prescription_${(data.patient.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }
};

export default function PrescriptionPrintView() {
  return null;
}
