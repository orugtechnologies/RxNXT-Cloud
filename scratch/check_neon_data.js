const { PrismaClient } = require('@prisma/client');

const neonPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_fm5eFcdzk3EA@ep-ancient-rain-aol4qecn.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function checkOldData() {
  try {
    console.log('--- FETCHING OLD NEON DATA ---');
    const clinics = await neonPrisma.clinic.findMany();
    console.log('Clinics in Neon:', clinics);

    const users = await neonPrisma.user.findMany();
    console.log('Users in Neon:', users.map(u => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role })));

    const patients = await neonPrisma.patient.findMany();
    console.log('Patients count in Neon:', patients.length);

    const prescriptions = await neonPrisma.prescription.findMany();
    console.log('Prescriptions count in Neon:', prescriptions.length);

  } catch (err) {
    console.error('Error querying Neon DB:', err);
  } finally {
    await neonPrisma.$disconnect();
  }
}

checkOldData();
