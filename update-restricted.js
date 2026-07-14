const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RESTRICTED_KEYWORDS = [
  'ketamine',
  'morphine',
  'fentanyl',
  'alprazolam',
  'diazepam',
  'clonazepam',
  'lorazepam',
  'codeine',
  'buprenorphine',
  'tramadol',
  'methadone',
  'oxycodone',
  'hydrocodone',
  'phenobarbital',
  'amphetamine',
  'methylphenidate',
  'dexamphetamine',
  'secobarbital',
  'pentobarbital',
  'zolpidem',
  'ephedrine',
  'pseudoephedrine'
];

async function main() {
  console.log('Finding and updating restricted drugs in the database...');
  let updatedCount = 0;

  for (const keyword of RESTRICTED_KEYWORDS) {
    // Find drugs containing the keyword in genericName or brandName
    const drugs = await prisma.drug.findMany({
      where: {
        OR: [
          { genericName: { contains: keyword, mode: 'insensitive' } },
          { brandName: { contains: keyword, mode: 'insensitive' } },
        ]
      }
    });

    if (drugs.length > 0) {
      console.log(`Found ${drugs.length} drugs matching '${keyword}'`);
      for (const drug of drugs) {
        await prisma.drug.update({
          where: { id: drug.id },
          data: { isRestricted: true }
        });
        updatedCount++;
        console.log(` - Updated: ${drug.brandName || drug.genericName} (ID: ${drug.id})`);
      }
    }
  }

  console.log(`\nSuccessfully updated ${updatedCount} drugs to be restricted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
