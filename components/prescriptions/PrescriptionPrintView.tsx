'use client';

import jsPDF from 'jspdf';
import { Patient } from '../patients/PatientSearchUI';
import { PrescribedMedicine } from './PrescriptionCart';

interface PrintViewProps {
  patient: Patient;
  medicines: PrescribedMedicine[];
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  followUpDate: string;
  doctorName?: string;
  clinicName?: string;
}

export const generatePrescriptionPDF = (data: PrintViewProps, asBase64 = false): string | void => {
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header: Clinic & Doctor
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.text(data.clinicName || 'RxNXT Clinic', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Dr. ${data.doctorName || 'Doctor'}`, pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  
  y += 10;
  // Patient Details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Patient Name: ${data.patient.name}`, 20, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, y, { align: 'right' });
  
  y += 7;
  doc.text(`Age/Sex: ${data.patient.age} / ${data.patient.gender}`, 20, y);
  doc.text(`Phone: ${data.patient.phone}`, pageWidth - 20, y, { align: 'right' });

  y += 10;
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Clinical Details
  if (data.chiefComplaint) {
    doc.setFont("helvetica", "bold");
    doc.text("Chief Complaint:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.chiefComplaint, 60, y);
    y += 7;
  }
  if (data.diagnosis) {
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.diagnosis, 60, y);
    y += 7;
  }
  
  y += 5;
  
  // Rx Symbol
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rx", 20, y);
  y += 10;

  // Medicines
  doc.setFontSize(11);
  data.medicines.forEach((med, index) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${med.name}`, 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    const details = `   ${med.dosage_form || 'Form'} | ${med.strength || 'Str'} | ${med.route || 'Route'} | Freq: ${med.frequency} | Dur: ${med.duration}`;
    doc.text(details, 20, y);
    y += 6;
    if (med.instructions) {
      doc.setTextColor(100, 100, 100);
      doc.text(`   Instructions: ${med.instructions}`, 20, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }
    y += 4;
  });

  // Notes & Follow up
  if (data.notes) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 20, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(doc.splitTextToSize(data.notes, pageWidth - 40), 20, y);
    y += 15;
  }

  if (data.followUpDate) {
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Follow up on: ${data.followUpDate}`, 20, y);
  }

  // Footer Signature
  doc.setFont("helvetica", "normal");
  doc.text("Doctor's Signature", pageWidth - 20, 270, { align: 'right' });
  doc.line(pageWidth - 60, 265, pageWidth - 20, 265);

  if (asBase64) {
    return doc.output('datauristring').split(',')[1];
  } else {
    doc.save(`Prescription_${data.patient.name.replace(/\s+/g, '_')}.pdf`);
  }
};

export default function PrescriptionPrintView() {
  return null; // pure function export wrapper
}
