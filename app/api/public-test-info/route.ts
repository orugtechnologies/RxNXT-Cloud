import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reminders = await prisma.reminder.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        patient: true,
        prescription: true
      }
    });

    const formatted = reminders.map(r => ({
      reminderId: r.id,
      status: r.status,
      messageType: r.messageType,
      scheduledFor: r.scheduledFor,
      sentAt: r.sentAt,
      patientName: r.patient?.name || 'N/A',
      patientPhone: r.patient?.phone || 'N/A',
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reminders: formatted
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
