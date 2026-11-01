const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 210;
const pageHeight = 297;
const marginX = 14;
const contentWidth = pageWidth - (marginX * 2); // 182mm

// Professional Design Tokens
const C = {
  slate900: [15, 23, 42],
  slate800: [30, 41, 59],
  slate700: [51, 65, 85],
  slate600: [71, 85, 105],
  slate500: [100, 116, 139],
  slate400: [148, 163, 184],
  slate200: [226, 232, 240],
  slate100: [241, 245, 249],
  slate50: [248, 250, 252],
  white: [255, 255, 255],
  navyDark: [15, 23, 42],
  emerald: [5, 150, 105],
  emeraldDark: [4, 120, 87],
  emeraldBg: [240, 253, 244],
  emeraldBorder: [167, 243, 208],
  primaryBlue: [37, 99, 235],
  blueBg: [239, 246, 255],
  blueBorder: [191, 219, 254],
  purple: [124, 58, 237],
  purpleBg: [245, 243, 255],
  purpleBorder: [221, 214, 254],
  amber: [217, 119, 6],
  amberBg: [254, 243, 199]
};

function drawHeader(pageNum, totalPages, titleText, subtitleText) {
  // Top Banner
  doc.setFillColor(...C.navyDark);
  doc.rect(0, 0, pageWidth, 20, 'F');

  // Accent Line
  doc.setFillColor(...C.emerald);
  doc.rect(0, 20, pageWidth, 1.2, 'F');

  // Logo / Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text('RxNXT', marginX, 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.slate400);
  doc.text('|  FINANCIAL ARCHITECTURE & TIER EARNINGS MODEL', marginX + 22, 10.5);

  // Document Sub-Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(52, 211, 153);
  doc.text('EXECUTIVE UNIT ECONOMICS & COHORT FORECAST', pageWidth - marginX, 10.5, { align: 'right' });

  // Page Title Bar
  doc.setFillColor(...C.slate50);
  doc.rect(marginX, 24, contentWidth, 12, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.rect(marginX, 24, contentWidth, 12, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.slate900);
  doc.text(titleText, marginX + 4, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(...C.slate600);
  doc.text(subtitleText, marginX + 4, 34);

  // Footer
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.3);
  doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...C.slate500);
  doc.text('RxNXT Cloud - Confidential Tier Earnings & Revenue Model - Orug Technologies Pvt. Ltd.', marginX, pageHeight - 6.5);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, pageHeight - 6.5, { align: 'right' });
}

// ==========================================
// PAGE 1: PER-CLINIC UNIT ECONOMICS BY TIER
// ==========================================
drawHeader(1, 2, '1. PER-CLINIC EARNINGS & UNIT ECONOMICS', 'Breakdown of Subscription Revenue, Operational COGS, and Net Margins by Tier');

let y = 40;

// Executive Summary Callout
doc.setFillColor(...C.white);
doc.roundedRect(marginX, y, contentWidth, 22, 2, 2, 'F');
doc.setDrawColor(...C.slate200);
doc.setLineWidth(0.3);
doc.roundedRect(marginX, y, contentWidth, 22, 2, 2, 'D');

doc.setFillColor(...C.slate100);
doc.roundedRect(marginX, y, contentWidth, 6, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.setTextColor(...C.slate900);
doc.text('EXECUTIVE MARGIN SUMMARY: HIGH CONTRIBUTION SAAS MODEL', marginX + 4, y + 4.2);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...C.slate700);
const summaryTxt = "RxNXT operates on an asset-light cloud architecture where software delivery costs are governed strictly by WhatsApp utility message units (13 paise/msg) and serverless micro-duty cycles. Because database and compute overhead per consultation is <0.02%, RxNXT delivers exceptional net contribution margins of 70% to 75% across all three subscription tiers.";
doc.text(doc.splitTextToSize(summaryTxt, contentWidth - 8), marginX + 4, y + 9.5);

y += 26;

// 3 Metric Cards for Each Tier
const cardW = (contentWidth - 6) / 3;
const cardH = 92;

// --- CARD 1: Rx Express ---
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
doc.setFontSize(8.5);
doc.setTextColor(...C.slate900);
doc.text('TIER 1: Rx EXPRESS', c1X + 4, y + 6);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate500);
doc.text('Solo GP / Family OPDs', c1X + 4, y + 10.5);

// Big Pricing & Margin Highlight
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...C.primaryBlue);
doc.text('Rs 6,999', c1X + 4, y + 21);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate500);
doc.text('/ yr (Rs 699/mo)', c1X + 26, y + 20.5);

doc.setFillColor(...C.blueBg);
doc.roundedRect(c1X + 3, y + 25, cardW - 6, 8, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.setTextColor(...C.primaryBlue);
doc.text('NET PROFIT: Rs 5,269 / yr', c1X + 5, y + 29.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.8);
doc.text('Profit Margin: 75.3%', c1X + 5, y + 32.2);

// Cost Breakdown
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate900);
doc.text('ANNUAL COGS BREAKDOWN:', c1X + 4, y + 38);

const c1Costs = [
  ['Meta WhatsApp (9k Rx)', 'Rs 1,170'],
  ['Supabase Database', 'Rs 240'],
  ['Vercel Serverless Compute', 'Rs 180'],
  ['Payment Gateway (2%)', 'Rs 140'],
  ['TOTAL COST / CLINIC', 'Rs 1,730']
];

let cy1 = y + 43;
c1Costs.forEach((item, i) => {
  const isTotal = i === c1Costs.length - 1;
  doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...(isTotal ? C.slate900 : C.slate600));
  doc.text(item[0], c1X + 4, cy1);
  doc.text(item[1], c1X + cardW - 4, cy1, { align: 'right' });
  cy1 += 4.5;
});

// Summary note
doc.setFillColor(...C.slate50);
doc.roundedRect(c1X + 3, y + cardH - 18, cardW - 6, 15, 1, 1, 'F');
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.5);
doc.setTextColor(...C.slate600);
const c1Note = "Low-friction high-volume tier. Fast adoption among solo GPs. Delivers stable cash flow with 75% retained earnings.";
doc.text(doc.splitTextToSize(c1Note, cardW - 8), c1X + 5, y + cardH - 14);


// --- CARD 2: Rx Connect (Hero) ---
let c2X = marginX + cardW + 3;
doc.setFillColor(...C.emeraldBg);
doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'F');
doc.setDrawColor(...C.emerald);
doc.setLineWidth(0.8);
doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'D');

// Top header block
doc.setFillColor(...C.emerald);
doc.roundedRect(c2X, y, cardW, 14, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...C.white);
doc.text('TIER 2: Rx CONNECT', c2X + 4, y + 6.2);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(209, 250, 229);
doc.text('Chronic Care & Adherence', c2X + 4, y + 10.5);

// Floating Popular Pill Badge
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

// Big Pricing & Margin Highlight
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...C.emerald);
doc.text('Rs 11,999', c2X + 4, y + 21);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate500);
doc.text('/ yr (Rs 1,199/mo)', c2X + 28, y + 20.5);

doc.setFillColor(167, 243, 208);
doc.roundedRect(c2X + 3, y + 25, cardW - 6, 8, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.setTextColor(...C.emeraldDark);
doc.text('NET PROFIT: Rs 8,349 / yr', c2X + 5, y + 29.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.8);
doc.text('Profit Margin: 69.6%', c2X + 5, y + 32.2);

// Cost Breakdown
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate900);
doc.text('ANNUAL COGS BREAKDOWN:', c2X + 4, y + 38);

const c2Costs = [
  ['WhatsApp (9k Rx + 12k Rem)', 'Rs 2,730'],
  ['Supabase Database & Logs', 'Rs 420'],
  ['Vercel Cron & Serverless', 'Rs 260'],
  ['Payment Gateway (2%)', 'Rs 240'],
  ['TOTAL COST / CLINIC', 'Rs 3,650']
];

let cy2 = y + 43;
c2Costs.forEach((item, i) => {
  const isTotal = i === c2Costs.length - 1;
  doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...(isTotal ? C.slate900 : C.slate600));
  doc.text(item[0], c2X + 4, cy2);
  doc.text(item[1], c2X + cardW - 4, cy2, { align: 'right' });
  cy2 += 4.5;
});

// Summary note
doc.setFillColor(...C.white);
doc.roundedRect(c2X + 3, y + cardH - 18, cardW - 6, 15, 1, 1, 'F');
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.5);
doc.setTextColor(...C.slate700);
const c2Note = "The core profit engine. Highest doctor LTV. Automated WhatsApp revisit loops ensure near-zero doctor churn.";
doc.text(doc.splitTextToSize(c2Note, cardW - 8), c2X + 5, y + cardH - 14);


// --- CARD 3: Rx Complete 360 ---
let c3X = marginX + (cardW * 2) + 6;
doc.setFillColor(...C.white);
doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'F');
doc.setDrawColor(...C.purple);
doc.setLineWidth(0.4);
doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'D');

// Top header block
doc.setFillColor(...C.purpleBg);
doc.roundedRect(c3X, y, cardW, 14, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...C.purple);
doc.text('TIER 3: Rx COMPLETE 360', c3X + 4, y + 6);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate500);
doc.text('Polyclinics & Pharmacies', c3X + 4, y + 10.5);

// Big Pricing & Margin Highlight
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...C.purple);
doc.text('Rs 21,999', c3X + 4, y + 21);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate500);
doc.text('/ yr (Rs 2,199/mo)', c3X + 28, y + 20.5);

doc.setFillColor(...C.purpleBg);
doc.roundedRect(c3X + 3, y + 25, cardW - 6, 8, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.setTextColor(...C.purple);
doc.text('NET PROFIT: Rs 16,279 / yr', c3X + 5, y + 29.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.8);
doc.text('Profit Margin: 74.0%', c3X + 5, y + 32.2);

// Cost Breakdown
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.5);
doc.setTextColor(...C.slate900);
doc.text('ANNUAL COGS BREAKDOWN:', c3X + 4, y + 38);

const c3Costs = [
  ['WhatsApp (25k Rx & Rem)', 'Rs 3,900'],
  ['Supabase Real-Time Stock', 'Rs 900'],
  ['Vercel Serverless Receipts', 'Rs 480'],
  ['Payment Gateway (2%)', 'Rs 440'],
  ['TOTAL COST / CLINIC', 'Rs 5,720']
];

let cy3 = y + 43;
c3Costs.forEach((item, i) => {
  const isTotal = i === c3Costs.length - 1;
  doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(...(isTotal ? C.slate900 : C.slate600));
  doc.text(item[0], c3X + 4, cy3);
  doc.text(item[1], c3X + cardW - 4, cy3, { align: 'right' });
  cy3 += 4.5;
});

// Summary note
doc.setFillColor(...C.slate50);
doc.roundedRect(c3X + 3, y + cardH - 18, cardW - 6, 15, 1, 1, 'F');
doc.setFont('helvetica', 'normal');
doc.setFontSize(5.5);
doc.setTextColor(...C.slate600);
const c3Note = "Maximum revenue density. Every polyclinic onboarded brings Rs 16,279 in pure profit. Up to 3 doctors + pharmacy counter.";
doc.text(doc.splitTextToSize(c3Note, cardW - 8), c3X + 5, y + cardH - 14);

y += cardH + 7;

// Table: Summary Comparison of Unit Economics
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...C.slate900);
doc.text('PER-CLINIC UNIT REVENUE & PROFIT COMPARISON', marginX, y);

y += 4;

const uCols = [
  { name: 'Subscription Tier', width: 42 },
  { name: 'Annual Price (ARR)', width: 32 },
  { name: 'Annual COGS', width: 30 },
  { name: 'RxNXT Net Profit', width: 38 },
  { name: 'Net Margin (%)', width: 40 }
];

doc.setFillColor(...C.navyDark);
doc.rect(marginX, y, contentWidth, 6.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.2);
doc.setTextColor(...C.white);

let ux = marginX + 2;
uCols.forEach(c => {
  doc.text(c.name, ux, y + 4.5);
  ux += c.width;
});

y += 6.5;

const uRows = [
  ['Tier 1: Rx Express', 'Rs 6,999 / clinic', 'Rs 1,730 / yr', 'Rs 5,269 / clinic', '75.3% Net Margin'],
  ['Tier 2: Rx Connect', 'Rs 11,999 / clinic', 'Rs 3,650 / yr', 'Rs 8,349 / clinic', '69.6% Net Margin'],
  ['Tier 3: Rx Complete 360', 'Rs 21,999 / clinic', 'Rs 5,720 / yr', 'Rs 16,279 / clinic', '74.0% Net Margin']
];

uRows.forEach((r, idx) => {
  const rowH = 6.2;
  doc.setFillColor(...(idx % 2 === 0 ? C.white : C.slate50));
  doc.rect(marginX, y, contentWidth, rowH, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.2);
  doc.line(marginX, y + rowH, pageWidth - marginX, y + rowH);

  let rx = marginX + 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(...C.slate900);
  doc.text(r[0], rx, y + 4.2);
  rx += uCols[0].width;

  doc.setFont('helvetica', 'normal');
  doc.text(r[1], rx, y + 4.2);
  rx += uCols[1].width;

  doc.setTextColor(...C.slate600);
  doc.text(r[2], rx, y + 4.2);
  rx += uCols[2].width;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(idx === 1 ? C.emeraldDark : idx === 2 ? C.purple : C.primaryBlue));
  doc.text(r[3], rx, y + 4.2);
  rx += uCols[3].width;

  doc.setTextColor(...C.emeraldDark);
  doc.text(r[4], rx, y + 4.2);

  y += rowH;
});


// ==========================================
// PAGE 2: COHORT REVENUE & SCALING MILESTONES
// ==========================================
doc.addPage();
drawHeader(2, 2, '2. COHORT REVENUE & SCALING MILESTONES', 'Financial Projections from Initial 55-Clinic Cohort to 5,000 Clinics Nationwide');

y = 40;

// Section: Local Cohort Earnings (Warangal & Hanamkonda - 55 Clinics)
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...C.slate900);
doc.text('A. LOCAL LAUNCH EARNINGS: 55-CLINIC COHORT (WARANGAL / HANAMKONDA)', marginX, y);

y += 4;

const cohortCols = [
  { name: 'Subscription Plan', width: 44 },
  { name: 'Cohort Share', width: 28 },
  { name: 'Clinics', width: 22 },
  { name: 'Gross ARR', width: 30 },
  { name: 'Annual COGS', width: 28 },
  { name: 'RxNXT Net Profit', width: 30 }
];

doc.setFillColor(...C.navyDark);
doc.rect(marginX, y, contentWidth, 6.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.2);
doc.setTextColor(...C.white);

let cx = marginX + 2;
cohortCols.forEach(c => {
  doc.text(c.name, cx, y + 4.5);
  cx += c.width;
});

y += 6.5;

const cohortRows = [
  ['Rx Express (Solo GPs)', '60% of cohort', '33 Clinics', 'Rs 2,30,967', 'Rs 57,090', 'Rs 1,73,877'],
  ['Rx Connect (Specialists)', '30% of cohort', '16 Clinics', 'Rs 1,91,984', 'Rs 58,400', 'Rs 1,33,584'],
  ['Rx Complete 360 (Hubs)', '10% of cohort', '6 Clinics', 'Rs 1,31,994', 'Rs 34,320', 'Rs 97,674'],
  ['Add-Ons (Seats & Wallet)', 'Expansion upsell', '--', 'Rs 35,000', 'Rs 12,000', 'Rs 23,000'],
  ['TOTAL LOCAL COHORT', '100% Active', '55 Clinics', 'Rs 5,89,945', 'Rs 1,61,810', 'Rs 4,28,135']
];

cohortRows.forEach((r, idx) => {
  const isTotal = idx === cohortRows.length - 1;
  const rowH = 6.2;
  doc.setFillColor(...(isTotal ? C.emeraldBg : idx % 2 === 0 ? C.white : C.slate50));
  doc.rect(marginX, y, contentWidth, rowH, 'F');
  doc.setDrawColor(...(isTotal ? C.emerald : C.slate200));
  doc.setLineWidth(isTotal ? 0.4 : 0.2);
  doc.line(marginX, y + rowH, pageWidth - marginX, y + rowH);

  let rx = marginX + 2;
  doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...(isTotal ? C.emeraldDark : C.slate900));
  doc.text(r[0], rx, y + 4.2);
  rx += cohortCols[0].width;

  doc.setTextColor(...C.slate600);
  doc.text(r[1], rx, y + 4.2);
  rx += cohortCols[1].width;

  doc.setFont('helvetica', 'bold');
  doc.text(r[2], rx, y + 4.2);
  rx += cohortCols[2].width;

  doc.setTextColor(...(isTotal ? C.emeraldDark : C.slate900));
  doc.text(r[3], rx, y + 4.2);
  rx += cohortCols[3].width;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.slate500);
  doc.text(r[4], rx, y + 4.2);
  rx += cohortCols[4].width;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...(isTotal ? C.emeraldDark : C.emerald));
  doc.text(r[5], rx, y + 4.2);

  y += rowH;
});

// Cohort Run-Rate Callout
y += 4;
doc.setFillColor(...C.slate50);
doc.roundedRect(marginX, y, contentWidth, 12, 1.5, 1.5, 'F');
doc.setDrawColor(...C.slate200);
doc.setLineWidth(0.3);
doc.roundedRect(marginX, y, contentWidth, 12, 1.5, 1.5, 'D');

doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.setTextColor(...C.slate900);
doc.text('LOCAL COHORT FINANCIAL RUN-RATE:', marginX + 4, y + 4.5);
doc.setFont('helvetica', 'normal');
doc.setFontSize(6.2);
doc.setTextColor(...C.slate700);
doc.text('Monthly Recurring Revenue (MRR): Rs 49,160 / mo   |   Annual Recurring Revenue (ARR): Rs 5.9 Lakhs   |   Net Annual Margin: 72.6%', marginX + 4, y + 8.5);

y += 18;

// Section: Scaling Milestones
doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...C.slate900);
doc.text('B. EXPANSION & SCALING MILESTONES (REGIONAL TO NATIONAL)', marginX, y);

y += 4;

const scaleCols = [
  { name: 'Scale Stage', width: 32 },
  { name: 'Active Clinics', width: 24 },
  { name: 'Annual ARR', width: 32 },
  { name: 'Annual COGS', width: 28 },
  { name: 'RxNXT Net Profit', width: 34 },
  { name: 'Monthly Cash (MRR)', width: 32 }
];

doc.setFillColor(...C.navyDark);
doc.rect(marginX, y, contentWidth, 6.5, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.2);
doc.setTextColor(...C.white);

let sx = marginX + 2;
scaleCols.forEach(c => {
  doc.text(c.name, sx, y + 4.5);
  sx += c.width;
});

y += 6.5;

const scaleRows = [
  ['Local Cohort', '55 Clinics', 'Rs 5.9 Lakhs', 'Rs 1.6 Lakhs', 'Rs 4.3 Lakhs', 'Rs 49,000 / mo'],
  ['District Milestone', '200 Clinics', 'Rs 21.4 Lakhs', 'Rs 5.8 Lakhs', 'Rs 15.6 Lakhs', 'Rs 1.78 Lakhs / mo'],
  ['State Footprint', '500 Clinics', 'Rs 53.6 Lakhs', 'Rs 14.5 Lakhs', 'Rs 39.1 Lakhs', 'Rs 4.46 Lakhs / mo'],
  ['Regional Leader', '1,500 Clinics', 'Rs 1.61 Crores', 'Rs 43.5 Lakhs', 'Rs 1.17 Crores', 'Rs 13.4 Lakhs / mo'],
  ['National Scale', '5,000 Clinics', 'Rs 5.36 Crores', 'Rs 1.45 Crores', 'Rs 3.91 Crores', 'Rs 44.6 Lakhs / mo']
];

scaleRows.forEach((r, idx) => {
  const isScale = idx >= 3;
  const rowH = 6.2;
  doc.setFillColor(...(isScale ? C.emeraldBg : idx % 2 === 0 ? C.white : C.slate50));
  doc.rect(marginX, y, contentWidth, rowH, 'F');
  doc.setDrawColor(...C.slate200);
  doc.setLineWidth(0.2);
  doc.line(marginX, y + rowH, pageWidth - marginX, y + rowH);

  let rx = marginX + 2;
  doc.setFont('helvetica', isScale ? 'bold' : 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...(isScale ? C.emeraldDark : C.slate900));
  doc.text(r[0], rx, y + 4.2);
  rx += scaleCols[0].width;

  doc.setFont('helvetica', 'bold');
  doc.text(r[1], rx, y + 4.2);
  rx += scaleCols[1].width;

  doc.setTextColor(...C.slate900);
  doc.text(r[2], rx, y + 4.2);
  rx += scaleCols[2].width;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.slate500);
  doc.text(r[3], rx, y + 4.2);
  rx += scaleCols[3].width;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emeraldDark);
  doc.text(r[4], rx, y + 4.2);
  rx += scaleCols[4].width;

  doc.setTextColor(...C.primaryBlue);
  doc.text(r[5], rx, y + 4.2);

  y += rowH;
});

y += 8;

// Strategic Takeaway Callout Box
doc.setFillColor(...C.white);
doc.roundedRect(marginX, y, contentWidth, 25, 2, 2, 'F');
doc.setDrawColor(...C.emerald);
doc.setLineWidth(0.6);
doc.roundedRect(marginX, y, contentWidth, 25, 2, 2, 'D');

doc.setFillColor(...C.emerald);
doc.roundedRect(marginX, y, contentWidth, 5.5, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(6.8);
doc.setTextColor(...C.white);
doc.text('EXECUTIVE FINANCIAL CONCLUSION FOR FOUNDERS & INVESTORS', marginX + 4, y + 4);

doc.setFont('helvetica', 'normal');
doc.setFontSize(6.2);
doc.setTextColor(...C.slate700);
const conclusionTxt = "1. Cash-Flow Positive from Cohort 1: RxNXT generates Rs 4.28 Lakhs in net profit from its first 55 local clinics, requiring zero external bridge capital to sustain cloud operations.\n2. Compounding Retained Earnings: Because the software is 100% built, new clinic subscriptions do not incur new engineering overhead - every Rs 100 in subscription translates to Rs 70-75 in gross contribution.\n3. The High-Value Polyclinic Leverage: Onboarding just 60 polyclinics (Tier 3) alone yields ~Rs 10 Lakhs in annual net profit, making enterprise clinic acquisition exceptionally high ROI.";
doc.text(doc.splitTextToSize(conclusionTxt, contentWidth - 8), marginX + 4, y + 8.5);

// Output Paths
const outWorkspace = path.join('C:', 'Users', 'orugt', '.gemini', 'antigravity', 'scratch', 'RxNXT-Cloud', 'RxNXT_Tier_Earnings_and_Revenue_Model.pdf');
const outBrain = path.join('C:', 'Users', 'orugt', '.gemini', 'antigravity', 'brain', 'a1d02c3c-4bc4-4391-8e96-23e1f327136c', 'RxNXT_Tier_Earnings_and_Revenue_Model.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outWorkspace, Buffer.from(pdfBytes));
console.log('Successfully saved to workspace:', outWorkspace);

fs.writeFileSync(outBrain, Buffer.from(pdfBytes));
console.log('Successfully saved to brain:', outBrain);
