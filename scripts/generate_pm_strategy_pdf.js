const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function generatePMStrategyPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - (marginX * 2); // 182mm

  // Professional Corporate Palette
  const C = {
    navyDark: [10, 25, 47],
    navyLight: [15, 33, 64],
    primaryBlue: [37, 99, 235],
    blueBg: [239, 246, 255],
    blueBorder: [191, 219, 254],
    emerald: [5, 150, 105],
    emeraldBg: [236, 253, 245],
    emeraldBorder: [167, 243, 208],
    purple: [109, 40, 217],
    purpleBg: [245, 243, 255],
    purpleBorder: [221, 214, 254],
    amber: [180, 83, 9],
    amberBg: [254, 243, 199],
    rose: [225, 29, 72],
    roseBg: [255, 241, 242],
    roseBorder: [254, 205, 211],
    slate900: [15, 23, 42],
    slate800: [30, 41, 59],
    slate700: [51, 65, 85],
    slate500: [100, 116, 139],
    slate400: [148, 163, 184],
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

    // Pill Badge
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(marginX + 44, 7.5, 68, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    doc.text('EXECUTIVE PRODUCT MEMORANDUM', marginX + 46.5, 12.2);

    // Title & Subtitle in banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.white);
    doc.text(title, pageWidth - marginX, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text(subtitle, pageWidth - marginX, 18, { align: 'right' });

    // Footer
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.slate500);
    doc.text('RxNXT Cloud - Product Strategy Evaluation: WhatsApp vs. Technology Hierarchy - Confidential', marginX, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // ==========================================
  // PAGE 1: MEMO DETAILS & STRATEGIC COMPARISON
  // ==========================================
  drawHeader(1, 3, 'Product Strategy Evaluation', 'Option A (WhatsApp-Centric) vs. Option B (Technology Hierarchy)');

  let y = 35;

  // Memo Metadata Block
  doc.setFillColor(...C.slate100);
  doc.roundedRect(marginX, y, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.navyDark);
  doc.text('TO:', marginX + 4, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Senior Product Manager / Executive Product Committee', marginX + 18, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', marginX + 4, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Clinical Architecture & Product Strategy Team', marginX + 18, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT:', marginX + 4, y + 15.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Evaluation of Tier Packaging: Messaging Volume vs. Clinical Technology Depth', marginX + 18, y + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.primaryBlue);
  doc.text('DATE: October 31, 2026', pageWidth - marginX - 4, y + 5.5, { align: 'right' });
  doc.setTextColor(...C.emerald);
  doc.text('STATUS: FOR DECISION', pageWidth - marginX - 4, y + 10.5, { align: 'right' });

  y += 26;

  // The Core Problem Callout Box
  doc.setFillColor(...C.roseBg);
  doc.roundedRect(marginX, y, contentWidth, 25, 2, 2, 'F');
  doc.setDrawColor(...C.roseBorder);
  doc.setLineWidth(0.6);
  doc.roundedRect(marginX, y, contentWidth, 25, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.rose);
  doc.text('THE COMMERCIAL PROBLEM WITH THE EXISTING WHATSAPP-CENTRIC MODEL', marginX + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...C.slate900);
  const pText = 'When tiers differentiate primarily by WhatsApp messaging quotas, doctors push back immediately: "Meta charges 13 paise per message. Why should I pay Rs 6,000 more just to send WhatsApp reminders? My receptionist can do that manually for free." WhatsApp is only a transport pipe, not software. To command Rs 12,999 and Rs 24,999, the value MUST be grounded in real clinical and operational software technology.';
  doc.text(doc.splitTextToSize(pText, contentWidth - 8), marginX + 4, y + 10.5);

  y += 30;

  // Section 1: Strategic Comparison Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('1. MULTI-DIMENSIONAL STRATEGIC COMPARISON', marginX, y);

  y += 4;

  const matY = y;
  doc.setFillColor(...C.navyDark);
  doc.rect(marginX, matY, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text('STRATEGIC DIMENSION', marginX + 3, matY + 4.5);
  doc.text('OPTION A: WHATSAPP-CENTRIC', marginX + 48, matY + 4.5);
  doc.text('OPTION B: TECHNOLOGY HIERARCHY', marginX + 110, matY + 4.5);
  doc.text('WINNER', marginX + 165, matY + 4.5);

  const matRows = [
    [
      'Product Positioning',
      'Digital Rx + WhatsApp Marketing / Reminder Bot',
      'Intelligent Clinic Operating System (Clinic OS)',
      'Option B'
    ],
    [
      'Doctor Willingness-to-Pay',
      'Low: Negotiates on message caps vs 13p SMS',
      'High: Pays for clinical safety & pediatric dose math',
      'Option B'
    ],
    [
      'Competitive Moat & Churn',
      'Fragile: Easily matched by Practo / Eka Care',
      'High Data Gravity: 12-mo vitals curves & habit scoring',
      'Option B'
    ],
    [
      'Gross Margin Stability',
      'Volatile: Heavy messaging volume erodes margins',
      'Predictable (>90%): Software on client; wallet for msgs',
      'Option B'
    ],
    [
      'Sales Objection Barrier',
      'High: "My staff can WhatsApp prescriptions for free"',
      'Low: "This graphs HbA1c curves and stops bad drug combos"',
      'Option B'
    ],
    [
      'Polyclinic Upsell Pitch',
      'Weak: Polyclinic simply gets more message quotas',
      'Compelling: In-house pharmacy FIFO stock & expiry alarms',
      'Option B'
    ],
    [
      'Engineering Timeline',
      'Immediate (already built in code)',
      'Phased: 3-4 weeks for Vitals Graphing UI & DDI table',
      'Option A (Short)'
    ]
  ];

  let mrY = matY + 6.5;
  matRows.forEach((r, rIdx) => {
    const rowH = 11.5;
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
    doc.text(doc.splitTextToSize(r[0], 42), marginX + 3, mrY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(...C.slate700);
    doc.text(doc.splitTextToSize(r[1], 58), marginX + 48, mrY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.emerald);
    doc.text(doc.splitTextToSize(r[2], 52), marginX + 110, mrY + 4.2);

    doc.setFont('helvetica', 'bold');
    const isB = r[3].includes('Option B');
    doc.setTextColor(isB ? C.emerald[0] : C.amber[0], isB ? C.emerald[1] : C.amber[1], isB ? C.emerald[2] : C.amber[2]);
    doc.text(r[3], marginX + 165, mrY + 4.2);

    mrY += rowH;
  });

  y = mrY + 7;

  // Bottom Takeaway Card
  doc.setFillColor(...C.blueBg);
  doc.roundedRect(marginX, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(...C.blueBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 14, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.primaryBlue);
  doc.text('KEY STRATEGIC TAKEAWAY FOR PRODUCT LEADERSHIP:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate900);
  doc.text('Option A treats WhatsApp as the product, commoditizing RxNXT into an SMS tool. Option B treats WhatsApp as the frictionless window into advanced clinical intelligence, unlocking durable enterprise SaaS multiples.', marginX + 4, y + 9.5);

  // ==========================================
  // PAGE 2: THE 3 TIERS & 4 SPECIALIST TECHNOLOGIES
  // ==========================================
  doc.addPage();
  drawHeader(2, 3, 'The Technology Hierarchy Architecture', 'Aligning Tiers with the "Rx" (Prescription) Evolution');

  y = 35;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('2. BRAND ALIGNMENT: HOW THE 3 TIERS TRACK THE LIFECYCLE OF THE "Rx"', marginX, y);

  y += 4;

  const cardW = (contentWidth - 8) / 3;
  const cardH = 75;

  // Tier 1 Card
  let c1X = marginX;
  doc.setFillColor(...C.white);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.blueBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(c1X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.blueBg);
  doc.roundedRect(c1X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.primaryBlue);
  doc.text('TIER 1: THE FAST Rx', c1X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.slate700);
  doc.text('How the Rx is Born (Creation)', c1X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.primaryBlue);
  doc.text('Rs 6,999', c1X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 699/mo)', c1X + 26, y + 20.5);

  let by1 = y + 27;
  const t1Bullets = [
    'Sub-20s digital prescription creation',
    'Typo-tolerant Fuse.js alias search',
    '1-click dosage chips (1-0-1, 3 days)',
    'Adaptive doctor habit engine (+50)',
    'Client-side jsPDF (<250ms DOM)',
    'Branded letterhead & NMC credentials',
    'Instant WhatsApp PDF delivery link'
  ];
  t1Bullets.forEach(b => {
    doc.setFillColor(...C.primaryBlue);
    doc.circle(c1X + 5, by1 - 0.9, 0.7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate700);
    doc.text(doc.splitTextToSize(b, cardW - 9), c1X + 8, by1);
    by1 += 6.5;
  });

  // Tier 2 Card
  let c2X = marginX + cardW + 4;
  doc.setFillColor(...C.emeraldBg);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.emerald);
  doc.setLineWidth(0.8);
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.emerald);
  doc.roundedRect(c2X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text('TIER 2: INTELLIGENT Rx', c2X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(209, 250, 229);
  doc.text('How the Rx Lives (Adherence)', c2X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.emerald);
  doc.text('Rs 12,999', c2X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 1,299/mo)', c2X + 28, y + 20.5);

  let by2 = y + 27;
  const t2Bullets = [
    'Everything in Solo GP Tier',
    'Longitudinal Vitals Graphing Engine',
    'AI Drug-Drug Interaction (DDI) Shield',
    'Pediatric & Renal Dose Calculator',
    'Specialty Protocol & Titration Studio',
    'Automated 8 AM Daily Dose Briefings',
    'Day-25 Chronic Medication Refill Alerts'
  ];
  t2Bullets.forEach(b => {
    doc.setFillColor(...C.emerald);
    doc.circle(c2X + 5, by2 - 0.9, 0.7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate900);
    doc.text(doc.splitTextToSize(b, cardW - 9), c2X + 8, by2);
    by2 += 6.5;
  });

  // Tier 3 Card
  let c3X = marginX + (cardW * 2) + 8;
  doc.setFillColor(...C.white);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...C.purpleBorder);
  doc.setLineWidth(0.5);
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'D');

  doc.setFillColor(...C.purpleBg);
  doc.roundedRect(c3X, y, cardW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...C.purple);
  doc.text('TIER 3: CONNECTED Rx', c3X + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.slate700);
  doc.text('How the Rx Flows (Fulfillment)', c3X + 4, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...C.purple);
  doc.text('Rs 24,999', c3X + 4, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('/ yr  (Rs 2,499/mo)', c3X + 28, y + 20.5);

  let by3 = y + 27;
  const t3Bullets = [
    'Everything in Specialist Practice',
    'Up to 3 Doctor Seats Included',
    'Multi-Counter Queue State Machine',
    'In-House Pharmacy FIFO Stock Sync',
    'Batch Expiry & Reorder Alarms',
    'Direct Dispense Billing Terminal',
    'Consolidated Revenue Reconciliation'
  ];
  t3Bullets.forEach(b => {
    doc.setFillColor(...C.purple);
    doc.circle(c3X + 5, by3 - 0.9, 0.7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slate900);
    doc.text(doc.splitTextToSize(b, cardW - 9), c3X + 8, by3);
    by3 += 6.5;
  });

  y += cardH + 8;

  // Section 3: The 4 Specialist Technologies (Redesigned with Zero Broken Unicode)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('3. THE 4 SPECIALIST TECHNOLOGIES (JUSTIFYING THE 2X VALUE JUMP)', marginX, y);

  y += 4;

  const gW = (contentWidth - 4) / 2;
  const gH = 32;

  const techCards = [
    {
      badge: 'TECH 01',
      title: 'Longitudinal Vitals Graphing Engine',
      sub: '6-12 Month Interactive Trendlines',
      desc: 'Plots BP (Sys/Dia), Fasting Sugar, Post-Prandial, HbA1c, and Serum Creatinine across visits. Allows doctors to visually evaluate treatment efficacy in 3 seconds.'
    },
    {
      badge: 'TECH 02',
      title: 'AI Drug-Drug Interaction (DDI) Shield',
      sub: 'Real-Time Medical Legal Protection',
      desc: 'Algorithmic contraindication detector alerting doctors to dangerous combinations (e.g. ACE inhibitors + K-sparing diuretics) and renal/hepatic drug restrictions.'
    },
    {
      badge: 'TECH 03',
      title: 'Automated Pediatric Dose Calculator',
      sub: 'Dynamic mg/kg/day Formulation Math',
      desc: 'Converts child weight into exact suspension volume (ml/dose) for antibiotic syrups (e.g. Amoxiclav mg/5ml) without mental math or dispensing ambiguity.'
    },
    {
      badge: 'TECH 04',
      title: 'Specialty Protocol & Titration Studio',
      sub: 'Multi-Regimen Complex Bundles',
      desc: '1-click templates for chronic titrations: Insulin sliding scales, step-down steroid tapers, and multi-week antibiotic regimens populated in 1 click.'
    }
  ];

  techCards.forEach((tc, idx) => {
    const gx = marginX + (idx % 2 === 0 ? 0 : gW + 4);
    const gy = y + (Math.floor(idx / 2) * (gH + 3.5));

    doc.setFillColor(...C.white);
    doc.roundedRect(gx, gy, gW, gH, 2, 2, 'F');
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.3);
    doc.roundedRect(gx, gy, gW, gH, 2, 2, 'D');

    // Category Pill Badge
    doc.setFillColor(...C.emeraldBg);
    doc.roundedRect(gx + 4, gy + 3.5, 16, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...C.emerald);
    doc.text(tc.badge, gx + 6, gy + 6.8);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.navyDark);
    doc.text(tc.title, gx + 23, gy + 6.8);

    // Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.emerald);
    doc.text(tc.sub, gx + 4, gy + 12);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(...C.slate700);
    doc.text(doc.splitTextToSize(tc.desc, gW - 8), gx + 4, gy + 16.5);
  });

  // ==========================================
  // PAGE 3: ROADMAP, ROI & DECISION MATRIX
  // ==========================================
  doc.addPage();
  drawHeader(3, 3, 'Roadmap, Unit Economics & Decision Matrix', 'Engineering Feasibility & Final PM Recommendations');

  y = 35;

  // Section 4: Engineering Feasibility Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('4. ENGINEERING EFFORT & FEASIBILITY ANALYSIS', marginX, y);

  y += 4;

  const devY = y;
  doc.setFillColor(...C.navyDark);
  doc.rect(marginX, devY, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text('MODULE', marginX + 3, devY + 4.5);
  doc.text('EXISTING CODEBASE STATUS', marginX + 50, devY + 4.5);
  doc.text('ENGINEERING EFFORT', marginX + 115, devY + 4.5);
  doc.text('TECH STACK', marginX + 152, devY + 4.5);

  const devRows = [
    ['Fast Prescribing & Habit Scoring', '100% Production Ready in Codebase', '0 Weeks (Done)', 'Fuse.js, LocalStorage'],
    ['Client-Side jsPDF & Meta Cloud API', '100% Production Ready in Codebase', '0 Weeks (Done)', 'jsPDF, Graph API v20.0'],
    ['Pharmacy FIFO & Dispensing Queue', '90% Ready (schema + routes exist)', '1 Week', 'Prisma, DispenseLog'],
    ['Longitudinal Vitals Graphing', 'Schema Ready (needs Recharts UI)', '1-2 Weeks', 'Recharts, React 18'],
    ['AI Drug Interaction (DDI) Shield', 'Concept Ready (needs DDI table)', '2 Weeks', 'Curated DDI Mapping Table'],
    ['Pediatric Dose Calculator', 'Formula Ready (needs modal UI)', '1 Week', 'Client-Side Dynamic Math']
  ];

  let drY = devY + 6.5;
  devRows.forEach((r, rIdx) => {
    const rowH = 7.5;
    if (rIdx % 2 === 1) {
      doc.setFillColor(...C.slate50);
      doc.rect(marginX, drY, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.2);
    doc.line(marginX, drY + rowH, marginX + contentWidth, drY + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.7);
    doc.setTextColor(...C.navyDark);
    doc.text(r[0], marginX + 3, drY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(r[1], marginX + 50, drY + 5);

    doc.setFont('helvetica', 'bold');
    const isDone = r[2].includes('0 Weeks');
    doc.setTextColor(isDone ? C.emerald[0] : C.primaryBlue[0], isDone ? C.emerald[1] : C.primaryBlue[1], isDone ? C.emerald[2] : C.primaryBlue[2]);
    doc.text(r[2], marginX + 115, drY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.slate500);
    doc.text(r[3], marginX + 152, drY + 5);

    drY += rowH;
  });

  y = drY + 7;

  // Section 5: Doctor Psychological ROI Proof
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('5. THE DOCTOR PSYCHOLOGICAL ROI PROOF', marginX, y);

  y += 4;

  const rW = (contentWidth - 4) / 2;
  const rH = 26;

  // Box 1
  doc.setFillColor(...C.emeraldBg);
  doc.roundedRect(marginX, y, rW, rH, 2, 2, 'F');
  doc.setDrawColor(...C.emeraldBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(marginX, y, rW, rH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...C.emerald);
  doc.text('SPECIALIST: THE 3-PATIENT RETENTION RULE', marginX + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.slate900);
  const sText = 'Specialist consultation fee in Tier-2/3 cities is Rs 500-Rs 800. Just 3 chronic patients retained per month via Day-25 refill alerts generates 3 x Rs 600 x 12 = Rs 21,600/year, fully paying for the Rs 12,999 tier with an 80%+ net cash return.';
  doc.text(doc.splitTextToSize(sText, rW - 8), marginX + 4, y + 10.5);

  // Box 2
  const r2X = marginX + rW + 4;
  doc.setFillColor(...C.purpleBg);
  doc.roundedRect(r2X, y, rW, rH, 2, 2, 'F');
  doc.setDrawColor(...C.purpleBorder);
  doc.setLineWidth(0.4);
  doc.roundedRect(r2X, y, rW, rH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...C.purple);
  doc.text('POLYCLINIC: STOCK EXPIRY LOSS ELIMINATION', r2X + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...C.slate900);
  const pText2 = 'An in-clinic pharmacy loses Rs 15,000-Rs 25,000 annually to unmonitored expired batches. Real-time FIFO inventory tracking pays for the Rs 24,999 polyclinic software purely on saved drug wastage alone.';
  doc.text(doc.splitTextToSize(pText2, rW - 8), r2X + 4, y + 10.5);

  y += rH + 7;

  // Section 6: Executive Decision Matrix Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text('6. EXECUTIVE DECISION MATRIX & FINAL RECOMMENDATION', marginX, y);

  y += 4;

  const scoreY = y;
  doc.setFillColor(...C.slate900);
  doc.rect(marginX, scoreY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text('EVALUATION CRITERIA', marginX + 3, scoreY + 4.2);
  doc.text('WEIGHT', marginX + 65, scoreY + 4.2);
  doc.text('OPTION A: WHATSAPP-CENTRIC', marginX + 90, scoreY + 4.2);
  doc.text('OPTION B: TECH HIERARCHY', marginX + 145, scoreY + 4.2);

  const scores = [
    ['Market Willingness-To-Pay (WTP)', '25%', '4.0 / 10', '9.0 / 10'],
    ['Customer Retention & LTV (Low Churn)', '20%', '5.0 / 10', '9.5 / 10'],
    ['Gross Margin Stability (>90%)', '15%', '6.0 / 10', '9.5 / 10'],
    ['Defensibility Against Competitors', '15%', '3.0 / 10', '9.0 / 10'],
    ['Sales Conversion Speed (Low Friction)', '15%', '5.0 / 10', '8.5 / 10'],
    ['Time-to-Market (Execution Feasibility)', '10%', '9.0 / 10', '7.0 / 10'],
    ['TOTAL WEIGHTED SCORE', '100%', '4.95 / 10', '8.85 / 10']
  ];

  let srY = scoreY + 6;
  scores.forEach((sc, sIdx) => {
    const isTotal = sIdx === scores.length - 1;
    const rowH = 6;
    if (isTotal) {
      doc.setFillColor(...C.emeraldBg);
      doc.rect(marginX, srY, contentWidth, rowH, 'F');
    } else if (sIdx % 2 === 1) {
      doc.setFillColor(...C.slate50);
      doc.rect(marginX, srY, contentWidth, rowH, 'F');
    }
    doc.setDrawColor(...C.slate200);
    doc.setLineWidth(0.2);
    doc.line(marginX, srY + rowH, marginX + contentWidth, srY + rowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.7);
    doc.setTextColor(isTotal ? C.emerald[0] : C.navyDark[0], isTotal ? C.emerald[1] : C.navyDark[1], isTotal ? C.emerald[2] : C.navyDark[2]);
    doc.text(sc[0], marginX + 3, srY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.text(sc[1], marginX + 65, srY + 4.2);
    doc.text(sc[2], marginX + 90, srY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.emerald);
    doc.text(sc[3], marginX + 145, srY + 4.2);

    srY += rowH;
  });

  y = srY + 6;

  // Final Recommendation Banner
  doc.setFillColor(...C.navyDark);
  doc.roundedRect(marginX, y, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(147, 197, 253);
  doc.text('EXECUTIVE PRODUCT RECOMMENDATION:', marginX + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.white);
  const recText = 'Adopt Option B (The Clinical Technology Hierarchy). Ground the brand in the "Rx" lifecycle (Creation -> Intelligence -> Fulfillment). Treat WhatsApp as the effortless delivery transport rather than the commodity product. Total engineering required is only 3-4 weeks on top of our existing production code.';
  doc.text(doc.splitTextToSize(recText, contentWidth - 8), marginX + 4, y + 9.5);

  // Save PDF across target destinations
  const repoOutputPath = path.join(__dirname, '..', 'RxNXT_Product_Strategy_WhatsApp_vs_Tech_Hierarchy.pdf');
  const brainDir = 'C:\\Users\\orugt\\.gemini\\antigravity\\brain\\a1d02c3c-4bc4-4391-8e96-23e1f327136c';
  const brainOutputPath = path.join(brainDir, 'RxNXT_Product_Strategy_WhatsApp_vs_Tech_Hierarchy.pdf');
  const desktopOutputPath = 'C:\\Users\\orugt\\Desktop\\RxNXT_Product_Strategy_WhatsApp_vs_Tech_Hierarchy.pdf';

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

  console.log('SUCCESS: Generated Clean PM Strategy PDF at:', repoOutputPath);
  console.log('File size:', fs.statSync(repoOutputPath).size, 'bytes');
}

generatePMStrategyPDF();
