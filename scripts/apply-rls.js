// scripts/apply-rls.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually parse .env if process.env.DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val;
      }
    }
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Connecting to database and enabling Row Level Security (RLS)...');
  
  // Read all public tables
  const tables = [
    'Clinic',
    'User',
    'Patient',
    'Encounter',
    'Prescription',
    'PrescriptionMedicine',
    'Drug',
    'TreatmentGroup',
    'TreatmentGroupItem',
    'DoctorDrugPreference',
    'ClinicDrugPreference',
    'Reminder',
    'QueueItem',
    'SubscriptionPayment',
    'PharmacyItem',
    'DispenseLog',
    'DispensedItem',
    'Bill',
    'BillItem'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE IF EXISTS "${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`[OK] RLS enabled on table: "${table}"`);
    } catch (err) {
      console.error(`[WARN] Failed on table "${table}":`, err.message);
    }
  }

  // Dynamic loop across all public tables
  try {
    const publicTables = await prisma.$queryRawUnsafe(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);
    
    console.log(`Checking ${publicTables.length} tables in public schema...`);
    for (const row of publicTables) {
      const name = row.tablename;
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${name}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`[VERIFIED] RLS active on public."${name}"`);
    }
  } catch (err) {
    console.error('[ERROR] Dynamic loop failed:', err.message);
  }

  // Verify RLS status from pg_tables / pg_class
  const rlsCheck = await prisma.$queryRawUnsafe(`
    SELECT relname AS tablename, relrowsecurity AS rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE pg_namespace.nspname = 'public' AND pg_class.relkind = 'r'
    ORDER BY relname;
  `);

  console.log('\n--- Final RLS Status Verification ---');
  let allEnabled = true;
  for (const t of rlsCheck) {
    console.log(`Table: ${t.tablename.padEnd(25)} | RLS Enabled: ${t.rls_enabled}`);
    if (!t.rls_enabled) allEnabled = false;
  }

  if (allEnabled) {
    console.log('\n SUCCESS: Row Level Security (RLS) is now ENABLED on all public tables!');
  } else {
    console.log('\n WARNING: Some tables still do not have RLS enabled.');
  }
}

main()
  .catch((e) => {
    console.error('Fatal error applying RLS:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
