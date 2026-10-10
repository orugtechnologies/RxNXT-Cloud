const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

console.log('Generating high-fidelity PowerPoint Presentation (.pptx)...');

const pptx = new pptxgen();

// Configure 16:9 Widescreen
pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches (or 13.33 x 7.5)
pptx.author = 'ORUG Technologies Pvt. Ltd.';
pptx.company = 'ORUG Technologies Pvt. Ltd.';
pptx.subject = 'RxNXT Cloud — ₹50 Lakhs Seed Expansion Pitch Deck';
pptx.title = 'RxNXT Cloud — ₹50 Lakhs Seed Expansion Pitch Presentation';

// Design Theme Colors
const BG_DARK = '090E1A';
const CARD_BG = '121B2D';
const CARD_BORDER = '1E2C47';
const TEXT_WHITE = 'FFFFFF';
const TEXT_MUTED = '94A3B8';
const TEXT_LIGHT = 'CBD5E1';
const BLUE = '2563EB';
const SKY = '38BDF8';
const EMERALD = '10B981';
const MINT = '34D399';
const PURPLE = '8B5CF6';
const AMBER = 'F59E0B';

function addHeader(slide, category, slideNum, title, subtitle) {
  // Top header line
  slide.addText('RxNXT CLOUD', {
    x: 0.8, y: 0.4, w: 2.5, h: 0.3,
    fontSize: 12, bold: true, color: SKY, fontFace: 'Arial'
  });

  slide.addText(`•  ${category}`, {
    x: 2.6, y: 0.4, w: 5.5, h: 0.3,
    fontSize: 10, bold: true, color: TEXT_MUTED, fontFace: 'Arial'
  });

  slide.addText(`Slide ${slideNum} of 09`, {
    x: 10.5, y: 0.4, w: 2.0, h: 0.3,
    fontSize: 10, align: 'right', color: TEXT_MUTED, fontFace: 'Arial'
  });

  // Divider
  slide.addShape(pptx.shapes.LINE, {
    x: 0.8, y: 0.75, w: 11.7, h: 0,
    line: { color: '2A3B5C', width: 1 }
  });

  // Title
  slide.addText(title, {
    x: 0.8, y: 0.9, w: 11.7, h: 0.45,
    fontSize: 20, bold: true, color: TEXT_WHITE, fontFace: 'Arial'
  });

  // Subtitle
  slide.addText(subtitle, {
    x: 0.8, y: 1.35, w: 11.7, h: 0.35,
    fontSize: 11, color: TEXT_MUTED, fontFace: 'Arial'
  });
}

function addFooter(slide, text = 'ORUG Technologies Pvt. Ltd. • Pitch Presentation') {
  slide.addShape(pptx.shapes.LINE, {
    x: 0.8, y: 7.0, w: 11.7, h: 0,
    line: { color: '1E2C47', width: 0.75 }
  });

  slide.addText(text, {
    x: 0.8, y: 7.08, w: 7.0, h: 0.3,
    fontSize: 9, color: TEXT_MUTED, fontFace: 'Arial'
  });

  slide.addText('Confidential • September 2026', {
    x: 8.5, y: 7.08, w: 4.0, h: 0.3,
    fontSize: 9, align: 'right', color: TEXT_MUTED, fontFace: 'Arial'
  });
}

// ==========================================
// SLIDE 1: COVER SLIDE
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  // Top Badge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 4.4, y: 1.2, w: 4.5, h: 0.45, r: 0.2,
    fill: { color: '162544' }, line: { color: '2563EB', width: 1 }
  });
  slide.addText('SEED STAGE EXPANSION PITCH • 2026', {
    x: 4.4, y: 1.2, w: 4.5, h: 0.45,
    fontSize: 10, bold: true, color: SKY, align: 'center', fontFace: 'Arial'
  });

  // Main Title
  slide.addText('RxNXT CLOUD', {
    x: 1.0, y: 1.9, w: 11.3, h: 1.1,
    fontSize: 48, bold: true, color: TEXT_WHITE, align: 'center', fontFace: 'Arial'
  });

  // Subtitle
  slide.addText('Accelerating Indian Outpatient Clinics with Fast Under 30-Second Prescriptions,\nDirect Meta WhatsApp Care & Live NMC Medical License Verification.', {
    x: 1.5, y: 3.1, w: 10.3, h: 0.7,
    fontSize: 14, color: TEXT_LIGHT, align: 'center', fontFace: 'Arial'
  });

  // 3 Metric Cards
  const cards = [
    { title: 'Phase 1 Grant Completed', val: '₹7.0 Lakhs (SISFS)', color: SKY },
    { title: 'Phase 2 Target Ask', val: '₹50.0 Lakhs (Debt/CCD)', color: MINT },
    { title: 'Host Incubator', val: 'SRiX (Warangal/Hyd)', color: PURPLE }
  ];

  cards.forEach((c, idx) => {
    const x = 1.8 + idx * 3.4;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 4.1, w: 3.0, h: 1.2, r: 0.15,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });
    slide.addText(c.title.toUpperCase(), {
      x: x, y: 4.25, w: 3.0, h: 0.3,
      fontSize: 9, bold: true, color: TEXT_MUTED, align: 'center', fontFace: 'Arial'
    });
    slide.addText(c.val, {
      x: x, y: 4.6, w: 3.0, h: 0.5,
      fontSize: 14, bold: true, color: c.color, align: 'center', fontFace: 'Arial'
    });
  });

  // Entity Details
  slide.addText('ORUG Technologies Private Limited  •  founders@rxnxt.com  •  https://app.rxnxt.in', {
    x: 1.0, y: 5.7, w: 11.3, h: 0.4,
    fontSize: 11, bold: true, color: SKY, align: 'center', fontFace: 'Arial'
  });

  addFooter(slide, 'ORUG Technologies Pvt. Ltd. • Pitch Presentation');
}

// ==========================================
// SLIDE 2: THE PROBLEM
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '1. Market Problem & Pain Points', '02',
    'The Critical Bottlenecks Crippling Indian Outpatient Clinics',
    '80%+ of India\'s 1.3M+ doctors run standalone OPD practices burdened by administrative friction and patient drop-off.'
  );

  const problems = [
    {
      title: 'Clinical Documentation',
      color: AMBER,
      stat: '3 to 5 Minutes Wasted',
      desc: 'Doctors spend 3 to 5 minutes per patient typing into clunky software or scribbling on paper.',
      bullets: [
        'Doctor fatigue during peak 50+ patient footfall hours.',
        'Unreadable handwriting causes dangerous pharmacy dispensing errors.',
        'Existing EMRs are bulky enterprise clones that doctors abandon within 2 weeks.',
        'Zero standard dosage autofill for Indian generic and brand medicines.'
      ]
    },
    {
      title: 'Patient Non-Adherence',
      color: SKY,
      stat: 'Over 45% Drop-Off',
      desc: 'Over 45% of patients forget medication schedules or abandon courses midway.',
      bullets: [
        'Paper slips get torn, lost, or ruined within 48 hours of consultation.',
        'Patients forget critical food timing (Before food vs. After dinner).',
        'Chronic diabetes/hypertension patients miss monthly refill dates.',
        'Clinics lose patient follow-up revenue because there is zero digital tracking.'
      ]
    },
    {
      title: 'Regulatory Liability',
      color: PURPLE,
      stat: 'Strict NMC Gazette 2023',
      desc: 'Unverified prescribing and generic non-compliance expose clinics to legal liability.',
      bullets: [
        'National Medical Commission (NMC) mandates registered generic prescribing.',
        'Rising quackery: No live verification of doctor registration numbers.',
        'No digital audit trail linking clinical consultations to pharmacy dispensing.',
        'Clinics risk compliance audits without tamper-proof electronic records.'
      ]
    }
  ];

  problems.forEach((p, idx) => {
    const x = 0.8 + idx * 4.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.85, w: 3.7, h: 4.9, r: 0.15,
      fill: { color: CARD_BG }, line: { color: p.color, width: 1.5 }
    });

    slide.addText(p.title, {
      x: x + 0.25, y: 2.05, w: 3.2, h: 0.35,
      fontSize: 14, bold: true, color: p.color, fontFace: 'Arial'
    });
    slide.addText(p.stat, {
      x: x + 0.25, y: 2.4, w: 3.2, h: 0.3,
      fontSize: 11, bold: true, color: TEXT_WHITE, fontFace: 'Arial'
    });
    slide.addText(p.desc, {
      x: x + 0.25, y: 2.75, w: 3.2, h: 0.7,
      fontSize: 9.5, color: TEXT_LIGHT, fontFace: 'Arial'
    });

    slide.addShape(pptx.shapes.LINE, {
      x: x + 0.25, y: 3.5, w: 3.2, h: 0,
      line: { color: '2A3B5C', width: 0.75 }
    });

    p.bullets.forEach((b, bIdx) => {
      slide.addText(`•  ${b}`, {
        x: x + 0.25, y: 3.65 + bIdx * 0.75, w: 3.2, h: 0.65,
        fontSize: 8.5, color: TEXT_LIGHT, fontFace: 'Arial'
      });
    });
  });

  addFooter(slide, 'Target Market: 1.3M Doctors | 250,000+ Standalone Clinics across Tier 1, 2 & 3 India');
}

// ==========================================
// SLIDE 3: THE SOLUTION
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '2. The RxNXT Solution', '03',
    'An Ultra-Fast, Zero-Bloat Clinical Operating System',
    'Engineered to deliver complete digital prescriptions in under 30 seconds with 100% automated post-consultation care.'
  );

  const pillars = [
    {
      title: 'Fast Under 30-Second Prescribing',
      color: MINT,
      points: [
        'Additive Scoring Search: Exact alias match (+100 pts), doctor favorite (+50 pts).',
        '1-Click Quick Chips: Dosage, duration, and food timing (1-0-1, 5 days, After meals).',
        'Protocol Packs: 1-click loading of entire treatment sets (e.g. Viral Fever Protocol).',
        '1-Click Cloning: Re-prescribes previous regimens for returning chronic patients in 2s.'
      ]
    },
    {
      title: 'Direct Meta WhatsApp Automation',
      color: SKY,
      points: [
        'Zero Microservices: Direct enterprise integration with Meta WhatsApp Cloud API (v20.0).',
        'Official PDF Delivery: Converts prescription into base64 and uploads to WhatsApp media.',
        'Smart Slot Nudges: Automated 3-slot daily schedules (8 AM, 1 PM, 8:30 PM).',
        'Day-25 Refill Alerts: Proactive monthly reminders for diabetic & hypertension care.'
      ]
    },
    {
      title: 'Live Government NMC Verification',
      color: PURPLE,
      points: [
        'Direct NMC REST API: Live verification against NMC & 24+ State Medical Councils in ~0.4s.',
        'Mandatory Gating: Workspace creation blocked until government credentials confirmed.',
        'Tamper-Proof Profiles: Registered name, degrees (MBBS/MD), and council year auto-locked.',
        'Digital Signature: Automatically bound to doctor profile and stamped on all PDFs.'
      ]
    },
    {
      title: 'Client-Side PDF Engine (Zero Server CPU)',
      color: AMBER,
      points: [
        '100% Client-Side Compilation: Prescriptions compile in doctor\'s web browser via jsPDF.',
        'Zero Server Compute Overhead: Eliminates headless Chrome/Puppeteer ($50-$100/mo).',
        'Infinite Horizontal Scalability: 5,000 doctors generating PDFs consumes 0% server CPU.',
        'Branded Letterhead: Automated clinic logo, registration credentials, and signature.'
      ]
    }
  ];

  pillars.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 6.0;
    const y = 1.85 + row * 2.5;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 5.7, h: 2.35, r: 0.15,
      fill: { color: CARD_BG }, line: { color: p.color, width: 1.5 }
    });

    slide.addText(p.title, {
      x: x + 0.3, y: y + 0.15, w: 5.1, h: 0.35,
      fontSize: 12.5, bold: true, color: p.color, fontFace: 'Arial'
    });

    p.points.forEach((pt, ptIdx) => {
      slide.addText(`•  ${pt}`, {
        x: x + 0.3, y: y + 0.55 + ptIdx * 0.42, w: 5.1, h: 0.38,
        fontSize: 8.5, color: TEXT_LIGHT, fontFace: 'Arial'
      });
    });
  });

  addFooter(slide, 'Eliminating clinical friction while creating an unbreakable patient retention loop');
}

// ==========================================
// SLIDE 4: PHASE 1 GRANT DELIVERABLES
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '3. Phase 1 (₹7L) Execution Proof', '04',
    '100% Delivery of Phase 1 Grant Objectives',
    'How the initial ₹7.0 Lakhs SISFS grant was deployed to transform a prototype into a production cloud architecture.'
  );

  // 4 Top Stat Boxes
  const stats = [
    { val: '100%', label: 'Cloud Multi-Tenant' },
    { val: '~0.4s', label: 'NMC Verify Latency' },
    { val: '< 30 Sec', label: 'Avg Prescription Time' },
    { val: 'v20.0', label: 'Meta Cloud API' }
  ];

  stats.forEach((s, idx) => {
    const x = 0.8 + idx * 3.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.85, w: 2.7, h: 0.95, r: 0.15,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });
    slide.addText(s.val, {
      x: x, y: 1.95, w: 2.7, h: 0.45,
      fontSize: 18, bold: true, color: MINT, align: 'center', fontFace: 'Arial'
    });
    slide.addText(s.label, {
      x: x, y: 2.4, w: 2.7, h: 0.3,
      fontSize: 9, color: TEXT_MUTED, align: 'center', fontFace: 'Arial'
    });
  });

  // Table
  const tableRows = [
    [
      { text: 'Phase 1 Deliverable', options: { bold: true, fill: '1E293B', color: TEXT_WHITE } },
      { text: 'Status', options: { bold: true, fill: '1E293B', color: TEXT_WHITE, align: 'center' } },
      { text: 'Technical & Operational Outcome', options: { bold: true, fill: '1E293B', color: TEXT_WHITE } }
    ],
    [
      { text: 'Cloud DB Migration', options: { bold: true, color: TEXT_WHITE } },
      { text: 'COMPLETED', options: { bold: true, color: MINT, align: 'center' } },
      { text: 'Migrated from local SQLite to Supabase Mumbai Cloud PostgreSQL (ap-south-1) with connection pooling.' }
    ],
    [
      { text: 'NMC Government Verification', options: { bold: true, color: TEXT_WHITE } },
      { text: 'COMPLETED', options: { bold: true, color: MINT, align: 'center' } },
      { text: 'Live zero-cost REST query covering NMC + 24 State Councils. Mandatory registration gate.' }
    ],
    [
      { text: 'Meta WhatsApp Architecture', options: { bold: true, color: TEXT_WHITE } },
      { text: 'COMPLETED', options: { bold: true, color: MINT, align: 'center' } },
      { text: 'Direct Graph API integration; eliminated Render microservice & scrapers. Zero cold starts.' }
    ],
    [
      { text: 'Receptionist Queue Sync', options: { bold: true, color: TEXT_WHITE } },
      { text: 'COMPLETED', options: { bold: true, color: MINT, align: 'center' } },
      { text: 'Real-time live queue connecting reception to doctor workspace with auto-resetting intake forms.' }
    ],
    [
      { text: 'Progressive Web App (PWA)', options: { bold: true, color: TEXT_WHITE } },
      { text: 'COMPLETED', options: { bold: true, color: MINT, align: 'center' } },
      { text: 'Installable mobile PWA with thumb-accessible sticky footer for fast smartphone prescribing.' }
    ]
  ];

  slide.addTable(tableRows, {
    x: 0.8, y: 3.0, w: 11.7, h: 3.7,
    fontSize: 9, fontFace: 'Arial', color: TEXT_LIGHT,
    fill: CARD_BG, border: { color: '2A3B5C', pt: 0.5 },
    colW: [2.5, 1.5, 7.7], margin: [4, 6, 4, 6]
  });

  addFooter(slide, 'Phase 1 Grant successfully deployed with zero technical debt and clean production build');
}

// ==========================================
// SLIDE 5: UNIT ECONOMICS
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '4. Business Model & Unit Economics', '05',
    'Unbeatable High-Margin SaaS Architecture (75%–80% Gross Margin)',
    'Priced for rapid Indian OPD adoption with near-zero marginal cost of hosting.'
  );

  // Left Card: Pricing
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.85, w: 5.7, h: 4.9, r: 0.15,
    fill: { color: CARD_BG }, line: { color: BLUE, width: 1.5 }
  });
  slide.addText('Strategic 3-Tier Pricing Model', {
    x: 1.1, y: 2.05, w: 5.1, h: 0.35,
    fontSize: 14, bold: true, color: SKY, fontFace: 'Arial'
  });
  const tiers = [
    { name: 'Tier 1 (SaaS BYOD)', price: '₹9,999 / year (~₹833/mo)', desc: 'For solo clinic practitioners using laptop, tablet, or phone.' },
    { name: 'Tier 2 (Hardware Bundle)', price: '₹24,999 One-Time', desc: 'Pre-configured 11" Android Kiosk Tablet + Stand + 1-Year SaaS subscription.' },
    { name: 'Tier 3 (Polyclinic Pack)', price: '₹18,000 / year', desc: 'Multi-doctor clinic network with centralized reception & pharmacy.' }
  ];
  tiers.forEach((t, tIdx) => {
    const ty = 2.5 + tIdx * 1.0;
    slide.addText(t.name, { x: 1.1, y: ty, w: 2.8, h: 0.3, fontSize: 10, bold: true, color: TEXT_WHITE, fontFace: 'Arial' });
    slide.addText(t.price, { x: 3.9, y: ty, w: 2.3, h: 0.3, fontSize: 10, bold: true, color: MINT, align: 'right', fontFace: 'Arial' });
    slide.addText(t.desc, { x: 1.1, y: ty + 0.3, w: 5.1, h: 0.45, fontSize: 8.5, color: TEXT_LIGHT, fontFace: 'Arial' });
  });

  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.1, y: 5.5, w: 5.1, h: 1.0, r: 0.1,
    fill: { color: '162544' }, line: { color: '2563EB', width: 1 }
  });
  slide.addText('💡 The "2-Patient" Psychological Pitch:\nAt ₹9,999/year (~₹833/month), writing just 2 to 3 consultations a month pays for the software. The remaining 500+ consultations are 100% pure profit.', {
    x: 1.25, y: 5.55, w: 4.8, h: 0.9,
    fontSize: 8.5, color: SKY, fontFace: 'Arial'
  });

  // Right Card: Cost Breakdown Table
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.85, w: 5.7, h: 4.9, r: 0.15,
    fill: { color: CARD_BG }, line: { color: EMERALD, width: 1.5 }
  });
  slide.addText('Single-Clinic Monthly Cost Breakdown', {
    x: 7.1, y: 2.05, w: 5.1, h: 0.35,
    fontSize: 14, bold: true, color: MINT, fontFace: 'Arial'
  });

  const costRows = [
    [
      { text: 'Component', options: { bold: true, fill: '1E293B', color: TEXT_WHITE } },
      { text: 'Monthly Cost', options: { bold: true, fill: '1E293B', color: TEXT_WHITE, align: 'right' } }
    ],
    [{ text: 'Allocated Serverless API (Vercel Pro)' }, { text: '~₹60 / mo', options: { align: 'right' } }],
    [{ text: 'Allocated PostgreSQL DB (Supabase Pro)' }, { text: '~₹75 / mo', options: { align: 'right' } }],
    [{ text: 'Meta WhatsApp Utility API (~600 msgs @ ₹0.13)' }, { text: '~₹78 / mo', options: { align: 'right' } }],
    [{ text: 'Client-Side PDF Generation (jsPDF)' }, { text: '₹0 / mo (Zero CPU)', options: { align: 'right', color: MINT } }],
    [{ text: 'NMC Doctor Verification API' }, { text: '₹0 / mo (Direct REST)', options: { align: 'right', color: MINT } }],
    [
      { text: 'TOTAL HOSTING COST PER CLINIC', options: { bold: true, color: TEXT_WHITE, fill: '1E293B' } },
      { text: '~₹213 / month', options: { bold: true, color: AMBER, align: 'right', fill: '1E293B' } }
    ],
    [
      { text: 'NET GROSS MARGIN (from ₹833 Revenue)', options: { bold: true, color: MINT, fill: '064E3B' } },
      { text: '₹620 / mo (74.4%)', options: { bold: true, color: MINT, align: 'right', fill: '064E3B' } }
    ]
  ];

  slide.addTable(costRows, {
    x: 7.1, y: 2.5, w: 5.1, h: 3.9,
    fontSize: 9, fontFace: 'Arial', color: TEXT_LIGHT,
    fill: CARD_BG, border: { color: '2A3B5C', pt: 0.5 },
    colW: [3.4, 1.7], margin: [4, 6, 4, 6]
  });

  addFooter(slide, 'High-margin software economics allows rapid reinvestment of cash flow into doctor acquisition');
}

// ==========================================
// SLIDE 6: USE OF FUNDS
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '5. ₹50 Lakhs Use of Funds', '06',
    'Deployment of the ₹50 Lakhs Seed Expansion Capital',
    'An 18-month commercial runway focused on clinic acquisition across Telangana and Andhra Pradesh.'
  );

  const allocations = [
    {
      title: 'Clinical Sales & Expansion',
      amount: '₹20.0 L (40%)',
      color: BLUE,
      points: [
        'Hire 2 Field Sales Reps in Hyderabad & Warangal.',
        'Doctor CME sponsorships & clinic demo booths.',
        'Target: Onboard 150–200 paying OPD clinics.',
        'Clinic incentive thermal printer bundles.'
      ]
    },
    {
      title: 'Product & AI Roadmap',
      amount: '₹15.0 L (30%)',
      color: MINT,
      points: [
        'Complete OPD Patient Billing & Dynamic UPI POS.',
        'In-clinic Pharmacy automatic inventory deduction.',
        'AI Drug-Drug Interaction safety radar engine.',
        'Patient adherence web app (OTP login).'
      ]
    },
    {
      title: 'ABDM & Compliance',
      amount: '₹8.0 L (16%)',
      color: PURPLE,
      points: [
        'Ayushman Bharat Digital Mission (M1/M2/M3) integration.',
        'ABHA Health ID creation for OPD patients.',
        'DPDP Act 2023 & ISO-27001 data compliance audits.',
        'Legal contracts & hospital data governance.'
      ]
    },
    {
      title: 'Runway & Operations',
      amount: '₹7.0 L (14%)',
      color: AMBER,
      points: [
        '18-month cloud serverless hosting reserve.',
        'Meta Enterprise WABA messaging volume deposits.',
        'Customer support helpline & training collateral.',
        'Corporate accounting & statutory filing.'
      ]
    }
  ];

  allocations.forEach((a, idx) => {
    const x = 0.8 + idx * 3.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.85, w: 2.7, h: 4.0, r: 0.15,
      fill: { color: CARD_BG }, line: { color: a.color, width: 1.5 }
    });

    slide.addText(a.amount, {
      x: x + 0.15, y: 2.05, w: 2.4, h: 0.35,
      fontSize: 13, bold: true, color: a.color, fontFace: 'Arial'
    });
    slide.addText(a.title, {
      x: x + 0.15, y: 2.4, w: 2.4, h: 0.45,
      fontSize: 10, bold: true, color: TEXT_WHITE, fontFace: 'Arial'
    });

    slide.addShape(pptx.shapes.LINE, {
      x: x + 0.15, y: 2.9, w: 2.4, h: 0,
      line: { color: '2A3B5C', width: 0.75 }
    });

    a.points.forEach((pt, pIdx) => {
      slide.addText(`✔  ${pt}`, {
        x: x + 0.15, y: 3.05 + pIdx * 0.65, w: 2.4, h: 0.58,
        fontSize: 8.5, color: TEXT_LIGHT, fontFace: 'Arial'
      });
    });
  });

  // Bottom Banner
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 6.0, w: 11.7, h: 0.8, r: 0.15,
    fill: { color: '162544' }, line: { color: '2563EB', width: 1 }
  });
  slide.addText('🎯 TARGET RUNWAY MILESTONE: Reach 200 Paying Clinics by Month 12 → Generating ₹20,00,000 Annual Recurring Revenue (ARR). Cashflow breakeven expected at 120 clinics (Month 14).', {
    x: 1.0, y: 6.1, w: 11.3, h: 0.6,
    fontSize: 10, bold: true, color: SKY, fontFace: 'Arial'
  });

  addFooter(slide, 'Strict capital efficiency: 70% of capital directly drives clinic acquisition and product monetization');
}

// ==========================================
// SLIDE 7: 12-MONTH ROADMAP
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '6. 12-Month Execution Roadmap', '07',
    '12-Month Operational Milestones & Traction Trajectory',
    'Clear, measurable operational quarterly gates from 10 pilot clinics to 200 commercial deployments.'
  );

  const quarters = [
    {
      quarter: 'Q1 • MONTHS 1-3',
      name: 'Pilot Lock-In',
      clinics: '30 Clinics (₹3.0L ARR)',
      color: BLUE,
      points: [
        'Onboard 30 active clinics across Warangal & Hyderabad.',
        'Doctor satisfaction NPS > 70 with verified < 30-second speed.',
        'Meta Tier 2 verification (10,000 messages/day capacity).',
        'Publish Clinical Adherence Whitepaper with SRiX.'
      ]
    },
    {
      quarter: 'Q2 • MONTHS 4-6',
      name: 'Commercial Scaling',
      clinics: '75 Clinics (₹7.5L ARR)',
      color: MINT,
      points: [
        'Expand field sales to Karimnagar, Nizamabad & Khammam.',
        'Launch OPD Billing & Dynamic UPI checkout POS.',
        'Activate Pharmacy stock inventory counter.',
        'Establish 80%+ 30-day doctor retention rate.'
      ]
    },
    {
      quarter: 'Q3 • MONTHS 7-9',
      name: 'Regional Expansion',
      clinics: '130 Clinics (₹13.0L ARR)',
      color: PURPLE,
      points: [
        'Enter Andhra Pradesh (Vijayawada, Guntur, Vizag).',
        'Deploy Ayushman Bharat (ABDM M1/M2) certified gateway.',
        'Release AI Drug Interaction safety radar.',
        'Achieve operating cash-flow breakeven (~120 clinics).'
      ]
    },
    {
      quarter: 'Q4 • MONTHS 10-12',
      name: 'Institutional Scale',
      clinics: '200 Clinics (₹20.0L ARR)',
      color: AMBER,
      points: [
        '200 active commercial clinics generating ₹20.0L ARR.',
        'Over 1.5 Million prescriptions dispatched via WhatsApp.',
        'Open institutional ₹2.5 Crore Series Pre-A round.',
        'Initiate expansion into Karnataka (Bengaluru / Mysuru).'
      ]
    }
  ];

  quarters.forEach((q, idx) => {
    const x = 0.8 + idx * 3.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.85, w: 2.7, h: 4.9, r: 0.15,
      fill: { color: CARD_BG }, line: { color: q.color, width: 1.5 }
    });

    slide.addText(q.quarter, {
      x: x + 0.15, y: 2.05, w: 2.4, h: 0.25,
      fontSize: 9, bold: true, color: q.color, fontFace: 'Arial'
    });
    slide.addText(q.name, {
      x: x + 0.15, y: 2.3, w: 2.4, h: 0.35,
      fontSize: 12, bold: true, color: TEXT_WHITE, fontFace: 'Arial'
    });
    slide.addText(q.clinics, {
      x: x + 0.15, y: 2.65, w: 2.4, h: 0.3,
      fontSize: 10, bold: true, color: q.color, fontFace: 'Arial'
    });

    slide.addShape(pptx.shapes.LINE, {
      x: x + 0.15, y: 3.05, w: 2.4, h: 0,
      line: { color: '2A3B5C', width: 0.75 }
    });

    q.points.forEach((pt, pIdx) => {
      slide.addText(`•  ${pt}`, {
        x: x + 0.15, y: 3.2 + pIdx * 0.8, w: 2.4, h: 0.72,
        fontSize: 8.5, color: TEXT_LIGHT, fontFace: 'Arial'
      });
    });
  });

  addFooter(slide, 'Structured quarterly execution roadmap designed for measurable compliance and institutional audit');
}

// ==========================================
// SLIDE 8: 30-DAY SPRINT ACTION PLAN
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };
  addHeader(slide, '7. Immediate Next Steps', '08',
    'The 30-Day Sprint to Unlock the ₹50L Funding Tranche',
    'Three concrete tactical milestones to present undeniable traction to the incubator investment board.'
  );

  const sprints = [
    {
      step: 'STEP 1 • DAYS 1 TO 10',
      title: 'Deploy Live Pilots',
      color: SKY,
      points: [
        'Deploy RxNXT in 10–15 local OPD clinics in Warangal & Hyderabad.',
        'Leverage SRiX health network & local IMA chapters.',
        'Ensure doctors write 15–25 digital prescriptions daily.',
        'Collect direct doctor feedback on prescribing speed.'
      ]
    },
    {
      step: 'STEP 2 • DAYS 11 TO 20',
      title: 'Traction Verification',
      color: MINT,
      points: [
        'Query DB: Total prescriptions written (> 5,000 target).',
        'Verify clinical speed: Documented < 30s per prescription.',
        'Meta delivery metrics: Show > 94% WhatsApp reach rate.',
        'Record 3 short video testimonials from active doctors.'
      ]
    },
    {
      step: 'STEP 3 • DAYS 21 TO 30',
      title: 'Commitment & Close',
      color: PURPLE,
      points: [
        'Get 3–5 signed Letters of Intent (LOIs) or pilot advance fees.',
        'Present verified metrics to SRiX Investment Board.',
        'Formally apply for SISFS Component 2 / DST Seed Fund.',
        'Close and disburse the ₹50 Lakhs seed expansion tranche.'
      ]
    }
  ];

  sprints.forEach((s, idx) => {
    const x = 0.8 + idx * 4.0;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.85, w: 3.7, h: 4.9, r: 0.15,
      fill: { color: CARD_BG }, line: { color: s.color, width: 1.5 }
    });

    slide.addText(s.step, {
      x: x + 0.25, y: 2.05, w: 3.2, h: 0.25,
      fontSize: 9, bold: true, color: s.color, fontFace: 'Arial'
    });
    slide.addText(s.title, {
      x: x + 0.25, y: 2.3, w: 3.2, h: 0.4,
      fontSize: 14, bold: true, color: TEXT_WHITE, fontFace: 'Arial'
    });

    slide.addShape(pptx.shapes.LINE, {
      x: x + 0.25, y: 2.8, w: 3.2, h: 0,
      line: { color: '2A3B5C', width: 0.75 }
    });

    s.points.forEach((pt, pIdx) => {
      slide.addText(`✔  ${pt}`, {
        x: x + 0.25, y: 2.95 + pIdx * 0.9, w: 3.2, h: 0.8,
        fontSize: 9, color: TEXT_LIGHT, fontFace: 'Arial'
      });
    });
  });

  addFooter(slide, 'Execution velocity: Moving from grant completion to commercial revenue in 30 days');
}

// ==========================================
// SLIDE 9: CLOSING / INVESTMENT ASK
// ==========================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  slide.addText('RxNXT CLOUD  •  TRANSFORMING INDIAN OUTPATIENT CARE', {
    x: 1.0, y: 1.0, w: 11.3, h: 0.4,
    fontSize: 11, bold: true, color: SKY, align: 'center', fontFace: 'Arial'
  });

  slide.addText('Let\'s Digitize Every Prescription Pad in India', {
    x: 1.0, y: 1.4, w: 11.3, h: 0.8,
    fontSize: 32, bold: true, color: TEXT_WHITE, align: 'center', fontFace: 'Arial'
  });

  slide.addText('Paper prescriptions are lost, unreadable, and disconnect patients from care.\nRxNXT makes prescribing faster than pen & paper while automating post-consultation WhatsApp adherence.', {
    x: 1.5, y: 2.3, w: 10.3, h: 0.7,
    fontSize: 13, color: TEXT_LIGHT, align: 'center', fontFace: 'Arial'
  });

  // Center Callout Card
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 2.2, y: 3.3, w: 8.9, h: 2.7, r: 0.2,
    fill: { color: CARD_BG }, line: { color: BLUE, width: 2 }
  });

  slide.addText('🤝 The Investment Ask: ₹50.0 Lakhs Seed Expansion', {
    x: 2.5, y: 3.55, w: 8.3, h: 0.45,
    fontSize: 16, bold: true, color: MINT, align: 'center', fontFace: 'Arial'
  });

  slide.addText('Seeking ₹50 Lakhs via SISFS Component 2 (Convertible Debenture / Debt) or DST NIDHI-SSS\nthrough SR Innovation Exchange (SRiX) Incubator.', {
    x: 2.5, y: 4.1, w: 8.3, h: 0.55,
    fontSize: 11, color: TEXT_WHITE, align: 'center', fontFace: 'Arial'
  });

  slide.addText('We have completed Phase 1, proved the architecture, eliminated serverless costs, and locked in regulatory moats. We are ready to scale.', {
    x: 2.5, y: 4.7, w: 8.3, h: 0.5,
    fontSize: 10, color: TEXT_LIGHT, align: 'center', fontFace: 'Arial'
  });

  slide.addText('ORUG Technologies Pvt. Ltd.  •  founders@rxnxt.com  •  Warangal / Hyderabad  •  SRiX Incubator Cohort', {
    x: 2.5, y: 5.3, w: 8.3, h: 0.4,
    fontSize: 11, bold: true, color: SKY, align: 'center', fontFace: 'Arial'
  });

  addFooter(slide, 'ORUG Technologies Pvt. Ltd. • Accelerating Healthcare Across India');
}

// ==========================================
// SAVE PRESENTATION
// ==========================================
const repoPptx = path.join(__dirname, 'RxNXT_50L_Funding_Pitch_Presentation.pptx');
const publicPptx = path.join(__dirname, 'public', 'RxNXT_50L_Funding_Pitch_Presentation.pptx');
const desktopPptx = 'C:\\Users\\orugt\\Desktop\\RxNXT_50L_Funding_Pitch_Presentation.pptx';

pptx.writeFile({ fileName: repoPptx }).then(() => {
  fs.copyFileSync(repoPptx, publicPptx);
  try { fs.copyFileSync(repoPptx, desktopPptx); } catch(e) {}
  console.log('SUCCESS: PowerPoint Presentation (.pptx) created!');
  console.log('1. Repo:', repoPptx);
  console.log('2. Public:', publicPptx);
  console.log('3. Desktop:', desktopPptx);
}).catch(err => {
  console.error('Error creating pptx:', err);
});
