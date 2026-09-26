export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalInventorySkus,
      lowStockItems,
      expiringSoonItems,
      todayDispensedLogs,
      pendingPrescriptionsCount,
    ] = await Promise.all([
      prisma.pharmacyItem.count({ where: { clinicId: user.clinicId, isActive: true } }),
      prisma.pharmacyItem.count({ where: { clinicId: user.clinicId, isActive: true, quantityInStock: { lte: 20 } } }),
      prisma.pharmacyItem.count({ where: { clinicId: user.clinicId, isActive: true, expiryDate: { lte: thirtyDaysFromNow } } }),
      prisma.dispenseLog.findMany({
        where: {
          clinicId: user.clinicId,
          createdAt: { gte: startOfToday },
        },
        select: { totalAmount: true },
      }),
      prisma.prescription.count({
        where: { clinicId: user.clinicId, dispenseStatus: 'PENDING' },
      }),
    ]);

    const todayRevenue = todayDispensedLogs.reduce((acc, log) => acc + (log.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalInventorySkus,
        lowStockItems,
        expiringSoonItems,
        dispensedTodayCount: todayDispensedLogs.length,
        todayRevenue,
        pendingPrescriptionsCount,
      },
    });
  } catch (error: any) {
    console.error('Pharmacy Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
