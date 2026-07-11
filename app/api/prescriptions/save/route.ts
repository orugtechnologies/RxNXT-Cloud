export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isDrugNameRestricted } from '@/lib/restrictedDrugs';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { patientId, chiefComplaint, diagnosis, notes, followUpDate, medicines, timeTakenSeconds, creationMethod } = await request.json();

    if (!patientId || !medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'Patient and at least 1 medicine are required' }, { status: 400 });
    }

    // 1. Strict Validation: Check for Restricted Drugs (Schedule X / Narcotics)
    // Custom names via keyword match
    const hasRestrictedCustom = medicines.some((m: any) => isDrugNameRestricted(m.name));
    if (hasRestrictedCustom) {
      return NextResponse.json({ error: 'Cannot prescribe highly restricted drugs or narcotics via telemedicine.' }, { status: 400 });
    }

    // Predefined drugs via database check
    const drugIds = medicines.map((m: any) => m.drugId).filter(Boolean);
    if (drugIds.length > 0) {
      const restrictedDrugs = await prisma.drug.findMany({
        where: { id: { in: drugIds }, isRestricted: true }
      });
      if (restrictedDrugs.length > 0) {
        return NextResponse.json({ error: 'Cannot prescribe highly restricted drugs or narcotics via telemedicine.' }, { status: 400 });
      }
    }

    // Verify patient belongs to the clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: user.clinicId },
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found or access denied' }, { status: 403 });

    // Create Encounter → Prescription → Medicines atomically
    const result = await prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          chiefComplaint: chiefComplaint || null,
          diagnosis: diagnosis || null,
          notes: notes || null,
          followUpDate: followUpDate || null,
        },
      });

      const prescription = await tx.prescription.create({
        data: {
          clinicId: user.clinicId,
          encounterId: encounter.id,
          doctorId: user.id,
          patientId,
          timeTakenSeconds: timeTakenSeconds || null,
          creationMethod: creationMethod || 'MANUAL',
        },
      });

      // Create medicine line items
      await tx.prescriptionMedicine.createMany({
        data: medicines.map((m: any) => ({
          prescriptionId: prescription.id,
          drugId: m.drugId || null,
          customName: m.name || null,
          dosageForm: m.dosage_form || null,
          strength: m.strength || null,
          route: m.route || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          instructions: m.instructions || null,
        })),
      });

      // Create Follow-up Reminder if followUpDate exists
      if (followUpDate) {
        await tx.reminder.create({
          data: {
            prescriptionId: prescription.id,
            patientId: patientId,
            scheduledFor: new Date(followUpDate),
            status: 'PENDING',
            messageType: 'FOLLOW_UP',
          }
        });
      }

      // Increment prescription count for global, doctor, and clinic preferences
      console.log('--- SAVING PRESCRIPTION ---');
      console.log('medicines:', medicines);
      console.log('drugIds:', drugIds);
      
      if (drugIds.length > 0) {
        await Promise.all(
          drugIds.map(async (id: string) => {
            // Global
            await tx.drug.update({
              where: { id },
              data: { prescriptionCount: { increment: 1 } },
            });
            // Doctor Preference
            await tx.doctorDrugPreference.upsert({
              where: { doctorId_drugId: { doctorId: user.id, drugId: id } },
              update: { count: { increment: 1 } },
              create: { doctorId: user.id, drugId: id, count: 1 },
            });
            // Clinic Preference
            await tx.clinicDrugPreference.upsert({
              where: { clinicId_drugId: { clinicId: user.clinicId, drugId: id } },
              update: { count: { increment: 1 } },
              create: { clinicId: user.clinicId, drugId: id, count: 1 },
            });
          })
        );
      }

      return { encounter, prescription };
    });

    return NextResponse.json({
      success: true,
      encounterId: result.encounter.id,
      prescriptionId: result.prescription.id,
    }, { status: 201 });

  } catch (err: any) {
    console.error('Save prescription error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

