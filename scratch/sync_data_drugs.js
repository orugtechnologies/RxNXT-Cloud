const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function sync() {
  const drugs = await prisma.drug.findMany({ orderBy: { genericName: 'asc' } });
  const mapped = drugs.map(d => ({
    genericName: d.genericName,
    brandName: d.brandName,
    aliases: d.aliases,
    dosageForm: d.dosageForm,
    strength: d.strength,
    route: d.route,
    isRestricted: d.isRestricted
  }));

  fs.writeFileSync('data/drugs.json', JSON.stringify(mapped, null, 2));
  console.log(`Synced ${mapped.length} enriched drugs with aliases into data/drugs.json!`);
  await prisma.$disconnect();
}
sync();
