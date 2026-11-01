const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const data = [
  {
    category: "General Physicians",
    doctors: [
      { id: "1", name: "Dr. Girish Loya", clinic: "Medicover Hospitals", address: "Door No. 23-6-156/1 & 156/2, Hunter Road, Opp. Nexa, Sainagar Colony, Hanamkonda", fee: "₹500 - ₹600", opd: "35 - 50", opdMid: 42.5 },
      { id: "2", name: "Dr. T. Suman", clinic: "Vasavi Clinic / Ekashilaa Hospital", address: "Kakaji Colony, Near Asian Sridevi Mall, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "3", name: "Dr. Muppidi Vishwa Bharath Reddy", clinic: "Srinivasa Hospital", address: "Beside old Radar Diagnostics, Opp. Vijaya Theater Road, Kakaji Nagar, Hanamkonda", fee: "₹400", opd: "40 - 55", opdMid: 47.5 },
      { id: "4", name: "Dr. Yogith Reddy", clinic: "General Medical Practice", address: "Subedari / Hanamkonda area", fee: "₹300 - ₹400", opd: "25 - 35", opdMid: 30.0 },
      { id: "5", name: "Dr. D. S. Raj Kumar (Raj Devude)", clinic: "RK Multi-Speciality / Jaya Hospital Rd", address: "Kakaji Colony, Hanamkonda", fee: "₹300 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "6", name: "Dr. D. Chiranjeevi", clinic: "Sri Chiranjeeva Hospital", address: "Nakkalagutta / Hanamkonda Main Road, Hanamkonda", fee: "₹300 - ₹400", opd: "25 - 40", opdMid: 32.5 },
      { id: "7", name: "Dr. M. Tarun Kumar Reddy", clinic: "Dr. Tarun's Clinic", address: "Beside Chakravarthy Hospitals, Near Ekasila Park, Balasamudram, Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 40", opdMid: 35.0 },
      { id: "8", name: "Dr. Aravind Bhupathi", clinic: "Aravind Nursing Home / Bandan Hospital", address: "Kakaji Nagar Colony, Hanamkonda", fee: "₹300 - ₹400", opd: "35 - 50", opdMid: 42.5 },
      { id: "9", name: "Dr. Darna Arun Kumar", clinic: "Medicover Hospitals", address: "Hunter Road, Sainagar Colony, Hanamkonda", fee: "₹500 - ₹600", opd: "30 - 45", opdMid: 37.5 },
      { id: "10", name: "Dr. Rohith Reddy Yata", clinic: "Aarogya Speciality Clinic", address: "Near Waddepally Road, Teachers Colony Phase 1, Subedari, Hanamkonda", fee: "₹300 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "11", name: "Dr. Suresh M / Dr. Suresh Kumar", clinic: "Surya Hospital / City Clinic", address: "Mulugu Road / Kakaji Colony, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "12", name: "Dr. Vydyam Gowtham (Goutham Vidyam)", clinic: "Abhaya Hospital / Specialist Clinic", address: "Bus Stand Road / Kakaji Colony, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "13", name: "Dr. P. Sammaiah (Sammayya)", clinic: "Sri Lasya Hospital (Prof. of Med, KMC)", address: "Kakaji Nagar Colony, Hanamkonda", fee: "₹400 - ₹500", opd: "60 - 80", opdMid: 70.0 },
      { id: "14", name: "Dr. Sharan Reddy (Dr. Charan Reddy)", clinic: "Sri Vijaya Practice", address: "Kakaji Colony / Subedari, Hanamkonda", fee: "₹300 - ₹400", opd: "25 - 35", opdMid: 30.0 },
      { id: "15", name: "Dr. Visampally Suresh Kumar", clinic: "Family Practice / Clinic", address: "Kazipet / Hanamkonda Road", fee: "₹300 - ₹400", opd: "25 - 40", opdMid: 32.5 },
      { id: "16", name: "Dr. V. Mahender (Mahindran)", clinic: "Jaya Hospitals", address: "Kakaji Colony / Main Road, Hanamkonda", fee: "₹300 - ₹500", opd: "30 - 45", opdMid: 37.5 }
    ]
  },
  {
    category: "Neurology & Neurosurgery",
    doctors: [
      { id: "1", name: "Dr. G. Madhusudana Prasad (Madhusudan sir)", clinic: "Madhu Neuro Care", address: "Opp. 2nd Bus Depot, Vijaya Talkies Road, Kakaji Colony, Hanamkonda", fee: "₹500", opd: "60 - 85", opdMid: 72.5 },
      { id: "2", name: "Dr. Madhu Babu", clinic: "Madhubabu Neuro MultiSpeciality Center", address: "Vijaya Talkies Road, Beside Joyalukkas, Near Asian Sridevi Mall, Hanamkonda", fee: "₹500 - ₹600", opd: "50 - 75", opdMid: 62.5 },
      { id: "3", name: "Dr. Telugu Ramakrishna", clinic: "Aravinda Super Speciality / Ramakrishna Hospitals", address: "Kakaji Colony, Hanamkonda", fee: "₹400 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "4", name: "Dr. Yempati Bhargav", clinic: "Bhargav Neuro Care Super Speciality Center", address: "Near Public Gardens / Bus Stand Road, Hanamkonda", fee: "₹500", opd: "45 - 65", opdMid: 55.0 },
      { id: "5", name: "Dr. Om Prakash Prasad", clinic: "Sri Sri Neuro Centre (OP Neuro Cure)", address: "Near Bus Stand Road, Kakaji Nagar Colony, Hanamkonda", fee: "₹500 - ₹600", opd: "45 - 65", opdMid: 55.0 },
      { id: "6", name: "Dr. K. Sampath Rao (Sampath Reddy)", clinic: "Ajara Hospitals / Dr. Sampath Rao Hospital", address: "Reddy Colony / Subedari, Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "7", name: "Dr. Attuluri Manasa (Manasa madam)", clinic: "Keerthan Neuro Centre / Manasa Hospital", address: "Nakkalagutta / Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "8", name: "Dr. Pradeep Kumar G (Pradeep sir)", clinic: "Neuro Care Clinic", address: "Kakaji Colony / Subedari, Hanamkonda", fee: "₹400 - ₹500", opd: "25 - 40", opdMid: 32.5 },
      { id: "9", name: "Dr. Goutham Kumar Puppala", clinic: "Goutham Neuro Care", address: "Opp. Kakatiya Degree College, Beside Shreya Hotel, Bus Stand Road, Hanamkonda", fee: "₹400 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "10", name: "Dr. Muduganti Amruth Reddy", clinic: "Dr. Amruth Reddy Neurophysician Clinic", address: "Near Asian Sridevi Mall, Balasamudram, Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "11", name: "Dr. Kancha Naresh", clinic: "Vinayaka Neuro Multi Speciality Centre", address: "Main Road, Kakaji Colony, Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 }
    ]
  },
  {
    category: "Orthopedics",
    doctors: [
      { id: "1", name: "Dr. S. Lakshmi Narayana (Lakshmi Narayana sir)", clinic: "Mourya Hospital", address: "MG Road, Near Gopalaswamy Temple, Warangal / Hanamkonda", fee: "₹400 - ₹600", opd: "50 - 75", opdMid: 62.5 },
      { id: "2", name: "Dr. R. Thirupathi Reddy", clinic: "City Orthopaedic Center / Thirupathi Reddy Hospital", address: "Near Vijaya Theater, Kakaji Nagar Colony, Hanamkonda", fee: "₹800 - ₹1,000", opd: "60 - 90", opdMid: 75.0 },
      { id: "3", name: "Dr. Sudhir Kancharla", clinic: "Janatha Hospital (Janatha Clinics)", address: "Nayeem Nagar / Hanamkonda", fee: "₹400 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "4", name: "Dr. Banda Naveen Kumar", clinic: "Medicover Hospitals", address: "Hunter Road, Sainagar Colony, Hanamkonda", fee: "₹500 - ₹700", opd: "35 - 50", opdMid: 42.5 },
      { id: "5", name: "Dr. Ranadeep (Ranadheer)", clinic: "Ranadheer Orthocare / Advanced Ortho Hospital", address: "Near Sumangali Function Hall, Hanamkonda", fee: "₹400 - ₹500", opd: "40 - 60", opdMid: 50.0 },
      { id: "6", name: "Dr. Uttam Vaidya Gattu (Uttam sir)", clinic: "Rohini Super Speciality Hospital", address: "Subedari / Kakaji Colony, Hanamkonda", fee: "₹400 - ₹600", opd: "30 - 45", opdMid: 37.5 },
      { id: "7", name: "Dr. Pradeep Kumar Mandapalli", clinic: "Christhu Jyothi Pradeep Ortho Care", address: "Opp. Srusti Hospital, Beside Venkateshwara Imaging Lane, Kakaji Colony, Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "8", name: "Dr. Sukesh Reddy P", clinic: "Fathima Multispeciality Hospital", address: "Main Road, Kazipet / Hanamkonda", fee: "₹500 - ₹800", opd: "40 - 60", opdMid: 50.0 }
    ]
  },
  {
    category: "Gynecology & Obstetrics",
    doctors: [
      { id: "1", name: "Dr. L. Radhika / Dr. K. Radhika (Radhika madam)", clinic: "Radhika Nursing Home", address: "Bheemaram / Balasamudram, Hanamkonda", fee: "₹300 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "2", name: "Dr. B. Sandhya Rani", clinic: "Ekashilaa Hospital", address: "Nayeem Nagar / Kishanpura, Hanamkonda", fee: "₹400 - ₹600", opd: "60 - 90", opdMid: 75.0 },
      { id: "3", name: "Dr. G. Arundhati Sai", clinic: "Lavanya Hospital", address: "Near Bus Stand / Subedari Road, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "4", name: "Dr. Soumya Gujjula (Sowmya)", clinic: "Kalyani Hospital", address: "Opp. Asian Sridevi Mall, Stadium Road, Balasamudram, Hanamkonda", fee: "₹300 - ₹500", opd: "40 - 60", opdMid: 50.0 },
      { id: "5", name: "Dr. Polam Rajitha Reddy", clinic: "Srilaxmi Nursing Home & Women's Clinic", address: "7-1-70, Near Asian Sridevi Mall 2nd Gate, Balasamudram, Hanamkonda", fee: "₹300 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "6", name: "Dr. Keerthana", clinic: "Sri Keerthana Clinic", address: "Kakaji Colony / Balasamudram, Hanamkonda", fee: "₹300 - ₹400", opd: "25 - 35", opdMid: 30.0 },
      { id: "7", name: "Dr. K. Sudha Rani", clinic: "Women's Clinic", address: "Subedari / Hanamkonda", fee: "₹300 - ₹400", opd: "25 - 40", opdMid: 32.5 },
      { id: "8", name: "Dr. Manjula Pathri", clinic: "Dr. Manjula Hospital / Surya Clinic", address: "Near Bachpan School, Ramnagar / Julywada, Hanamkonda", fee: "₹400 - ₹500", opd: "45 - 65", opdMid: 55.0 },
      { id: "9", name: "Dr. Sujatha Dasari", clinic: "Dr. Sujatha Hospital", address: "Kakaji Colony, Hanamkonda", fee: "₹400 - ₹500", opd: "50 - 70", opdMid: 60.0 },
      { id: "10", name: "Dr. P. Roja", clinic: "Maternal & Women's Clinic", address: "Shiva Nagar / Kothawada, Warangal-Hanamkonda", fee: "₹300 - ₹400", opd: "25 - 35", opdMid: 30.0 },
      { id: "11", name: "Dr. Duddu Sandhya Rani", clinic: "Laxmi Narasimha Hospital / Ekashilaa Hospital", address: "Kishanpura / Nayeem Nagar, Hanamkonda", fee: "₹300 - ₹500", opd: "40 - 60", opdMid: 50.0 },
      { id: "12", name: "Dr. Sirisha Reddy", clinic: "Dr. Sirisha Reddy's Centre for Fetal Medicine", address: "Near Asian Sridevi Mall / Kaloji Marg, Sai Nagar, Hanamkonda", fee: "₹500 - ₹700", opd: "35 - 50", opdMid: 42.5 },
      { id: "13", name: "Dr. M. Sailaja", clinic: "Samata Nursing Home", address: "Charbouli Road, Warangal / Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "14", name: "Dr. Macha Prashanthi Mohan", clinic: "Prashanthi Hospitals / Rainbow BirthRight", address: "Machili Bazar Road, Hanamkonda", fee: "₹500 - ₹700", opd: "50 - 75", opdMid: 62.5 },
      { id: "15", name: "Dr. Sriperumbundur Ravali", clinic: "Medicover Hospitals", address: "Hunter Road, Sainagar Colony, Hanamkonda", fee: "₹500 - ₹600", opd: "30 - 45", opdMid: 37.5 },
      { id: "16", name: "Dr. Kiranmai Reddy", clinic: "SV Super Speciality Hospital", address: "Nakkalagutta / Hanamkonda", fee: "₹400 - ₹500", opd: "30 - 45", opdMid: 37.5 },
      { id: "17", name: "Dr. M. Suvarna Ratnam", clinic: "Suvarna's Women & Fertility / Prashanthi Hospital", address: "Siddharthanagar, Kazipet / Hanamkonda", fee: "₹300 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "18", name: "Dr. Kunduru Radhika Reddy", clinic: "Mamatha Clinic", address: "Kakaji Colony / Kakaji Nagar, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 },
      { id: "19", name: "Dr. M. Sreedevi", clinic: "Sri Devi Hospital / Women's Clinic", address: "Near Hanamkonda Chowrasta (Kakaji Colony) / Hunter Road, Hanamkonda", fee: "₹300 - ₹500", opd: "35 - 50", opdMid: 42.5 },
      { id: "20", name: "Dr. B. Vijetha", clinic: "Women's Care Clinic", address: "Near Chowrastha, Brahmanawada, Beside Joyalukkas, Hanamkonda", fee: "₹300 - ₹400", opd: "30 - 45", opdMid: 37.5 }
    ]
  }
];

const doc = new jsPDF({
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4'
});

const pageWidth = 297;
const pageHeight = 210;
const marginX = 10;
const tableWidth = pageWidth - (marginX * 2); // 277 mm
// Columns: [#, Doctor Name, Clinic, Address, Fee, OPD/day, Pts/mo, Msgs/mo, Meta Cost]
const colWidths = [7, 43, 47, 65, 23, 21, 23, 26, 22]; // Sum = 277 mm
let currentY = 35;

function drawHeader() {
  // Top Banner
  doc.setFillColor(30, 64, 175); // Deep Royal Blue
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text('DOCTORS DIRECTORY, OPD VOLUMES & WHATSAPP ESTIMATES — HANAMKONDA & KAZIPET', marginX, 10.5);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text('Addresses, Consultation Fees, Daily/Monthly Patient Counts, and WhatsApp Lifecycle Message Estimates (@ 4 msgs/pt, 25 days/mo, ₹0.13/msg)', marginX, 16.5);

  // Accent Line
  doc.setFillColor(14, 165, 233); // Sky Blue accent
  doc.rect(0, 24, pageWidth, 1.2, 'F');
}

function drawSectionBanner(title) {
  if (currentY > pageHeight - 28) {
    doc.addPage();
    currentY = 15;
  }

  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(marginX, currentY, tableWidth, 7.5, 1, 1, 'F');
  
  // Left color accent pill
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(marginX, currentY, 3, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(title.toUpperCase(), marginX + 5, currentY + 5.2);

  currentY += 9.5;
  drawTableHeader();
}

function drawTableHeader() {
  doc.setFillColor(30, 58, 138); // Dark Navy Blue
  doc.rect(marginX, currentY, tableWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  let curX = marginX;
  const headers = [
    '#', 
    'DOCTOR NAME', 
    'CLINIC / HOSPITAL', 
    'ADDRESS & LOCALITY', 
    'FEE (₹)', 
    'OPD/DAY', 
    'PTS/MO', 
    'MSGS/MO (4x)', 
    'META COST'
  ];
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], curX + 1.5, currentY + 4.4);
    curX += colWidths[i];
  }

  currentY += 6.5;
}

drawHeader();

let grandTotalPts = 0;
let grandTotalDailyOpd = 0;
let grandTotalMsgs = 0;
let grandTotalCost = 0;

data.forEach((section) => {
  drawSectionBanner(section.category);

  let secPts = 0;
  let secDailyOpd = 0;
  let secMsgs = 0;
  let secCost = 0;

  section.doctors.forEach((docItem, index) => {
    const monthlyPts = Math.round(docItem.opdMid * 25);
    const monthlyMsgs = Math.round(monthlyPts * 4);
    const metaCost = Math.round(monthlyMsgs * 0.13);

    secPts += monthlyPts;
    secDailyOpd += docItem.opdMid;
    secMsgs += monthlyMsgs;
    secCost += metaCost;

    // Line wrapping
    const nameLines = doc.splitTextToSize(docItem.name, colWidths[1] - 3);
    const clinicLines = doc.splitTextToSize(docItem.clinic, colWidths[2] - 3);
    const addressLines = doc.splitTextToSize(docItem.address, colWidths[3] - 3);

    const maxLines = Math.max(nameLines.length, clinicLines.length, addressLines.length, 1);
    const rowHeight = Math.max(6.2, maxLines * 3.6 + 1.8);

    // Page break
    if (currentY + rowHeight > pageHeight - 14) {
      doc.addPage();
      currentY = 15;
      drawTableHeader();
    }

    // Alternating shading
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, currentY, tableWidth, rowHeight, 'F');
    }

    // Bottom border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY + rowHeight, marginX + tableWidth, currentY + rowHeight);

    // Print text
    doc.setFontSize(7);

    // # ID
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(docItem.id, marginX + 1.5, currentY + 4);

    // Doctor Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(nameLines, marginX + colWidths[0] + 1.5, currentY + 3.8);

    // Clinic
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(clinicLines, marginX + colWidths[0] + colWidths[1] + 1.5, currentY + 3.8);

    // Address
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(addressLines, marginX + colWidths[0] + colWidths[1] + colWidths[2] + 1.5, currentY + 3.8);

    // Fee
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(docItem.fee, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 1.5, currentY + 4);

    // OPD/Day
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(docItem.opd, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 1.5, currentY + 4);

    // Pts/Mo
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(monthlyPts.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 1.5, currentY + 4);

    // Msgs/Mo
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199); // Sky Blue
    doc.text(monthlyMsgs.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + 1.5, currentY + 4);

    // Meta Cost
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber-700
    doc.text('₹' + metaCost.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7] + 1.5, currentY + 4);

    currentY += rowHeight;
  });

  // Section Subtotal Row
  if (currentY + 6.5 > pageHeight - 14) {
    doc.addPage();
    currentY = 15;
    drawTableHeader();
  }
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.rect(marginX, currentY, tableWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 64, 175);
  doc.text(`Subtotal (${section.category}) — ${section.doctors.length} Doctors:`, marginX + colWidths[0] + 1.5, currentY + 4.2);
  doc.text(`${Math.round(secDailyOpd)}/day`, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 1.5, currentY + 4.2);
  doc.text(secPts.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 1.5, currentY + 4.2);
  doc.text(secMsgs.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + 1.5, currentY + 4.2);
  doc.text('₹' + secCost.toLocaleString(), marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7] + 1.5, currentY + 4.2);

  currentY += 8.5;

  grandTotalDailyOpd += secDailyOpd;
  grandTotalPts += secPts;
  grandTotalMsgs += secMsgs;
  grandTotalCost += secCost;
});

// Grand Total Banner
if (currentY + 12 > pageHeight - 14) {
  doc.addPage();
  currentY = 15;
}
doc.setFillColor(30, 58, 138); // Dark Navy Blue
doc.roundedRect(marginX, currentY, tableWidth, 8, 1, 1, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(255, 255, 255);
doc.text('GRAND TOTAL — ALL 55 DOCTORS COHORT:', marginX + 3, currentY + 5.2);
doc.text(`${Math.round(grandTotalDailyOpd)} pts/day`, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 1.5, currentY + 5.2);
doc.text(`${grandTotalPts.toLocaleString()} pts/mo`, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 1.5, currentY + 5.2);
doc.text(`${grandTotalMsgs.toLocaleString()} msgs`, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + 1.5, currentY + 5.2);
doc.text(`₹${grandTotalCost.toLocaleString()}/mo`, marginX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + colWidths[7] + 1.5, currentY + 5.2);

// Footer & Pagination
const totalPages = doc.internal.getNumberOfPages();
for (let p = 1; p <= totalPages; p++) {
  doc.setPage(p);
  
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(marginX, pageHeight - 8, marginX + tableWidth, pageHeight - 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(148, 163, 184);
  doc.text('RxNXT Clinical Directory • Hanamkonda & Kazipet • Practice Economics & WhatsApp Capacity Planning', marginX, pageHeight - 4.2);
  doc.text(`Page ${p} of ${totalPages}`, marginX + tableWidth - 18, pageHeight - 4.2);
}

// Save outputs
const outPath1 = path.join(__dirname, '..', 'Doctors_List_Hanamkonda_Kazipet.pdf');
const brainDir = 'C:\\Users\\orugt\\.gemini\\antigravity\\brain\\a1d02c3c-4bc4-4391-8e96-23e1f327136c';
const outPath2 = path.join(brainDir, 'Doctors_List_Hanamkonda_Kazipet.pdf');

const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outPath1, Buffer.from(pdfBytes));
console.log('Saved to:', outPath1);

if (fs.existsSync(brainDir)) {
  fs.writeFileSync(outPath2, Buffer.from(pdfBytes));
  console.log('Saved to:', outPath2);
}
