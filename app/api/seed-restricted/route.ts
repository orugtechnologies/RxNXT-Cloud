import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDrugNameRestricted } from '@/lib/restrictedDrugs';

export async function GET(request: Request) {
  try {
    const RESTRICTED_KEYWORDS = [
      'ketamine', 'morphine', 'fentanyl', 'alprazolam', 'diazepam',
      'clonazepam', 'lorazepam', 'codeine', 'buprenorphine', 'tramadol',
      'methadone', 'oxycodone', 'hydrocodone', 'phenobarbital',
      'amphetamine', 'methylphenidate', 'dexamphetamine', 'secobarbital',
      'pentobarbital', 'zolpidem', 'ephedrine', 'pseudoephedrine'
    ];

    let totalUpdated = 0;

    for (const keyword of RESTRICTED_KEYWORDS) {
      // Find all drugs matching the keyword
      const drugs = await prisma.drug.findMany({
        where: {
          OR: [
            { genericName: { contains: keyword, mode: 'insensitive' } },
            { brandName: { contains: keyword, mode: 'insensitive' } },
          ],
          isRestricted: false // Only update those not already flagged
        },
        select: { id: true }
      });

      if (drugs.length > 0) {
        const ids = drugs.map(d => d.id);
        const result = await prisma.drug.updateMany({
          where: { id: { in: ids } },
          data: { isRestricted: true }
        });
        totalUpdated += result.count;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully flagged ${totalUpdated} restricted drugs in the database.` });
  } catch (error: any) {
    console.error('Error seeding restricted drugs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
