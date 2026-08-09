import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('getReminders') === 'true') {
      const reminders = await prisma.reminder.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { patient: true }
      });
      return NextResponse.json({
        success: true,
        reminders: reminders.map(r => ({
          id: r.id,
          status: r.status,
          messageType: r.messageType,
          scheduledFor: r.scheduledFor,
          sentAt: r.sentAt,
          patientName: r.patient?.name,
          patientPhone: r.patient?.phone
        }))
      });
    }

    const user = await getAuthenticatedUser();
    const clinicId = user?.clinicId || 'default';

    const MICROSERVICE_URL = process.env.WHATSAPP_MICROSERVICE_URL || 'https://rxnxt-whatsapp-service.onrender.com';
    const response = await fetch(`${MICROSERVICE_URL}/api/whatsapp/status?clinicId=${clinicId}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Microservice returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[WhatsApp Status Proxy Error]', error);
    return NextResponse.json(
      { error: 'Failed to connect to microservice', details: error.message },
      { status: 503 }
    );
  }
}
