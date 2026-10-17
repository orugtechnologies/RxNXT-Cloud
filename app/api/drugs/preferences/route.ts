export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let drugs: any[] = [];

    // 1. Doctor's Personal Preferences (Real-world prescription count)
    const doctorPrefs = await prisma.doctorDrugPreference.findMany({
      where: { doctorId: user.id, count: { gt: 0 } },
      orderBy: { count: 'desc' },
      take: 8,
      include: { drug: true }
    });

    drugs = doctorPrefs.map(dp => dp.drug).filter(Boolean);

    // 2. If fewer than 8, supplement with Clinic-wide preferences
    if (drugs.length < 8 && user.clinicId) {
      const existingIds = drugs.map(d => d.id);
      const clinicPrefs = await prisma.clinicDrugPreference.findMany({
        where: {
          clinicId: user.clinicId,
          count: { gt: 0 },
          drugId: { notIn: existingIds }
        },
        orderBy: { count: 'desc' },
        take: 8 - drugs.length,
        include: { drug: true }
      });
      drugs.push(...clinicPrefs.map(cp => cp.drug).filter(Boolean));
    }

    // 3. If still fewer than 8, supplement with curated everyday OPD essentials
    // (Prevents random seeded cardiac/specialty drugs from dominating fresh accounts)
    if (drugs.length < 8) {
      const CURATED_OPD_KEYWORDS = [
        'dolo',
        'pan',
        'azithral',
        'augmentin',
        'montair',
        'levocet',
        'emeset',
        'combiflam',
        'calpol',
        'voveran'
      ];

      for (const keyword of CURATED_OPD_KEYWORDS) {
        if (drugs.length >= 8) break;
        const existingIds = drugs.map(d => d.id);
        const match = await prisma.drug.findFirst({
          where: {
            isActive: true,
            id: { notIn: existingIds },
            OR: [
              { brandName: { contains: keyword, mode: 'insensitive' } },
              { genericName: { contains: keyword, mode: 'insensitive' } }
            ]
          }
        });
        if (match) {
          drugs.push(match);
        }
      }
    }

    // 4. Final safety fallback: supplement with top prescribed drugs if still under 8
    if (drugs.length < 8) {
      const existingIds = drugs.map(d => d.id);
      const topDrugs = await prisma.drug.findMany({
        where: {
          isActive: true,
          id: { notIn: existingIds },
          OR: [
            { clinicId: user.clinicId },
            { clinicId: null }
          ]
        },
        orderBy: [
          { prescriptionCount: 'desc' },
          { createdAt: 'asc' }
        ],
        take: 8 - drugs.length
      });
      drugs.push(...topDrugs);
    }

    // Format drugs for quick chip presentation
    const formatted = drugs.map(d => ({
      id: d.id,
      drugId: d.id,
      name: d.brandName || d.genericName,
      genericName: d.genericName,
      brandName: d.brandName,
      dosage_form: d.dosageForm || 'TABLET',
      strength: d.strength || '',
      route: d.route || 'ORAL',
      frequency: '',
      duration: '',
      instructions: '',
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Fetch drug preferences error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
