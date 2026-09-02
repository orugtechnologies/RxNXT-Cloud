export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendMedicineReminder,
  sendFollowUpReminder,
  sendRefillReminder,
  isMetaConfigured,
} from '@/services/whatsappService';

const CONCURRENCY_LIMIT = parseInt(process.env.META_CONCURRENCY || '10', 10);
const MESSAGES_PER_SECOND = parseInt(process.env.META_MESSAGES_PER_SECOND || '20', 10);
const BATCH_SIZE = parseInt(process.env.REMINDERS_BATCH_SIZE || '50', 10);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processSingleReminder(reminder: any): Promise<{ id: string; status: 'SENT' | 'FAILED'; reason?: string }> {
  const { patient, prescription } = reminder;

  if (!patient || !patient.phone) {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: 'FAILED' },
    });
    return { id: reminder.id, status: 'FAILED', reason: 'No phone number' };
  }

  let sendResult: any = null;

  if (reminder.messageType === 'FOLLOW_UP') {
    const doctorName = prescription?.doctor?.fullName || 'your doctor';
    const clinicName = prescription?.clinic?.name || 'the clinic';

    try {
      sendResult = await sendFollowUpReminder(
        patient.phone,
        patient.name,
        clinicName,
        doctorName,
        prescription?.clinicId || 'default'
      );
    } catch (e) {
      sendResult = null;
    }
  } else if (reminder.messageType === 'REFILL') {
    const doctorName = prescription?.doctor?.fullName || 'your doctor';
    const clinicName = prescription?.clinic?.name || 'the clinic';

    try {
      sendResult = await sendRefillReminder(
        patient.phone,
        patient.name,
        doctorName,
        clinicName,
        prescription?.clinicId || 'default'
      );
    } catch (e) {
      sendResult = null;
    }
  } else {
    // MEDICINE reminder (MEDICINE_MORNING, MEDICINE_AFTERNOON, MEDICINE_NIGHT, or generic MEDICINE)
    const doctorName = prescription?.doctor?.fullName || 'your doctor';
    const clinicName = prescription?.clinic?.name || 'RxNXT Clinic';

    let slotType = 'MORNING';
    if (reminder.messageType === 'MEDICINE_AFTERNOON') {
      slotType = 'AFTERNOON';
    } else if (reminder.messageType === 'MEDICINE_NIGHT') {
      slotType = 'NIGHT';
    }

    const isMedForSlot = (freq: string, slot: string) => {
      const f = (freq || '').toLowerCase();
      if (slot === 'MORNING') {
        if (f.includes('0-1-0') || f.includes('0-0-1') || f.includes('bedtime') || f.includes('hs')) {
          if (!f.includes('1-1-1') && !f.includes('1-0-1') && !f.includes('thrice') && !f.includes('3 times')) return false;
        }
        return true;
      }
      if (slot === 'AFTERNOON') {
        return f.includes('1-1-1') || f.includes('0-1-0') || f.includes('thrice') || f.includes('3 times') || f.includes('afternoon');
      }
      if (slot === 'NIGHT') {
        return f.includes('1-0-1') || f.includes('1-1-1') || f.includes('0-0-1') || f.includes('bedtime') || f.includes('hs') || f.includes('night') || f.includes('twice') || f.includes('thrice') || f.includes('2 times') || f.includes('3 times');
      }
      return true;
    };

    const filteredMeds = prescription?.medicines?.filter((m: any) => isMedForSlot(m.frequency || '', slotType)) || [];
    const targetMeds = filteredMeds.length > 0 ? filteredMeds : prescription?.medicines || [];

    const medicinesList = targetMeds
      .map((m: any) => {
        const name = m.customName || m.drug?.brandName || m.drug?.genericName || 'Medicine';
        const strength = m.strength ? ` ${m.strength}` : '';
        let rawInst = (m.instructions || '').trim();
        let inst = rawInst;
        if (rawInst) {
          if (/after\s+(meals?|food)/i.test(rawInst)) {
            inst = 'After Food';
          } else if (/before\s+(meals?|food)/i.test(rawInst)) {
            inst = 'Before Food';
          } else if (/with\s+(meals?|food)/i.test(rawInst)) {
            inst = 'With Food';
          }
        }
        const instStr = inst ? ` - ${inst}` : '';
        return `"${name}${strength}${instStr}"`;
      })
      .filter(Boolean)
      .join('\n') || '"Prescribed medicines"';

    try {
      sendResult = await sendMedicineReminder(
        patient.phone,
        patient.name,
        medicinesList,
        doctorName,
        clinicName,
        prescription?.clinicId || 'default',
        slotType
      );
    } catch (e) {
      sendResult = null;
    }
  }

  if (sendResult?.success) {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        providerMessageId: sendResult.messageId || null,
      },
    });
    return { id: reminder.id, status: 'SENT' };
  } else {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: 'FAILED' },
    });
    return { id: reminder.id, status: 'FAILED', reason: 'WhatsApp send failed' };
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Authorization check for production
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    const urlSecret = new URL(request.url).searchParams.get('secret');
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || urlSecret === cronSecret;
    if (!isAuthorized) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const now = new Date();

    // 1. Stalled Job Recovery Safety Net:
    // For jobs stuck in 'PROCESSING' > 15 mins:
    // - If already attempted >= 2 times: Hard-fail to prevent duplicate sends
    // - If attempted 1 time: Reset to 'PENDING' for one safe retry
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    await prisma.reminder.updateMany({
      where: {
        status: 'PROCESSING',
        updatedAt: { lte: fifteenMinutesAgo },
        attempts: { gte: 2 },
      },
      data: {
        status: 'FAILED',
      },
    });

    const recovered = await prisma.reminder.updateMany({
      where: {
        status: 'PROCESSING',
        updatedAt: { lte: fifteenMinutesAgo },
        attempts: { lt: 2 },
      },
      data: {
        status: 'PENDING',
      },
    });

    // 2. Truly Atomic Batch Claiming:
    // Atomically claim due reminders & increment attempt counter
    let claimedIds: string[] = [];

    try {
      // PostgreSQL atomic lock & claim using SKIP LOCKED
      const claimedRows: Array<{ id: string }> = await prisma.$queryRaw`
        WITH due_batch AS (
          SELECT id FROM "Reminder"
          WHERE "status" = 'PENDING' AND "scheduledFor" <= ${now}
          ORDER BY "scheduledFor" ASC
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "Reminder" r
        SET "status" = 'PROCESSING', "attempts" = r."attempts" + 1, "lastAttemptAt" = NOW(), "updatedAt" = NOW()
        FROM due_batch
        WHERE r.id = due_batch.id
        RETURNING r.id;
      `;
      claimedIds = claimedRows.map((r) => r.id);
    } catch (sqlErr) {
      // Fallback for non-PostgreSQL / SQLite test environments
      claimedIds = await prisma.$transaction(async (tx) => {
        const pending = await tx.reminder.findMany({
          where: {
            status: 'PENDING',
            scheduledFor: { lte: now },
          },
          select: { id: true },
          take: BATCH_SIZE,
          orderBy: { scheduledFor: 'asc' },
        });

        if (pending.length === 0) return [];
        const ids = pending.map((p) => p.id);

        await tx.reminder.updateMany({
          where: { id: { in: ids }, status: 'PENDING' },
          data: {
            status: 'PROCESSING',
            attempts: { increment: 1 },
            lastAttemptAt: new Date(),
          },
        });

        return ids;
      });
    }

    if (claimedIds.length === 0) {
      return NextResponse.json({
        message: 'No reminders due.',
        recoveredCount: recovered.count,
        processedCount: 0,
        durationMs: Date.now() - startTime,
      });
    }

    // 3. Fetch Full Clinical Details for Claimed Reminders
    const reminders = await prisma.reminder.findMany({
      where: { id: { in: claimedIds } },
      include: {
        patient: true,
        prescription: {
          include: {
            clinic: true,
            doctor: true,
            medicines: {
              include: {
                drug: true,
              },
            },
          },
        },
      },
    });

    const results: Array<{ id: string; status: 'SENT' | 'FAILED'; reason?: string }> = [];

    // 4. Dispatch with Controlled Concurrency & Rate Limiting via Meta Cloud API
    const chunkSize = CONCURRENCY_LIMIT;
    const delayBetweenChunksMs = Math.max(50, Math.floor((1000 / MESSAGES_PER_SECOND) * chunkSize));

    for (let i = 0; i < reminders.length; i += chunkSize) {
      const chunk = reminders.slice(i, i + chunkSize);
      const chunkResults = await Promise.allSettled(
        chunk.map((reminder) => processSingleReminder(reminder))
      );

      chunkResults.forEach((cr, idx) => {
        if (cr.status === 'fulfilled') {
          results.push(cr.value);
        } else {
          results.push({
            id: chunk[idx].id,
            status: 'FAILED',
            reason: cr.reason?.message || 'Processing error',
          });
        }
      });

      if (i + chunkSize < reminders.length) {
        await sleep(delayBetweenChunksMs);
      }
    }

    const successCount = results.filter((r) => r.status === 'SENT').length;
    const failedCount = results.filter((r) => r.status === 'FAILED').length;

    return NextResponse.json({
      provider: isMetaConfigured() ? 'meta_cloud_api' : 'meta_mock',
      recoveredCount: recovered.count,
      processedCount: results.length,
      successCount,
      failedCount,
      durationMs: Date.now() - startTime,
      results,
    });
  } catch (error: any) {
    console.error('Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

