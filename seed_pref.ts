import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'doctor@rxnxt.com' } });
  const crocin = await prisma.drug.findFirst({ where: { brandName: 'Crocin' } });

  if (user && crocin) {
    console.log("Upserting Doctor Preference...");
    await prisma.doctorDrugPreference.upsert({
      where: { doctorId_drugId: { doctorId: user.id, drugId: crocin.id } },
      update: { count: { increment: 2 } },
      create: { doctorId: user.id, drugId: crocin.id, count: 2 },
    });
    console.log("Upserting Clinic Preference...");
    await prisma.clinicDrugPreference.upsert({
      where: { clinicId_drugId: { clinicId: user.clinicId, drugId: crocin.id } },
      update: { count: { increment: 2 } },
      create: { clinicId: user.clinicId, drugId: crocin.id, count: 2 },
    });
    console.log("Done.");
  }
}

main().finally(() => prisma.$disconnect());
