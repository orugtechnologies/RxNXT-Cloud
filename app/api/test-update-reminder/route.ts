import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pendingReminders = await prisma.reminder.findMany({
      where: { status: 'PENDING' },
      include: { patient: true }
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
      updatedList.push({
        id: updated.id,
        patientName: rem.patient?.name,
        patientPhone: rem.patient?.phone,
        newScheduledForIST: '2026-08-09 23:40:00 IST',
        status: updated.status
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedList.length} pending reminder(s) to 23:40 IST tonight!`,
      reminders: updatedList
    });
  } catch (error: any) {
    console.error('Error updating test reminder:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
