import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

// ─────────────────────────────────────────
// GET /api/billing/[id] — fetch single bill
// ─────────────────────────────────────────
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bill = await prisma.bill.findFirst({
      where: { id: params.id, clinicId: user.clinicId },
      include: {
        patient: { select: { id: true, name: true, phone: true, age: true, gender: true } },
        items: true,
      },
    });

    if (!bill) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

    return NextResponse.json({ success: true, bill });
  } catch (err: any) {
    console.error('GET /api/billing/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// PATCH /api/billing/[id] — update payment
// ─────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const {
      paymentStatus,
      paymentMode,
      paymentRef,
      consultationFee,
      medicineFee,
      otherFee,
      discount,
      notes,
    } = body;

    const existing = await prisma.bill.findFirst({
      where: { id: params.id, clinicId: user.clinicId },
    });
    if (!existing) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

    const updateData: any = {};

    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode;
    if (paymentRef !== undefined) updateData.paymentRef = paymentRef;
    if (notes !== undefined) updateData.notes = notes;

    // Recalculate totals if amounts changed
    const newConsultation = consultationFee ?? existing.consultationFee;
    const newMedicine = medicineFee ?? existing.medicineFee;
    const newOther = otherFee ?? existing.otherFee;
    const newDiscount = discount ?? existing.discount;

    if (
      consultationFee !== undefined ||
      medicineFee !== undefined ||
      otherFee !== undefined ||
      discount !== undefined
    ) {
      updateData.consultationFee = newConsultation;
      updateData.medicineFee = newMedicine;
      updateData.otherFee = newOther;
      updateData.discount = newDiscount;
      updateData.totalAmount = Math.max(0, (newConsultation + newMedicine + newOther) - newDiscount);
    }

    // Mark paidAt timestamp when status moves to PAID
    if (paymentStatus === 'PAID' && existing.paymentStatus !== 'PAID') {
      updateData.paidAt = new Date();
    }
    if (paymentStatus === 'PENDING' || paymentStatus === 'CANCELLED') {
      updateData.paidAt = null;
    }

    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: updateData,
      include: {
        patient: { select: { id: true, name: true, phone: true, age: true, gender: true } },
        items: true,
      },
    });

    return NextResponse.json({ success: true, bill });
  } catch (err: any) {
    console.error('PATCH /api/billing/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 });
  }
}

// ─────────────────────────────────────────
// DELETE /api/billing/[id] — cancel a bill
// ─────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = ['admin', 'clinic_admin'];
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: 'Only admins can delete bills' }, { status: 403 });
  }

  try {
    const existing = await prisma.bill.findFirst({
      where: { id: params.id, clinicId: user.clinicId },
    });
    if (!existing) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });

    // Soft-cancel instead of hard delete to preserve audit trail
    const bill = await prisma.bill.update({
      where: { id: params.id },
      data: { paymentStatus: 'CANCELLED' },
    });

    return NextResponse.json({ success: true, bill });
  } catch (err: any) {
    console.error('DELETE /api/billing/[id] error:', err);
    return NextResponse.json({ error: 'Failed to cancel bill' }, { status: 500 });
  }
}
