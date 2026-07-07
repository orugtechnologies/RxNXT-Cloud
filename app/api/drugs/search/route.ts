export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const queryLower = q.toLowerCase();

    // 1. Fetch active drug catalog and personalized preferences
    const [allDrugs, doctorPrefs, clinicPrefs] = await Promise.all([
      prisma.drug.findMany({
        where: { 
          isActive: true,
          OR: [
            { clinicId: null },
            { clinicId: user.clinicId }
          ]
        },
        select: { id: true, genericName: true, brandName: true, aliases: true, dosageForm: true, strength: true, route: true, clinicId: true }
      }),
      prisma.doctorDrugPreference.findMany({ where: { doctorId: user.id } }),
      prisma.clinicDrugPreference.findMany({ where: { clinicId: user.clinicId } })
    ]);

    // O(1) Lookups for preferences
    const docPrefMap = new Map(doctorPrefs.map(p => [p.drugId, p.count]));
    const clinicPrefMap = new Map(clinicPrefs.map(p => [p.drugId, p.count]));

    // Helper: Map drug to UI format
    const mapDrugToResponse = (d: any, finalScore: number, rawFuzzy: number, popularity: number) => ({
      brand_id: d.id,
      generic_id: d.id,
      brand_name: d.brandName ?? d.genericName,
      generic_name: d.genericName,
      dosage_form: d.dosageForm,
      strength: d.strength,
      route: d.route,
      aliases: d.aliases,
      match_score: finalScore,
      raw_score: rawFuzzy,
      popularity: popularity,
      drugId: d.id,
    });

    // 2. SHORT-CIRCUIT: Exact Alias Match
    const exactAliasMatches = allDrugs.filter(d => 
      d.aliases && d.aliases.toLowerCase().split(',').map(a => a.trim()).includes(queryLower)
    );

    if (exactAliasMatches.length > 0) {
      const rankedAliases = exactAliasMatches.map(d => {
        const docCount = docPrefMap.get(d.id) || 0;
        const clinicCount = clinicPrefMap.get(d.id) || 0;
        // Exact Alias Match +100
        let score = 100 + Math.min(docCount, 50) + Math.min(clinicCount, 20);
        if (d.clinicId === user.clinicId) score += 60; // Clinic-specific custom drug boost
        return mapDrugToResponse(d, score, 0, docCount);
      });
      // Sort Descending
      rankedAliases.sort((a, b) => b.match_score - a.match_score);
      return NextResponse.json({ 
        data: rankedAliases.slice(0, 25), 
        metadata: { isLowConfidence: false, totalFound: rankedAliases.length } 
      });
    }

    // 3. FULL ADDITIVE SCORING (ML Search Strategy)
    const fuse = new Fuse(allDrugs, {
      keys: ['genericName', 'brandName', 'aliases'],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    });

    const fuseResults = fuse.search(q);

    let rankedResults = fuseResults.map(result => {
      const d = result.item;
      const docCount = docPrefMap.get(d.id) || 0;
      const clinicCount = clinicPrefMap.get(d.id) || 0;
      
      let score = 0;

      // Doctor Usage Score: +0 to 50
      score += Math.min(docCount, 50);

      // Clinic Usage Score: +0 to 20
      score += Math.min(clinicCount, 20);
      
      // Clinic Custom Drug Bonus: +60 (Highest priority for custom items)
      if (d.clinicId === user.clinicId) score += 60;

      // Brand Match: +40
      if (d.brandName?.toLowerCase() === queryLower) score += 40;

      // Generic Match: +30
      if (d.genericName.toLowerCase() === queryLower) score += 30;

      // Prefix Match: +25
      if (d.genericName.toLowerCase().startsWith(queryLower) || d.brandName?.toLowerCase().startsWith(queryLower)) {
          score += 25;
      }

      // Fuzzy Match: +0 to 20
      // fuse score is 0.0 (perfect) to 1.0 (mismatch). 
      const fuzzyPoints = Math.max(0, Math.round((1 - (result.score || 0)) * 20));
      score += fuzzyPoints;

      return mapDrugToResponse(d, score, result.score || 1.0, docCount);
    });

    // Sort by final additive score (Descending)
    rankedResults.sort((a, b) => b.match_score - a.match_score);

    // 4. Zero Results Strategy & Confidence
    // Low confidence if the absolute best score is incredibly low (e.g. less than 15 points)
    const isLowConfidence = rankedResults.length > 0 && rankedResults[0].match_score < 15;
    
    return NextResponse.json({ 
      data: rankedResults.slice(0, 25),
      metadata: {
        isLowConfidence, // Trigger "Did you mean?"
        totalFound: rankedResults.length
      }
    });

  } catch (err: any) {
    console.error("Search API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

