const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generatePricingPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm

  // Colors
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
    doc.roundedRect(marginX + 45, 7.5, 52, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text('COMMERCIAL STRATEGY', marginX + 47.5, 12.2);

    // Title & Subtitle in banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.white);
    doc.text(title, pageWidth - marginX, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, pageWidth - marginX, 18, { align: 'right' });

    // Footer
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate500);
    doc.text('RxNXT Cloud - Confidential Financial & Commercial Architecture - Orug Technologies', marginX, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // ==========================================
  // PAGE 1: PRICING MODEL A & COMMERCIAL TIERS
  // ==========================================
  drawHeader(1, 2, 'Strategic Pricing & Subscription Model', 'Adopted Model A (Rs 6,999 / Rs 12,999 / Rs 24,999)');

  let y = 35;

  // Executive Summary Card
  doc.setFillColor(...C.blueBg);
  doc.roundedRect(marginX, y, contentWidth, 23, 2, 2, 'F');
  doc.setDrawColor(...C.primaryBlue);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, y, contentWidth, 23, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.navyDark);
  doc.text('EXECUTIVE OVERVIEW: THE "1-DAY OPD" SUBSCRIPTION ANCHOR', marginX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.slate700);
  const execText = 'In Tier-2/3 Indian cities (e.g. Hanamkonda & Kazipet), a GP earns Rs 8,000-Rs 18,000/day and a Specialist earns Rs 15,000-Rs 35,000/day. Model A is priced so the ENTIRE annual software fee is less than 1 single day of outpatient consultations. Combined with sub-0.02% database duty cycles and client-side jsPDF rendering, this model delivers an unprecedented 89% to 95% net operating margin.';
  doc.text(doc.splitTextToSize(execText, contentWidth - 8), marginX + 4, y + 11.5);

  y += 28;

  // Section Header: The 3 Commercial Tiers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('1. ADOPTED COMMERCIAL SUBSCRIPTION TIERS (MODEL A)', marginX, y);

  y += 5;

  // 3 Pricing Cards Side-by-Side
  const cardW = (contentWidth - 8) / 3; // ~58mm each
  const cardH = 70;

  // --- Card 1: Solo GP ---
  let c1X = marginX;
  doc.setFillColor(...C.white);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.4);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'D');

  // Top header block
  doc.setFillColor(...C.slate100);
  doc.roundedRect(c1X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.slate900);
  doc.text('SOLO GP TIER', c1X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('Individual Family OPDs', c1X + 4, y + 10.5);

  // Price
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...C.primaryBlue);
  doc.text('Rs 6,999', c1X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ year  (or Rs 699 / mo)', c1X + 27, y + 20.5);

  // Feature bullets
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(...C.slate700);
  let by1 = y + 27;
  const c1Bullets = [
    '1 Doctor + 1 Receptionist Desk',
    'Unlimited Digital Prescriptions',
    'Instant WhatsApp PDF Delivery',
    'Adaptive Clinical Habit Scoring',
    'OPD Front-Desk Token Queue',
    'Direct Self-Registration'
  ];
  c1Bullets.forEach(b => {
    doc.setFillColor(...C.primaryBlue);
    doc.circle(c1X + 5, by1 - 0.9, 0.8, 'F');
    doc.text(b, c1X + 8, by1);
    by1 += 6.5;
  });

  // --- Card 2: Specialist Practice (Hero) ---
  let c2X = marginX + cardW + 4;
  doc.setFillColor(...C.emeraldBg);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.7);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'D');

  // Top header block
  doc.setFillColor(...C.emerald);
  doc.roundedRect(c2X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text('SPECIALIST PRACTICE', c2X + 4, y + 6.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(209, 250, 229);
  doc.text('Chronic Care & Adherence', c2X + 4, y + 10.5);

  // Floating Popular Pill Badge (Centered on top border with zero text overlap)
  const badgeW = 24;
  const badgeH = 4.8;
  const badgeX = c2X + (cardW - badgeW) / 2;
  const badgeY = y - 2.4;
  doc.setFillColor(...C.amber);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(...C.white);
  doc.text('MOST POPULAR', c2X + cardW / 2, badgeY + 3.4, { align: 'center' });

  // Price
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...C.emerald);
  doc.text('Rs 12,999', c2X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ year  (or Rs 1,299 / mo)', c2X + 29, y + 20.5);

  // Feature bullets
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(...C.slate700);
  let by2 = y + 27;
  const c2Bullets = [
    'Everything in Solo GP Tier',
    'Automated 8 AM WhatsApp Briefings',
    'Day-25 Chronic Care Refill Alerts',
    'Auto Follow-Up Revisit Reminders',
    'Patient Adherence Analytics',
    'Includes 1,000 Adherence msgs/mo'
  ];
  c2Bullets.forEach(b => {
    doc.setFillColor(...C.emerald);
    doc.circle(c2X + 5, by2 - 0.9, 0.8, 'F');
    doc.text(b, c2X + 8, by2);
    by2 += 6.5;
  });

  // --- Card 3: Polyclinic Hub ---
  let c3X = marginX + (cardW * 2) + 8;
  doc.setFillColor(...C.white);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.purple);
  doc.setLineWidth(0.4);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'D');

  // Top header block
  doc.setFillColor(...C.purpleBg);
  doc.roundedRect(c3X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.purple);
  doc.text('POLYCLINIC HUB', c3X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('Multi-Doctor & Pharmacy', c3X + 4, y + 10.5);

  // Price
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...C.purple);
  doc.text('Rs 24,999', c3X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...C.slate500);
  doc.text('/ year  (or Rs 2,499 / mo)', c3X + 29, y + 20.5);

  // Feature bullets
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.7);
  doc.setTextColor(...C.slate700);
  let by3 = y + 27;
  const c3Bullets = [
    'Everything in Specialist Practice',
    'Up to 3 Doctor Seats Included',
    'In-House Pharmacy & Batch Stock',
    'Dispensing Queue & Medicine Billing',
    'Extra Doctor Seats @ Rs 399/mo',
    'Consolidated Practice Analytics'
  ];
  c3Bullets.forEach(b => {
    doc.setFillColor(...C.purple);
    doc.circle(c3X + 5, by3 - 0.9, 0.8, 'F');
    doc.text(b, c3X + 8, by3);
    by3 += 6.5;
  });

  y += cardH + 8;

  // Section 2: Acquisition Engine: The First 150
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('2. THE ACQUISITION ENGINE: "THE FIRST 150 FREE PRESCRIPTIONS"', marginX, y);

  y += 4;

  doc.setFillColor(...C.white);
  doc.roundedRect(marginX, y, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 34, 2, 2, 'D');

  const steps = [
    { title: 'Rx #1 - #100', desc: 'Frictionless Prescribing', sub: 'Doctor tests 18s workflow. Habit engine learns top 20 drugs.' },
    { title: 'Rx #101 - #145', desc: 'Soft Status Indicator', sub: 'Dismissible pill badge tracks balance without interrupting OPD.' },
    { title: 'Rx #146 - #149', desc: 'Pre-Expiry Urgency', sub: 'Prompt highlighting queue continuity and clinical history safety.' },
    { title: 'Rx #150', desc: 'Seamless Activation', sub: '1-click UPI/Razorpay activation modal. Prescriptions unlocked instantly.' }
  ];

  const stepW = contentWidth / 4;
  steps.forEach((s, idx) => {
    const sx = marginX + (idx * stepW);
    if (idx > 0) {
      doc.setDrawColor(...C.slate200);
      doc.setLineWidth(0.2);
      doc.line(sx, y + 3, sx, y + 31);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.primaryBlue);
    doc.text(s.title, sx + 4, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.slate900);
    doc.text(s.desc, sx + 4, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate500);
    doc.text(doc.splitTextToSize(s.sub, stepW - 7), sx + 4, y + 18);
  });

  y += 40;

  // Section 3: WhatsApp Adherence Wallet Top-Ups
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('3. PREPAID WHATSAPP ADHERENCE WALLET MECHANICS', marginX, y);

  y += 4;

  const wTableY = y;
  doc.setFillColor(...C.slate900);
  doc.rect(marginX, wTableY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text('PACKAGE', marginX + 3, wTableY + 4.2);
  doc.text('CREDITS', marginX + 45, wTableY + 4.2);
  doc.text('PRICE', marginX + 80, wTableY + 4.2);
  doc.text('PRICE / MSG', marginX + 115, wTableY + 4.2);
  doc.text('META COGS (@ Rs 0.13)', marginX + 145, wTableY + 4.2);
  doc.text('NET MARGIN', marginX + 165, wTableY + 4.2);

  const wRows = [
    ['Included in Base', '1,000 msgs / mo (Specialist)', 'Included in Tier', 'Rs 0.00', 'Rs 130.00 / clinic', 'Protected SaaS'],
    ['Starter Top-Up Pack', '2,500 Credits', 'Rs 499', 'Rs 0.20 / msg', 'Rs 325.00', '34.8% Profit'],
    ['Growth Top-Up Pack', '6,000 Credits', 'Rs 999', 'Rs 0.16 / msg', 'Rs 780.00', '21.9% Profit']
  ];

  let rY = wTableY + 6;
  wRows.forEach((row, rIdx) => {
    if (rIdx % 2 === 1) {
      doc.setFillColor(...C.slate50);
      doc.rect(marginX, rY, contentWidth, 6, 'F');
    }
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.2);
    doc.line(marginX, rY + 6, marginX + contentWidth, rY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.slate900);
    doc.text(row[0], marginX + 3, rY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.text(row[1], marginX + 45, rY + 4.2);
    doc.text(row[2], marginX + 80, rY + 4.2);
    doc.text(row[3], marginX + 115, rY + 4.2);
    doc.text(row[4], marginX + 145, rY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.emerald);
    doc.text(row[5], marginX + 165, rY + 4.2);

    rY += 6;
  });

  // ==========================================
  // PAGE 2: FINANCIAL REVENUE & VALUATION
  // ==========================================
  doc.addPage();
  drawHeader(2, 2, 'Financial Earnings & Valuation Projections', 'Cashflow, Unit Economics & 5-Phase Growth Model');

  y = 35;

  // Cohort Deep Dive: 55 Doctors Hanamkonda & Kazipet
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('4. IMMEDIATE CASHFLOW: 55 DOCTORS IN HANAMKONDA & KAZIPET', marginX, y);

  y += 4;

  // Box container
  doc.setFillColor(...C.white);
  doc.roundedRect(marginX, y, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, y, contentWidth, 54, 2, 2, 'D');

  // Left column: Revenue Breakdown
  let boxY = y + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.navyDark);
  doc.text('ANNUAL SUBSCRIPTION REVENUE (ARR)', marginX + 5, boxY);

  const revLines = [
    ['- 33 Solo GPs (60% cohort)', '@ Rs 6,999 / yr', '= Rs 2,30,967'],
    ['- 16 Specialists (30% cohort)', '@ Rs 12,999 / yr', '= Rs 2,07,984'],
    ['- 6 Polyclinic Hubs (10% cohort)', '@ Rs 24,999 / yr', '= Rs 1,49,994'],
    ['- WhatsApp Wallet Top-Ups & Extra Seats', 'Upsell expansion', '= Rs 49,055']
  ];

  let lineY = boxY + 5.5;
  revLines.forEach(l => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate700);
    doc.text(l[0], marginX + 5, lineY);
    doc.setTextColor(...C.slate500);
    doc.text(l[1], marginX + 52, lineY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate900);
    doc.text(l[2], marginX + 85, lineY, { align: 'right' });
    lineY += 5.2;
  });

  doc.setFillColor(...C.blueBg);
  doc.rect(marginX + 3, lineY - 1, 84, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.primaryBlue);
  doc.text('TOTAL GROSS ANNUAL REVENUE:', marginX + 5, lineY + 3.2);
  doc.text('Rs 6,38,000', marginX + 85, lineY + 3.2, { align: 'right' });

  // Divider inside box
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.line(marginX + 92, y + 3, marginX + 92, y + 51);

  // Right column: Direct Cloud COGS & Net Margin
  let cogsX = marginX + 97;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...C.navyDark);
  doc.text('DIRECT INFRASTRUCTURE COGS (55 CLINICS)', cogsX, boxY);

  const cogsLines = [
    ['- Supabase Mumbai Pro Database', '$25 / mo ($300/yr)', '= Rs 25,200'],
    ['- Vercel Edge Serverless Pro', '$20 / mo ($240/yr)', '= Rs 20,160'],
    ['- Meta WhatsApp Utility API', '~60,000 Rx @ Rs 0.13', '= Rs 10,500'],
    ['- Payment Gateway Fee (Razorpay/UPI)', '~2.0% volume charge', '= Rs 12,760']
  ];

  let cY = boxY + 5.5;
  cogsLines.forEach(l => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate700);
    doc.text(l[0], cogsX, cY);
    doc.setTextColor(...C.slate500);
    doc.text(l[1], cogsX + 50, cY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.slate900);
    doc.text(l[2], cogsX + 82, cY, { align: 'right' });
    cY += 5.2;
  });

  doc.setFillColor(...C.emeraldBg);
  doc.rect(cogsX - 2, cY - 1, 84, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.emerald);
  doc.text('NET ANNUAL CASHFLOW (EBITDA):', cogsX, cY + 3.2);
  doc.text('Rs 5,69,380 (89.2% Margin)', cogsX + 82, cY + 3.2, { align: 'right' });

  y += 62;

  // Section 5: 5-Phase Scale Projection Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('5. MULTI-PHASE SCALE & ARR PROJECTION', marginX, y);

  y += 4;

  const mTableY = y;
  doc.setFillColor(...C.navyDark);
  doc.rect(marginX, mTableY, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text('GROWTH PHASE', marginX + 3, mTableY + 4.5);
  doc.text('CLINICS', marginX + 55, mTableY + 4.5);
  doc.text('ANNUAL ARR', marginX + 85, mTableY + 4.5);
  doc.text('CLOUD COGS', marginX + 118, mTableY + 4.5);
  doc.text('NET PROFIT (EBITDA)', marginX + 148, mTableY + 4.5);
  doc.text('MARGIN', marginX + 172, mTableY + 4.5);

  const mRows = [
    ['Phase 1: Immediate Cohort (Hnk & Kzp)', '55 Clinics', 'Rs 6.38 Lakhs', 'Rs 0.68 Lakhs', 'Rs 5.70 Lakhs', '89.3%'],
    ['Phase 2: Tri-City Cluster (Wgl, Krm, Kmm)', '200 Clinics', 'Rs 23.20 Lakhs', 'Rs 1.85 Lakhs', 'Rs 21.35 Lakhs', '92.0%'],
    ['Phase 3: State Presence (Telangana & AP)', '500 Clinics', 'Rs 58.00 Lakhs', 'Rs 3.90 Lakhs', 'Rs 54.10 Lakhs', '93.3%'],
    ['Phase 4: South India Regional Scale', '1,500 Clinics', 'Rs 1.74 Crores', 'Rs 9.80 Lakhs', 'Rs 1.64 Crores', '94.4%'],
    ['Phase 5: National Multi-Cluster Scale', '5,000 Clinics', 'Rs 5.80 Crores', 'Rs 28.50 Lakhs', 'Rs 5.51 Crores', '95.1%']
  ];

  let mrY = mTableY + 6.5;
  mRows.forEach((row, rIdx) => {
    if (rIdx % 2 === 1) {
      doc.setFillColor(...C.slate50);
      doc.rect(marginX, mrY, contentWidth, 6.5, 'F');
    }
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.2);
    doc.line(marginX, mrY + 6.5, marginX + contentWidth, mrY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.slate900);
    doc.text(row[0], marginX + 3, mrY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(row[1], marginX + 55, mrY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.primaryBlue);
    doc.text(row[2], marginX + 85, mrY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate500);
    doc.text(row[3], marginX + 118, mrY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.emerald);
    doc.text(row[4], marginX + 148, mrY + 4.5);

    doc.setTextColor(...C.slate900);
    doc.text(row[5], marginX + 172, mrY + 4.5);

    mrY += 6.5;
  });

  y = mrY + 8;

  // Section 6: Enterprise Valuation Multiple Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...C.slate900);
  doc.text('6. ENTERPRISE VALUATION IMPACT (8x - 12x ARR MULTIPLE)', marginX, y);

  y += 4;

  const valW = (contentWidth - 6) / 3;
  const valH = 26;

  const valCards = [
    { scale: '55 Clinics (Local Seed)', arr: 'Rs 6.38 Lakhs ARR', val: 'Rs 50 L - Rs 75 L', sub: 'Self-sustaining profitable seed stage' },
    { scale: '500 Clinics (State Scale)', arr: 'Rs 58.00 Lakhs ARR', val: 'Rs 4.5 Cr - Rs 6.5 Cr', sub: 'Series-A ready regional leader' },
    { scale: '2,000 Clinics (South India)', arr: 'Rs 2.32 Crores ARR', val: 'Rs 18.0 Cr - Rs 25.0 Cr', sub: 'High-margin vertical SaaS exit potential' }
  ];

  valCards.forEach((v, vIdx) => {
    const vx = marginX + (vIdx * (valW + 3));
    doc.setFillColor(...C.white);
    doc.roundedRect(vx, y, valW, valH, 2, 2, 'F');
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(vx, y, valW, valH, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.slate700);
    doc.text(v.scale, vx + 3.5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...C.primaryBlue);
    doc.text(v.arr, vx + 3.5, y + 11.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.emerald);
    doc.text(v.val, vx + 3.5, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.slate500);
    doc.text(v.sub, vx + 3.5, y + 22.5);
  });

  y += valH + 8;

  // Bottom Key Takeaways Callout
  doc.setFillColor(...C.slate100);
  doc.roundedRect(marginX, y, contentWidth, 18, 2, 2, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 18, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.navyDark);
  doc.text('CRITICAL COMMERCIAL ADVANTAGES:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate700);
  doc.text('1. Negative Working Capital: Annual upfront payments provide 100% upfront liquidity with zero debt or credit exposure.', marginX + 4, y + 9.5);
  doc.text('2. Pure Operating Leverage: Cloud COGS remains under 7% across all scale tiers because client browsers handle PDF generation.', marginX + 4, y + 14);

  // Save PDF
  const repoOutputPath = path.join(__dirname, '..', 'RxNXT_Commercial_Pricing_and_Revenue_Model.pdf');
  const brainDir = 'C:\\Users\\orugt\\.gemini\\antigravity\\brain\\a1d02c3c-4bc4-4391-8e96-23e1f327136c';
  const brainOutputPath = path.join(brainDir, 'RxNXT_Commercial_Pricing_and_Revenue_Model.pdf');

  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(repoOutputPath, Buffer.from(pdfBytes));

  try {
    fs.writeFileSync(brainOutputPath, Buffer.from(pdfBytes));
    console.log('Saved to Brain Artifact directory:', brainOutputPath);
  } catch (e) {
    console.log('Brain write skipped:', e.message);
  }

  console.log('SUCCESS: Generated RxNXT Commercial Pricing & Revenue Model PDF at:', repoOutputPath);
  console.log('File size:', fs.statSync(repoOutputPath).size, 'bytes');
}

generatePricingPDF();
