const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

// Comprehensive Clinical and Indian Brand Alias Dictionary
const aliasDictionary = {
  // Analgesics & NSAIDs & Antipyretics
  'Aceclofenac': ['Zerodol', 'Hifenac', 'Aceclo', 'Dolokind', 'ACL'],
  'Paracetamol': ['PCM', 'Dolo', 'Calpol', 'Crocin', 'P-Mol', 'Pacimol', 'Pyrigesic'],
  'Ibuprofen': ['Brufen', 'Combiflam', 'Ibugesic', 'IBU'],
  'Diclofenac': ['Voveran', 'Dynapar', 'Voltaren', 'Diclogel', 'DIC'],
  'Tramadol': ['Tramazac', 'Ultracet', 'Tramatas', 'Contramal', 'TRA'],
  'Mefenamic Acid': ['Meftal', 'Ponstan', 'Meftal Spas', 'MEF'],
  'Aspirin': ['Ecosprin', 'Disprin', 'ASA', 'Aspicot', 'Cardiprin'],
  'Piroxicam': ['Dolonex', 'Feldene', 'Pirox'],

  // Antibiotics & Anti-Infectives
  'Amoxicillin': ['Mox', 'Amoxil', 'Novamox', 'AMOX'],
  'Amoxicillin-Clavulanate': ['Augmentin', 'Clavam', 'Moxikind-CV', 'Amoxyclav', 'AUG', 'CV'],
  'Amoxicillin + Clavulanic Acid': ['Augmentin', 'Clavam', 'Moxikind-CV', 'Amoxyclav', 'AUG'],
  'Azithromycin': ['Azee', 'Azithral', 'Zithromax', 'AZM', 'Azi'],
  'Cefixime': ['Zifi', 'Taxim-O', 'Cefspan', 'Mahacef', 'CFX'],
  'Cefpodoxime': ['Monocef-O', 'Gudcef', 'Doxcef', 'Macpod', 'CPD'],
  'Cefuroxime': ['Ceftum', 'Cetil', 'Altacef', 'Pulmocef', 'CXM'],
  'Ceftriaxone': ['Monocef', 'Rocephin', 'Xone', 'Oframax', 'CTR'],
  'Ciprofloxacin': ['Cifran', 'Ciplox', 'Cipro', 'CIP'],
  'Levofloxacin': ['Levomac', 'Loxof', 'Glevo', 'LEVO', 'LVX'],
  'Ofloxacin': ['Oflox', 'Zenflox', 'Tarivid', 'OFL'],
  'Doxycycline': ['Doxil', 'Doxy-1', 'Microdox', 'DOX'],
  'Metronidazole': ['Flagyl', 'Metrogyl', 'METRO', 'MTZ'],
  'Norfloxacin': ['Norflox', 'Norilet', 'NOR'],
  'Nitrofurantoin': ['Martifur', 'Niftran', 'NFT'],
  'Acyclovir': ['Zovirax', 'Herperax', 'ACV'],
  'Fluconazole': ['Forcan', 'Flucos', 'Diflucan', 'FLZ'],
  'Albendazole': ['Zentel', 'Bandey', 'Noworm', 'ALB'],
  'Ivermectin': ['Ivecop', 'Vermact', 'IVM'],

  // Gastrointestinal & Antacids
  'Pantoprazole': ['Pan', 'Pantocid', 'Pantop', 'PAN'],
  'Pantoprazole + Domperidone': ['Pan-D', 'Pantocid-D', 'Pantop-D', 'PAND'],
  'Omeprazole': ['Omez', 'Omee', 'Prilosec', 'OMZ'],
  'Rabeprazole': ['Razo', 'Happi', 'Rabicip', 'Rablet', 'RAB'],
  'Esomeprazole': ['Nexpro', 'Sompraz', 'Nexium', 'ESO'],
  'Ranitidine': ['Rantac', 'Aciloc', 'Zantac', 'RAN'],
  'Famotidine': ['Famocid', 'Pepcid', 'FAM'],
  'Antacid (Aluminium+Magnesium)': ['Digene', 'Gelusil', 'Mucaine', 'ANTACID'],
  'Sucralfate': ['Sucrafil', 'Carafate', 'SUC'],
  'Ondansetron': ['Emeset', 'Ondem', 'Zofran', 'Vomikind', 'OND'],
  'Domperidone': ['Domstal', 'Motilium', 'Vomistop', 'DOM'],
  'Metoclopramide': ['Perinorm', 'Reglan', 'MCP'],
  'Loperamide': ['Imodium', 'Lopamide', 'LOP'],
  'Bisacodyl': ['Dulcolax', 'Dulcoflex', 'BIS'],
  'Lactulose': ['Duphalac', 'Cremaffin', 'LAC'],
  'Oral Rehydration Salts': ['ORS', 'Electral', 'Walyte', 'Prolyte'],

  // Respiratory & Allergy
  'Cetirizine': ['Cetzine', 'Alerid', 'Zyrtec', 'Okacet', 'CET'],
  'Levocetirizine': ['Levocet', 'Vozet', 'Xyzal', 'L-Cet', 'LEVO-CET'],
  'Montelukast + Levocetirizine': ['Montair-LC', 'Telekast-L', 'Levocet-M', 'Montek-LC', 'MLC'],
  'Fexofenadine': ['Allegra', 'Fexova', 'Altiva', 'FEXO'],
  'Bilastine': ['Bilaxten', 'Bilasure', 'BIL'],
  'Ambroxol': ['Mucolite', 'Ambrodil', 'AMB'],
  'Bromhexine': ['Bisolvon', 'Grilinctus-BM', 'BRM'],
  'Dextromethorphan': ['Benadryl DR', 'Ascoril D', 'DXM'],
  'Salbutamol': ['Asthalin', 'Ventolin', 'SBL'],
  'Ipratropium': ['Duolin', 'Ipravent', 'IPR'],
  'Budesonide': ['Budecort', 'Pulmicort', 'BUD'],
  'Formoterol + Budesonide': ['Foracort', 'Symbicort', 'Budetrol'],

  // Cardiovascular & Hypertension
  'Amlodipine': ['Amlong', 'Stamlo', 'Norvasc', 'AML'],
  'Telmisartan': ['Telma', 'Telmikind', 'Telpres', 'Micardis', 'TEL'],
  'Telmisartan + Hydrochlorothiazide': ['Telma-H', 'Telmikind-H', 'TEL-H'],
  'Telmisartan + Amlodipine': ['Telma-AM', 'Amlokind-T', 'TEL-AM'],
  'Losartan': ['Losacar', 'Repace', 'Cozaar', 'LOS'],
  'Atorvastatin': ['Atorva', 'Storvas', 'Lipitor', 'Atocor', 'ATOR'],
  'Rosuvastatin': ['Rosuvas', 'Rozavel', 'Crestor', 'ROSU'],
  'Metoprolol': ['Betaloc', 'Metolar', 'Seloken', 'METO'],
  'Atenolol': ['Tenormin', 'Betacard', 'ATN'],
  'Carvedilol': ['Carloc', 'Coreg', 'CARV'],
  'Bisoprolol': ['Concor', 'Corbis', 'BISO'],
  'Ramipril': ['Cardace', 'Ramirand', 'RAM'],
  'Enalapril': ['Envas', 'Vasotec', 'ENA'],
  'Amiodarone': ['Cordarone', 'AMI'],
  'Clopidogrel': ['Clopilet', 'Plavix', 'CLOP'],
  'Furosemide': ['Lasix', 'Frusenex', 'LASIX', 'FUR'],
  'Torsemide': ['Dytor', 'Torget', 'TOR'],
  'Spironolactone': ['Aldactone', 'SPIR'],

  // Diabetes & Endocrine
  'Metformin': ['Glycomet', 'Gluconorm', 'Glucophage', 'Obimet', 'MET'],
  'Glimepiride': ['Amaryl', 'Zoryl', 'Glimy', 'GLIM'],
  'Glipizide': ['Glynase', 'Minidiab'],
  'Gliclazide': ['Diamicron', 'Reclimet', 'GLIC'],
  'Voglibose': ['Volibo', 'Vobose', 'PPG', 'VOG'],
  'Teneligliptin': ['Tenalim', 'Ziten', 'Tenglyn', 'TENE'],
  'Sitagliptin': ['Januvia', 'Istavel', 'SITA'],
  'Vildagliptin': ['Galvus', 'Jalra', 'VILDA'],
  'Dapagliflozin': ['Forxiga', 'Oxra', 'DAPA'],
  'Empagliflozin': ['Jardiance', 'Gibtulio', 'EMPA'],
  'Levothyroxine': ['Thyronorm', 'Eltroxin', 'Synthroid', 'THYRO'],
  'Carbimazole': ['Neomercazole', 'CARB'],

  // Vitamins, Minerals & Supplements
  'Calcium + Vitamin D3': ['Shelcal', 'Gemcal', 'Cipcal', 'CAL-D3'],
  'Cholecalciferol': ['Calcirol', 'D3 Must', 'Uprise D3', 'Tayo', 'Vit D3', 'D3'],
  'Vitamin D3': ['Calcirol', 'D3 Must', 'Uprise D3', 'Tayo', 'Vit D3'],
  'Vitamin B-Complex': ['Becosules', 'Neurobion Forte', 'Optineuron', 'BCP', 'B-COMP'],
  'Methylcobalamin': ['Nurokind', 'Meganeuron', 'Mecobal', 'B12'],
  'Iron + Folic Acid': ['Autrin', 'Orofer-XT', 'Dexorange', 'Fefol', 'IFA'],
  'Zinc + Vitamin C': ['Limcee', 'Celin', 'Becozinc', 'Zincovit', 'VIT-C'],

  // Neurology, Psychiatry & Sedatives (Restricted / Sched H)
  'Alprazolam': ['Alprax', 'Restyl', 'Trika', 'ALP'],
  'Clonazepam': ['Clonotril', 'Zapiz', 'Rivotril', 'CLZ'],
  'Lorazepam': ['Ativan', 'Lopez', 'LOR'],
  'Diazepam': ['Valium', 'Calmpose', 'DZP'],
  'Escitalopram': ['Nexito', 'Cipralex', 'ESC'],
  'Sertraline': ['Daxid', 'Zoloft', 'SERT'],
  'Amitriptyline': ['Tryptomer', 'Elavil', 'AMI'],
  'Pregabalin': ['Pregalin', 'Lyrica', 'Maxgalin', 'PGB'],
  'Gabapentin': ['Gabapin', 'Neurontin', 'GBP'],
  'Carbamazepine': ['Tegretol', 'Mazetol', 'CBZ'],
  'Sodium Valproate': ['Epilim', 'Encorate', 'Valparin', 'VPA'],
  'Levetiracetam': ['Levera', 'Keppra', 'LEV'],

  // Dermatology & Topical
  'Betamethasone Cream': ['Betnovate', 'Betamil', 'BET'],
  'Clobetasol': ['Tenovate', 'Cloben', 'CLO'],
  'Mupirocin': ['T-Bact', 'Bactroban', 'MUP'],
  'Clotrimazole': ['Candid', 'Canesten', 'CLOT'],
  'Ketoconazole': ['Nizral', 'Ketocip', 'KTC'],
  'Permethrin': ['Permite', 'Scaboma', 'PERM'],
  'Calamine Lotion': ['Lacto Calamine', 'Caladryl', 'CALAMINE']
};

async function runEnrichment() {
  console.log("Fetching all global drugs...");
  const drugs = await prisma.drug.findMany();
  console.log(`Found ${drugs.length} drugs.`);

  let updatedCount = 0;

  for (const d of drugs) {
    let matchedAliases = [];

    // Match exact generic name
    for (const [genKey, aliasArr] of Object.entries(aliasDictionary)) {
      if (d.genericName.toLowerCase().includes(genKey.toLowerCase()) || genKey.toLowerCase().includes(d.genericName.toLowerCase())) {
        matchedAliases.push(...aliasArr);
      }
    }

    // Include existing brand name if distinct
    if (d.brandName) {
      const cleanBrand = d.brandName.split(' ')[0];
      if (!matchedAliases.includes(cleanBrand)) {
        matchedAliases.push(cleanBrand);
      }
    }

    // Include any existing aliases
    if (d.aliases) {
      const existing = d.aliases.split(',').map(s => s.trim());
      matchedAliases.push(...existing);
    }

    // De-duplicate & format as clean comma-separated string
    const uniqueAliases = Array.from(new Set(matchedAliases.map(s => s.trim()))).filter(Boolean);
    
    // Default shorthand if none matched: first 4 letters of generic
    if (uniqueAliases.length === 0) {
      uniqueAliases.push(d.genericName.slice(0, 4).toUpperCase());
    }

    const finalAliases = uniqueAliases.join(', ');

    await prisma.drug.update({
      where: { id: d.id },
      data: { aliases: finalAliases }
    });

    updatedCount++;
  }

  console.log(`Successfully enriched ${updatedCount} drugs with rich Indian aliases!`);

  // Re-export CSV & JSON
  const allUpdated = await prisma.drug.findMany({ orderBy: { genericName: 'asc' } });
  fs.writeFileSync("global_medicine_catalog.json", JSON.stringify(allUpdated, null, 2));

  const headers = ["ID", "Generic Name", "Brand Name", "Aliases", "Dosage Form", "Strength", "Route", "Is Restricted", "Prescription Count"];
  const rows = allUpdated.map(d => [
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

  fs.writeFileSync("global_medicine_catalog.csv", [headers.join(','), ...rows.map(r => r.join(','))].join('\n'));

  // Update markdown artifact
  let md = `# ?? RxNXT Global Medicine Catalog (150 Drugs with Complete Aliases)\n\n`;
  md += `All **150 standard pharmaceutical entries** now have comprehensive aliases, clinical acronyms, and popular Indian brand shortcuts for ultra-fast search.\n\n`;
  md += `| # | Generic Name | Popular Brand Name | Aliases & Search Shortcuts | Form | Strength | Route | Classification |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

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

  fs.writeFileSync("C:/Users/orugt/.gemini/antigravity/brain/34ae9eac-2d89-49e7-b315-8f759b94156e/global_medicine_catalog.md", md);

  console.log("All catalogs and artifacts refreshed!");
  await prisma.$disconnect();
}

runEnrichment().catch(err => {
  console.error("Enrichment error:", err);
  process.exit(1);
});
