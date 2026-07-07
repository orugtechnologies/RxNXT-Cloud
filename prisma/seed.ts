// prisma/seed.ts
// Seeds the local SQLite database with:
//   - 1 demo clinic
//   - 1 demo doctor login
//   - 160+ common Indian drugs
//   - 5 sample patients

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RxNXT database...\n');

  // ── 0. Clear Tracking Data ──────────────────────────────────────────
  await prisma.doctorDrugPreference.deleteMany({});
  await prisma.clinicDrugPreference.deleteMany({});

  // ── 1. Demo Clinic ──────────────────────────────────────────────
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic-001' },
    update: {},
    create: {
      id: 'demo-clinic-001',
      name: 'RxNXT Demo Clinic',
      address: '123 Health Street, Bengaluru, Karnataka',
      phone: '+91 80 1234 5678',
      email: 'info@rxnxtdemo.com',
    },
  });
  console.log(`✅ Clinic: ${clinic.name}`);

  // ── 2. Demo Doctor ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@rxnxt.com' },
    update: {},
    create: {
      email: 'doctor@rxnxt.com',
      password: hashedPassword,
      fullName: 'Dr. Shanmukha Datta',
      role: 'clinic_admin',
      specialization: 'General Physician',
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Doctor: ${doctor.fullName} (${doctor.email})`);

  // ── 3. Drugs ────────────────────────────────────────────────────
  const drugsPath = path.join(process.cwd(), 'data', 'drugs.json');
  const drugsData = JSON.parse(fs.readFileSync(drugsPath, 'utf-8'));

  let drugCount = 0;
  for (const d of drugsData) {
    await prisma.drug.upsert({
      where: {
        id: `drug-${d.genericName}-${d.brandName ?? 'generic'}-${d.strength ?? 'std'}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .substring(0, 50),
      },
      update: {},
      create: {
        id: `drug-${d.genericName}-${d.brandName ?? 'generic'}-${d.strength ?? 'std'}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .substring(0, 50),
        genericName: d.genericName,
        brandName: d.brandName ?? null,
        aliases: d.genericName.toLowerCase() === 'paracetamol' ? 'PCM' : 
                 d.genericName.toLowerCase() === 'azithromycin' ? 'AZM' :
                 d.genericName.toLowerCase() === 'pantoprazole' ? 'PANTO' :
                 d.genericName.toLowerCase() === 'amoxicillin' ? 'AMOX' :
                 d.genericName.toLowerCase() === 'levocetirizine' ? 'LEVO' : null,
        dosageForm: d.dosageForm ?? null,
        strength: d.strength ?? null,
        route: d.route ?? null,
        prescriptionCount: Math.floor(Math.random() * 50),
      },
    });
    drugCount++;
  }
  console.log(`✅ Drugs seeded: ${drugCount} entries`);

  // ── 4. Sample Patients ──────────────────────────────────────────
  const patients = [
    { name: 'Ramesh Sharma', phone: '9876543210', age: 45, gender: 'Male' },
    { name: 'Priya Nair', phone: '9765432109', age: 32, gender: 'Female' },
    { name: 'Abdul Rahman', phone: '9654321098', age: 62, gender: 'Male' },
    { name: 'Lakshmi Devi', phone: '9543210987', age: 28, gender: 'Female' },
    { name: 'Suresh Kumar', phone: '9432109876', age: 55, gender: 'Male' },
  ];

  for (const p of patients) {
    await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        name: p.name,
        phone: p.phone,
        age: p.age,
        gender: p.gender,
      },
    });
  }
  console.log(`✅ Sample patients: ${patients.length} added`);

  // ── Done ─────────────────────────────────────────────────────────
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login: doctor@rxnxt.com');
  console.log('  Password: doctor123');
  console.log('  App: http://localhost:3000');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
