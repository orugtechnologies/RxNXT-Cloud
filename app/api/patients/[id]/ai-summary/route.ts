import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patientId = params.id;
    if (!patientId) return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });

    // Verify patient access
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: user.clinicId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 404 });
    }

    // Fetch all past encounters and prescriptions
    const encounters = await prisma.encounter.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        prescription: {
          include: {
            medicines: {
              include: {
                drug: true,
              },
            },
          },
        },
      },
    });

    // If 0 previous visits, mark as First Visit
    if (encounters.length === 0) {
      return NextResponse.json({
        isFirstVisit: true,
        visitCount: 0,
        patientName: patient.name,
        message: 'First time visit. No prior clinical history recorded.',
      });
    }

    // Process medical history for AI summarization
    const historyData = encounters.map((enc) => {
      const meds = enc.prescription?.medicines.map(m => m.customName || m.drug?.name).filter(Boolean) || [];
      return {
        date: enc.createdAt.toISOString().split('T')[0],
        chiefComplaint: enc.chiefComplaint || 'None noted',
        diagnosis: enc.diagnosis || 'General consultation',
        medicines: meds.join(', ') || 'No Rx prescribed',
      };
    });

    // Synthesize Clinical Insights
    const diagnosesList = Array.from(new Set(historyData.map(h => h.diagnosis))).filter(d => d !== 'General consultation');
    const complaintsList = Array.from(new Set(historyData.map(h => h.chiefComplaint))).filter(c => c !== 'None noted');
    const allMeds = Array.from(new Set(historyData.flatMap(h => h.medicines.split(', ')))).filter(m => m && m !== 'No Rx prescribed');

    const lastVisit = historyData[0];

    const summaryBullets = [
      diagnosesList.length > 0
        ? `Primary Diagnosis History: ${diagnosesList.join(', ')}`
        : `Chief Complaints Logged: ${complaintsList.join(', ') || 'Routine Wellness Checks'}`,

      allMeds.length > 0
        ? `Previously Prescribed Rx: ${allMeds.slice(0, 4).join(', ')}${allMeds.length > 4 ? ` (+${allMeds.length - 4} more)` : ''}`
        : `No heavy prescription drug history on record.`,

      `Last Consultation (${lastVisit.date}): ${lastVisit.diagnosis !== 'General consultation' ? lastVisit.diagnosis : lastVisit.chiefComplaint}`,
    ];

    const keyTakeaway = historyData.length > 2
      ? `Frequent visitor (${historyData.length} visits). Review chronic condition management.`
      : `Returning patient (${historyData.length} visit${historyData.length > 1 ? 's' : ''}). Last seen on ${lastVisit.date}.`;

    return NextResponse.json({
      isFirstVisit: false,
      visitCount: encounters.length,
      lastVisitDate: lastVisit.date,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      summaryBullets,
      keyTakeaway,
      recentDiagnoses: diagnosesList,
      recentMeds: allMeds,
    });

  } catch (error: any) {
    console.error('AI Summary Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI summary' }, { status: 500 });
  }
}
