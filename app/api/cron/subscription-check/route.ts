export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionExpiryNotice } from '@/services/whatsappService';

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
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

    // 1. Auto-expire any clinics whose subscription/trial has passed
    const expiredResult = await prisma.clinic.updateMany({
      where: {
        subscriptionEndsAt: { lt: now },
        subscriptionStatus: { in: ['TRIAL', 'ACTIVE'] },
      },
      data: {
        subscriptionStatus: 'EXPIRED',
      },
    });

    // 2. Find clinics expiring in <= 7 days that have not received a reminder recently
    const expiringClinics = await prisma.clinic.findMany({
      where: {
        subscriptionEndsAt: {
          gt: now,
          lte: sevenDaysFromNow,
        },
        subscriptionStatus: { in: ['TRIAL', 'ACTIVE'] },
        OR: [
          { renewalReminderSentAt: null },
          { renewalReminderSentAt: { lt: sixDaysAgo } },
        ],
      },
      include: {
        users: {
          where: {
            role: { in: ['clinic_admin', 'doctor', 'admin'] },
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const results: Array<{ clinicId: string; clinicName: string; status: string; recipient?: string }> = [];

    for (const clinic of expiringClinics) {
      const primaryUser = clinic.users[0];
      const phone = primaryUser?.phone || clinic.phone;
      const doctorName = primaryUser?.fullName || 'Doctor';
      const expiryDate = clinic.subscriptionEndsAt || now;
      const diffMs = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      const expiryDateStr = expiryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const planLabel = clinic.subscriptionPlan === 'TRIAL_14_DAYS' ? '14-Day Free Trial' : 'Subscription';

      if (phone) {
        try {
          await sendSubscriptionExpiryNotice(
            phone,
            doctorName,
            clinic.name,
            planLabel,
            expiryDateStr,
            daysRemaining
          );

          await prisma.clinic.update({
            where: { id: clinic.id },
            data: { renewalReminderSentAt: now },
          });

          results.push({
            clinicId: clinic.id,
            clinicName: clinic.name,
            status: 'SENT',
            recipient: phone,
          });
        } catch (sendErr: any) {
          console.error(`Failed to send 7-day reminder to clinic ${clinic.id}:`, sendErr);
          results.push({
            clinicId: clinic.id,
            clinicName: clinic.name,
            status: 'FAILED',
            recipient: phone,
          });
        }
      } else {
        results.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          status: 'SKIPPED_NO_PHONE',
        });
      }
    }

    return NextResponse.json({
      success: true,
      autoExpiredCount: expiredResult.count,
      expiringCount: expiringClinics.length,
      notifiedCount: results.filter((r) => r.status === 'SENT').length,
      durationMs: Date.now() - startTime,
      results,
    });
  } catch (error: any) {
    console.error('Subscription Check Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
