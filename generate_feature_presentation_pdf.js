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

// Color Palette matching our UI theme
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

function drawWrappedLines(text, x, y, maxWidth, lineHeight = 4.2) {
  const clean = sanitize(text);
  const lines = doc.splitTextToSize(clean, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i], x, y + i * lineHeight);
  }
  return y + lines.length * lineHeight;
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
  doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
  doc.text('RxNXT CLOUD', 18, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text('-  Intelligent Outpatient Operating System', 47, 14);

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

function drawFooter(text = 'ORUG Technologies - Outpatient Clinical Architecture & Feature Deck') {
  doc.setDrawColor(C.border[0], C.border[1], C.border[2]);
  doc.setLineWidth(0.4);
  doc.line(18, H - 12, W - 18, H - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(C.grayMuted[0], C.grayMuted[1], C.grayMuted[2]);
  doc.text(sanitize(text), 18, H - 7);
  doc.text('RxNXT Cloud Platform - Vercel Edge + Supabase Mumbai', W - 18, H - 7, { align: 'right' });
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
doc.roundedRect(W / 2 - 60, 32, 120, 8, 4, 4, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('PRODUCTION DEPLOYED • SUB-30S PRESCRIBING • META WHATSAPP CARE', W / 2, 37.5, { align: 'center' });

// Main Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(36);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('RxNXT CLOUD', W / 2, 60, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(13);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Intelligent Outpatient Operating System & Feature Master Deck', W / 2, 70, { align: 'center' });

doc.setFontSize(10);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text(
  'A Unified Clinical Command Center for Doctors, Receptionists, Patients & In-Clinic Pharmacies',
  W / 2,
  78,
  { align: 'center' }
);

// 4 Feature Pillars
const cw = 60;
const gap = 6;
const startX = (W - (4 * cw + 3 * gap)) / 2;

const pillars = [
  { icon: 'DOCTOR', title: 'Doctor Workspace', text: 'Sub-30s prescribing, additive fuzzy search, 1-click dosage chips & cloning.', color: C.blue },
  { icon: 'WHATSAPP', title: 'WhatsApp Care', text: 'Meta Cloud API v20.0 with 3-window Smart Slots & Day 25 chronic refill alerts.', color: C.emerald },
  { icon: 'QUEUE', title: 'Queue & DPDP', text: '0.5s rapid registration auto-reset, sequential tokens, and DPDP 2023 compliance.', color: C.purple },
  { icon: 'PHARMACY', title: 'Pharmacy Counter', text: 'Unified Rx ID workflow, real-time stock deduction, batch/expiry controls & receipt logs.', color: C.amber }
];

pillars.forEach((p, idx) => {
  const px = startX + idx * (cw + gap);
  drawCard(px, 94, cw, 68, p.color);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(p.color[0], p.color[1], p.color[2]);
  doc.text(p.icon, px + 6, 104);

  doc.setFontSize(11);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(p.title, px + 6, 114);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  drawWrappedLines(p.text, px + 6, 120, cw - 12, 4.2);
});

drawFooter();

// ==========================================
// SLIDE 2: VALUE MATRIX
// ==========================================
doc.addPage();
drawHeader('Value Proposition', 2, 'Clinical Pain Points & Stakeholder Value Matrix', 'Unifying the 4 critical OPD touchpoints to eliminate friction, errors, and revenue leakage.');

const vColW = 61;
const vStartX = 18;

const actors = [
  {
    role: 'Doctor',
    friction: 'Slow paper writing, illegible handwriting risks, non-compliant follow-ups.',
    solution: ['Sub-30s prescribing engine with 1-click chips', 'MCI registration badge & digital signature', '1-click repeat prescription cloning', '85% time savings per patient'],
    color: C.blue
  },
  {
    role: 'Receptionist',
    friction: 'Waiting room congestion, manual tokens, slow patient data intake.',
    solution: ['0.5s auto-clearing registration interface', 'Sequential live tokens with waiting timers', 'DPDP Act 2023 WhatsApp consent logging', '70% drop in front-desk chaos'],
    color: C.purple
  },
  {
    role: 'Patient',
    friction: 'Lost paper prescriptions, forgotten dose hours, missed chronic refills.',
    solution: ['Instant WhatsApp PDF delivery + summary', '3-Window Smart Slot dose nudges (IST)', 'Day 25 chronic refill care alert', '3x higher medication adherence'],
    color: C.emerald
  },
  {
    role: 'Pharmacist',
    friction: 'Unreadable handwriting, fake/reused scripts, inventory mismatch.',
    solution: ['Unified Rx ID lookup directly from screen', 'Batch, expiry date & rack location tracking', 'Automatic real-time stock deduction', '0 dispensing errors, live stock audit'],
    color: C.amber
  }
];

actors.forEach((act, i) => {
  const x = vStartX + i * (vColW + 5);
  drawCard(x, 42, vColW, 140, act.color);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(C.white[0], C.white[1], C.white[2]);
  doc.text(act.role, x + 6, 52);

  doc.setFontSize(7.5);
  doc.setTextColor(C.rose[0], C.rose[1], C.rose[2]);
  doc.text('FRICTION SOLVED:', x + 6, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  let splitFric = doc.splitTextToSize(act.friction, vColW - 12);
  doc.text(splitFric, x + 6, 66);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
  doc.text('KEY DELIVERABLES:', x + 6, 90);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
  let currY = 97;
  act.solution.forEach(pt => {
    let bullet = doc.splitTextToSize(`• ${pt}`, vColW - 12);
    doc.text(bullet, x + 6, currY);
    currY += 10;
  });
});
drawFooter();

// ==========================================
// SLIDE 3: ARCHITECTURE & TECH STACK
// ==========================================
doc.addPage();
drawHeader('Technical Architecture', 3, 'High-Performance Multi-Tenant Cloud Architecture', 'Built for zero server cold starts, rock-solid security isolation, and sub-100ms response times.');

const aW = 83;
drawCard(18, 42, aW, 100, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Frontend & PWA Edge', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Framework: Next.js 14 App Router',
  '• Language: Full TypeScript type-safety',
  '• Design System: Tailwind CSS + Radix UI',
  '• Mobile Experience: Touch swipe gestures, thumb navigation',
  '• PWA: Service worker offline caching & install banner'
], 24, 62);

drawCard(107, 42, aW, 100, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('PostgreSQL & Multi-Tenancy', 113, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Host: Supabase Mumbai Cloud (ap-south-1)',
  '• ORM: Prisma ORM with connection pooling',
  '• Auth: NextAuth.js JWT session strategy',
  '• Isolation: clinicId scoped boundary on all tables',
  '• Security: Passwords hashed with bcryptjs'
], 113, 62);

drawCard(196, 42, aW, 100, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('PDF & Meta Cloud Gateway', 202, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• PDF Engine: jsPDF rendered client-side in DOM',
  '• Zero Server Lag: 0 server CPU load for PDF generation',
  '• WhatsApp Gateway: Meta Graph API v20.0 direct',
  '• Zero Cold Starts: No external Twilio/microservice lag',
  '• Document Upload: Direct base64 PDF upload to Meta'
], 202, 62);

// Bottom strip
drawCard(18, 148, W - 36, 36, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('PRODUCTION LATENCY & CAPACITY METRICS', 24, 156);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Supabase Mumbai Query Latency: ~35ms    • Drug Fuzzy Search API: <40ms    • Meta WhatsApp Dispatch: Instant    • PDF Render Time: <150ms', 24, 166);
doc.text('• Multi-Clinic Security: Zero cross-tenant data leakage guaranteed via server-side session authentication.', 24, 174);

drawFooter();

// ==========================================
// SLIDE 4: DOCTOR WORKSPACE
// ==========================================
doc.addPage();
drawHeader('Doctor Prescribing Engine', 4, 'Sub-30-Second Prescription Generation', 'Combining additive clinical search, 1-click dosage chips, and historical cloning to save clinical time.');

drawCard(18, 42, 126, 142, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Additive Scoring Fuzzy Drug Search', 24, 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  'The search API (/api/drugs/search) implements a clinical additive scoring model:',
  '',
  '+100 Pts: Exact Clinical Alias Match',
  '  • Typing "PCM" short-circuits instantly to Paracetamol 650mg.',
  '',
  '+50 Pts: Doctor Prescribing Preference',
  '  • Tracks doctor prescribing frequency and ranks favorite medicines first.',
  '',
  '+20 Pts: Clinic Standardized Formulary',
  '  • Prioritizes clinic-wide featured medicine inventory.',
  '',
  '<15 Pts: Low Confidence Safeguard',
  '  • Triggers "Did you mean?" UI banner to prevent medication selection errors.'
], 24, 60);

drawCard(152, 42, 127, 142, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('1-Click Dosage Chips & Clinical Cloning', 158, 52);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  'Zero Typing Prescribing Workflow:',
  '',
  '• Frequency Chips: [1-0-1]  [1-1-1]  [1-0-0]  [0-0-1]  [SOS]',
  '• Duration Chips: [3 Days]  [5 Days]  [7 Days]  [1 Month]',
  '• Meal Instructions: [After meals]  [Before food]  [At bedtime]',
  '',
  'Clinical History Timeline & 1-Click Repeat Cloning:',
  '• Review full encounter history with prior chief complaints & diagnosis.',
  '• 1-Click "Clone Prescription" immediately populates repeat medications.',
  '',
  'Regulatory Stamps & Security:',
  '• Dynamic Unified Rx ID (#RX-### / RX-YYMMDD-###).',
  '• Embeds verified NMC doctor registration number & digital signature.'
], 158, 60);

drawFooter();

// ==========================================
// SLIDE 5: RECEPTION & QUEUE
// ==========================================
doc.addPage();
drawHeader('Queue Management', 5, 'Receptionist OPD Flow & Patient Queue System', 'Eliminating waiting room friction with sub-second form resets and real-time waiting timers.');

const qW = 83;
drawCard(18, 42, qW, 100, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('0.5s Rapid Intake Form', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Built for high-volume morning OPD queues.',
  '• Form auto-clears in 0.5s after token creation.',
  '• Rapid fields: Name, Phone, Age, Gender, Address.',
  '• Phone duplicate detection pulls past records.',
  '• Zero front-desk lag or manual form resets.'
], 24, 62);

drawCard(107, 42, qW, 100, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Live Sequential Token Queue', 113, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Issues sequential tokens: Token #14, #15, etc.',
  '• Status states: WAITING, AWAY, SKIPPED, COMPLETED.',
  '• Doctor sees real-time waiting timers ("Waiting 5m").',
  '• 1-Click consultation start directly from queue item.',
  '• Syncs between reception desk and doctor workstation.'
], 113, 62);

drawCard(196, 42, qW, 100, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('DPDP Act (2023) Compliance', 202, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Mandated WhatsApp communication consent checkbox.',
  '• Complies with India Digital Personal Data Protection Act.',
  '• Timestamped consent stored on patient profile.',
  '• Multi-tenant database prevents cross-clinic leaks.',
  '• Patient right to opt out supported.'
], 202, 62);

// Summary card
drawCard(18, 148, W - 36, 36, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('CLINICAL IMPACT & RECEPTION ROI', 24, 156);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• 70% decrease in front-desk telephone enquiries regarding waiting status.', 24, 166);
doc.text('• Eliminates loud calling of patient names, creating a calm, modern clinic atmosphere.', 24, 174);

drawFooter();

// ==========================================
// SLIDE 6: WHATSAPP PATIENT ADHERENCE
// ==========================================
doc.addPage();
drawHeader('Patient Adherence Engine', 6, 'Automated Patient Care & WhatsApp Smart-Slots', 'Continuous care loop utilizing Meta Cloud API v20.0 with 3-window daily medication nudges.');

const sW = 83;
drawCard(18, 42, sW, 95, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('🌅 8:00 AM IST — Morning Slot', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Morning doses (1-0-0, 1-0-1, 1-1-1, OD).',
  '• "Take before breakfast / with water".',
  '• Automated doctor follow-up visit reminders.',
  '• Day 25 chronic care refill briefings.'
], 24, 62);

drawCard(107, 42, sW, 95, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('☀️ 1:30 PM IST — Afternoon Slot', 113, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Afternoon doses (0-1-0, 1-1-1).',
  '• "Take after lunch with water".',
  '• Zero message spillage: strictly excludes morning',
  '  and evening-only medicines.'
], 113, 62);

drawCard(196, 42, sW, 95, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('🌙 8:30 PM IST — Night Slot', 202, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.2);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Bedtime doses (0-0-1, 1-0-1, 1-1-1, HS).',
  '• "Take after dinner / before bedtime".',
  '• Closes patient daily adherence cycle.',
  '• Prevents missed nighttime antibiotics & sedatives.'
], 202, 62);

// Bottom cards
drawCard(18, 143, 126, 42, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Zero Waste & Superseding Rules', 24, 151);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('When a doctor modifies or re-issues a prescription, all older pending reminders are marked SUPERSEDED immediately. The patient only gets clean, active messages.', 24, 160);

drawCard(152, 143, 127, 42, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Day 25 Chronic Refill Engine', 158, 151);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('For long-term prescriptions (>14 days), fires 5 days before medication ends: "5 days of medicines remaining. Contact Dr. Shanmukha at RxNXT Clinic for your monthly checkup."', 158, 160);

drawFooter();

// ==========================================
// SLIDE 7: PHARMACY COUNTER
// ==========================================
doc.addPage();
drawHeader('Dispensary Operations', 7, 'In-Clinic Pharmacy Counter & Inventory Engine', 'Connecting the doctor prescription directly to the dispensary with real-time stock deduction.');

drawCard(18, 42, 126, 95, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Unified Rx ID Dispensing Terminal', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Route: /pharmacist/dashboard',
  '• Synchronized format: #RX-### / RX-YYMMDD-###.',
  '• Pharmacist enters Rx ID or picks patient from dispensing queue.',
  '• Auto-loads prescribed medicines, forms, strengths, and units.',
  '• Prevents handwriting misinterpretation and wrong dispensing.'
], 24, 62);

drawCard(152, 42, 127, 95, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Real-Time Stock Deduction & Batches', 158, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Route: /pharmacist/inventory',
  '• 1-Click Dispense decrements current stock quantity immediately.',
  '• Tracks Batch Number, Expiry Date, Rack/Shelf Location.',
  '• Highlights low-stock medicines breaching minimum reorder levels.',
  '• Prevents out-of-stock crises and expired medicine dispensing.'
], 158, 62);

drawCard(18, 143, W - 36, 42, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('DISPENSING LOGS, PAYMENT RECORDING & CLINIC REVENUE RETENTION', 24, 151);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Records payment mode (CASH, UPI, CARD, CREDIT) and total bill amount for each dispense log.', 24, 160);
doc.text('• Tracks unit selling price (MRP) vs cost price for margin calculation and internal clinic audit trail.', 24, 168);

drawFooter();

// ==========================================
// SLIDE 8: COMPLIANCE & ADMIN
// ==========================================
doc.addPage();
drawHeader('Regulatory Compliance', 8, 'Regulatory Verification, RBAC & Multi-Tenant Control', 'Built-in National Medical Commission (NMC) verification and multi-role clinic operations.');

const rW = 83;
drawCard(18, 42, rW, 100, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Official NMC REST API', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Live verification against National Medical Commission.',
  '• Checks all 24+ State Medical Councils in ~0.4s.',
  '• Mandates verified license before workspace creation.',
  '• Double validated on server-side NextAuth endpoint.',
  '• Eradicates quackery and unauthorized access.'
], 24, 62);

drawCard(107, 42, rW, 100, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Role-Based Access (RBAC)', 113, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• doctor: Clinical workspace, patients, templates.',
  '• receptionist: Queue tokens, registration.',
  '• pharmacist: Dispensing counter, inventory.',
  '• nurse: Vital check & support workflows.',
  '• admin / superadmin: Clinic profile, billing, staff.'
], 113, 62);

drawCard(196, 42, rW, 100, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('14-Day Trial & Lockout', 202, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Automated 14-day free trial on registration.',
  '• 7-day prior renewal alert sent via Meta WhatsApp.',
  '• Grace period lockout system protects clinic data.',
  '• Non-destructive read-only archive upon expiration.',
  '• Supports Starter, Pro, and Enterprise tiers.'
], 202, 62);

drawCard(18, 148, W - 36, 36, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('CLINIC PROFILE & WHITE-LABELING CUSTOMIZATION', 24, 156);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text('• Drag-and-drop clinic logo upload • Digital signature auto-embedded on PDFs • Custom per-clinic formulary.', 24, 166);

drawFooter();

// ==========================================
// SLIDE 9: EXPANSION ROADMAP
// ==========================================
doc.addPage();
drawHeader('Strategic Roadmap', 9, 'Strategic Product Roadmap & Feature Expansions', 'Horizontal depth into Clinical Decision Support (CDSS), Integrated Billing, and Patient Self-Service.');

const rdW = 126;
drawCard(18, 42, rdW, 68, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('1. AI Clinical Decision Support (CDSS)', 24, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Drug-Drug Interaction (DDI) alert engine (e.g. Warfarin + NSAID warnings).',
  '• Pediatric & geriatric dose calculations based on age & weight.',
  '• Generic cost-saving switcher: suggests equivalent cheaper formulations.'
], 24, 60);

drawCard(152, 42, 127, 68, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('2. Integrated OPD Billing & Dynamic UPI', 158, 52);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Unified Checkout: Consultation fee + lab + pharmacy bill in one invoice.',
  '• Dynamic UPI QR codes printed on prescriptions and sent via WhatsApp.',
  '• Cash register tracking & daily financial reconciliation reports.'
], 158, 60);

drawCard(18, 116, rdW, 68, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('3. Zero-Install Patient Web Portal', 24, 126);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Lightweight phone + OTP login for patients without app install.',
  '• View past prescription PDFs, vitals trends, and appointment bookings.',
  '• Interactive adherence tracker where patients tap "Dose Taken".'
], 24, 134);

drawCard(152, 116, 127, 68, C.amber);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('4. Permanent Cloud Archival & AWS S3', 158, 126);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Long-term storage of encrypted prescription PDFs on AWS S3 / Supabase.',
  '• SHA-256 cryptographic tamper verification for legal validity.',
  '• Time-limited signed URLs for insurance and audit access.'
], 158, 134);

drawFooter();

// ==========================================
// SLIDE 10: ACTION PLAN & SUMMARY
// ==========================================
doc.addPage();
fillBackground();

// Badge
doc.setFillColor(16, 185, 129, 40);
doc.setDrawColor(C.emerald[0], C.emerald[1], C.emerald[2]);
doc.setLineWidth(0.5);
doc.roundedRect(W / 2 - 50, 32, 100, 8, 4, 4, 'FD');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('OPERATIONAL BLUEPRINT COMPLETE', W / 2, 37.5, { align: 'center' });

doc.setFont('helvetica', 'bold');
doc.setFontSize(30);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Feature Discussion & Next Steps', W / 2, 58, { align: 'center' });

doc.setFont('helvetica', 'normal');
doc.setFontSize(11);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('Recommended Priorities to Accelerate Pilot Adoption and Clinical Impact', W / 2, 68, { align: 'center' });

const spW = 83;
drawCard(18, 80, spW, 90, C.blue);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Track A: Clinical Depth', 24, 92);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.sky[0], C.sky[1], C.sky[2]);
doc.text('AI Decision Support (CDSS)', 24, 100);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Implement Drug-Drug Interaction alerts.',
  '• Add generic brand switcher.',
  '• Dosage sanity validation.',
  '',
  'Impact: Elevates clinical quality & brand trust.'
], 24, 110);

drawCard(107, 80, spW, 90, C.emerald);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Track B: Monetization', 107 + 6, 92);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.mint[0], C.mint[1], C.mint[2]);
doc.text('OPD Billing & Dynamic UPI', 107 + 6, 100);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Consultation + Pharmacy unified invoice.',
  '• Dynamic UPI QR on prescriptions.',
  '• Daily cash register reconciliation.',
  '',
  'Impact: Unlocks direct clinic revenue control.'
], 107 + 6, 110);

drawCard(196, 80, spW, 90, C.purple);
doc.setFont('helvetica', 'bold');
doc.setFontSize(11);
doc.setTextColor(C.white[0], C.white[1], C.white[2]);
doc.text('Track C: Retention', 196 + 6, 92);
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(C.purple[0], C.purple[1], C.purple[2]);
doc.text('Patient Mobile Web Portal', 196 + 6, 100);
doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(C.grayLight[0], C.grayLight[1], C.grayLight[2]);
doc.text([
  '• Mobile phone OTP authentication.',
  '• Prescription PDF archive on phone.',
  '• Interactive dose tracking check-ins.',
  '',
  'Impact: Maximizes patient compliance & returns.'
], 196 + 6, 110);

drawFooter('ORUG Technologies Pvt. Ltd. • Hyderabad & Warangal • Ready for Clinical Pilots');

// Output file
const outputPath = path.join(__dirname, 'RxNXT_Platform_Feature_Presentation.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
console.log(`✅ Presentation PDF generated successfully: ${outputPath}`);
