import { jsPDF } from 'jspdf';

export interface PrescriptionMedicineItem {
  id?: string;
  name: string;
  dosage_form?: string;
  strength?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface PrescriptionPDFData {
  patient: {
    id?: string;
    name: string;
    phone?: string | null;
    age?: number | string | null;
    gender?: string | null;
    address?: string | null;
  };
  medicines: PrescriptionMedicineItem[];
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
export function formatScheduleDescription(freq?: string): string {
  if (!freq) return '-';
  const clean = freq.trim();
  
  if (/^[0-9]+-[0-9]+-[0-9]+$/.test(clean)) {
    const [m, a, n] = clean.split('-');
    const slots: string[] = [];
    if (m !== '0') slots.push(`${m} Morn`);
    if (a !== '0') slots.push(`${a} Aft`);
    if (n !== '0') slots.push(`${n} Night`);
    return slots.length > 0 ? `${clean} (${slots.join(' + ')})` : clean;
  }
  
  if (/^[0-9]+-[0-9]+-[0-9]+-[0-9]+$/.test(clean)) {
    return `${clean} (4 times/day)`;
  }

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

/**
 * Creates and formats a jsPDF document strictly adhering to NMC Gazette 2023 Guidelines.
 */
export function buildPrescriptionDoc(data: PrescriptionPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  const bottomThreshold = pageHeight - 35; // Space for footer

  let y = margin;

  const drawSubHeader = () => {
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, y, contentWidth, 1.5, 'F');
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Prescription for ${data.patient.name || 'Patient'} (Contd.)`, margin, y);
    doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - margin, y, { align: 'right' });
    y += 6;
  };

  const drawFooter = () => {
    const footerY = pageHeight - 20;

    // Doctor signature line
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

    // Legal / System watermark footer (NMC Gazette 2023 P. 108 Sec 3.7.9 compliant)
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Digitally generated via RxNXT™ • Valid under NMC Regulations 2023 & IT Act, 2000 • e-Prescription valid for 2 weeks from issue or once dispensed.',
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

  const checkNewPage = (neededHeight: number) => {
    if (y + neededHeight > bottomThreshold) {
      drawFooter();
      doc.addPage();
      y = margin;
      drawSubHeader();
    }
  };

  // 1. Accent header bar
  doc.setFillColor(15, 118, 110); // Emerald/Teal
  doc.rect(0, 0, pageWidth, 4, 'F');

  y = 12;

  // 2. Clinic branding & Doctor info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(data.clinicName || 'RxNXT™ Health Clinic', margin, y + 4);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(`Dr. ${data.doctorName || 'Attending Physician'}`, pageWidth - margin, y + 2, { align: 'right' });

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (data.clinicAddress) {
    doc.text(data.clinicAddress, margin, y + 2);
  }
  
  if (data.doctorSpecialization || data.doctorRegNo) {
    const specText = [data.doctorSpecialization, data.doctorRegNo ? `Reg: ${data.doctorRegNo}` : ''].filter(Boolean).join(' • ');
    doc.text(specText, pageWidth - margin, y + 2, { align: 'right' });
  }

  if (data.verificationStatus === 'VERIFIED') {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text(`[✓ Verified by ${data.medicalCouncil || 'Medical Council'}]`, pageWidth - margin, y + 6, { align: 'right' });
  }

  y += 4;
  if (data.clinicPhone) {
    doc.text(`Ph: ${data.clinicPhone}`, margin, y + 2);
  }

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 5;

  // 3. Patient Info Card
  const cardHeight = (data.chiefComplaint || data.diagnosis) ? 24 : 16;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');

  const cardPadding = 3.5;
  const pY = y + cardPadding + 3;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PATIENT:', margin + cardPadding, pY);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.patient?.name || 'Patient', margin + cardPadding + 16, pY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AGE / SEX:', margin + 78, pY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.patient?.age || '—'} Y / ${data.patient?.gender || '—'}`, margin + 95, pY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('DATE:', pageWidth - margin - 45, pY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), pageWidth - margin - cardPadding, pY, { align: 'right' });

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

  // 4. Rx Symbol & Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('Rx', margin, y + 2);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Medication Schedule & Dosage Plan', margin + 9, y + 1.5);

  y += 5.5;

  // 5. Medicines Table
  const col = {
    sno: { x: margin, w: 9 },
    medicine: { x: margin + 9, w: 61 },
    schedule: { x: margin + 70, w: 46 },
    duration: { x: margin + 116, w: 22 },
    instructions: { x: margin + 138, w: 42 },
  };

  const headerHeight = 7.5;
  doc.setFillColor(30, 41, 59);
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

  (data.medicines || []).forEach((med, index) => {
    const isEven = index % 2 === 0;
    // NMC Guideline-1 P.76 & P.108: Generic / Medicine name in CAPITAL letters
    const medTitle = (med.name || '').toUpperCase();
    const formStrength = [
      med.dosage_form || '',
      med.strength ? `(${med.strength})` : '',
      med.route && med.route !== 'Oral' ? `[${med.route}]` : '',
    ].filter(Boolean).join(' ');

    const scheduleDesc = formatScheduleDescription(med.frequency);

    doc.setFontSize(8.5);
    const medTitleLines = doc.splitTextToSize(medTitle, col.medicine.w - 4);
    
    doc.setFontSize(8);
    const schedLines = doc.splitTextToSize(scheduleDesc, col.schedule.w - 4);
    const durLines = doc.splitTextToSize(med.duration || '-', col.duration.w - 4);
    const instLines = doc.splitTextToSize(med.instructions || '-', col.instructions.w - 4);

    const textLineCount = Math.max(
      medTitleLines.length + (formStrength ? 1 : 0),
      schedLines.length,
      durLines.length,
      instLines.length
    );
    const rowHeight = Math.max(8.5, textLineCount * 4.2 + 3);

    checkNewPage(rowHeight);

    // Row background
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Subtle bottom border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    const rowTextY = y + 4.5;

    // #
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}`, col.sno.x + col.sno.w / 2, rowTextY, { align: 'center' });

    // Medicine Name
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(medTitleLines, col.medicine.x + 2, rowTextY);

    if (formStrength) {
      const formY = rowTextY + (medTitleLines.length * 3.8);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(formStrength, col.medicine.x + 2, formY);
    }

    // Schedule
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(schedLines[0] || '-', col.schedule.x + 2, rowTextY);
    
    if (schedLines.length > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(schedLines.slice(1), col.schedule.x + 2, rowTextY + 3.8);
    }

    // Duration
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(durLines, col.duration.x + 2, rowTextY);

    // Instructions
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(instLines, col.instructions.x + 2, rowTextY);

    y += rowHeight;
  });

  y += 6;

  // 6. Advice & Notes
  if (data.notes && data.notes.trim()) {
    const notesText = data.notes.trim();
    doc.setFontSize(8.5);
    const wrappedNotes = doc.splitTextToSize(notesText, contentWidth - 10);
    const boxHeight = Math.max(14, wrappedNotes.length * 4 + 9);

    checkNewPage(boxHeight + 5);

    doc.setFillColor(254, 252, 232); // Amber-50
    doc.setDrawColor(254, 240, 138); // Amber-200
    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text("Doctor's Advice & Special Instructions:", margin + 4, y + 4.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(wrappedNotes, margin + 4, y + 9);

    y += boxHeight + 5;
  }

  // 7. Follow-up Visit
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

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 101, 52);
    doc.text(`Next Follow-up Visit: ${formattedDate}`, margin + 4, y + 6);

    y += 14;
  }

  // 8. Footer
  drawFooter();

  return doc;
}

/**
 * Returns raw base64 string of the PDF (without data URI prefix).
 */
export function generatePrescriptionBase64(data: PrescriptionPDFData): string {
  const doc = buildPrescriptionDoc(data);
  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1];
}

/**
 * Returns a Node.js Buffer containing the PDF binary.
 */
export function generatePrescriptionBuffer(data: PrescriptionPDFData): Buffer {
  const doc = buildPrescriptionDoc(data);
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
