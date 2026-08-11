const { PrismaClient } = require('@prisma/client');

const neonDbUrl = "postgresql://neondb_owner:npg_fm5eFcdzk3EA@ep-ancient-rain-aol4qecn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const supabaseDbUrl = process.env.DATABASE_URL || "postgresql://postgres.ztcbzxgczfahqexaqlxs:Orugtech%402024@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const neon = new PrismaClient({ datasources: { db: { url: neonDbUrl } } });
const supabase = new PrismaClient({ datasources: { db: { url: supabaseDbUrl } } });

async function migrateReminders() {
  console.log('🔄 Checking and copying Reminders from Neon -> Supabase...\n');

  try {
    const reminders = await neon.reminder.findMany();
    console.log(`Found ${reminders.length} Reminders in Neon.`);

    for (const r of reminders) {
      await supabase.reminder.upsert({
        where: { id: r.id },
        update: r,
        create: r
      });
    }

    console.log('✅ All Reminders successfully copied to Supabase Mumbai!');
  } catch (err) {
    console.error('❌ Reminder Migration Error:', err);
  } finally {
    await neon.$disconnect();
    await supabase.$disconnect();
  }
}

migrateReminders();
