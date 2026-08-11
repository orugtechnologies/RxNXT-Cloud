const { PrismaClient } = require('@prisma/client');

const neonDbUrl = "postgresql://neondb_owner:npg_fm5eFcdzk3EA@ep-ancient-rain-aol4qecn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const supabaseDbUrl = process.env.DATABASE_URL || "postgresql://postgres.ztcbzxgczfahqexaqlxs:Orugtech%402024@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

const neon = new PrismaClient({ datasources: { db: { url: neonDbUrl } } });
const supabase = new PrismaClient({ datasources: { db: { url: supabaseDbUrl } } });

async function migrate() {
  console.log('📦 Starting Data Transfer from Neon -> Supabase Mumbai...\n');

  try {
    // 1. Clinics
    const clinics = await neon.clinic.findMany();
    console.log(`Found ${clinics.length} Clinics in Neon.`);
    for (const c of clinics) {
      await supabase.clinic.upsert({
        where: { id: c.id },
        update: c,
        create: c
      });
    }
    console.log('✅ Clinics migrated.');

    // 2. Users (Doctors/Admins including orughospital@orug.com)
    const users = await neon.user.findMany();
    console.log(`Found ${users.length} Users in Neon: ${users.map(u => u.email).join(', ')}`);
    for (const u of users) {
      // First delete any duplicate user with different ID to preserve exact foreign key IDs
      const existing = await supabase.user.findUnique({ where: { email: u.email } });
      if (existing && existing.id !== u.id) {
        await supabase.user.delete({ where: { email: u.email } });
      }

      await supabase.user.upsert({
        where: { id: u.id },
        update: u,
        create: u
      });
    }
    console.log('✅ All 6 Users (including orughospital@orug.com) migrated successfully.');

    // 3. Patients
    const patients = await neon.patient.findMany();
    console.log(`Found ${patients.length} Patients in Neon.`);
    for (const p of patients) {
      await supabase.patient.upsert({
        where: { id: p.id },
        update: p,
        create: p
      });
    }
    console.log('✅ Patients migrated.');

    // 4. Encounters
    const encounters = await neon.encounter.findMany();
    console.log(`Found ${encounters.length} Encounters in Neon.`);
    for (const enc of encounters) {
      await supabase.encounter.upsert({
        where: { id: enc.id },
        update: enc,
        create: enc
      });
    }
    console.log('✅ Encounters migrated.');

    // 5. Prescriptions
    const prescriptions = await neon.prescription.findMany();
    console.log(`Found ${prescriptions.length} Prescriptions in Neon.`);
    for (const rx of prescriptions) {
      await supabase.prescription.upsert({
        where: { id: rx.id },
        update: rx,
        create: rx
      });
    }
    console.log('✅ Prescriptions migrated.');

    // 6. Prescription Medicines
    const rxMeds = await neon.prescriptionMedicine.findMany();
    console.log(`Found ${rxMeds.length} Prescription Medicines in Neon.`);
    for (const pm of rxMeds) {
      await supabase.prescriptionMedicine.upsert({
        where: { id: pm.id },
        update: pm,
        create: pm
      });
    }
    console.log('✅ Prescription Medicines migrated.');

    // 7. Queue Items
    const queueItems = await neon.queueItem.findMany();
    console.log(`Found ${queueItems.length} Queue Items in Neon.`);
    for (const q of queueItems) {
      await supabase.queueItem.upsert({
        where: { id: q.id },
        update: q,
        create: q
      });
    }
    console.log('✅ Queue Items migrated.');

    console.log('\n🎉 ALL NEON DATA HAS BEEN COPIED TO SUPABASE MUMBAI SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Migration Error:', err);
  } finally {
    await neon.$disconnect();
    await supabase.$disconnect();
  }
}

migrate();
