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
  bg: [7, 13, 25],          // Deep Navy
  card: [19, 31, 56],       // Slate Navy Card
  border: [30, 48, 80],     // Border
  blue: [37, 99, 235],      // Royal Blue
  sky: [56, 189, 248],      // Sky Blue
  emerald: [16, 185, 129],  // Emerald
  mint: [110, 231, 183],    // Mint
  purple: [139, 92, 246],   // Purple
  amber: [245, 158, 11],    // Amber
  rose: [244, 63, 94],      // Rose
  white: [255, 255, 255],
  grayLight: [203, 213, 225],
  grayMuted: [148, 163, 184]
};

// Clean string of any non-ASCII characters that cause jsPDF WinAnsiEncoding glitches
function sanitize(str) {
  if (!str) return '';
  return String(str)
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[⚡🚀⏱️🏢🔒💊📱🎫🛋️🏛️👥💳🧠☁️🎯🇮🇳⭐]/g, '')
    .trim();
}

function fillBackground() {
  doc.setFillColor(C.bg[0], C.bg[1], C.bg[2]);
  doc.rect(0, 0, W, H, 'F');
  
  // Ambient radial circles
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
  doc.setTextColor(C.emerald[0], C.emerald[1], C.emerald[2]);
  doc.text('RxNXT CLOUD', 18, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text('-  Market Fit, Competitive Moats & Scalability Deck', 47, 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
  doc.text(sanitize(category).toUpperCase(), W / 2, 14, { align: 'center' });

  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(`Slide ${slideNum} of 10`, W - 18, 14, { align: 'right' });

  // Divider line
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.line(18, 18, W - 18, 18);

  // Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(sanitize(title), 18, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  doc.text(sanitize(subtitle), 18, 33);
}

function drawFooter(text = 'RxNXT Technologies - Market Fit & Competitive Positioning Master Deck') {
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.line(18, H - 12, W - 18, H - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(sanitize(text), 18, H - 7);
  doc.text('Benchmark: Practo Ray | HealthPlix | Eka Care | Traditional Paper', W - 18, H - 7, { align: 'right' });
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

function drawWrappedLines(text, x, y, maxWidth, lineHeight = 4.2) {
  const clean = sanitize(text);
  const lines = doc.splitTextToSize(clean, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i], x, y + i * lineHeight);
  }
  return y + lines.length * lineHeight;
}

// ==========================================
// SLIDE 1: COVER
// ==========================================
fillBackground();

// Badge
doc.setFillColor(16, 185, 129, 40);
doc.setDrawColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.setLineWidth(0.5);
doc.roundedRect(W / 2 - 65, 30, 130, 8, 4, 4, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('MARKET FIT - COMPETITIVE ADVANTAGE - PAN-INDIA SCALABILITY', W / 2, 35.5, { align: 'center' });

// Main Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(34);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('RxNXT CLOUD', W / 2, 56, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(13);
doc.setTextColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.text('Strategic Positioning, Revenue Engine & Regional Scale', W / 2, 66, { align: 'center' });

doc.setFontSize(9.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text(
  'How RxNXT Outperforms Legacy Competitors to Capture India\'s 80% Unorganized OPD Market',
  W / 2,
  74,
  { align: 'center' }
);

// 4 Strategic Pillars with generous width and precise padding
const cw = 61;
const cgap = 5.5;
const startX = 18;

const pillars = [
  {
    icon: 'SPEED',
    title: 'Sub-30s Prescribing',
    text: 'Writes complete digital prescriptions in under 30 seconds with fuzzy alias search and 1-click chips.',
    color: C.emerald
  },
  {
    icon: 'ECOSYSTEM',
    title: '4-Node Clinic Loop',
    text: 'Unifies Reception Queue, Doctor Cabin, Pharmacy Counter, and Patient WhatsApp in real time.',
    color: C.blue
  },
  {
    icon: 'RETENTION',
    title: 'Clinic Revenue Engine',
    text: 'Day 25 chronic refill alerts drive +20% repeat visits and retain in-clinic medicine sales.',
    color: C.purple
  },
  {
    icon: 'SCALE',
    title: 'Universal Indian Scale',
    text: 'Universal WhatsApp transport plus live NMC API verification across all 24+ State Councils.',
    color: C.amber
  }
];

pillars.forEach((p, idx) => {
  const px = startX + idx * (cw + cgap);
  drawCard(px, 90, cw, 74, p.color);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(p.color[0], p.color[1], p.color[2]);
  doc.text(p.icon, px + 6, 101);

  doc.setFontSize(10.5);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(p.title, px + 6, 110);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  drawWrappedLines(p.text, px + 6, 118, cw - 12, 4.2);
});

// Presentation note
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
doc.text('Supported by SRiX Incubator (DST, Govt of India) - Deployed on Vercel Edge + Supabase Mumbai', W / 2, 178, { align: 'center' });

drawFooter();

// ==========================================
// SLIDE 2: WHY 80% STILL USE PAPER
// ==========================================
doc.addPage();
drawHeader('Market Dynamics', 2, 'Why 80% of Indian Clinics Still Prescribe on Paper', 'Analyzing the fatal product flaws of legacy incumbents and how RxNXT was engineered to win.');

const colW2 = 82;
const colGap2 = 7.5;

// Trap 1
drawCard(18, 40, colW2, 98, C.rose);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Trap 1: The Prescribing Speed Bottleneck', 24, 50);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.rose[0], C.rose[1], C.rose[2]);
doc.text('COMPETITOR FAILURE (Practo, HealthPlix):', 24, 58);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let yT1 = 65;
yT1 = drawWrappedLines('- Takes 2 to 3 minutes to fill complex forms and dropdowns.', 24, yT1, colW2 - 12, 4);
yT1 = drawWrappedLines('- When 40+ patients wait outside, doctors abandon software and revert to pen & paper.', 24, yT1 + 2, colW2 - 12, 4);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('THE RxNXT FIX:', 24, yT1 + 4);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('Sub-30-second prescription engine with additive scoring and 1-click dosage chips.', 24, yT1 + 10, colW2 - 12, 4);

// Trap 2
const p2X = 18 + colW2 + colGap2;
drawCard(p2X, 40, colW2, 98, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Trap 2: The Doctor-Siloed Island', p2X + 6, 50);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
doc.text('COMPETITOR FAILURE (Eka Care):', p2X + 6, 58);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let yT2 = 65;
yT2 = drawWrappedLines('- Software focuses strictly on the doctor screen, ignoring reception chaos.', p2X + 6, yT2, colW2 - 12, 4);
yT2 = drawWrappedLines('- Disconnected from dispensary: 40% medicine sales leak to external chemists.', p2X + 6, yT2 + 2, colW2 - 12, 4);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('THE RxNXT FIX:', p2X + 6, yT2 + 4);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('Complete 4-node ecosystem synchronizing Reception, Doctor, Pharmacy & Patient.', p2X + 6, yT2 + 10, colW2 - 12, 4);

// Trap 3
const p3X = 18 + (colW2 + colGap2) * 2;
drawCard(p3X, 40, colW2, 98, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Trap 3: The Pharma Data Monetization', p3X + 6, 50);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('COMPETITOR FAILURE (HealthPlix):', p3X + 6, 58);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let yT3 = 65;
yT3 = drawWrappedLines('- Monetizes by scraping and selling aggregate doctor prescription data to pharma reps.', p3X + 6, yT3, colW2 - 12, 4);
yT3 = drawWrappedLines('- Doctors dislike commercial exploitation of clinic data and intrusive pop-ups.', p3X + 6, yT3 + 2, colW2 - 12, 4);

doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('THE RxNXT FIX:', p3X + 6, yT3 + 4);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('100% Doctor-Centric, DPDP Act 2023 compliant, sovereign multi-tenant database.', p3X + 6, yT3 + 10, colW2 - 12, 4);

// Bottom callout
drawCard(18, 144, W - 36, 38, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('THE FUNDAMENTAL MARKET INSIGHT', 24, 153);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Indian doctors don\'t want an administrative EHR burden. They want a lightning-fast digital prescription typewriter', 24, 161);
doc.text('that eliminates handwriting legal liability, organizes waiting crowds, and brings chronic patients back every month.', 24, 168);

drawFooter();

// ==========================================
// SLIDE 3: COMPETITIVE MATRIX
// ==========================================
doc.addPage();
drawHeader('Benchmarking', 3, 'Head-to-Head Competitive Scorecard', 'Direct comparison against major Indian healthcare incumbents across the 6 critical operational dimensions.');

const mRows = [
  { dim: 'Prescribing Speed', practo: 'Slow (2-3 mins)', plix: 'Medium (~45s)', eka: 'Medium (~1 min)', rxnxt: 'Sub-30 Seconds (<28s avg)' },
  { dim: 'Medicine Search', practo: 'Exact spelling only', plix: 'Standard brand search', eka: 'Standard search', rxnxt: 'Additive Scoring ("PCM" -> Dolo 650)' },
  { dim: 'WhatsApp Adherence', practo: 'SMS link to portal', plix: 'SMS / 3rd-party aggregator', eka: 'Basic PDF delivery', rxnxt: 'Meta Cloud API v20.0 + 3-Window Crons' },
  { dim: 'In-Clinic Pharmacy Sync', practo: 'None', plix: 'None', eka: 'None', rxnxt: 'Built-in Dispensing Terminal & Stock Sync' },
  { dim: 'Doctor Data Trust', practo: 'Competes (marketplace)', plix: 'Sells pharma analytics', eka: 'ABDM health locker focus', rxnxt: '100% Doctor-Sovereign (DPDP Act 2023)' },
  { dim: 'Pricing & Onboarding', practo: 'High (Rs 18K-30K/yr)', plix: 'Freemium / Pharma ads', eka: 'Freemium', rxnxt: 'Affordable SaaS (Rs 7,999-11,999/yr)' }
];

const colX = [20, 72, 116, 160, 206];
const rowH = 12;

// Table Header
doc.setFillColor(15, 26, 48);
doc.rect(18, 40, W - 36, 9, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('DIMENSION', colX[0], 46);
doc.text('PRACTO RAY', colX[1], 46);
doc.text('HEALTHPLIX', colX[2], 46);
doc.text('EKA CARE', colX[3], 46);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('RxNXT CLOUD (OURS)', colX[4], 46);

let tblY = 49;
mRows.forEach((r, idx) => {
  doc.setFillColor(idx % 2 === 0 ? 19 : 14, idx % 2 === 0 ? 31 : 23, idx % 2 === 0 ? 56 : 42);
  doc.rect(18, tblY, W - 36, rowH, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(sanitize(r.dim), colX[0], tblY + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.rose[0], C.rose[1], C.rose[2]);
  doc.text(sanitize(r.practo), colX[1], tblY + 7.5);

  doc.setTextColor(C.amber[0], C.amber[1], C.amber[2]);
  doc.text(sanitize(r.plix), colX[2], tblY + 7.5);
  doc.text(sanitize(r.eka), colX[3], tblY + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
  doc.text(sanitize(r.rxnxt), colX[4], tblY + 7.5);

  tblY += rowH;
});

// Bottom 3 Cards
const bCardW = 82;
const bCardGap = 7.5;

drawCard(18, 128, bCardW, 54, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Saves 2 Hours Every Day', 24, 138);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('By cutting prescription time to <30 seconds, doctors save 1.5 to 2 hours of clinical time every day during peak OPD rush hours.', 24, 145, bCardW - 12, 4);

drawCard(18 + bCardW + bCardGap, 128, bCardW, 54, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Direct WhatsApp Delivery', 18 + bCardW + bCardGap + 6, 138);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('Direct official Graph API v20.0 eliminates SMS drop-off. 94%+ patients open prescriptions on WhatsApp within 3 minutes.', 18 + bCardW + bCardGap + 6, 145, bCardW - 12, 4);

drawCard(18 + (bCardW + bCardGap) * 2, 128, bCardW, 54, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('In-Clinic Dispensary Sync', 18 + (bCardW + bCardGap) * 2 + 6, 138);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
drawWrappedLines('Plugs internal pharmacy leakage. Real-time stock deduction retains 40% of medicine sales that competitors ignore.', 18 + (bCardW + bCardGap) * 2 + 6, 145, bCardW - 12, 4);

drawFooter();

// ==========================================
// SLIDE 4: PRODUCT-MARKET FIT
// ==========================================
doc.addPage();
drawHeader('Product-Market Fit', 4, 'Product-Market Fit: Engineered for Indian Outpatients', 'Every single UI interaction is tailored around the speed, vernaculars, and habits of Indian practitioners.');

const s4W = 126;
drawCard(18, 40, s4W, 142, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Additive Scoring Clinical Search Engine', 24, 50);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let s4Y1 = 58;
s4Y1 = drawWrappedLines('Engineered specifically for clinical shorthand Indian doctors actually use:', 24, s4Y1, s4W - 12, 4.2);
s4Y1 += 2;
s4Y1 = drawWrappedLines('+100 Pts: Exact Clinical Alias Match', 24, s4Y1, s4W - 12, 4.2);
s4Y1 = drawWrappedLines('  - Typing "PCM" yields Paracetamol 650mg in 20ms.', 24, s4Y1, s4W - 12, 4);
s4Y1 = drawWrappedLines('  - Typing "P-Mol", "Aceclo-P" returns verified brands.', 24, s4Y1, s4W - 12, 4);
s4Y1 += 2;
s4Y1 = drawWrappedLines('+50 Pts: Doctor Prescribing Preference', 24, s4Y1, s4W - 12, 4.2);
s4Y1 = drawWrappedLines('  - Doctor\'s frequently prescribed brands automatically rise to the top.', 24, s4Y1, s4W - 12, 4);
s4Y1 += 2;
s4Y1 = drawWrappedLines('+20 Pts: Clinic Standardization', 24, s4Y1, s4W - 12, 4.2);
s4Y1 = drawWrappedLines('  - Prioritizes internal pharmacy in-stock formulary first.', 24, s4Y1, s4W - 12, 4);
s4Y1 += 2;
s4Y1 = drawWrappedLines('Low-Confidence Safeguard:', 24, s4Y1, s4W - 12, 4.2);
drawWrappedLines('  - Prevents wrong medicine selection with "Did you mean?" safety banner.', 24, s4Y1, s4W - 12, 4);

drawCard(152, 40, s4W, 142, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('1-Click Chips, Cloning & Reception Intake', 158, 50);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let s4Y2 = 58;
s4Y2 = drawWrappedLines('Zero-Typing Prescribing Chips:', 158, s4Y2, s4W - 12, 4.2);
s4Y2 = drawWrappedLines('  - Frequency: [1-0-1]  [1-1-1]  [1-0-0]  [0-0-1]  [SOS]', 158, s4Y2, s4W - 12, 4);
s4Y2 = drawWrappedLines('  - Duration: [3 Days]  [5 Days]  [7 Days]  [1 Month]', 158, s4Y2, s4W - 12, 4);
s4Y2 = drawWrappedLines('  - Timing: [After meals]  [Before food]  [At bedtime]', 158, s4Y2, s4W - 12, 4);
s4Y2 += 3;
s4Y2 = drawWrappedLines('1-Click Encounter Cloning:', 158, s4Y2, s4W - 12, 4.2);
s4Y2 = drawWrappedLines('  - For chronic returning patients, doctor clicks "Clone Prescription".', 158, s4Y2, s4W - 12, 4);
s4Y2 = drawWrappedLines('  - Populates previous medications, frequencies, and instructions in 0.2s.', 158, s4Y2, s4W - 12, 4);
s4Y2 += 3;
s4Y2 = drawWrappedLines('0.5s Rapid Reception Intake & Tokens:', 158, s4Y2, s4W - 12, 4.2);
s4Y2 = drawWrappedLines('  - Auto-resets in 0.5s for fast morning walk-in OPD crowds.', 158, s4Y2, s4W - 12, 4);
s4Y2 = drawWrappedLines('  - Issues sequential tokens with live waiting duration timers.', 158, s4Y2, s4W - 12, 4);
drawWrappedLines('  - Captures DPDP Act (2023) WhatsApp consent automatically.', 158, s4Y2, s4W - 12, 4);

drawFooter();

// ==========================================
// SLIDE 5: MONEY GENERATOR & ROI
// ==========================================
doc.addPage();
drawHeader('Revenue & ROI', 5, 'The Money Generator: Dual ROI for Doctor & RxNXT', 'A B2B healthcare SaaS must generate multiples of its subscription cost to achieve zero customer churn.');

const s5W = 126;
drawCard(18, 40, s5W, 100, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('How RxNXT Generates Money for Clinics', 24, 50);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y5A = 58;
y5A = drawWrappedLines('1. Day 25 Chronic Refill Retention (+20% OPD Revenue):', 24, y5A, s5W - 12, 4.2);
y5A = drawWrappedLines('  - Automated WhatsApp refill alert fires 5 days before chronic medications run out.', 24, y5A, s5W - 12, 4);
y5A = drawWrappedLines('  - In a 300-patient clinic, brings 40-60 extra repeat visits, generating Rs 15,000 to Rs 30,000 extra monthly consultation fees.', 24, y5A, s5W - 12, 4);
y5A += 2;
y5A = drawWrappedLines('2. Plugs In-Clinic Pharmacy Leakage:', 24, y5A, s5W - 12, 4.2);
y5A = drawWrappedLines('  - Unifies doctor cabin with dispensary counter via Unified Rx ID.', 24, y5A, s5W - 12, 4);
y5A = drawWrappedLines('  - Retains internal medicine sales that street chemists usually take.', 24, y5A, s5W - 12, 4);
y5A += 2;
y5A = drawWrappedLines('3. The "2-Patient" Psychological Barrier:', 24, y5A, s5W - 12, 4.2);
drawWrappedLines('  - At Rs 799/mo, writing just 2 prescriptions pays for the platform. Remaining 400+ visits per month are 100% pure profit.', 24, y5A, s5W - 12, 4);

drawCard(152, 40, s5W, 100, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('How RxNXT Generates High-Margin SaaS Cash', 158, 50);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y5B = 58;
y5B = drawWrappedLines('1. 70% to 75% Gross Profit Margins:', 158, y5B, s5W - 12, 4.2);
y5B = drawWrappedLines('  - Lean serverless hosting (Vercel + Supabase Mumbai) + client-side jsPDF rendering keeps infra costs under Rs 200-350/mo per clinic.', 158, y5B, s5W - 12, 4);
y5B += 2;
y5B = drawWrappedLines('2. Unshakeable Data Gravity (Near-Zero Churn):', 158, y5B, s5W - 12, 4.2);
y5B = drawWrappedLines('  - Once a clinic has 1,500 patient records, custom drug templates, and stock batches in RxNXT, switching away is extremely painful.', 158, y5B, s5W - 12, 4);
y5B += 2;
y5B = drawWrappedLines('3. Negative Working Capital:', 158, y5B, s5W - 12, 4.2);
y5B = drawWrappedLines('  - Upfront annual collections (Rs 7,999 to Rs 11,999) fund ongoing server operations from Day 1 without external debt.', 158, y5B, s5W - 12, 4);
y5B += 2;
y5B = drawWrappedLines('4. Word-of-Mouth Referral Network:', 158, y5B, s5W - 12, 4.2);
drawWrappedLines('  - Doctors actively recommend RxNXT to department colleagues and medical alumni batches.', 158, y5B, s5W - 12, 4);

// Bottom strip
drawCard(18, 146, W - 36, 36, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('FINANCIAL HIGHLIGHTS & UNIT ROI', 24, 155);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Clinic Financial ROI: 15x to 25x Annual Return on Subscription Fee.', 24, 163);
doc.text('Software Platform Gross Margin: 74.0% (Starter Tier) | 64.1% (Clinic Pro Tier) | Payback Period: Day 1 of payment.', 24, 171);

drawFooter();

// ==========================================
// SLIDE 6: POSITIVE CLIENT FEEDBACK
// ==========================================
doc.addPage();
drawHeader('Stakeholder Feedback', 6, 'Multi-Stakeholder Delight & Positive Client Feedback', 'Why Doctors, Receptionists, Patients, and Pharmacists actively champion RxNXT within the clinic.');

const stW = 61;
const stGap = 5.5;
const stX = 18;

const feedbacks = [
  {
    role: 'Doctor',
    quote: '"No hand cramps after 60 patients."',
    points: [
      'Professional prescription with digital signature and NMC seal.',
      'Prescribes in <30 seconds without cognitive fatigue.',
      '1-Click past visit cloning for repeat chronic medications.'
    ],
    color: C.blue
  },
  {
    role: 'Receptionist',
    quote: '"The waiting room is finally calm."',
    points: [
      '0.5s auto-clearing form keeps intake lines moving.',
      'Tokens stop patients from crowding the doctor\'s cabin door.',
      '70% fewer phone calls asking "When is my turn?"'
    ],
    color: C.purple
  },
  {
    role: 'Patient',
    quote: '"Prescription is safe on WhatsApp."',
    points: [
      'Instant WhatsApp PDF delivery and clean treatment summary.',
      '3-Window Smart Slot alerts tell them which pill to take at night.',
      'Zero lost prescriptions or unreadable handwriting.'
    ],
    color: C.emerald
  },
  {
    role: 'Pharmacist',
    quote: '"Zero dispensing guesswork."',
    points: [
      'Unified Rx ID pulls up exact line items immediately.',
      'Highlights batch number, expiry date, and shelf rack location.',
      'Automatic stock deduction on 1-click dispensing.'
    ],
    color: C.amber
  }
];

feedbacks.forEach((f, idx) => {
  const fx = stX + idx * (stW + stGap);
  drawCard(fx, 40, stW, 142, f.color);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(f.role, fx + 6, 50);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(f.color[0], f.color[1], f.color[2]);
  drawWrappedLines(f.quote, fx + 6, 58, stW - 12, 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
  doc.text('KEY DELIGHT FACTORS:', fx + 6, 80);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  let currY = 88;
  f.points.forEach(pt => {
    currY = drawWrappedLines(`- ${pt}`, fx + 6, currY, stW - 12, 4);
    currY += 2;
  });
});

drawFooter();

// ==========================================
// SLIDE 7: REGIONAL SCALABILITY
// ==========================================
doc.addPage();
drawHeader('Regional Scalability', 7, 'Regional Scalability: Conquering Tier 1, 2 & 3 India', 'Architected from day one to eliminate regional IT overhead and linguistic friction across India.');

const scW = 126;
drawCard(18, 40, scW, 68, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('1. Universal WhatsApp Transport (500M+ Indians)', 24, 49);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y7A = 56;
y7A = drawWrappedLines('- Zero App Store Friction: Tier 2/3 patients will not install, configure, or remember passwords for a new mobile healthcare app.', 24, y7A, scW - 12, 4);
y7A += 1.5;
y7A = drawWrappedLines('- Zero Digital Literacy Barrier: Everyone in India understands how to open WhatsApp, view an attached PDF, and read automated dose reminders.', 24, y7A, scW - 12, 4);
y7A += 1.5;
drawWrappedLines('- Official Meta Graph API v20.0 delivers 94%+ successful delivery rates across all Indian mobile operators.', 24, y7A, scW - 12, 4);

drawCard(152, 40, 127, 68, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('2. Live NMC Verification Across ALL 24+ State Councils', 158, 49);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y7B = 56;
y7B = drawWrappedLines('- Pan-India State Council Integration: TSMC, APMC, MMC, KMC, DMC, UP, Bihar, Tamil Nadu, and all Indian State Councils.', 158, y7B, scW - 12, 4);
y7B += 1.5;
y7B = drawWrappedLines('- Queries government medical council registries in ~0.4s during doctor onboarding.', 158, y7B, scW - 12, 4);
y7B += 1.5;
drawWrappedLines('- Zero physical paperwork: A doctor in Warangal, Hubli, or Nagpur can register, verify, and start prescribing in 60 seconds.', 158, y7B, scW - 12, 4);

drawCard(18, 114, scW, 68, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('3. Hardware-Agnostic BYOD Architecture', 24, 123);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y7C = 130;
y7C = drawWrappedLines('- Operates on iPads, Android tablets, or cheap Rs 15,000 laptops via Chrome and Edge.', 24, y7C, scW - 12, 4);
y7C += 1.5;
y7C = drawWrappedLines('- Installable PWA with offline service worker functions during spotty Indian clinic internet fluctuations.', 24, y7C, scW - 12, 4);
y7C += 1.5;
drawWrappedLines('- Zero On-Premise Servers: No local database setups, zero engineer site visits.', 24, y7C, scW - 12, 4);

drawCard(152, 114, 127, 68, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('4. Client-Side Rendering (Infinite Concurrency)', 158, 123);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y7D = 130;
y7D = drawWrappedLines('- Prescription PDFs render client-side in the browser DOM via jsPDF.', 158, y7D, scW - 12, 4);
y7D += 1.5;
y7D = drawWrappedLines('- 50,000 doctors prescribing simultaneously consumes ZERO server CPU power.', 158, y7D, scW - 12, 4);
y7D += 1.5;
drawWrappedLines('- Supabase Mumbai (ap-south-1) ensures sub-40ms latency across the Indian subcontinent.', 158, y7D, scW - 12, 4);

drawFooter();

// ==========================================
// SLIDE 8: 100-CLINIC FINANCIAL MODEL
// ==========================================
doc.addPage();
drawHeader('Scale Economics', 8, '100-Clinic Cohort Financial Model & Cash Generation', 'Demonstrating rapid path to cash flow positivity and massive Year 2 renewal margins.');

const plW = 82;
const plGap = 7.5;

drawCard(18, 40, plW, 96, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Starter (Solo Doctor)', 24, 50);
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Rs 7,999 / year', 24, 59);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y8A = 66;
y8A = drawWrappedLines('- For single practitioners (BYOD)', 24, y8A, plW - 12, 4);
y8A = drawWrappedLines('- Incurred Cost: Rs 2,079 / yr', 24, y8A, plW - 12, 4);
y8A = drawWrappedLines('- Net Profit: Rs 5,920 / clinic', 24, y8A, plW - 12, 4);
y8A = drawWrappedLines('- Gross Profit Margin: 74.0%', 24, y8A, plW - 12, 4);
drawWrappedLines('- Max WhatsApp Quota: 750 msgs/mo', 24, y8A, plW - 12, 4);

drawCard(18 + plW + plGap, 40, plW, 96, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Pro (Clinic + Pharmacy)', 18 + plW + plGap + 6, 50);
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('Rs 11,999 / year', 18 + plW + plGap + 6, 59);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y8B = 66;
y8B = drawWrappedLines('- Hero Tier: Doctor + Desk + Pharmacy', 18 + plW + plGap + 6, y8B, plW - 12, 4);
y8B = drawWrappedLines('- Incurred Cost: Rs 4,303 / yr', 18 + plW + plGap + 6, y8B, plW - 12, 4);
y8B = drawWrappedLines('- Net Profit: Rs 7,696 / clinic', 18 + plW + plGap + 6, y8B, plW - 12, 4);
y8B = drawWrappedLines('- Gross Profit Margin: 64.1%', 18 + plW + plGap + 6, y8B, plW - 12, 4);
drawWrappedLines('- Max WhatsApp Quota: 2,000 msgs/mo', 18 + plW + plGap + 6, y8B, plW - 12, 4);

drawCard(18 + (plW + plGap) * 2, 40, plW, 96, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Polyclinic / Group', 18 + (plW + plGap) * 2 + 6, 50);
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('Rs 19,999 / year', 18 + (plW + plGap) * 2 + 6, 59);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y8C = 66;
y8C = drawWrappedLines('- 2-4 Doctors Group Practice', 18 + (plW + plGap) * 2 + 6, y8C, plW - 12, 4);
y8C = drawWrappedLines('- Incurred Cost: Rs 8,932 / yr', 18 + (plW + plGap) * 2 + 6, y8C, plW - 12, 4);
y8C = drawWrappedLines('- Net Profit: Rs 11,067 / clinic', 18 + (plW + plGap) * 2 + 6, y8C, plW - 12, 4);
y8C = drawWrappedLines('- Gross Profit Margin: 55.3%', 18 + (plW + plGap) * 2 + 6, y8C, plW - 12, 4);
drawWrappedLines('- Max WhatsApp Quota: 4,500 msgs/mo', 18 + (plW + plGap) * 2 + 6, y8C, plW - 12, 4);

// 100-Clinic Cohort
drawCard(18, 142, W - 36, 40, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('100-CLINIC COHORT ANNUAL CASH GENERATION (YEAR 1)', 24, 151);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('Gross Subscription Revenue: Rs 14,49,900   |   Infrastructure & WhatsApp Costs: -Rs 5,10,000   |   Year 1 Net Profit: Rs 9,39,900 (64.8%)', 24, 159);
doc.text('Year 2 Renewal Run-Rate: Rs 9,99,900 / year recurring at ~95% Net Profit Margin!', 24, 167);

drawFooter();

// ==========================================
// SLIDE 9: STRATEGIC ROADMAP
// ==========================================
doc.addPage();
drawHeader('Expansion Vectors', 9, 'Strategic Roadmap: Deepening Moats & Revenue Expansion', 'Horizontal and vertical expansion modules to transform from an OPD EMR to an end-to-end Clinical OS.');

const rW = 126;
drawCard(18, 40, rW, 68, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('1. AI Clinical Decision Support (CDSS)', 24, 49);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y9A = 56;
y9A = drawWrappedLines('- Drug-Drug Interaction (DDI) alert engine warns doctors in real time of severe contraindications.', 24, y9A, rW - 12, 4);
y9A += 1.5;
y9A = drawWrappedLines('- Pediatric and geriatric dosage sanity checks based on patient age and body weight.', 24, y9A, rW - 12, 4);
y9A += 1.5;
drawWrappedLines('- Generic cost-saving switcher: recommends bioequivalent cheaper brands to build patient trust.', 24, y9A, rW - 12, 4);

drawCard(152, 40, 127, 68, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('2. Integrated OPD Billing & Dynamic UPI', 158, 49);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y9B = 56;
y9B = drawWrappedLines('- Unified Checkout: Consultation fee + lab + pharmacy bill in one invoice at reception desk.', 158, y9B, rW - 12, 4);
y9B += 1.5;
y9B = drawWrappedLines('- Dynamic UPI QR codes printed directly on prescriptions and dispatched via WhatsApp with exact amount.', 158, y9B, rW - 12, 4);
y9B += 1.5;
drawWrappedLines('- Daily cash register reconciliation reports and financial audit logs for clinic owners.', 158, y9B, rW - 12, 4);

drawCard(18, 114, rW, 68, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('3. Zero-Install Patient Web Portal', 24, 123);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y9C = 130;
y9C = drawWrappedLines('- Lightweight OTP login on mobile browser without requiring any mobile app store downloads.', 24, y9C, rW - 12, 4);
y9C += 1.5;
y9C = drawWrappedLines('- Longitudinal Health Timeline: View historical prescription PDFs, diagnosis trends, and vitals history.', 24, y9C, rW - 12, 4);
y9C += 1.5;
drawWrappedLines('- Interactive dose tracking check-in where patients tap "Dose Taken", giving doctors real adherence data.', 24, y9C, rW - 12, 4);

drawCard(152, 114, 127, 68, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('4. Permanent Cloud Archival & AWS S3', 158, 123);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y9D = 130;
y9D = drawWrappedLines('- Encrypted long-term prescription PDF storage on AWS S3 or Supabase Storage buckets.', 158, y9D, rW - 12, 4);
y9D += 1.5;
y9D = drawWrappedLines('- SHA-256 cryptographic tamper verification for legal validity and medicolegal audit readiness.', 158, y9D, rW - 12, 4);
y9D += 1.5;
drawWrappedLines('- Time-limited signed URLs for insurance reimbursements and clinical audits.', 158, y9D, rW - 12, 4);

drawFooter();

// ==========================================
// SLIDE 10: CONCLUSION & SUMMARY
// ==========================================
doc.addPage();
fillBackground();

// Badge
doc.setFillColor(16, 185, 129, 40);
doc.setDrawColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.setLineWidth(0.5);
doc.roundedRect(W / 2 - 50, 28, 100, 8, 4, 4, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('READY FOR PAN-INDIA ADOPTION', W / 2, 33.5, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(28);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Why RxNXT Wins the Market', W / 2, 54, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(10.5);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Speed + WhatsApp Retention + Pharmacy Sync + Zero On-Premise Overhead', W / 2, 63, { align: 'center' });

const cpW = 82;
const cpGap = 7.5;

drawCard(18, 76, cpW, 94, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('The Core Moat', 24, 87);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('Doctor Speed & Trust', 24, 94);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y10A = 102;
y10A = drawWrappedLines('- Prescribes in <30 seconds with 1-click dosage chips.', 24, y10A, cpW - 12, 4);
y10A = drawWrappedLines('- Zero pharma data scraping: 100% doctor-sovereign database.', 24, y10A, cpW - 12, 4);
drawWrappedLines('- Builds unshakeable doctor loyalty from Day 1.', 24, y10A, cpW - 12, 4);

drawCard(18 + cpW + cpGap, 76, cpW, 94, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('The Retention Loop', 18 + cpW + cpGap + 6, 87);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('WhatsApp Patient Care', 18 + cpW + cpGap + 6, 94);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y10B = 102;
y10B = drawWrappedLines('- 3-Window Smart Slot dose nudges directly on WhatsApp.', 18 + cpW + cpGap + 6, y10B, cpW - 12, 4);
y10B = drawWrappedLines('- Day 25 chronic refill alerts drive +20% repeat visits.', 18 + cpW + cpGap + 6, y10B, cpW - 12, 4);
drawWrappedLines('- Retains internal clinic pharmacy sales.', 18 + cpW + cpGap + 6, y10B, cpW - 12, 4);

drawCard(18 + (cpW + cpGap) * 2, 76, cpW, 94, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10.5);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('The Business Model', 18 + (cpW + cpGap) * 2 + 6, 87);
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('70%+ Software Margins', 18 + (cpW + cpGap) * 2 + 6, 94);
doc.setFont('helvetica', 'normal');
doc.setFontSize(7.8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
let y10C = 102;
y10C = drawWrappedLines('- Lean serverless architecture keeps infra under Rs 350/mo.', 18 + (cpW + cpGap) * 2 + 6, y10C, cpW - 12, 4);
y10C = drawWrappedLines('- Upfront annual subscription cash creates negative working capital.', 18 + (cpW + cpGap) * 2 + 6, y10C, cpW - 12, 4);
drawWrappedLines('- Immediate Day 1 payback with compounding renewal profit.', 18 + (cpW + cpGap) * 2 + 6, y10C, cpW - 12, 4);

drawFooter('RxNXT Technologies Pvt. Ltd. - Hyderabad & Warangal - Supported by SRiX Incubator (DST)');

// Save PDF
const outputPath = path.join(__dirname, 'RxNXT_Market_Fit_and_Competitive_Deck.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
console.log(`SUCCESS: Perfectly formatted PDF generated at: ${outputPath}`);
