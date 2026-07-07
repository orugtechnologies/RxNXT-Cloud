import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const docPrefs = await prisma.doctorDrugPreference.findMany();
  const clinicPrefs = await prisma.clinicDrugPreference.findMany();
  const crocin = await prisma.drug.findFirst({ where: { brandName: 'Crocin' } });
  const pyrigesic = await prisma.drug.findFirst({ where: { brandName: 'Pyrigesic' } });

  console.log("--- Doctor Preferences ---");
  console.dir(docPrefs, { depth: null });
  console.log("--- Clinic Preferences ---");
  console.dir(clinicPrefs, { depth: null });
  console.log("--- Crocin ---");
  console.log(crocin);
  console.log("--- Pyrigesic ---");
  console.log(pyrigesic);
}

main().finally(() => prisma.$disconnect());
