'use client';

import jsPDF from 'jspdf';
import { Patient } from '../patients/PatientSearchUI';
import { PrescribedMedicine } from './PrescriptionCart';

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

/**
 * Translates dosage frequencies into patient-friendly schedule descriptions
 */
function formatScheduleDescription(freq: string): string {
  if (!freq) return '-';
  const clean = freq.trim();
  
  // Standard 3-slot pattern (e.g. 1-0-1, 1-0-0, 0-0-1, 1-1-1)
  if (/^[0-9]+-[0-9]+-[0-9]+$/.test(clean)) {
    const [m, a, n] = clean.split('-');
    const slots: string[] = [];
    if (m !== '0') slots.push(`${m} Morn`);
    if (a !== '0') slots.push(`${a} Aft`);
    if (n !== '0') slots.push(`${n} Night`);
    return slots.length > 0 ? `${clean} (${slots.join(' + ')})` : clean;
  }
  
  // 4-slot pattern (e.g. 1-1-1-1)
  if (/^[0-9]+-[0-9]+-[0-9]+-[0-9]+$/.test(clean)) {
    return `${clean} (4 times/day)`;
  }

  // Common medical frequency abbreviations
  const upper = clean.toUpperCase();
  if (upper === 'OD' || upper === '1-0-0' || upper === '0-0-1') return `${clean} (Once Daily)`;
  if (upper === 'BD' || upper === 'BID') return `${clean} (Twice Daily)`;
  if (upper === 'TDS' || upper === 'TID') return `${clean} (Thrice Daily)`;
  if (upper === 'QID') return `${clean} (4 times Daily)`;
  if (upper === 'HS') return `${clean} (At Bedtime)`;
  if (upper === 'SOS' || upper === 'PRN') return `${clean} (As Needed / Emergency)`;
  if (upper === 'STAT') return `${clean} (Immediately)`;

  return clean;
}

export const generatePrescriptionPDF = (data: PrintViewProps, asBase64 = false): string | void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  const bottomThreshold = pageHeight - 35; // Leave room for footer

  let y = margin;

  // Helper for adding new page with header continuation
  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > bottomThreshold) {
      drawFooter();
      doc.addPage();
      y = margin;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, y, contentWidth, 1.5, 'F');
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Prescription for ${data.patient.name} (Contd.)`, margin, y);
    doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - margin, y, { align: 'right' });
    y += 6;
  };

  const drawFooter = () => {
    const footerY = pageHeight - 20;

    // Doctor signature line on right
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.setLineWidth(0.4);
    doc.line(pageWidth - margin - 55, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Dr. ${data.doctorName || 'Doctor'}`, pageWidth - margin - 27.5, footerY - 1, { align: 'center' });
    
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(data.doctorRegNo ? `Reg. No: ${data.doctorRegNo}` : 'Authorized Medical Signatory', pageWidth - margin - 27.5, footerY + 3, { align: 'center' });

    // Legal / System watermark footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Digitally generated via RxNXT™ Healthcare Cloud • Valid under Information Technology Act, 2000.',
      margin,
      pageHeight - 10
    );
    const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
    doc.text(
      `Page ${(doc.internal as any).getCurrentPageInfo ? (doc.internal as any).getCurrentPageInfo().pageNumber : 1}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  };

  // --- 1. TOP ACCENT BAR ---
  doc.setFillColor(15, 118, 110); // Healthcare Teal / Emerald (0F766E)
  doc.rect(0, 0, pageWidth, 4, 'F');

  y = 12;

  // --- 2. CLINIC & DOCTOR HEADER ---
  // Left: Clinic Branding
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(data.clinicName || 'RxNXT™ Health Clinic', margin, y + 4);

  // Right: Doctor Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110); // Teal
  doc.text(`Dr. ${data.doctorName || 'Attending Physician'}`, pageWidth - margin, y + 2, { align: 'right' });

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate-600
  if (data.clinicAddress) {
    doc.text(data.clinicAddress, margin, y + 2);
  }
  
  if (data.doctorSpecialization || data.doctorRegNo) {
    const specText = [data.doctorSpecialization, data.doctorRegNo ? `Reg: ${data.doctorRegNo}` : ''].filter(Boolean).join(' • ');
    doc.text(specText, pageWidth - margin, y + 2, { align: 'right' });
  }

  // Verified Badge underneath Doctor Specialization
  if (data.verificationStatus === 'VERIFIED') {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Emerald-800
    doc.text(`[✓ Verified by ${data.medicalCouncil || 'Medical Council'}]`, pageWidth - margin, y + 6, { align: 'right' });
  }

  y += 4;
  if (data.clinicPhone) {
    doc.text(`Ph: ${data.clinicPhone}`, margin, y + 2);
  }

  y += 6;
  // Header divider
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // --- 3. PATIENT & VISIT METADATA CARD ---
  const cardHeight = (data.chiefComplaint || data.diagnosis) ? 24 : 16;
  
  // Background box with rounded corners
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

  const cardPadding = 3.5;
  const pY = y + cardPadding + 3;

  // Row 1: Patient Name, Age/Sex, Phone, Date
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PATIENT:', margin + cardPadding, pY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.patient.name, margin + cardPadding + 16, pY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AGE / SEX:', margin + 78, pY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.patient.age || '—'} Y / ${data.patient.gender || '—'}`, margin + 95, pY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DATE:', pageWidth - margin - 45, pY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - margin - cardPadding, pY, { align: 'right' });

  // Row 2 (if present): Chief Complaint & Diagnosis
  if (data.chiefComplaint || data.diagnosis) {
    const diagY = pY + 7;
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + cardPadding, diagY - 2.5, pageWidth - margin - cardPadding, diagY - 2.5);

    if (data.chiefComplaint) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Complaint:', margin + cardPadding, diagY + 1.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const complaintText = doc.splitTextToSize(data.chiefComplaint, 60)[0];
      doc.text(complaintText, margin + cardPadding + 18, diagY + 1.5);
    }

    if (data.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Diagnosis:', margin + 95, diagY + 1.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110);
      const diagText = doc.splitTextToSize(data.diagnosis, 70)[0];
      doc.text(diagText, margin + 112, diagY + 1.5);
    }
  }

  y += cardHeight + 6;

  // --- 4. RX SYMBOL & SECTION HEADING ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110); // Teal Rx symbol
  doc.text('Rx', margin, y + 2);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Medication Schedule & Dosage Plan', margin + 9, y + 1.5);

  y += 5.5;

  // --- 5. ELEGANT SCHEDULED MEDICINES TABLE ---
  // Column definitions totaling 180mm width
  const col = {
    sno: { x: margin, w: 9 },                              // 9mm
    medicine: { x: margin + 9, w: 61 },                    // 61mm
    schedule: { x: margin + 70, w: 46 },                   // 46mm
    duration: { x: margin + 116, w: 22 },                  // 22mm
    instructions: { x: margin + 138, w: 42 },              // 42mm
  };

  // Table Header Row
  const headerHeight = 7.5;
  doc.setFillColor(30, 41, 59); // Slate-800 dark navy header
  doc.rect(margin, y, contentWidth, headerHeight, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  const headerY = y + 5;
  doc.text('#', col.sno.x + col.sno.w / 2, headerY, { align: 'center' });
  doc.text('Medicine & Form', col.medicine.x + 2, headerY);
  doc.text('Schedule (M - A - N)', col.schedule.x + 2, headerY);
  doc.text('Duration', col.duration.x + 2, headerY);
  doc.text('Instructions / Food', col.instructions.x + 2, headerY);

  y += headerHeight;

  // Table Data Rows
  data.medicines.forEach((med, index) => {
    const isEven = index % 2 === 0;

    // Build text strings
    const medTitle = med.name;
    const formStrength = [
      med.dosage_form || '',
      med.strength ? `(${med.strength})` : '',
      med.route ? `[${med.route}]` : ''
    ].filter(Boolean).join(' ');

    const scheduleDesc = formatScheduleDescription(med.frequency);
    const durationText = med.duration || '-';
    const instructionsText = med.instructions || '-';

    // Calculate height needed for this row
    doc.setFontSize(8.5);
    const medTitleLines = doc.splitTextToSize(medTitle, col.medicine.w - 4);
    const formLines = formStrength ? doc.splitTextToSize(formStrength, col.medicine.w - 4) : [];
    
    doc.setFontSize(8);
    const schedLines = doc.splitTextToSize(scheduleDesc, col.schedule.w - 4);
    const durLines = doc.splitTextToSize(durationText, col.duration.w - 4);
    const instLines = doc.splitTextToSize(instructionsText, col.instructions.w - 4);

    const totalLinesMedicine = medTitleLines.length + (formLines.length ? 1 : 0);
    const maxLines = Math.max(totalLinesMedicine, schedLines.length, durLines.length, instLines.length, 1);
    
    const rowHeight = Math.max(10, maxLines * 4.2 + 4.5);

    // Page overflow check
    checkNewPage(rowHeight);

    // Zebra row background
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252); // Subtle slate-50
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Row bottom border
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // S.No
    const rowTextY = y + 4.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), col.sno.x + col.sno.w / 2, rowTextY, { align: 'center' });

    // Col 2: Medicine Name & Form
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // Dark slate
    doc.text(medTitleLines, col.medicine.x + 2, rowTextY);

    if (formStrength) {
      const formY = rowTextY + (medTitleLines.length * 3.8);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(formStrength, col.medicine.x + 2, formY);
    }

    // Col 3: Schedule
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110); // Emerald/Teal schedule accent
    doc.text(schedLines[0] || '-', col.schedule.x + 2, rowTextY);
    
    if (schedLines.length > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(schedLines.slice(1), col.schedule.x + 2, rowTextY + 3.8);
    }

    // Col 4: Duration
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(durLines, col.duration.x + 2, rowTextY);

    // Col 5: Instructions
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(instLines, col.instructions.x + 2, rowTextY);

    y += rowHeight;
  });

  y += 6;

  // --- 6. ADVICE & DOCTOR NOTES BOX (IF PRESENT) ---
  if (data.notes && data.notes.trim()) {
    const notesText = data.notes.trim();
    doc.setFontSize(8.5);
    const wrappedNotes = doc.splitTextToSize(notesText, contentWidth - 10);
    const boxHeight = Math.max(14, wrappedNotes.length * 4 + 9);

    checkNewPage(boxHeight + 5);

    // Amber-50 / Slate-50 background for Doctor's Advice
    doc.setFillColor(254, 252, 232); // Amber-50
    doc.setDrawColor(254, 240, 138); // Amber-200
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // Amber-800
    doc.text('Doctor\'s Advice & Special Instructions:', margin + 4, y + 4.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedNotes, margin + 4, y + 9);

    y += boxHeight + 5;
  }

  // --- 7. FOLLOW-UP DATE BOX (IF PRESENT) ---
  if (data.followUpDate) {
    checkNewPage(12);

    let formattedDate = data.followUpDate;
    try {
      formattedDate = new Date(data.followUpDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      // keep raw string
    }

    doc.setFillColor(240, 253, 244); // Emerald-50
    doc.setDrawColor(187, 247, 208); // Emerald-200
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52); // Emerald-800
    doc.text(`Next Follow-up Visit: ${formattedDate}`, margin + 4, y + 6);

    y += 14;
  }

  // --- 8. FOOTER & SIGNATURE ---
  drawFooter();

  // Return base64 string or trigger browser download
  if (asBase64) {
    return doc.output('datauristring').split(',')[1];
  } else {
    const filename = `Prescription_${(data.patient.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  }
};

export default function PrescriptionPrintView() {
  return null; // pure function export wrapper
}
