export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = user.clinicId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Run all counts in parallel for maximum performance
    const [
      totalPatients,
      totalPrescriptions,
      todayPrescriptions,
      recentPrescriptions,
      followUps,
      frequentMedsPrefs,
      queueItems,
    ] = await Promise.all([
      // Total patients in clinic
      prisma.patient.count({ where: { clinicId } }),

      // Total prescriptions in clinic
      prisma.prescription.count({ where: { clinicId } }),

      // Today's prescriptions
      prisma.prescription.count({
        where: { clinicId, createdAt: { gte: today } },
      }),

      // Recent prescriptions (last 10)
      prisma.prescription.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          patient: { select: { name: true, age: true, gender: true } },
          encounter: { select: { chiefComplaint: true, diagnosis: true, followUpDate: true } },
          medicines: { select: { id: true } },
        },
      }),

      // Upcoming follow-ups (next 7 days)
      prisma.encounter.findMany({
        where: {
          clinicId,
          followUpDate: {
            gte: today.toISOString().split('T')[0],
            lte: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          },
        },
        orderBy: { followUpDate: 'asc' },
        take: 10,
        include: {
          patient: { select: { name: true, phone: true, age: true, gender: true } },
        },
      }),

      // Frequent medicines for THIS clinic (fast query)
      prisma.clinicDrugPreference.findMany({
        where: { clinicId, count: { gt: 0 } },
        orderBy: { count: 'desc' },
        take: 10,
        include: { drug: true }
      }),

      // Today's Queue (WAITING status for this doctor)
      prisma.queueItem.findMany({
        where: {
          clinicId,
          doctorId: user.id,
          status: 'WAITING',
          createdAt: { gte: today },
        },
        orderBy: { createdAt: 'asc' },
        include: {
          patient: { select: { name: true, phone: true, age: true, gender: true } },
        },
      }),
    ]);

    // Format recent prescriptions
    const formattedRecentRx = recentPrescriptions.map((rx) => ({
      id: rx.id,
      created_at: rx.createdAt.toISOString(),
      patient_id: rx.patientId,
      patient_name: rx.patient.name,
      patient_age: rx.patient.age,
      patient_gender: rx.patient.gender,
      chief_complaint: rx.encounter?.chiefComplaint ?? null,
      diagnosis: rx.encounter?.diagnosis ?? null,
      follow_up_date: rx.encounter?.followUpDate ?? null,
      medicine_count: rx.medicines.length,
    }));

    // Format follow-ups
    const formattedFollowUps = followUps.map((enc) => {
      const followDate = new Date(enc.followUpDate!);
      const daysUntil = Math.ceil((followDate.getTime() - Date.now()) / 86400000);
      return {
        encounter_id: enc.id,
        follow_up_date: enc.followUpDate,
        chief_complaint: enc.chiefComplaint,
        diagnosis: enc.diagnosis,
        visit_date: enc.createdAt.toISOString(),
        patient_id: enc.patientId,
        patient_name: enc.patient.name,
        patient_phone: enc.patient.phone,
        patient_age: enc.patient.age,
        patient_gender: enc.patient.gender,
        days_until: daysUntil,
      };
    });

    // Format frequent medicines
    const formattedFreqMeds = frequentMedsPrefs.map((pref) => ({
      medicine_id: pref.drug.id,
      medicine_name: pref.drug.brandName ?? pref.drug.genericName,
      dosage_form: pref.drug.dosageForm,
      strength: pref.drug.strength,
      route: pref.drug.route,
      prescription_count: pref.count,
    }));

    // Format Queue
    const formattedQueue = queueItems.map((q) => ({
      id: q.id,
      patient_id: q.patientId,
      patient_name: q.patient.name,
      patient_phone: q.patient.phone,
      patient_age: q.patient.age,
      patient_gender: q.patient.gender,
      waiting_since: q.createdAt.toISOString(),
      status: q.status,
    }));

    return NextResponse.json({
      stats: {
        total_patients: totalPatients,
        today_patients: 0, // Not tracked at patient level; use rx count
        total_prescriptions: totalPrescriptions,
        prescriptions_today: todayPrescriptions,
        follow_ups_due: followUps.length,
        recent_activity: [],
      },
      recentPrescriptions: formattedRecentRx,
      followUps: formattedFollowUps,
      frequentMedicines: formattedFreqMeds,
      todayQueue: formattedQueue,
    });

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

