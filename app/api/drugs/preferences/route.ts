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

    // 3. If still fewer than 8, supplement with overall top prescribed active drugs
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

    // Format drugs with clinically smart default frequency / duration / instructions
    const formatted = drugs.map(d => {
      const name = d.brandName || d.genericName;
      const lower = name.toLowerCase();

      // Clinical smart defaults
      let defaultFreq = '1-0-1';
      let defaultDuration = '3 days';
      let defaultInstructions = 'After Food';

      if (lower.includes('pan') || lower.includes('rab') || lower.includes('ome') || lower.includes('pantoprazole')) {
        defaultFreq = '1-0-0';
        defaultDuration = '5 days';
        defaultInstructions = 'Before Food';
      } else if (lower.includes('azith') || lower.includes('augmentin') || lower.includes('mox') || lower.includes('cefix')) {
        defaultFreq = '1-0-1';
        defaultDuration = '5 days';
        defaultInstructions = 'After Food';
      } else if (lower.includes('dolo') || lower.includes('crocin') || lower.includes('paracetamol')) {
        defaultFreq = '1-0-1';
        defaultDuration = '3 days';
        defaultInstructions = 'After Food';
      } else if (lower.includes('montair') || lower.includes('cetz') || lower.includes('cetirizine') || lower.includes('levocet')) {
        defaultFreq = '0-0-1';
        defaultDuration = '5 days';
        defaultInstructions = 'At bedtime';
      } else if (lower.includes('ors')) {
        defaultFreq = '1-1-1';
        defaultDuration = '2 days';
        defaultInstructions = 'Sip slowly with water';
      }

      return {
        id: d.id,
        drugId: d.id,
        name: name,
        genericName: d.genericName,
        brandName: d.brandName,
        dosage_form: d.dosageForm || 'TABLET',
        strength: d.strength || '',
        route: d.route || 'ORAL',
        frequency: defaultFreq,
        duration: defaultDuration,
        instructions: defaultInstructions,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Fetch drug preferences error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
