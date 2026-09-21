const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4' // 297 x 210 mm
});

const W = 297;
const H = 210;

// Color Palette
const C = {
  bg: [8, 14, 30],         // Dark navy
  card: [18, 29, 52],      // Card navy
  border: [30, 48, 80],    // Subtle border
  blue: [37, 99, 235],     // Royal blue
  sky: [56, 189, 248],     // Sky blue
  emerald: [16, 185, 129], // Emerald
  mint: [110, 231, 183],   // Light mint
  purple: [139, 92, 246],  // Purple
  amber: [245, 158, 11],   // Amber
  white: [255, 255, 255],
  grayLight: [203, 213, 225],
  grayMuted: [148, 163, 184]
};

function fillBackground() {
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(0, 0, W, H, 'F');
  
  // Ambient radial glow top right
  doc.setFillColor(25, 45, 85);
  doc.circle(W - 20, 10, 60, 'F');
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.circle(W - 20, 10, 50, 'F');
}

function drawHeader(category, slideNum, title, subtitle) {
  fillBackground();

  // Top Bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
  doc.text('RxNXT CLOUD', 18, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text('•  Outpatient Clinical Operating System', 47, 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
  doc.text(category.toUpperCase(), W / 2, 15, { align: 'center' });

  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(`Slide ${slideNum} of 9`, W - 18, 15, { align: 'right' });

  // Divider
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.line(18, 18, W - 18, 18);

  // Slide Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(title, 18, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(subtitle, 18, 34);
}

function drawFooter(text = 'RxNXT Technologies • Confidential Pitch Deck for SISFS Phase 2 Seed Funding') {
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.line(18, H - 12, W - 18, H - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(text, 18, H - 7);
  doc.text('Supported by SRiX Incubator • DST Govt of India', W - 18, H - 7, { align: 'right' });
}

function drawCard(x, y, w, h, topColor = null) {
  doc.setFillColor(C.card[0], C.card[1], C.card[2]);
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  if (topColor) {
    doc.setFillColor(topColor[0], topColor[1], topColor[2]);
    doc.roundedRect(x, y, w, 2.5, 1, 1, 'F');
  }
}

// ==========================================
// SLIDE 1: COVER
// ==========================================
fillBackground();

// Badge
doc.setFillColor(16, 185, 129, 40);
doc.setDrawColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.setLineWidth(0.5);
doc.roundedRect(W / 2 - 50, 32, 100, 8, 4, 4, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('SRiX INCUBATOR • SISFS PHASE 1 VALIDATED', W / 2, 37.5, { align: 'center' });

// Main Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(36);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('RxNXT CLOUD', W / 2, 60, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(13);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Scaling Outpatient Clinical Care Across India', W / 2, 70, { align: 'center' });

doc.setFontSize(10);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text(
  'Sub-30s Digital Prescribing • Official Meta WhatsApp Patient Care • Live Government NMC License Verification',
  W / 2,
  78,
  { align: 'center' }
);

// Meta Cards
const mw = 76;
const mx = 22;
const my = 95;

// Card 1
drawCard(mx, my, mw, 36, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('PHASE 1 COMPLETED', mx + mw / 2, my + 10, { align: 'center' });
doc.setFontSize(15);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('₹7.0 Lakhs', mx + mw / 2, my + 20, { align: 'center' });
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
doc.text('SISFS Grant (PoC & Cloud Architecture)', mx + mw / 2, my + 28, { align: 'center' });

// Card 2
drawCard(mx + mw + 12, my, mw, 36, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('TARGET EXPANSION ASK', mx + mw * 1.5 + 12, my + 10, { align: 'center' });
doc.setFontSize(15);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('₹50.0 Lakhs', mx + mw * 1.5 + 12, my + 20, { align: 'center' });
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
doc.text('SISFS Phase 2 Debt / Convertible Debenture', mx + mw * 1.5 + 12, my + 28, { align: 'center' });

// Card 3
drawCard(mx + (mw + 12) * 2, my, mw, 36, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('HOST INCUBATOR', mx + mw * 2.5 + 24, my + 10, { align: 'center' });
doc.setFontSize(15);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('SRiX Incubator', mx + mw * 2.5 + 24, my + 20, { align: 'center' });
doc.setFontSize(8);
doc.setFont('helvetica', 'normal');
doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
doc.text('SR Innovation Exchange (Warangal/Hyd)', mx + mw * 2.5 + 24, my + 28, { align: 'center' });

// Presenter Box
drawCard(50, 146, W - 100, 32);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('RxNXT Technologies Private Limited • Investment Memorandum', W / 2, 155, { align: 'center' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Contact: Founders & Core Product Team | Warangal & Hyderabad, Telangana', W / 2, 163, { align: 'center' });
doc.text('Live Production Environment: https://rxnxt-app.vercel.app (Supabase Mumbai + Meta Cloud API)', W / 2, 170, { align: 'center' });

drawFooter();

// ==========================================
// SLIDE 2: THE PROBLEM
// ==========================================
doc.addPage();
drawHeader(
  '1. Market Problem & Pain Points',
  '02',
  'The Critical Bottlenecks Crippling Indian Outpatient Clinics',
  '80%+ of India\'s 1.3M+ doctors run standalone OPD practices burdened by administrative friction and patient drop-off.'
);

const colW3 = (W - 36 - 16) / 3;
const pY = 44;

// Col 1
drawCard(18, pY, colW3, 138, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
doc.text('⏱️ Clinical Documentation', 25, pY + 12);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Doctors spend 3 to 5 minutes per patient typing into clunky software or scribbling on paper.', 25, pY + 20, { maxWidth: colW3 - 14 });

const b1 = [
  'Doctor fatigue during peak 50+ patient footfall hours.',
  'Unreadable handwriting causes dangerous pharmacy dispensing errors.',
  'Existing EMRs are bulky enterprise clones that doctors abandon within 2 weeks.',
  'Zero standard dosage autofill for Indian generic and brand medicines.'
];
let b1Y = pY + 40;
b1.forEach(pt => {
  doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
  doc.text('•', 25, b1Y);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(pt, 30, b1Y, { maxWidth: colW3 - 20 });
  b1Y += 22;
});

// Col 2
drawCard(18 + colW3 + 8, pY, colW3, 138, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('📉 Patient Non-Adherence', 25 + colW3 + 8, pY + 12);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Over 45% of patients forget medication schedules or abandon courses midway.', 25 + colW3 + 8, pY + 20, { maxWidth: colW3 - 14 });

const b2 = [
  'Paper slips get torn, lost, or ruined within 48 hours of consultation.',
  'Patients forget critical food timing (Before food vs. After dinner).',
  'Chronic diabetes/hypertension patients miss monthly refill dates.',
  'Clinics lose patient follow-up revenue because there is zero digital tracking.'
];
let b2Y = pY + 40;
b2.forEach(pt => {
  doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
  doc.text('•', 25 + colW3 + 8, b2Y);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(pt, 30 + colW3 + 8, b2Y, { maxWidth: colW3 - 20 });
  b2Y += 22;
});

// Col 3
drawCard(18 + (colW3 + 8) * 2, pY, colW3, 138, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('⚠️ Regulatory Liability', 25 + (colW3 + 8) * 2, pY + 12);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Unverified prescribing and telemedicine fraud expose clinics to severe legal action.', 25 + (colW3 + 8) * 2, pY + 20, { maxWidth: colW3 - 14 });

const b3 = [
  'NMC and Indian Medical Council enforcing strict doctor identity rules.',
  'No real-time license verification exists in existing prescription apps.',
  'Unqualified staff or quacks prescribing restricted Schedule X medications.',
  'Lack of digital tamper-proof signatures creates massive legal vulnerability.'
];
let b3Y = pY + 40;
b3.forEach(pt => {
  doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
  doc.text('•', 25 + (colW3 + 8) * 2, b3Y);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(pt, 30 + (colW3 + 8) * 2, b3Y, { maxWidth: colW3 - 20 });
  b3Y += 22;
});

drawFooter();

// ==========================================
// SLIDE 3: THE SOLUTION & MOATS
// ==========================================
doc.addPage();
drawHeader(
  '2. Proprietary Solution & Moats',
  '03',
  'RxNXT: The High-Speed Outpatient Clinical Operating System',
  'Designed specifically for Indian doctors: prescribed in under 30 seconds, delivered on WhatsApp, fully regulatory-gated.'
);

const colW2 = (W - 36 - 12) / 2;
const sY = 44;

// Block 1
drawCard(18, sY, colW2, 66, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('⚡ Sub-30s Prescribing Workflow', 25, sY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Additive Scoring Search: Alias match (+100 pts), doctor habit (+50 pts), clinic fav (+20 pts).', 25, sY + 18);
doc.text('• 1-Click Quick Chips: Frequency (1-0-1), Duration (5d), Food (After meals) in 1 tap.', 25, sY + 26);
doc.text('• Protocol Packs: Load full complex treatment templates (e.g. "Viral Fever") in 1 click.', 25, sY + 34);
doc.text('• 1-Click Cloning: Clone previous visits for chronic returning patients in under 2 seconds.', 25, sY + 42);
doc.text('• Restricted Drug Shield: Built-in safety blocks for narcotics and Schedule X drugs.', 25, sY + 50);

// Block 2
drawCard(18 + colW2 + 12, sY, colW2, 66, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('💬 Direct Meta WhatsApp Cloud API (v20.0)', 25 + colW2 + 12, sY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Zero Third-Party Aggregators: Direct official Graph API v20.0 (no Twilio, no Render).', 25 + colW2 + 12, sY + 18);
doc.text('• Official Document Delivery: Prescription PDF uploaded directly to Meta /media endpoint.', 25 + colW2 + 12, sY + 26);
doc.text('• Smart Slot Dose Alerts: Automated 3-slot nudges (8:00 AM, 1:00 PM, 8:30 PM IST).', 25 + colW2 + 12, sY + 34);
doc.text('• Chronic Care Refill Alerts: Proactive Day-25 refill reminders for hypertension & diabetes.', 25 + colW2 + 12, sY + 42);
doc.text('• Direct Cost Savings: Meta base rate ~₹0.13/msg vs. ₹0.75+ on third-party aggregators.', 25 + colW2 + 12, sY + 50);

// Block 3
drawCard(18, sY + 72, colW2, 66, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('🛡️ Live Government NMC Verification (~0.4s)', 25, sY + 82);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Direct National Medical Commission REST API covering all 24+ Indian State Councils.', 25, sY + 90);
doc.text('• Mandatory Onboarding Gate: Workspace creation blocked until government license verified.', 25, sY + 98);
doc.text('• Auto-Lock Profile: Doctor\'s registered name, degrees (MBBS/MD) locked from govt data.', 25, sY + 106);
doc.text('• Tamper-Proof Digital Signature: Embedded in all generated prescription PDFs.', 25, sY + 114);
doc.text('• Zero-Cost API: Zero verification API charges, maintaining high SaaS gross margins.', 25, sY + 122);

// Block 4
drawCard(18 + colW2 + 12, sY + 72, colW2, 66, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
doc.text('📄 Client-Side PDF Engine (Zero Server CPU)', 25 + colW2 + 12, sY + 82);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• 100% Client-Side Compilation: Prescriptions render in the doctor\'s browser via jsPDF.', 25 + colW2 + 12, sY + 90);
doc.text('• Zero Server Compute Overhead: Eliminates headless Chrome/Puppeteer ($50-$100/mo).', 25 + colW2 + 12, sY + 98);
doc.text('• Infinite Horizontal Scalability: 5,000 doctors generating PDFs consumes 0% server CPU.', 25 + colW2 + 12, sY + 106);
doc.text('• Professional Letterhead: Automated clinic logo, registration credentials, and signature.', 25 + colW2 + 12, sY + 114);
doc.text('• Sub-500ms PDF generation for seamless, instantaneous printing or WhatsApp dispatch.', 25 + colW2 + 12, sY + 122);

drawFooter();

// ==========================================
// SLIDE 4: PHASE 1 MILESTONES DELIVERED
// ==========================================
doc.addPage();
drawHeader(
  '3. Phase 1 (₹7L) Execution Proof',
  '04',
  '100% Delivery of Phase 1 Grant Objectives',
  'How the ₹7.0 Lakhs SISFS grant was deployed to take RxNXT from prototype to production cloud.'
);

// 4 Stats
const sW = (W - 36 - 24) / 4;
const stY = 44;

function drawStat(x, y, val, label, color) {
  doc.setFillColor(C.card[0], C.card[1], C.card[2]);
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.roundedRect(x, y, sW, 24, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(val, x + sW / 2, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(label, x + sW / 2, y + 18, { align: 'center' });
}

drawStat(18, stY, '100% Cloud', 'Supabase Mumbai PostgreSQL', C.sky);
drawStat(18 + sW + 8, stY, '~0.4s', 'Live NMC Verification Speed', C.emerald);
drawStat(18 + (sW + 8) * 2, stY, '< 30s', 'Average Prescribing Time', C.emerald);
drawStat(18 + (sW + 8) * 3, stY, 'v20.0', 'Official Meta WhatsApp API', C.sky);

// Milestone Table
const tY = 74;
doc.setFillColor(C.card[0], C.card[1], C.card[2]);
doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
doc.roundedRect(18, tY, W - 36, 108, 3, 3, 'FD');

// Table Header
doc.setFillColor(15, 23, 42);
doc.rect(18, tY, W - 36, 12, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('PHASE 1 DELIVERABLE', 25, tY + 8);
doc.text('STATUS', 105, tY + 8);
doc.text('TECHNICAL OUTCOME & ARCHITECTURAL IMPACT', 140, tY + 8);

const rows = [
  ['PostgreSQL Cloud Migration', 'COMPLETED', 'Fully migrated from local SQLite to Supabase Mumbai (ap-south-1) with Prisma connection pooling.'],
  ['NMC Doctor Gating Engine', 'COMPLETED', 'Integrated live government registry covering NMC & all 24+ State Councils; double-enforced on server.'],
  ['Meta Cloud API Integration', 'COMPLETED', 'Direct Meta Graph API v20.0 integration; bypassed Render worker; zero cold-start delays.'],
  ['Receptionist Queue Sync', 'COMPLETED', 'Live queue connecting front desk to doctor workspace with auto-resetting registration forms.'],
  ['Mobile Progressive Web App', 'COMPLETED', 'Installable PWA manifest with thumb-friendly sticky action footer for fast smartphone prescribing.'],
  ['Prescription Quick-Chips UI', 'COMPLETED', 'Replaced slow dropdowns with 1-click pills (1-0-1, 5 days, after meals) and protocol packs.'],
  ['Unit Test Suite (34/34 passing)', 'COMPLETED', 'Full test coverage across doctor verification, drug additive search, and queue operations.']
];

let rY = tY + 22;
rows.forEach((r, idx) => {
  if (idx % 2 === 1) {
    doc.setFillColor(14, 23, 44);
    doc.rect(18, rY - 7, W - 36, 13, 'F');
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(r[0], 25, rY);

  doc.setTextColor(C.emerald[0], C.emerald[1], C.emerald[2]);
  doc.text(r[1], 105, rY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(r[2], 140, rY, { maxWidth: W - 140 - 25 });

  rY += 13.5;
});

drawFooter();

// ==========================================
// SLIDE 5: UNIT ECONOMICS
// ==========================================
doc.addPage();
drawHeader(
  '4. Business Model & Unit Economics',
  '05',
  'High-Margin SaaS Architecture: 75% to 80% Software Gross Margin',
  'Priced for rapid Indian OPD adoption with near-zero marginal cost to serve each additional clinic.'
);

const uW = (W - 36 - 14) / 2;
const uY = 44;

// Left Box: Pricing Tiers
drawCard(18, uY, uW, 138, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('🏷️ Strategic 3-Tier Pricing Model', 25, uY + 12);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Designed to eliminate purchase friction for Indian private practitioners:', 25, uY + 20);

// Tier 1
doc.setFillColor(14, 25, 48);
doc.roundedRect(25, uY + 28, uW - 14, 26, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Tier 1: BYOD SaaS Only', 30, uY + 36);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('₹9,999 / year (~₹833/mo)', uW - 5, uY + 36, { align: 'right' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('For doctors using existing laptops/tablets. Unlimited PDF prescriptions, Smart Slot reminders, cloud updates, and support.', 30, uY + 43, { maxWidth: uW - 24 });

// Tier 2
doc.setFillColor(14, 25, 48);
doc.roundedRect(25, uY + 58, uW - 14, 26, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Tier 2: Hardware Bundle', 30, uY + 66);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('₹24,999 One-Time', uW - 5, uY + 66, { align: 'right' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Pre-configured 11" Android Kiosk Tablet + Desktop Stand + 1-Year SaaS subscription. Renews at ₹9,999/yr from Year 2.', 30, uY + 73, { maxWidth: uW - 24 });

// Tier 3
doc.setFillColor(14, 25, 48);
doc.roundedRect(25, uY + 88, uW - 14, 26, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Tier 3: Polyclinic Multi-Doctor', 30, uY + 96);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('₹18,000 / year', uW - 5, uY + 96, { align: 'right' });
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('For clinics with 2 to 4 doctors. Unified front desk receptionist, multi-queue routing, and consolidated clinic analytics.', 30, uY + 103, { maxWidth: uW - 24 });

// Pitch Callout
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
doc.text('💡 The "2-Patient" Psychological Hook:', 25, uY + 123);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('At ₹9,999/year (~₹833/month), writing just 2 to 3 consultations a month pays for the software. The remaining 500+ consultations are 100% pure profit.', 25, uY + 129, { maxWidth: uW - 14 });

// Right Box: Unit Economics Table
drawCard(18 + uW + 14, uY, uW, 138, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('💵 1 Clinic Monthly Unit Economics', 25 + uW + 14, uY + 12);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Demonstrating exceptional gross margins across a standard 20-clinic cohort:', 25 + uW + 14, uY + 20);

// Table Inside Right Box
const uTable = [
  ['Monthly SaaS Subscription (from ₹9,999/yr)', '+ ₹833 / mo', 'Revenue'],
  ['Allocated Serverless Hosting (Vercel Pro)', '- ₹60 / mo', 'Fixed Cloud'],
  ['Allocated PostgreSQL DB (Supabase Pro)', '- ₹75 / mo', 'Fixed Cloud'],
  ['Meta WhatsApp Utility API (~600 msgs @ ₹0.13)', '- ₹78 / mo', 'Variable Messaging'],
  ['Client-Side PDF Generation (jsPDF)', '₹0 / mo', 'Zero Server CPU'],
  ['NMC Doctor Verification (Direct REST)', '₹0 / mo', 'Zero Third-Party Cost'],
  ['Domain & SSL Amortization', '- ₹5 / mo', 'Infrastructure']
];

let utY = uY + 28;
uTable.forEach((row, i) => {
  doc.setFillColor(14, 25, 48);
  doc.roundedRect(25 + uW + 14, utY, uW - 14, 9.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(i === 0 ? C.mint[0] : C.white[0], i === 0 ? C.mint[1] : C.white[1], i === 0 ? C.mint[2] : C.white[2]);
  doc.text(row[0], 30 + uW + 14, utY + 6.5);
  doc.text(row[1], uW * 2 + 25, utY + 6.5, { align: 'right' });
  utY += 11;
});

// Summary Box inside Right Box
doc.setFillColor(16, 185, 129, 30);
doc.setDrawColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.setLineWidth(0.6);
doc.roundedRect(25 + uW + 14, utY + 2, uW - 14, 26, 2, 2, 'FD');

doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('NET GROSS PROFIT PER CLINIC:', 30 + uW + 14, utY + 12);
doc.setFontSize(13);
doc.text('₹615 / mo (73.8% Margin)', uW * 2 + 25, utY + 12, { align: 'right' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Annual Net Profit on 100 Clinics: ₹7,38,000 / year on pure software renewals!', 30 + uW + 14, utY + 21);

drawFooter();

// ==========================================
// SLIDE 6: CAPACITY & SCALABILITY
// ==========================================
doc.addPage();
drawHeader(
  '5. Technical Capacity & Ceilings',
  '06',
  'Architectural Scalability: Validated up to 100 Clinics / 300 Doctors',
  'How our zero-bloat serverless design prevents performance degradation as the customer base scales.'
);

const capW = (W - 36 - 16) / 3;
const capY = 44;

drawCard(18, capY, capW, 80, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('📄 Prescription PDF Engine', 25, capY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Capacity: Virtually Unlimited (∞)', 25, capY + 18);
doc.text('• Why: Client-side jsPDF renders in browser DOM.', 25, capY + 26);
doc.text('• Server Impact: 0% Server CPU / RAM consumption.', 25, capY + 34);
doc.text('• Scaling Cost: ₹0 marginal cost at 50,000 PDFs/day.', 25, capY + 42);
doc.text('• Resilience: Zero server crashes during clinic rushes.', 25, capY + 50);

drawCard(18 + capW + 8, capY, capW, 80, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('🐘 PostgreSQL Relational Store', 25 + capW + 8, capY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Capacity: 3.5 Million Complete Prescriptions.', 25 + capW + 8, capY + 18);
doc.text('• Data Size: ~2.5 KB to 3 KB per complete consultation.', 25 + capW + 8, capY + 26);
doc.text('• Supabase Pro: 8 GB disk included; auto-scalable.', 25 + capW + 8, capY + 34);
doc.text('• Connection Pooling: Supavisor pooler in Mumbai.', 25 + capW + 8, capY + 42);
doc.text('• Daily Backups & Point-in-Time Recovery active.', 25 + capW + 8, capY + 50);

drawCard(18 + (capW + 8) * 2, capY, capW, 80, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('💬 Meta WhatsApp Pipeline', 25 + (capW + 8) * 2, capY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Tier 1: 1,000 unique patients / rolling 24h.', 25 + (capW + 8) * 2, capY + 18);
doc.text('• Tier 2: 10,000 unique patients / 24h (auto-upgrade).', 25 + (capW + 8) * 2, capY + 26);
doc.text('• Concurrency: Throttled to 10 concurrent requests.', 25 + (capW + 8) * 2, capY + 34);
doc.text('• Atomic Queue: FOR UPDATE SKIP LOCKED in DB.', 25 + (capW + 8) * 2, capY + 42);
doc.text('• Zero duplicate or missed dose reminders.', 25 + (capW + 8) * 2, capY + 50);

// Upgrade Roadmap Bar
const upY = 132;
drawCard(18, upY, W - 36, 50, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
doc.text('🚀 The Low-Cost Scaling Path from 100 to 1,000+ Clinics', 25, upY + 10);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('1. Drug Search Cache: Caching the global drug catalog in Redis (Upstash) avoids database hits during doctor keystrokes (cost: $10/mo).', 25, upY + 18);
doc.text('2. Reminder Queue Fan-Out: Offloading 8:00 AM bursts to serverless queue workers (Upstash QStash) enables 50,000 simultaneous nudges.', 25, upY + 26);
doc.text('3. Multi-Clinic Phone ID Mapping: Large polyclinics can send from their own verified WhatsApp Business Number IDs seamlessly.', 25, upY + 34);
doc.text('Result: The platform can comfortably scale to 1,000+ clinics across South India with under ₹25,000/month in total cloud expense.', 25, upY + 42);

drawFooter();

// ==========================================
// SLIDE 7: USE OF FUNDS (₹50L)
// ==========================================
doc.addPage();
drawHeader(
  '6. Capital Allocation & Runway',
  '07',
  'Deployment of the ₹50 Lakhs Seed Expansion Capital',
  'An 18-month commercial runway focused on clinic acquisition across Telangana and Andhra Pradesh.'
);

const fundW = (W - 36 - 24) / 4;
const fundY = 44;

function drawFundCard(x, y, pct, amount, title, items, color) {
  drawCard(x, y, fundW, 100, color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(amount, x + 10, y + 12);
  doc.setFontSize(8.5);
  doc.text(`${pct} • ${title}`, x + 10, y + 19);

  let itemY = y + 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  items.forEach(it => {
    doc.text('✔ ' + it, x + 10, itemY, { maxWidth: fundW - 16 });
    itemY += 15;
  });
}

drawFundCard(
  18,
  fundY,
  '40%',
  '₹20.0 L',
  'Clinical Sales & Onboarding',
  [
    '2 field sales reps in Hyderabad & Warangal.',
    'Onboard 150-200 paying clinics.',
    'Doctor CME events & demo tablet kiosks.',
    'Doctor referral commission structure.'
  ],
  C.blue
);

drawFundCard(
  18 + fundW + 8,
  fundY,
  '30%',
  '₹15.0 L',
  'Product & AI Expansion',
  [
    'Clinic Pharmacy stock auto-deduction.',
    'WhatsApp UPI / Razorpay payment links.',
    'AI Drug-Drug Interaction safety cross-check.',
    'Patient Mobile Health Portal (OTP).'
  ],
  C.emerald
);

drawFundCard(
  18 + (fundW + 8) * 2,
  fundY,
  '16%',
  '₹8.0 L',
  'Compliance & ABDM',
  [
    'Ayushman Bharat Digital Mission (M1/M2).',
    'Patient ABHA ID generation & record sync.',
    'ISO-27001 data security certification.',
    'HIPAA compliance audit for expansion.'
  ],
  C.purple
);

drawFundCard(
  18 + (fundW + 8) * 3,
  fundY,
  '14%',
  '₹7.0 L',
  'Runway & Operations',
  [
    '18-month serverless cloud & DB reserve.',
    'Meta Enterprise WABA volume deposits.',
    'Customer support desk & hardware buffer.',
    'Legal, accounting & incubator filing fees.'
  ],
  C.amber
);

// Target Runway Banner
const banY = 152;
drawCard(18, banY, W - 36, 30);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('🎯 Target Financial Milestone on ₹50L Runway:', 25, banY + 11);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Reach 200 Paying Clinics by Month 12 &rarr; Generating ₹20,00,000 Annual Recurring Revenue (ARR).', 25, banY + 18);
doc.setFont('helvetica', 'bold');
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Cashflow Breakeven Expected at 120 Clinics (Month 14). Series Pre-A Valuation Target: ₹12 to ₹15 Crores.', 25, banY + 25);

drawFooter();

// ==========================================
// SLIDE 8: 12-MONTH EXECUTION ROADMAP
// ==========================================
doc.addPage();
drawHeader(
  '7. Execution Milestones',
  '08',
  '12-Month Operational Milestones & Growth Trajectory',
  'Measurable quarterly execution targets from local incubator pilots to regional dominance.'
);

const qW = (W - 36 - 24) / 4;
const qY = 44;

function drawQCard(x, y, qTitle, subtitle, items, targetArr, color) {
  drawCard(x, y, qW, 138, color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(qTitle.toUpperCase(), x + 10, y + 10);
  doc.setFontSize(11);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(subtitle, x + 10, y + 18);

  let itY = y + 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  items.forEach(it => {
    doc.text('• ' + it, x + 10, itY, { maxWidth: qW - 16 });
    itY += 15;
  });

  // Target Box
  doc.setFillColor(14, 25, 48);
  doc.roundedRect(x + 8, y + 115, qW - 16, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text('QUARTER TARGET', x + qW / 2, y + 121, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(targetArr, x + qW / 2, y + 127, { align: 'center' });
}

drawQCard(
  18,
  qY,
  'Q1 • Months 1 to 3',
  'Pilot Lock-In',
  [
    'Onboard 30 active clinics across Warangal & Hyderabad.',
    'Doctor satisfaction NPS > 70 with verified 30s prescription speed.',
    'Meta Tier 2 verification (10,000 messages/day capacity).',
    'Publish Clinical Adherence Whitepaper with SRiX.'
  ],
  '30 Clinics (₹3.0L ARR)',
  C.blue
);

drawQCard(
  18 + qW + 8,
  qY,
  'Q2 • Months 4 to 6',
  'Commercial Launch',
  [
    'Expand to 75 paying clinics across Telangana OPDs.',
    'Deploy Clinic Pharmacy Inventory module.',
    'Roll out instant WhatsApp UPI consultation payments.',
    'Recruit 2 regional medical representative partners.'
  ],
  '75 Clinics (₹7.5L ARR)',
  C.emerald
);

drawQCard(
  18 + (qW + 8) * 2,
  qY,
  'Q3 • Months 7 to 9',
  'Regional Scale',
  [
    'Expand into Andhra Pradesh (Vijayawada, Vizag).',
    'Integrate ABDM M1/M2 for national health records.',
    'Deploy AI Clinical Decision Support cross-checker.',
    'Cross 100,000 monthly active patient prescriptions.'
  ],
  '130 Clinics (₹13.0L ARR)',
  C.purple
);

drawQCard(
  18 + (qW + 8) * 3,
  qY,
  'Q4 • Months 10 to 12',
  'Series Pre-A Round',
  [
    'Surpass 200 paying clinics across 6 cities.',
    'Generate ₹20.0 Lakhs in Annual Recurring Revenue.',
    'Maintain 75%+ gross margin across all deployments.',
    'Open institutional ₹2.5 Crore Series Pre-A round.'
  ],
  '200 Clinics (₹20.0L ARR)',
  C.amber
);

drawFooter();

// ==========================================
// SLIDE 9: CONCLUSION & 30-DAY PLAN
// ==========================================
doc.addPage();
drawHeader(
  '8. Action Plan & Ask',
  '09',
  'The 30-Day Sprint to Unlock the ₹50L Tranche',
  'Immediate roadmap to turn existing technological excellence into undeniable traction proof.'
);

const actW = (W - 36 - 16) / 3;
const actY = 44;

drawCard(18, actY, actW, 90, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('Step 1: Onboard 10-15 Doctors', 25, actY + 10);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('TIMELINE: DAYS 1 TO 14', 25, actY + 16);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Deploy RxNXT in 10-15 local OPD clinics.', 25, actY + 26);
doc.text('• Leverage SRiX health network & local IMA chapters.', 25, actY + 34);
doc.text('• Ensure doctors write 15-25 prescriptions/day.', 25, actY + 42);
doc.text('• Collect direct doctor feedback on prescribing speed.', 25, actY + 50);

drawCard(18 + actW + 8, actY, actW, 90, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Step 2: Extract Traction Proof', 25 + actW + 8, actY + 10);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('TIMELINE: DAYS 15 TO 22', 25 + actW + 8, actY + 16);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Query DB: Total prescriptions written (>5,000).', 25 + actW + 8, actY + 26);
doc.text('• Verify clinical speed: Documented < 32s/prescription.', 25 + actW + 8, actY + 34);
doc.text('• Meta delivery metrics: Show >94% WhatsApp reach.', 25 + actW + 8, actY + 42);
doc.text('• Record 3 short video testimonials from doctors.', 25 + actW + 8, actY + 50);

drawCard(18 + (actW + 8) * 2, actY, actW, 90, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('Step 3: Secure 3-5 Paid LOIs', 25 + (actW + 8) * 2, actY + 10);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('TIMELINE: DAYS 23 TO 30', 25 + (actW + 8) * 2, actY + 16);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Get 3-5 signed Letters of Intent or advance fees.', 25 + (actW + 8) * 2, actY + 26);
doc.text('• Present traction metrics to SRiX Investment Board.', 25 + (actW + 8) * 2, actY + 34);
doc.text('• Formally apply for SISFS Component 2 / DST Seed.', 25 + (actW + 8) * 2, actY + 42);
doc.text('• Close the ₹50 Lakhs seed expansion tranche.', 25 + (actW + 8) * 2, actY + 50);

// Investment Callout Box
const cBoxY = 142;
drawCard(18, cBoxY, W - 36, 40, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('🤝 The Investment Ask: ₹50.0 Lakhs Seed Expansion', 25, cBoxY + 10);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Seeking ₹50 Lakhs via SISFS Component 2 (Convertible Debenture / Debt) or DST NIDHI-SSS through SRiX Incubator.', 25, cBoxY + 18);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('We have completed Phase 1, proved the architecture, eliminated serverless costs, and locked in regulatory moats. We are ready to scale.', 25, cBoxY + 25);
doc.setFont('helvetica', 'bold');
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Contact: founders@rxnxt.com  •  Warangal / Hyderabad  •  SRiX Incubator Cohort', 25, cBoxY + 33);

drawFooter('RxNXT Technologies Pvt. Ltd. • Accelerating Healthcare Across India');

// ==========================================
// SAVE TO DESKTOP AND REPO
// ==========================================
const desktopPath = 'C:\\Users\\orugt\\Desktop\\RxNXT_50L_Funding_Pitch_Presentation.pdf';
const repoPath = path.join(__dirname, 'RxNXT_50L_Funding_Pitch_Presentation.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(desktopPath, Buffer.from(pdfBytes));
fs.writeFileSync(repoPath, Buffer.from(pdfBytes));

console.log('SUCCESS: Pitch Deck PDF saved to:');
console.log('1. Desktop:', desktopPath);
console.log('2. Repo:', repoPath);
console.log('Total Pages:', doc.getNumberOfPages());
console.log('File Size:', fs.statSync(desktopPath).size, 'bytes');
