// lib/labReportPdfGenerator.ts
// Standardized client/server PDF generation for Clinical Laboratory Reports

import { jsPDF } from 'jspdf';
import { LabParameterResult } from './labTemplates';

// Ensure TextEncoder is available across both Node (Jest/JSDOM) and browser environments
if (typeof globalThis.TextEncoder === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TextEncoder: UtilTextEncoder, TextDecoder: UtilTextDecoder } = require('util');
    (globalThis as any).TextEncoder = UtilTextEncoder;
    (globalThis as any).TextDecoder = UtilTextDecoder;
  } catch {
    // Browser fallback
  }
}

export interface LabReportPDFData {
  orderNumber: string;
  orderDate?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  patient: {
    name: string;
    age?: number | string | null;
    gender?: string | null;
    phone?: string | null;
  };
  doctorName?: string;
  technicianName?: string;
  testName: string;
  category?: string;
  results: LabParameterResult[];
  impression?: string;
}

export function generateLabReportPDF(data: LabReportPDFData, returnBase64: boolean = false): string | void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Clinic Header
  doc.setFillColor(37, 99, 235); // Royal Blue #2563eb
  doc.rect(margin, 12, contentWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(data.clinicName || 'RxNXT Clinical Diagnostic Center', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const clinicContact = [data.clinicAddress, data.clinicPhone ? `Tel: ${data.clinicPhone}` : ''].filter(Boolean).join(' | ');
  doc.text(clinicContact || 'Digital Health Diagnostic Laboratory', margin, 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('LABORATORY INVESTIGATION REPORT', pageWidth - margin, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const dateStr = data.orderDate ? new Date(data.orderDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Reported: ${dateStr}`, pageWidth - margin, 25, { align: 'right' });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, 28, pageWidth - margin, 28);

  // 2. Patient & Order Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, 31, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 31, contentWidth, 22, 2, 2, 'S');

  // Left Column: Patient Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Patient: ${data.patient.name}`, margin + 4, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const ageGender = [
    data.patient.age ? `${data.patient.age} Yrs` : null,
    data.patient.gender ? data.patient.gender.toUpperCase() : null,
  ].filter(Boolean).join(' / ') || 'Age/Gender not specified';
  doc.text(`Age / Sex: ${ageGender}`, margin + 4, 43);
  doc.text(`Phone: ${data.patient.phone || 'N/A'}`, margin + 4, 49);

  // Right Column: Order & Doctor
  const colRightX = margin + contentWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Order ID: ${data.orderNumber}`, colRightX, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ref. Doctor: ${data.doctorName || 'Self / OPD Walk-in'}`, colRightX, 43);
  doc.text(`Sample Category: ${data.category || 'Clinical Specimen'}`, colRightX, 49);

  // 3. Test Heading
  let currentY = 60;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(data.testName.toUpperCase(), margin + 4, currentY + 5.5);

  currentY += 12;

  // 4. Results Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const colTestX = margin + 4;
  const colValueX = margin + 80;
  const colUnitX = margin + 115;
  const colRangeX = margin + 140;

  doc.text('TEST PARAMETER', colTestX, currentY + 4.8);
  doc.text('OBSERVED VALUE', colValueX, currentY + 4.8);
  doc.text('UNIT', colUnitX, currentY + 4.8);
  doc.text('REFERENCE INTERVAL', colRangeX, currentY + 4.8);

  currentY += 10;

  // 5. Parameter Rows
  data.results.forEach((res, index) => {
    // Check page overflow
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 20;
    }

    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY - 3.5, contentWidth, 7, 'F');
    }

    doc.setFont('helvetica', res.isAbnormal ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(res.isAbnormal ? 185 : 15, res.isAbnormal ? 28 : 23, res.isAbnormal ? 28 : 42); // Red if abnormal

    doc.text(res.name, colTestX, currentY + 1.5);

    // Value with Flag badge
    const valText = res.value || '-';
    doc.text(valText, colValueX, currentY + 1.5);

    if (res.isAbnormal && res.flag && res.flag !== 'NORMAL') {
      doc.setFontSize(7);
      doc.setTextColor(220, 38, 38);
      doc.text(`[${res.flag}]`, colValueX + doc.getTextWidth(valText) + 3, currentY + 1.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(res.unit || '-', colUnitX, currentY + 1.5);
    doc.text(res.referenceRange || '-', colRangeX, currentY + 1.5);

    currentY += 7.5;
  });

  // 6. Impression Box
  if (data.impression && data.impression.trim()) {
    currentY += 4;
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 16, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('IMPRESSION / CLINICAL INTERPRETATION:', margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitImp = doc.splitTextToSize(data.impression.trim(), contentWidth - 8);
    doc.text(splitImp, margin + 4, currentY + 10.5);

    currentY += 20;
  }

  // 7. Signature & Footer (Anchored to bottom)
  const footerY = pageHeight - 22;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Verified Clinical Laboratory Report | RxNXT Diagnostic Module | Valid without physical signature', margin, footerY + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const techLabel = data.technicianName ? `Verified by: ${data.technicianName} (Medical Lab Technologist)` : 'Medical Lab Technologist / Authorized Signatory';
  doc.text(techLabel, pageWidth - margin, footerY + 2, { align: 'right' });

  if (returnBase64) {
    return doc.output('datauristring');
  }

  const safeFilename = `${data.patient.name.replace(/[^a-zA-Z0-9]/g, '_')}_LabReport_${data.orderNumber}.pdf`;
  doc.save(safeFilename);
}
