export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prescriptionId, items, paymentMode, notes } = await request.json();

    if (!prescriptionId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Prescription ID and dispensed items are required.' }, { status: 400 });
    }

    const prescription = await prisma.prescription.findFirst({
      where: { id: prescriptionId, clinicId: user.clinicId },
      include: { patient: true },
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found or access denied.' }, { status: 404 });
    }

    // Atomic dispense and stock deduction transaction
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0.0;

      const preparedItems = items.map((it: any) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0.0;
        const total = qty * price;
        totalAmount += total;

        return {
          pharmacyItemId: it.pharmacyItemId || null,
          medicineName: it.medicineName || 'Prescribed Medicine',
          quantity: qty,
          unitPrice: price,
          totalPrice: total,
          dosageForm: it.dosageForm || 'Tablet',
          batchNumber: it.batchNumber || null,
        };
      });

      // 1. Create Dispense Log
      const dispenseLog = await tx.dispenseLog.create({
        data: {
          clinicId: user.clinicId,
          prescriptionId,
          pharmacistId: user.id,
          pharmacistName: user.fullName || 'Pharmacist',
          patientId: prescription.patientId,
          patientName: prescription.patient.name,
          totalAmount,
          paymentMode: paymentMode || 'CASH',
          notes: notes || null,
          items: {
            create: preparedItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Decrement inventory stock quantities for matched inventory items
      for (const it of preparedItems) {
        if (it.pharmacyItemId) {
          await tx.pharmacyItem.update({
            where: { id: it.pharmacyItemId },
            data: {
              quantityInStock: {
                decrement: it.quantity,
              },
            },
          });
        }
      }

      // 3. Mark Prescription as DISPENSED
      const updatedPrescription = await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          dispenseStatus: 'DISPENSED',
        },
      });

      return { dispenseLog, updatedPrescription };
    });

    return NextResponse.json({
      success: true,
      message: 'Prescription successfully dispensed and stock updated.',
      dispenseLog: result.dispenseLog,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Dispense Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
