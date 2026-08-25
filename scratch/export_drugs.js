const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportDrugs() {
  const drugs = await prisma.drug.findMany({
    orderBy: { genericName: 'asc' }
  });

  console.log("Total drugs retrieved:", drugs.length);

  // Write JSON
  fs.writeFileSync("global_medicine_catalog.json", JSON.stringify(drugs, null, 2));

  // Write CSV
  const headers = ["ID", "Generic Name", "Brand Name", "Aliases", "Dosage Form", "Strength", "Route", "Is Restricted", "Prescription Count"];
  const rows = drugs.map(d => [
    `"${d.id}"`,
    `"${(d.genericName || '').replace(/"/g, '""')}"`,
    `"${(d.brandName || '').replace(/"/g, '""')}"`,
    `"${(d.aliases || '').replace(/"/g, '""')}"`,
    `"${(d.dosageForm || '').replace(/"/g, '""')}"`,
    `"${(d.strength || '').replace(/"/g, '""')}"`,
    `"${(d.route || '').replace(/"/g, '""')}"`,
    d.isRestricted ? "Yes" : "No",
    d.prescriptionCount || 0
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  fs.writeFileSync("global_medicine_catalog.csv", csvContent);
  console.log("Exported global_medicine_catalog.json and global_medicine_catalog.csv successfully!");

  await prisma.$disconnect();
}

exportDrugs().catch(err => {
  console.error("Export error:", err);
  process.exit(1);
});
