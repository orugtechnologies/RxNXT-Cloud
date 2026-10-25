export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { WALLET_RECHARGE_PACKAGES } from '@/lib/wallet';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      select: {
        id: true,
        name: true,
        whatsappCreditBalance: true,
        whatsappLowBalanceAlertSent: true,
      },
    });

    const recentTransactions = await (prisma as any).whatsAppCreditTransaction?.findMany({
      where: { clinicId: user.clinicId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }) || [];

    return NextResponse.json({
      success: true,
      balance: clinic?.whatsappCreditBalance ?? 0,
      isLowBalance: (clinic?.whatsappCreditBalance ?? 0) < 100,
      packages: Object.values(WALLET_RECHARGE_PACKAGES),
      recentTransactions,
    });
  } catch (error: any) {
    console.error('Wallet GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch wallet info' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { packageId, paymentRef } = await request.json();
    const pack = WALLET_RECHARGE_PACKAGES[packageId];
    if (!pack) {
      return NextResponse.json({ error: 'Invalid recharge package selected.' }, { status: 400 });
    }

    const finalRef = paymentRef || `WAL_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Execute atomic wallet credit transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedClinic = await tx.clinic.update({
        where: { id: user.clinicId },
        data: {
          whatsappCreditBalance: { increment: pack.credits },
          whatsappLowBalanceAlertSent: false, // Reset alert on recharge
        },
        select: {
          id: true,
          whatsappCreditBalance: true,
        },
      });

      const transaction = await (tx as any).whatsAppCreditTransaction.create({
        data: {
          clinicId: user.clinicId,
          type: 'RECHARGE',
          amount: pack.credits,
          balanceAfter: updatedClinic.whatsappCreditBalance,
          referenceId: finalRef,
          description: `1-Click In-App Recharge: ${pack.name} (+${pack.credits.toLocaleString()} WhatsApp credits)`,
        },
      });

      return { updatedClinic, transaction };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully recharged ${pack.credits.toLocaleString()} WhatsApp credits.`,
      newBalance: result.updatedClinic.whatsappCreditBalance,
      transaction: result.transaction,
    });
  } catch (error: any) {
    console.error('Wallet Recharge Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process wallet recharge' }, { status: 500 });
  }
}
