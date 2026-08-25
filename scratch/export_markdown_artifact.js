const fs = require('fs');
const drugs = JSON.parse(fs.readFileSync('global_medicine_catalog.json', 'utf8'));

let md = `# ?? RxNXT Global Medicine Catalog (150 Drugs)\n\n`;
md += `This catalog contains **${drugs.length} standard pharmaceutical entries** available across all clinics for rapid search auto-completion, brand-to-generic resolution, and dosage scheduling.\n\n`;
md += `| # | Generic Name | Popular Brand Name | Aliases | Form | Strength | Route | Schedule / Restriction |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;

drugs.forEach((d, idx) => {
  const generic = d.genericName || '-';
  const brand = d.brandName || '-';
  const aliases = d.aliases || '-';
  const form = d.dosageForm || '-';
  const strength = d.strength || '-';
  const route = d.route || 'Oral';
  const restricted = d.isRestricted ? '?? Restricted (Sched H/X)' : 'Standard';

  md += `| ${idx + 1} | **${generic}** | ${brand} | ${aliases} | \`${form}\` | ${strength} | ${route} | ${restricted} |\n`;
});

const artifactPath = "C:/Users/orugt/.gemini/antigravity/brain/34ae9eac-2d89-49e7-b315-8f759b94156e/global_medicine_catalog.md";
fs.writeFileSync(artifactPath, md);
console.log("Markdown artifact created at:", artifactPath);
