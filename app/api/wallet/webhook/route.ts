export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature in production when secret is set
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody || '{}');
    const event = payload.event;
    const payment = payload.payload?.payment?.entity;

    // Handle payment.captured
    if (event === 'payment.captured' && payment) {
      const clinicId = payment.notes?.clinic_id;
      const credits = parseInt(payment.notes?.credits || '0', 10);
      const paymentId = payment.id;

      if (clinicId && credits > 0) {
        // Prevent duplicate processing
        const existingTx = await (prisma as any).whatsAppCreditTransaction?.findFirst({
          where: { referenceId: paymentId },
        });

        if (!existingTx) {
          await prisma.$transaction(async (tx) => {
            const updated = await tx.clinic.update({
              where: { id: clinicId },
              data: {
                whatsappCreditBalance: { increment: credits },
                whatsappLowBalanceAlertSent: false,
              },
              select: { whatsappCreditBalance: true },
            });

            await (tx as any).whatsAppCreditTransaction.create({
              data: {
                clinicId,
                type: 'RECHARGE',
                amount: credits,
                balanceAfter: updated.whatsappCreditBalance,
                referenceId: paymentId,
                description: `Payment Gateway Webhook Recharge (+${credits.toLocaleString()} credits)`,
              },
            });
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Wallet Webhook Error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
