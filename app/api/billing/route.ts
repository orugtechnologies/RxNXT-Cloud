import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

// ─────────────────────────────────────────
// GET /api/billing — list bills for clinic
// ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // PENDING | PAID | PARTIAL | CANCELLED
  const patientId = searchParams.get('patientId');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const where: any = { clinicId: user.clinicId };
    if (status) where.paymentStatus = status;
    if (patientId) where.patientId = patientId;

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true, phone: true, age: true, gender: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.bill.count({ where }),
    ]);

    // Summary stats for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayStats, pendingCount] = await Promise.all([
      prisma.bill.aggregate({
        where: { clinicId: user.clinicId, paymentStatus: 'PAID', paidAt: { gte: todayStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.bill.count({ where: { clinicId: user.clinicId, paymentStatus: 'PENDING' } }),
    ]);

    return NextResponse.json({
      success: true,
      bills,
      total,
      stats: {
        todayRevenue: todayStats._sum.totalAmount || 0,
        todayPaidCount: todayStats._count,
        pendingCount,
      },
    });
  } catch (err: any) {
    console.error('GET /api/billing error:', err);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// POST /api/billing — create a new bill
// ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Receptionists, admins and doctors can create bills
  const allowed = ['receptionist', 'admin', 'clinic_admin', 'doctor'];
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      patientId,
      encounterId,
      prescriptionId,
      consultationFee = 0,
      medicineFee = 0,
      otherFee = 0,
      discount = 0,
      paymentStatus = 'PENDING',
      paymentMode,
      paymentRef,
      notes,
      items = [],
    } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    // Validate patient belongs to clinic
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: user.clinicId },
    });
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate bill number: RX-BILL-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.bill.count({ where: { clinicId: user.clinicId } });
    const billNumber = `RX-BILL-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const totalAmount = Math.max(
      0,
      (consultationFee + medicineFee + otherFee) - discount
    );

    const billItems = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: (item.quantity || 1) * (item.unitPrice || 0),
      itemType: item.itemType || 'CONSULTATION',
    }));

    const bill = await prisma.bill.create({
      data: {
        billNumber,
        clinicId: user.clinicId,
        patientId,
        encounterId: encounterId || null,
        prescriptionId: prescriptionId || null,
        consultationFee,
        medicineFee,
        otherFee,
        discount,
        totalAmount,
        paymentStatus,
        paymentMode: paymentMode || null,
        paymentRef: paymentRef || null,
        paidAt: paymentStatus === 'PAID' ? new Date() : null,
        createdById: user.id,
        createdByName: user.fullName,
        notes: notes || null,
        items: { create: billItems },
      },
      include: {
        patient: { select: { id: true, name: true, phone: true, age: true, gender: true } },
        items: true,
      },
    });

    return NextResponse.json({ success: true, bill }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/billing error:', err);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
