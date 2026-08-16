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

      // Determine medication course duration (e.g. 5 days, 7 days vs 30 days / chronic)
      let maxDurationDays = 5;
      let isChronic = false;

      medicines.forEach((m: any) => {
        const durStr = (m.duration || '').toLowerCase();
        if (durStr.includes('month') || durStr.includes('30') || durStr.includes('continuous')) {
          isChronic = true;
        }
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

      if (maxDurationDays > 14) isChronic = true;

      const now = new Date();

      if (isChronic) {
        // CHRONIC CARE: Daily morning briefings for 14 days + Refill Reminder on Day 25
        for (let day = 1; day <= 14; day++) {
          const reminderDate = new Date();
          reminderDate.setDate(now.getDate() + day);
          reminderDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

          await tx.reminder.create({
            data: {
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: reminderDate,
              status: 'PENDING',
              messageType: 'MEDICINE',
            }
          });
        }

        // Schedule Monthly Refill Alert on Day 25
        const refillDate = new Date();
        refillDate.setDate(now.getDate() + 25);
        refillDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

        await tx.reminder.create({
          data: {
            prescriptionId: prescription.id,
            patientId: patientId,
            scheduledFor: refillDate,
            status: 'PENDING',
            messageType: 'REFILL',
          }
        });
      } else {
        // ACUTE CARE: Smart Slot Nudges (Morning 8:00 AM, Afternoon 1:30 PM, Night 8:30 PM)
        let needsAfternoon = false;
        let needsNight = true; // default true for standard acute courses

        medicines.forEach((m: any) => {
          const freq = (m.frequency || '').toLowerCase();
          if (freq.includes('1-1-1') || freq.includes('0-1-0') || freq.includes('thrice') || freq.includes('3 times')) {
            needsAfternoon = true;
          }
          if (freq.includes('1-0-1') || freq.includes('1-1-1') || freq.includes('0-0-1') || freq.includes('bedtime') || freq.includes('twice') || freq.includes('night')) {
            needsNight = true;
          }
        });

        for (let day = 1; day <= maxDurationDays; day++) {
          // 1. Morning Slot (8:00 AM IST / 2:30 AM UTC)
          const morningDate = new Date();
          morningDate.setDate(now.getDate() + day);
          morningDate.setUTCHours(2, 30, 0, 0);

          await tx.reminder.create({
            data: {
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: morningDate,
              status: 'PENDING',
              messageType: 'MEDICINE_MORNING',
            }
          });

          // 2. Afternoon Slot (1:30 PM IST / 8:00 AM UTC)
          if (needsAfternoon) {
            const afternoonDate = new Date();
            afternoonDate.setDate(now.getDate() + day);
            afternoonDate.setUTCHours(8, 0, 0, 0);

            await tx.reminder.create({
              data: {
                prescriptionId: prescription.id,
                patientId: patientId,
                scheduledFor: afternoonDate,
                status: 'PENDING',
                messageType: 'MEDICINE_AFTERNOON',
              }
            });
          }

          // 3. Night Slot (8:30 PM IST / 3:00 PM UTC)
          if (needsNight) {
            const nightDate = new Date();
            nightDate.setDate(now.getDate() + day);
            nightDate.setUTCHours(15, 0, 0, 0);

            await tx.reminder.create({
              data: {
                prescriptionId: prescription.id,
                patientId: patientId,
                scheduledFor: nightDate,
                status: 'PENDING',
                messageType: 'MEDICINE_NIGHT',
              }
            });
          }
        }
      }

      // Mark any WAITING queue items for this patient and doctor as COMPLETED
      await tx.queueItem.updateMany({
        where: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          status: 'WAITING',
        },
        data: { status: 'COMPLETED' },
      });

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

