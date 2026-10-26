export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { isDrugNameRestricted } from '@/lib/restrictedDrugs';
import { getClinicSubscription } from '@/lib/subscription';
import { formatUnifiedRxId } from '@/lib/prescription-id';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 0. Enforce Subscription / 150-Rx Usage-Based Free Trial Guard
    const sub = await getClinicSubscription(user.clinicId);
    if (!sub.allowed) {
      return NextResponse.json({
        error: sub.isUsageLocked ? 'TRIAL_USAGE_LIMIT_REACHED' : 'SUBSCRIPTION_EXPIRED',
        message: sub.isUsageLocked
          ? `You have reached your 150 free prescription trial limit. Please select a subscription tier to continue creating prescriptions.`
          : 'Your subscription has expired. Please renew your subscription to continue creating prescriptions.',
        subscription: sub,
      }, { status: 403 });
    }

    const { patientId, chiefComplaint, diagnosis, notes, followUpDate, medicines, timeTakenSeconds, creationMethod, enableDailyReminders } = await request.json();

    if (!patientId || !medicines || medicines.length === 0) {
      return NextResponse.json({ error: 'Patient and at least 1 medicine are required' }, { status: 400 });
    }

    // Strict Clinical Validation: Frequency, Duration, and Instructions are mandatory for every prescribed medicine
    for (let i = 0; i < medicines.length; i++) {
      const m = medicines[i];
      const medName = m.name || m.customName || `Medicine #${i + 1}`;
      if (!m.frequency || !m.frequency.trim()) {
        return NextResponse.json({ error: `Frequency is mandatory for "${medName}".` }, { status: 400 });
      }
      if (!m.duration || !m.duration.trim()) {
        return NextResponse.json({ error: `Duration is mandatory for "${medName}".` }, { status: 400 });
      }
      if (!m.instructions || !m.instructions.trim()) {
        return NextResponse.json({ error: `Instructions are mandatory for "${medName}".` }, { status: 400 });
      }
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

      // ── Determine Daily Token & Unified Rx ID (RX-YYMMDD-###) ────────────
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const queueItem = tx.queueItem?.findFirst ? await tx.queueItem.findFirst({
        where: {
          clinicId: user.clinicId,
          patientId,
          createdAt: { gte: todayStart },
        },
        orderBy: { createdAt: 'desc' },
      }) : null;

      let tokenNumber = queueItem?.tokenNumber;
      if (!tokenNumber) {
        const todayCount = tx.prescription?.count ? await tx.prescription.count({
          where: {
            clinicId: user.clinicId,
            createdAt: { gte: todayStart },
          },
        }) : 0;
        tokenNumber = todayCount + 1;
      }

      const unifiedRxId = formatUnifiedRxId(new Date(), tokenNumber);

      // Ensure unique ID in case of token overlap
      let finalRxId = unifiedRxId;
      const existing = tx.prescription?.findUnique ? await tx.prescription.findUnique({ where: { id: finalRxId } }) : null;
      if (existing) {
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        finalRxId = `${unifiedRxId}-${randomSuffix}`;
      }

      const prescription = await tx.prescription.create({
        data: {
          id: finalRxId,
          clinicId: user.clinicId,
          encounterId: encounter.id,
          doctorId: user.id,
          patientId,
          timeTakenSeconds: timeTakenSeconds || null,
          creationMethod: creationMethod || 'MANUAL',
        },
      });

      // Mark queue item as COMPLETED if patient was waiting in queue
      if (queueItem && queueItem.status !== 'COMPLETED' && tx.queueItem?.update) {
        await tx.queueItem.update({
          where: { id: queueItem.id },
          data: { status: 'COMPLETED' },
        });
      }

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

      // ── Doctor-Scoped & Type-Aware Smart Superseding ──────────────────────────
      // Look up previous prescriptions by the SAME DOCTOR for this patient
      const prevDocPrescriptions = await tx.prescription.findMany({
        where: {
          patientId: patientId,
          doctorId: user.id,
        },
        select: { id: true },
      });
      const prevPrescriptionIds = prevDocPrescriptions.map((p) => p.id);

      if (prevPrescriptionIds.length > 0) {
        // Only supersede acute dose reminders and follow-ups belonging to THIS DOCTOR.
        // Standing chronic care monthly refills (REFILL) and other specialists' care plans remain protected.
        await tx.reminder.updateMany({
          where: {
            patientId: patientId,
            prescriptionId: { in: prevPrescriptionIds },
            status: 'PENDING',
            messageType: {
              in: ['MEDICINE', 'MEDICINE_MORNING', 'MEDICINE_AFTERNOON', 'MEDICINE_NIGHT', 'FOLLOW_UP'],
            },
          },
          data: {
            status: 'SUPERSEDED',
          },
        });
      }

      // Collect all reminders for high-performance bulk creation
      const remindersToCreate: Array<{
        prescriptionId: string;
        patientId: string;
        scheduledFor: Date;
        status: 'PENDING';
        messageType: 'FOLLOW_UP' | 'REFILL' | 'MEDICINE' | 'MEDICINE_MORNING' | 'MEDICINE_AFTERNOON' | 'MEDICINE_NIGHT';
      }> = [];

      // Create Follow-up Reminder if followUpDate exists
      if (followUpDate) {
        remindersToCreate.push({
          prescriptionId: prescription.id,
          patientId: patientId,
          scheduledFor: new Date(followUpDate),
          status: 'PENDING',
          messageType: 'FOLLOW_UP',
        });
      }

      // Determine medication course duration (e.g. 3 days, 5 days, 7 days vs 30 days / chronic)
      const detectedDurations: number[] = [];
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
            if (parsed > 0) {
              detectedDurations.push(parsed);
            }
          }
        }
      });

      const maxDurationDays = detectedDurations.length > 0 ? Math.max(...detectedDurations) : 5;
      if (maxDurationDays > 14) isChronic = true;

      const now = new Date();

      // NEW RULE:
      // The Single Super-Prescription Message automatically delivers the complete schedule and PDF upon consultation.
      // Ongoing automated daily morning reminders are only scheduled if explicitly opted-in (enableDailyReminders === true).
      // Grandfathered prescriptions (like Swamiji's) already in the DB continue running their scheduled reminders normally.
      if (enableDailyReminders) {
        if (isChronic) {
          // CHRONIC CARE: Daily morning briefings for 14 days + Refill Reminder on Day 25
          for (let day = 1; day <= 14; day++) {
            const reminderDate = new Date();
            reminderDate.setDate(now.getDate() + day);
            reminderDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

            remindersToCreate.push({
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: reminderDate,
              status: 'PENDING',
              messageType: 'MEDICINE',
            });
          }

          // Schedule Monthly Refill Alert on Day 25
          const refillDate = new Date();
          refillDate.setDate(now.getDate() + 25);
          refillDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

          remindersToCreate.push({
            prescriptionId: prescription.id,
            patientId: patientId,
            scheduledFor: refillDate,
            status: 'PENDING',
            messageType: 'REFILL',
          });
        } else {
          // ACUTE ILLNESS: Streamlined 1-Morning Daily Briefing (8:00 AM IST) for the prescribed course
          const durationDays = Math.min(maxDurationDays, 14);
          for (let day = 1; day <= durationDays; day++) {
            const morningDate = new Date();
            morningDate.setDate(now.getDate() + day);
            morningDate.setUTCHours(2, 30, 0, 0); // 8:00 AM IST

            remindersToCreate.push({
              prescriptionId: prescription.id,
              patientId: patientId,
              scheduledFor: morningDate,
              status: 'PENDING',
              messageType: 'MEDICINE_MORNING',
            });
          }
        }
      }

      // Fast single-query batch insert for all scheduled reminders
      if (remindersToCreate.length > 0) {
        await tx.reminder.createMany({
          data: remindersToCreate,
        });
      }

      // Mark any active queue items (WAITING, RETURNED_READY, IN_PROCEDURE) for this patient and doctor as COMPLETED
      await tx.queueItem.updateMany({
        where: {
          clinicId: user.clinicId,
          doctorId: user.id,
          patientId,
          status: { in: ['WAITING', 'RETURNED_READY', 'IN_PROCEDURE'] },
        },
        data: { status: 'COMPLETED' },
      });

      // Epic 1: Atomically increment clinic prescription ledger counter
      if (tx.clinic?.update) {
        try {
          await tx.clinic.update({
            where: { id: user.clinicId },
            data: { prescriptionsCount: { increment: 1 } },
          });
        } catch (e) {
          console.warn('Non-blocking clinic prescription count update warning:', e);
        }
      }

      return { encounter, prescription };
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    // Performance Optimization: Update drug & preference counters non-blocking outside the critical ACID transaction
    if (drugIds.length > 0) {
      Promise.allSettled(
        drugIds.map(async (id: string) => {
          try {
            await Promise.all([
              prisma.drug.update({
                where: { id },
                data: { prescriptionCount: { increment: 1 } },
              }),
              prisma.doctorDrugPreference.upsert({
                where: { doctorId_drugId: { doctorId: user.id, drugId: id } },
                update: { count: { increment: 1 } },
                create: { doctorId: user.id, drugId: id, count: 1 },
              }),
              prisma.clinicDrugPreference.upsert({
                where: { clinicId_drugId: { clinicId: user.clinicId, drugId: id } },
                update: { count: { increment: 1 } },
                create: { clinicId: user.clinicId, drugId: id, count: 1 },
              }),
            ]);
          } catch (e) {
            console.warn('Non-blocking drug preference increment warning:', e);
          }
        })
      ).catch(() => {});
    }

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

