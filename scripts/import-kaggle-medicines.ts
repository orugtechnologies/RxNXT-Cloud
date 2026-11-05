import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to extract dosage form from drug name or label
function detectDosageForm(text: string): string {
  const lower = (text || '').toLowerCase();
  if (lower.includes('tablet') || lower.includes(' tab')) return 'Tablet';
  if (lower.includes('capsule') || lower.includes(' cap')) return 'Capsule';
  if (lower.includes('syrup') || lower.includes(' syp')) return 'Syrup';
  if (lower.includes('injection') || lower.includes(' inj')) return 'Injection';
  if (lower.includes('suspension') || lower.includes(' susp')) return 'Suspension';
  if (lower.includes('eye drop') || lower.includes('ear drop') || lower.includes('drop')) return 'Drops';
  if (lower.includes('gel') || lower.includes('ointment') || lower.includes('cream')) return 'Ointment';
  if (lower.includes('inhaler') || lower.includes('respule')) return 'Inhaler';
  if (lower.includes('powder') || lower.includes('sachet')) return 'Powder';
  if (lower.includes('lotion')) return 'Lotion';
  if (lower.includes('solution')) return 'Solution';
  return 'Tablet'; // standard default
}

// Helper to extract route
function detectRoute(dosageForm: string): string {
  switch (dosageForm) {
    case 'Tablet':
    case 'Capsule':
    case 'Syrup':
    case 'Suspension':
    case 'Powder':
      return 'Oral';
    case 'Injection':
      return 'Injectable (IV/IM)';
    case 'Drops':
      return 'Ophthalmic / Otic';
    case 'Ointment':
    case 'Lotion':
    case 'Gel':
      return 'Topical';
    case 'Inhaler':
      return 'Inhalation';
    default:
      return 'Oral';
  }
}

// Helper to extract strength (e.g. 500mg, 625 mg, 10ml, etc.)
function extractStrength(text: string): string | null {
  const match = (text || '').match(/\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|%)\b/i);
  return match ? match[0] : null;
}

// Clean CSV line accounting for quoted fields with commas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function runImport() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.error('Data directory does not exist: ', dataDir);
    process.exit(1);
  }

  // Find CSV file in data folder
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.log('\n❌ No .csv file found in the "data/" directory.');
    console.log('👉 Please download the Kaggle dataset zip, extract the .csv file, and place it in:');
    console.log(`   ${dataDir}\n`);
    console.log('Then re-run: npx ts-node scripts/import-kaggle-medicines.ts\n');
    process.exit(1);
  }

  const csvPath = path.join(dataDir, files[0]);
  console.log(`\n📦 Found dataset: ${files[0]}`);
  console.log(`🚀 Starting high-speed streaming batch ingestion into RxNXT database...\n`);

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headerProcessed = false;
  let headers: string[] = [];
  let colName = -1;
  let colComp1 = -1;
  let colComp2 = -1;
  let colCompGeneral = -1;
  let colDiscontinued = -1;
  let colManufacturer = -1;
  let colDosage = -1;

  let totalProcessed = 0;
  let totalInserted = 0;
  let batch: any[] = [];
  const BATCH_SIZE = 1000;
  const startTime = Date.now();

  for await (const rawLine of rl) {
    if (!rawLine.trim()) continue;

    if (!headerProcessed) {
      headers = parseCsvLine(rawLine).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      headerProcessed = true;

      // Detect column indices dynamically
      colName = headers.findIndex(h => h === 'name' || h === 'medicinename' || h === 'brandname');
      colComp1 = headers.findIndex(h => h === 'shortcomposition1' || h === 'composition1');
      colComp2 = headers.findIndex(h => h === 'shortcomposition2' || h === 'composition2');
      colCompGeneral = headers.findIndex(h => h === 'composition' || h === 'salt' || h === 'genericname');
      colDiscontinued = headers.findIndex(h => h.includes('discontinued'));
      colManufacturer = headers.findIndex(h => h.includes('manufacturer'));
      colDosage = headers.findIndex(h => h === 'dosageform' || h === 'type' || h === 'packsize');

      console.log(`Headers detected: ${headers.slice(0, 8).join(', ')}...`);
      console.log(`Mapping: name -> col ${colName}, composition -> col ${colComp1 !== -1 ? colComp1 : colCompGeneral}`);
      continue;
    }

    const row = parseCsvLine(rawLine);
    const rawBrandName = colName !== -1 ? row[colName] : '';
    if (!rawBrandName || rawBrandName.length < 2) continue;

    // Skip discontinued medicines if column exists
    if (colDiscontinued !== -1 && /true|yes|1/i.test(row[colDiscontinued])) {
      continue;
    }

    // Build Generic salt name
    let genericSalt = '';
    if (colComp1 !== -1 && row[colComp1]) {
      genericSalt = row[colComp1];
      if (colComp2 !== -1 && row[colComp2]) {
        genericSalt += ` + ${row[colComp2]}`;
      }
    } else if (colCompGeneral !== -1 && row[colCompGeneral]) {
      genericSalt = row[colCompGeneral];
    }

    if (!genericSalt) {
      genericSalt = rawBrandName; // fallback if only brand is available
    }

    const dosageForm = colDosage !== -1 && row[colDosage] && !/allopathy/i.test(row[colDosage])
      ? detectDosageForm(row[colDosage])
      : detectDosageForm(rawBrandName);

    const strength = extractStrength(rawBrandName) || extractStrength(genericSalt) || null;
    const route = detectRoute(dosageForm);

    batch.push({
      genericName: genericSalt.substring(0, 500),
      brandName: rawBrandName.substring(0, 255),
      dosageForm: dosageForm,
      strength: strength,
      route: route,
      isActive: true,
      clinicId: null, // Global drug available across all clinics
    });

    totalProcessed++;

    if (batch.length >= BATCH_SIZE) {
      try {
        await prisma.drug.createMany({
          data: batch,
          skipDuplicates: true,
        });
        totalInserted += batch.length;
      } catch (err: any) {
        console.error(`Batch insert error at row ${totalProcessed}:`, err.message);
      }
      batch = [];

      if (totalInserted % 10000 === 0) {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        const rate = Math.floor(totalInserted / (elapsedSec || 1));
        console.log(`✅ Loaded ${totalInserted.toLocaleString()} medicines... (${rate} drugs/sec)`);
      }
    }
  }

  // Insert any remainder
  if (batch.length > 0) {
    try {
      await prisma.drug.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalInserted += batch.length;
    } catch (err: any) {
      console.error('Final batch insert error:', err.message);
    }
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  console.log(`\n🎉 Ingestion Complete!`);
  console.log(`📊 Total Medicines Processed: ${totalProcessed.toLocaleString()}`);
  console.log(`💊 Total Medicines Added to Database: ${totalInserted.toLocaleString()}`);
  console.log(`⏱️ Time Taken: ${elapsed} seconds\n`);

  await prisma.$disconnect();
}

runImport().catch(err => {
  console.error('Fatal import error:', err);
  prisma.$disconnect();
  process.exit(1);
});
