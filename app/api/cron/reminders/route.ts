export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMedicineReminder, sendFollowUpReminder } from '@/services/whatsappService';

// This endpoint should be triggered by Vercel Cron or Upstash QStash (e.g. hourly)
export async function GET(request: Request) {
  // Security check: Ensure the request comes from a trusted cron service.
  // For Vercel Cron, you would check the authorization header against CRON_SECRET.
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Find all PENDING reminders that are due to be sent (scheduledFor <= now)
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
      // Limit to 50 per batch to avoid timeout
      take: 50, 
    });

    if (dueReminders.length === 0) {
      return NextResponse.json({ message: 'No reminders due.' });
    }

    const results = [];

    // 2. Process each reminder
    for (const reminder of dueReminders) {
      // In a real application, you might have specific reminder text for specific medicines.
      // Here we will just send a generic reminder for the first medicine in the prescription as an example,
      // or aggregate them.
      const medicineNames = reminder.prescription.medicines
        .map(m => m.customName || m.drug?.brandName || m.drug?.genericName || 'your medicine')
        .join(', ');

      if (!reminder.patient.phone) {
        // Mark as failed if no phone number
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED' }
        });
        results.push({ id: reminder.id, status: 'FAILED', reason: 'No phone number' });
        continue;
      }

      try {
        // Send WhatsApp Reminder based on messageType
        if (reminder.messageType === 'FOLLOW_UP') {
          await sendFollowUpReminder(
            reminder.patient.phone,
            reminder.patient.name,
            reminder.prescription.clinic.name,
            reminder.prescription.doctor.fullName
          );
        } else {
          await sendMedicineReminder(
            reminder.patient.phone,
            reminder.patient.name,
            medicineNames
          );
        }

        // Mark as SENT
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });
        
        results.push({ id: reminder.id, status: 'SENT' });
      } catch (err: any) {
        console.error(`Failed to send reminder ${reminder.id}:`, err);
        // We leave it as PENDING to retry on the next cron cycle, or mark it FAILED after max retries.
        // For now, we will mark as FAILED to prevent infinite loops.
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'FAILED' }
        });
        results.push({ id: reminder.id, status: 'FAILED', error: err.message });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: dueReminders.length,
      results 
    });

  } catch (error: any) {
    console.error('Cron reminder error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

