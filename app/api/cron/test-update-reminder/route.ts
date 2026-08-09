import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFollowUpReminder, sendMedicineReminder } from '@/services/whatsappService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const triggerNow = searchParams.get('trigger') === 'true';

    // 1. Fetch pending reminders
    const pendingReminders = await prisma.reminder.findMany({
      where: { status: 'PENDING' },
      include: {
        patient: true,
        prescription: {
          include: {
            clinic: true,
            doctor: true,
          }
        }
      }
    });

    // Set scheduledFor to tonight at 23:40 IST = 2026-08-09T18:10:00.000Z
    const targetTime = new Date('2026-08-09T18:10:00.000Z');

    const updatedList = [];
    for (const rem of pendingReminders) {
      const updated = await prisma.reminder.update({
        where: { id: rem.id },
        data: {
          scheduledFor: targetTime,
          status: 'PENDING'
        }
      });

      let dispatchResult = null;
      if (triggerNow && rem.patient?.phone && rem.prescription) {
        try {
          if (rem.messageType === 'FOLLOW_UP') {
            dispatchResult = await sendFollowUpReminder(
              rem.patient.phone,
              rem.patient.name,
              rem.prescription.clinic.name,
              rem.prescription.doctor.fullName,
              rem.prescription.clinicId
            );
          } else {
            dispatchResult = await sendMedicineReminder(
              rem.patient.phone,
              rem.patient.name,
              'your prescribed medicine',
              rem.prescription.clinicId
            );
          }

          await prisma.reminder.update({
            where: { id: rem.id },
            data: { status: 'SENT', sentAt: new Date() }
          });
        } catch (e: any) {
          dispatchResult = { error: e.message };
        }
      }

      updatedList.push({
        id: updated.id,
        patientName: rem.patient?.name,
        patientPhone: rem.patient?.phone,
        scheduledForIST: '2026-08-09 23:40:00 IST (11:40 PM)',
        status: updated.status,
        dispatchResult
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully set ${updatedList.length} pending reminder(s) to 23:40 IST tonight!`,
      reminders: updatedList
    });
  } catch (error: any) {
    console.error('Error updating test reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
