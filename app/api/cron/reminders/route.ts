export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMedicineReminder, sendFollowUpReminder, sendRefillReminder } from '@/services/whatsappService';

// This endpoint is triggered by Render 8:00 AM Cron or Vercel Cron
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is configured in environment, verify authorization
  if (process.env.NODE_ENV === 'production' && cronSecret) {
    const urlSecret = new URL(request.url).searchParams.get('secret');
    const isAuthorized = authHeader === `Bearer ${cronSecret}` || urlSecret === cronSecret;
    if (!isAuthorized) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    // Find all PENDING reminders that are due to be sent (scheduledFor <= now)
    const now = new Date();
    const dueReminders = await prisma.reminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        patient: true,
        prescription: {
          include: {
            clinic: true,
            doctor: true,
            medicines: {
              include: {
                drug: true,
              }
            }
          }
        }
      },
      take: 50, 
    });

    if (dueReminders.length === 0) {
      return NextResponse.json({ message: 'No reminders due.' });
    }

    const results = [];
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const reminder of dueReminders) {
      const { patient, prescription } = reminder;

      if (!patient || !patient.phone) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED' }
        });
        results.push({ id: reminder.id, status: 'FAILED', reason: 'No phone number' });
        continue;
      }

      let success = false;

      if (reminder.messageType === 'FOLLOW_UP') {
        const dateStr = reminder.scheduledFor
          ? new Date(reminder.scheduledFor).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : 'scheduled date';

        const doctorName = prescription?.doctor?.fullName || 'your doctor';
        const clinicName = prescription?.clinic?.name || 'the clinic';

        try {
          await sendFollowUpReminder(
            patient.phone,
            patient.name,
            clinicName,
            doctorName,
            prescription?.clinicId || 'default'
          );
          success = true;
        } catch (e) {
          success = false;
        }
      } else if (reminder.messageType === 'REFILL') {
        const doctorName = prescription?.doctor?.fullName || 'your doctor';
        const clinicName = prescription?.clinic?.name || 'the clinic';

        try {
          await sendRefillReminder(
            patient.phone,
            patient.name,
            doctorName,
            clinicName,
            prescription?.clinicId || 'default'
          );
          success = true;
        } catch (e) {
          success = false;
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
            const freq = m.frequency ? ` (${m.frequency})` : '';
            const inst = m.instructions ? ` - ${m.instructions}` : '';
            return `• *${name}${strength}*${freq}${inst}`;
          })
          .filter(Boolean)
          .join('\n') || '• Prescribed medicines';

        try {
          await sendMedicineReminder(
            patient.phone,
            patient.name,
            medicinesList,
            doctorName,
            clinicName,
            prescription?.clinicId || 'default',
            slotType
          );
          success = true;
        } catch (e) {
          success = false;
        }
      }

      if (success) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
        results.push({ id: reminder.id, status: 'SENT' });
      } else {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED' }
        });
        results.push({ id: reminder.id, status: 'FAILED', reason: 'WhatsApp send failed' });
      }

      // Intentional 1-second delay to prevent WhatsApp anti-spam bans
      await delay(1000);
    }

    return NextResponse.json({
      processedCount: dueReminders.length,
      results
    });

  } catch (error: any) {
    console.error('Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
