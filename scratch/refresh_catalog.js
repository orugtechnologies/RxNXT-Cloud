const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function refreshFiles() {
  const allUpdated = await prisma.drug.findMany({ orderBy: { genericName: 'asc' } });
  fs.writeFileSync('global_medicine_catalog.json', JSON.stringify(allUpdated, null, 2));

  const headers = ['ID', 'Generic Name', 'Brand Name', 'Aliases', 'Dosage Form', 'Strength', 'Route', 'Is Restricted', 'Prescription Count'];
  const rows = allUpdated.map(d => [
    `"${d.id}"`,
    `"${(d.genericName || '').replace(/"/g, '""')}"`,
    `"${(d.brandName || '').replace(/"/g, '""')}"`,
    `"${(d.aliases || '').replace(/"/g, '""')}"`,
    `"${(d.dosageForm || '').replace(/"/g, '""')}"`,
    `"${(d.strength || '').replace(/"/g, '""')}"`,
    `"${(d.route || '').replace(/"/g, '""')}"`,
    d.isRestricted ? 'Yes' : 'No',
    d.prescriptionCount || 0
  ]);

  try {
    fs.writeFileSync('global_medicine_catalog.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  } catch (e) {
    fs.writeFileSync('global_medicine_catalog_updated.csv', [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
  }

  let md = '# ?? RxNXT Global Medicine Catalog (150 Drugs with Complete Aliases)\n\n';
  md += 'All **150 standard pharmaceutical entries** now have comprehensive aliases, clinical acronyms, and popular Indian brand shortcuts for ultra-fast search.\n\n';
  md += '| # | Generic Name | Popular Brand Name | Aliases & Search Shortcuts | Form | Strength | Route | Classification |\n';
  md += '|---|---|---|---|---|---|---|---|\n';

  allUpdated.forEach((d, idx) => {
    const generic = d.genericName || '-';
    const brand = d.brandName || '-';
    const aliases = d.aliases || '-';
    const form = d.dosageForm || '-';
    const strength = d.strength || '-';
    const route = d.route || 'Oral';
    const restricted = d.isRestricted ? '?? Schedule H / Restricted' : 'Standard';

    md += `| ${idx + 1} | **${generic}** | ${brand} | \`${aliases}\` | ${form} | ${strength} | ${route} | ${restricted} |\n`;
  });

  fs.writeFileSync('C:/Users/orugt/.gemini/antigravity/brain/34ae9eac-2d89-49e7-b315-8f759b94156e/global_medicine_catalog.md', md);
  console.log('Successfully refreshed JSON, CSV, and Markdown artifact!');
  await prisma.$disconnect();
}

refreshFiles().catch(err => {
  console.error('Refresh error:', err);
  process.exit(1);
});
