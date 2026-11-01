const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generateTechTiersPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm

  // Professional Color Palette
  const C = {
    navyDark: [10, 25, 47],
    navyLight: [15, 33, 64],
    primaryBlue: [37, 99, 235],
    blueBg: [239, 246, 255],
    emerald: [5, 150, 105],
    emeraldBg: [236, 253, 245],
    purple: [109, 40, 217],
    purpleBg: [245, 243, 255],
    amber: [217, 119, 6],
    amberBg: [254, 243, 199],
    rose: [225, 29, 72],
    roseBg: [255, 241, 242],
    slate900: [15, 23, 42],
    slate700: [51, 65, 85],
    slate500: [100, 116, 139],
    slate200: [226, 232, 240],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255]
  };

  function drawHeader(pageNum, totalPages, title, subtitle) {
    // Top banner
    doc.setFillColor(...C.navyDark);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line
    doc.setFillColor(...C.primaryBlue);
    doc.rect(0, 28, pageWidth, 1.5, 'F');

    // Logo / Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...C.white);
    doc.text('RxNXT', marginX, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(147, 197, 253);
    doc.text(' Cloud', marginX + 22, 13);

    // Badge
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(marginX + 45, 7.5, 62, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    doc.text('CLINICAL TECHNOLOGY ARCHITECTURE', marginX + 47.5, 12.2);

    // Title & Subtitle in banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...C.white);
    doc.text(title, pageWidth - marginX, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, pageWidth - marginX, 18, { align: 'right' });

    // Footer
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate500);
    doc.text('RxNXT Cloud - Clinical Technology Differentiation Blueprint - Orug Technologies Pvt. Ltd.', marginX, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // ==========================================
  // PAGE 1: CORE CRITIQUE & TECHNOLOGY TIERS
  // ==========================================
  drawHeader(1, 2, 'Technology Differentiation Blueprint', 'Re-Architecting Value Beyond WhatsApp Messaging');

  let y = 35;

  // The Strategic Problem Card (Critique Analysis)
  doc.setFillColor(...C.roseBg);
  doc.roundedRect(marginX, y, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(...C.rose);
  doc.setLineWidth(0.5);
  doc.roundedRect(marginX, y, contentWidth, 26, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.rose);
  doc.text('CRITICAL COMMERCIAL REALITY: WHATSAPP IS A TRANSPORT PIPE, NOT THE SOFTWARE', marginX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(...C.slate900);
  const problemText = 'When tiers differ primarily by WhatsApp messaging counts, doctors push back: "Meta charges 13 paise/msg. Why pay double (Rs 6,999 to Rs 12,999) for automated SMS/WhatsApp reminders?" WhatsApp is only the delivery pipe. To command higher subscription tiers, the value MUST be grounded in real clinical software technology: Longitudinal Vitals Graphing, AI Drug Safety Checks, Automated Pediatric Dosing, and Real-Time Batch Inventory FIFO Sync.';
  doc.text(doc.splitTextToSize(problemText, contentWidth - 8), marginX + 4, y + 11.5);

  y += 31;

  // Section 1: The 3 Deep-Tech Tiers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('1. THE 3-TIER CLINICAL TECHNOLOGY HIERARCHY', marginX, y);

  y += 4;

  const cardW = (contentWidth - 8) / 3;
  const cardH = 80;

  // --- Card 1: Solo GP (Prescribing Speed Engine) ---
  let c1X = marginX;
  doc.setFillColor(...C.white);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.primaryBlue);
  doc.setLineWidth(0.5);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.blueBg);
  doc.roundedRect(c1X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.primaryBlue);
  doc.text('TIER 1: SOLO GP', c1X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate700);
  doc.text('Prescribing Speed Engine', c1X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.primaryBlue);
  doc.text('Rs 6,999', c1X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 699/mo)', c1X + 27, y + 20.5);

  let by1 = y + 27;
  const c1Tech = [
    'Sub-20s Consultation Prescriber',
    'Typo-Tolerant Fuse.js Fuzzy Search',
    'Adaptive Doctor Habit Engine',
    'OPD Front-Desk Token Queue',
    'Client-Side jsPDF (<250ms DOM)',
    'Official NMC Registration Embed',
    'Instant WhatsApp PDF Delivery'
  ];
  c1Tech.forEach(b => {
    doc.setFillColor(...C.primaryBlue);
    doc.circle(c1X + 5, by1 - 0.9, 0.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(...C.slate700);
    doc.text(b, c1X + 8, by1);
    by1 += 6.5;
  });

  // --- Card 2: Specialist (Clinical Intelligence) ---
  let c2X = marginX + cardW + 4;
  doc.setFillColor(...C.emeraldBg);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.8);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.emerald);
  doc.roundedRect(c2X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text('TIER 2: SPECIALIST', c2X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(209, 250, 229);
  doc.text('Clinical Intelligence & Monitoring', c2X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.emerald);
  doc.text('Rs 12,999', c2X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 1,299/mo)', c2X + 29, y + 20.5);

  let by2 = y + 27;
  const c2Tech = [
    'Everything in Solo GP Tier',
    'Longitudinal Vitals Graphing',
    'AI Drug-Drug Interaction Shield',
    'Pediatric & Renal Dose Calculator',
    'Specialty Protocol Studio',
    'Chronic Care Retention Telemetry',
    'WhatsApp: 8 AM Briefings + Refills'
  ];
  c2Tech.forEach(b => {
    doc.setFillColor(...C.emerald);
    doc.circle(c2X + 5, by2 - 0.9, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(...C.slate900);
    doc.text(b, c2X + 8, by2);
    by2 += 6.5;
  });

  // --- Card 3: Polyclinic Hub (Distributed Infrastructure) ---
  let c3X = marginX + (cardW * 2) + 8;
  doc.setFillColor(...C.white);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.purple);
  doc.setLineWidth(0.5);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.purpleBg);
  doc.roundedRect(c3X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.purple);
  doc.text('TIER 3: POLYCLINIC', c3X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate700);
  doc.text('Distributed Practice Infrastructure', c3X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.purple);
  doc.text('Rs 24,999', c3X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 2,499/mo)', c3X + 29, y + 20.5);

  let by3 = y + 27;
  const c3Tech = [
    'Everything in Specialist Practice',
    'Up to 3 Doctor Seats Included',
    'Multi-Counter Queue State Machine',
    'In-House Pharmacy FIFO Stock Sync',
    'Batch Expiry & Reorder Alarms',
    'Direct Dispense Billing Terminal',
    'Consolidated Revenue Reconciliation'
  ];
  c3Tech.forEach(b => {
    doc.setFillColor(...C.purple);
    doc.circle(c3X + 5, by3 - 0.9, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.6);
    doc.setTextColor(...C.slate900);
    doc.text(b, c3X + 8, by3);
    by3 += 6.5;
  });

  y += cardH + 8;

  // Section 2: Deep Dive into Specialist Technologies
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('2. THE 4 CORE SPECIALIST TECHNOLOGIES JUSTIFYING THE 2X UPGRADE', marginX, y);

  y += 4;

  const tGridW = (contentWidth - 4) / 2;
  const tGridH = 26;

  const techDeepDive = [
    {
      tag: 'TECH 01',
      title: 'Longitudinal Vitals Graphing Engine',
      desc: 'Interactive 6-12 month trendlines for BP (Sys/Dia), Fasting Sugar, HbA1c, and Serum Creatinine plotted automatically across visits. Doctors visually detect disease progression in 3 seconds.'
    },
    {
      tag: 'TECH 02',
      title: 'AI Drug-Drug Interaction (DDI) Shield',
      desc: 'Real-time contraindication detection protecting doctor medical licenses. Instantly alerts if ACE inhibitors conflict with potassium diuretics or if a drug is contraindicated in renal impairment.'
    },
    {
      tag: 'TECH 03',
      title: 'Automated Pediatric Dose Calculator',
      desc: 'Automatic mg/kg/day formulation calculation based on child weight. Converts complex pediatric suspensions (e.g. Amoxiclav syrup mg/ml) into exact ml doses without manual math errors.'
    },
    {
      tag: 'TECH 04',
      title: 'Specialty Protocol & Titration Studio',
      desc: 'Pre-configured complex multi-regime treatment bundles: Insulin sliding scale titrations, step-down steroid tapers, and multi-week antibiotic regimens populated with a single click.'
    }
  ];

  techDeepDive.forEach((td, idx) => {
    const gx = marginX + (idx % 2 === 0 ? 0 : tGridW + 4);
    const gy = y + (Math.floor(idx / 2) * (tGridH + 3));

    doc.setFillColor(...C.white);
    doc.roundedRect(gx, gy, tGridW, tGridH, 2, 2, 'F');
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(gx, gy, tGridW, tGridH, 2, 2, 'D');

    // Clean ASCII badge for Tech ID
    doc.setFillColor(...C.emeraldBg);
    doc.roundedRect(gx + 3.5, gy + 3.5, 14, 4.2, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(...C.emerald);
    doc.text(td.tag, gx + 4.8, gy + 6.4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...C.navyDark);
    doc.text(td.title, gx + 19.5, gy + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(...C.slate700);
    doc.text(doc.splitTextToSize(td.desc, tGridW - 8), gx + 4, gy + 11.5);
  });

  // ==========================================
  // PAGE 2: ARCHITECTURE MATRIX & VALUE MATH
  // ==========================================
  doc.addPage();
  drawHeader(2, 2, 'Clinical Technology Matrix & ROI Math', 'Side-by-Side Architectural Breakdown & Doctor Value Justification');

  y = 35;

  // Section 3: Comprehensive Technology Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('3. COMPREHENSIVE TECHNOLOGY ARCHITECTURE MATRIX', marginX, y);

  y += 4;

  const matY = y;
  doc.setFillColor(...C.navyDark);
  doc.rect(marginX, matY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...C.white);
  doc.text('CAPABILITY AREA', marginX + 3, matY + 4.8);
  doc.text('SOLO GP TIER (Rs 6,999/yr)', marginX + 42, matY + 4.8);
  doc.text('SPECIALIST TIER (Rs 12,999/yr)', marginX + 88, matY + 4.8);
  doc.text('POLYCLINIC HUB (Rs 24,999/yr)', marginX + 135, matY + 4.8);

  const matRows = [
    [
      'Prescribing Engine',
      'Sub-20s Prescriber + Fuse.js Alias Search',
      'Additive Habit Learning + Specialty Protocol Studio',
      'Multi-Doctor Parallel Prescribing Engine'
    ],
    [
      'Clinical Safety & AI',
      'Schedule H / Narcotic Telemedicine Alerts',
      'AI Drug-Drug Interaction (DDI) + Pediatric Dose Calc',
      'Clinic-Wide Drug Formulary & Restricted Stock Controls'
    ],
    [
      'Patient Health Records',
      'Basic Visit History & Electronic Letterhead',
      'Longitudinal Vitals Graphing (BP/Sugar/HbA1c Curves)',
      'Central Multi-Doctor Patient Master Index (MPI)'
    ],
    [
      'Practice Architecture',
      '1 Doctor Seat + 1 Receptionist Desk',
      '1 Doctor + Receptionist + Adherence Telemetry',
      '3 Doctor Seats + Pharmacy + Multi-Counter Queue'
    ],
    [
      'Pharmacy & Dispensing',
      'External Pharmacy PDF Link',
      'External Rx Link + Procedure Charge Slips',
      'Integrated In-House Pharmacy FIFO Stock & Expiry Sync'
    ],
    [
      'Billing & Revenue',
      'Simple Consultation Invoices',
      'Consultation Invoices + Procedure Receipts',
      'Split Revenue Audit: Doctor Fees vs. Pharmacy Margin'
    ],
    [
      'WhatsApp Output Layer',
      'Instant Branded Rx PDF Delivery',
      'Rx PDF + 8 AM Daily Briefings + Day-25 Chronic Alerts',
      'Multi-Doctor PDF Delivery + Live Queue Token Pings'
    ]
  ];

  let mrY = matY + 7;
  matRows.forEach((r, rIdx) => {
    const rowH = 12.5;
    if (rIdx % 2 === 1) {
      doc.setFillColor(...C.slate50);
      doc.rect(marginX, mrY, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.2);
    doc.line(marginX, mrY + rowH, marginX + contentWidth, mrY + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.navyDark);
    doc.text(doc.splitTextToSize(r[0], 37), marginX + 3, mrY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(...C.slate700);
    doc.text(doc.splitTextToSize(r[1], 44), marginX + 42, mrY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.emerald);
    doc.text(doc.splitTextToSize(r[2], 44), marginX + 88, mrY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.purple);
    doc.text(doc.splitTextToSize(r[3], 44), marginX + 135, mrY + 4.2);

    mrY += rowH;
  });

  y = mrY + 8;

  // Section 4: Doctor ROI Math & Financial Justification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('4. THE DOCTOR ROI PROOF: WHY DOCTORS EASILY PAY THE HIGHER TIERS', marginX, y);

  y += 4;

  const roiW = (contentWidth - 4) / 2;
  const roiH = 34;

  // Specialist ROI Box
  doc.setFillColor(...C.emeraldBg);
  doc.roundedRect(marginX, y, roiW, roiH, 2, 2, 'F');
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, y, roiW, roiH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.emerald);
  doc.text('WHY A SPECIALIST PAYS Rs 12,999 (NOT Rs 6,999)', marginX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate900);
  const sRoi = '1. Liability Protection: AI DDI checks protect against dangerous prescribing lawsuits.\n2. Chronic Revisit ROI: In India, a specialist consultation fee is Rs 500-Rs 800. Just 2 to 3 returning chronic patients a month (via Day-25 refill alerts) pays for the entire software!\n3. Clinical Time Savings: Pediatric dose calculations save 45 minutes of manual math daily.';
  doc.text(doc.splitTextToSize(sRoi, roiW - 8), marginX + 4, y + 11.5);

  // Polyclinic ROI Box
  const pRoiX = marginX + roiW + 4;
  doc.setFillColor(...C.purpleBg);
  doc.roundedRect(pRoiX, y, roiW, roiH, 2, 2, 'F');
  doc.setDrawColor(...C.purple);
  doc.setLineWidth(0.4);
  doc.roundedRect(pRoiX, y, roiW, roiH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.purple);
  doc.text('WHY A POLYCLINIC PAYS Rs 24,999 (NOT Rs 12,999)', pRoiX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate900);
  const pRoi = '1. Stock Expiry Elimination: The average in-clinic pharmacy loses Rs 15,000-Rs 25,000/year to expired unmonitored medicines. FIFO tracking pays for RxNXT on stock savings alone.\n2. Multi-Doctor Cost Amortization: Covers 3 doctors (only Rs 694/doctor/month).\n3. Revenue Leakage Prevention: Unbilled medicines and procedures are flagged automatically.';
  doc.text(doc.splitTextToSize(pRoi, roiW - 8), pRoiX + 4, y + 11.5);

  y += roiH + 7;

  // Bottom Takeaway Banner
  doc.setFillColor(...C.navyDark);
  doc.roundedRect(marginX, y, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(147, 197, 253);
  doc.text('THE COMMERCIAL WINNING PITCH TO DOCTORS:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.white);
  doc.text('"RxNXT is not an SMS marketing tool. It is an intelligent clinical workstation that protects your clinical safety, graphs your patients\' health over 12 months, and automates your clinic operations effortlessly."', marginX + 4, y + 9.5);

  // Save PDF
  const repoOutputPath = path.join(__dirname, '..', 'RxNXT_Technology_Tier_Differentiation_Blueprint.pdf');
  const brainDir = 'C:\\Users\\orugt\\.gemini\\antigravity\\brain\\a1d02c3c-4bc4-4391-8e96-23e1f327136c';
  const brainOutputPath = path.join(brainDir, 'RxNXT_Technology_Tier_Differentiation_Blueprint.pdf');
  const desktopOutputPath = 'C:\\Users\\orugt\\Desktop\\RxNXT_Technology_Tier_Differentiation_Blueprint.pdf';

  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(repoOutputPath, Buffer.from(pdfBytes));

  try {
    fs.writeFileSync(brainOutputPath, Buffer.from(pdfBytes));
    console.log('Saved to Brain Artifact directory:', brainOutputPath);
  } catch (e) {
    console.log('Brain write skipped:', e.message);
  }

  try {
    fs.writeFileSync(desktopOutputPath, Buffer.from(pdfBytes));
    console.log('Saved to Desktop:', desktopOutputPath);
  } catch (e) {
    console.log('Desktop write skipped:', e.message);
  }

  console.log('SUCCESS: Generated Technology Tier Differentiation Blueprint PDF at:', repoOutputPath);
  console.log('File size:', fs.statSync(repoOutputPath).size, 'bytes');
}

generateTechTiersPDF();
