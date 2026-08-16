export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// Clone a prescription for the same or a different patient
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sourcePrescriptionId, targetPatientId, chiefComplaint, diagnosis, notes, followUpDate } = await request.json();

    // Fetch the source prescription + medicines
    const source = await prisma.prescription.findFirst({
      where: { id: sourcePrescriptionId, clinicId: user.clinicId },
      include: {
        medicines: true,
        encounter: true,
      },
    });

    if (!source) return NextResponse.json({ error: 'Source prescription not found' }, { status: 404 });

    const patientId = targetPatientId || source.patientId;

    const result = await prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          chiefComplaint: chiefComplaint ?? source.encounter?.chiefComplaint ?? null,
          diagnosis: diagnosis ?? source.encounter?.diagnosis ?? null,
          notes: notes ?? source.encounter?.notes ?? null,
          followUpDate: followUpDate ?? null,
        },
      });

      const prescription = await tx.prescription.create({
        data: {
          clinicId: user.clinicId,
          encounterId: encounter.id,
          doctorId: user.id,
          patientId,
        },
      });

      await tx.prescriptionMedicine.createMany({
        data: source.medicines.map((m) => ({
          prescriptionId: prescription.id,
          drugId: m.drugId,
          customName: m.customName,
          dosageForm: m.dosageForm,
          strength: m.strength,
          route: m.route,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
      });

      // Create Follow-up Reminder if followUpDate exists
      if (followUpDate) {
        await tx.reminder.create({
          data: {
            prescriptionId: prescription.id,
            patientId,
            scheduledFor: new Date(followUpDate),
            status: 'PENDING',
            messageType: 'FOLLOW_UP',
          }
        });
      }

      // Determine medication course duration (e.g. 5 days, 7 days)
      let maxDurationDays = 5;
      source.medicines.forEach((m) => {
        if (m.duration) {
          const match = m.duration.match(/\d+/);
          if (match) {
            const parsed = parseInt(match[0], 10);
            if (parsed > 0 && parsed > maxDurationDays) {
              maxDurationDays = parsed;
            }
          }
        }
      });
      maxDurationDays = Math.min(maxDurationDays, 14);

      const now = new Date();
      for (let day = 1; day <= maxDurationDays; day++) {
        const reminderDate = new Date();
        reminderDate.setDate(now.getDate() + day);
        reminderDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

        await tx.reminder.create({
          data: {
            prescriptionId: prescription.id,
            patientId,
            scheduledFor: reminderDate,
            status: 'PENDING',
            messageType: 'MEDICINE',
          }
        });
      }

      return { encounter, prescription, medicines_copied: source.medicines.length };
    });

    return NextResponse.json({
      encounter_id: result.encounter.id,
      prescription_id: result.prescription.id,
      patient_id: patientId,
      medicines_copied: result.medicines_copied,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

