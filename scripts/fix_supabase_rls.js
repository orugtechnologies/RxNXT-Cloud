const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current Row-Level Security (RLS) status across all public tables in Supabase...');

  // Query tables in public schema and their RLS status
  const tables = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS tablename, c.relrowsecurity AS rowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
  `);

  console.log(`Found ${tables.length} tables in public schema:`);
  console.table(tables);

  const disabledTables = tables.filter(t => !t.rowsecurity);

  if (disabledTables.length === 0) {
    console.log('✅ All tables already have Row-Level Security enabled!');
    return;
  }

  console.log(`\n🚨 ${disabledTables.length} tables have RLS DISABLED: ${disabledTables.map(t => t.tablename).join(', ')}`);
  console.log('🛡️ Enabling Row-Level Security (RLS) on all public tables...');

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${table.tablename}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`  ✓ Enabled RLS on public."${table.tablename}"`);
    } catch (err) {
      console.error(`  ✗ Failed on public."${table.tablename}":`, err.message);
    }
  }

  // Re-verify
  const verifiedTables = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS tablename, c.relrowsecurity AS rowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
  `);

  console.log('\n🔒 Re-verifying RLS status after fix:');
  console.table(verifiedTables);

  const remaining = verifiedTables.filter(t => !t.rowsecurity);
  if (remaining.length === 0) {
    console.log('\n🎉 SUCCESS: All public tables in Supabase project now have Row-Level Security (RLS) ENABLED!');
    console.log('Public PostgREST access is now completely secured against unauthorized anon requests.');
  } else {
    console.warn(`\n⚠️ Warning: ${remaining.length} tables still have RLS disabled:`, remaining.map(t => t.tablename));
  }
}

main()
  .catch((e) => {
    console.error('Fatal error running RLS fix:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
