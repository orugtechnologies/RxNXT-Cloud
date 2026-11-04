const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('1. Ensuring ROW LEVEL SECURITY is enabled on all tables in public schema...');
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  `);

  for (const row of tables) {
    const tableName = row.tablename;
    console.log(`Enabling RLS on "${tableName}"...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`);
  }

  console.log('\n2. Revoking public REST API privileges from anon & authenticated roles...');
  await prisma.$executeRawUnsafe(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;`);
  await prisma.$executeRawUnsafe(`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;`);
  await prisma.$executeRawUnsafe(`REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;`);
  await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;`);
  await prisma.$executeRawUnsafe(`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;`);

  console.log('\n3. Verifying security status...');
  const insecure = await prisma.$queryRawUnsafe(`
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
  `);

  console.log('Insecure tables remaining (rls_disabled):', insecure.length);

  const remainingGrants = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as count 
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');
  `);
  console.log('Remaining table grants to anon/authenticated:', remainingGrants[0].count);

  console.log('\n4. Verifying Prisma access as backend service...');
  const count = await prisma.clinic.count();
  console.log('Prisma query test passed. Total clinics:', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
