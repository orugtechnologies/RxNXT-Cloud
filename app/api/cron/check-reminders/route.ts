import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
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

    const formatted = reminders.map(r => ({
      reminderId: r.id,
      status: r.status,
      messageType: r.messageType,
      scheduledForIST: r.scheduledFor ? new Date(r.scheduledFor.getTime() + (5.5 * 3600 * 1000)).toISOString().replace('T', ' ').substring(0, 19) + ' IST' : null,
      sentAtIST: r.sentAt ? new Date(r.sentAt.getTime() + (5.5 * 3600 * 1000)).toISOString().replace('T', ' ').substring(0, 19) + ' IST' : null,
      patientName: r.patient?.name || 'N/A',
      patientPhone: r.patient?.phone || 'N/A',
      clinicName: r.prescription?.clinic?.name || 'N/A',
      doctorName: r.prescription?.doctor?.fullName || 'N/A'
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      reminders: formatted
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
