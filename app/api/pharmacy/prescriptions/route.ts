export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { formatDisplayRxId } from '@/lib/prescription-id';

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const status = searchParams.get('status') || 'PENDING'; // 'PENDING' | 'DISPENSED' | 'ALL'

  try {
    const cleanQ = q ? q.trim() : '';
    const strippedQ = cleanQ ? cleanQ.replace(/^[#rx\-]+/i, '') : '';

    const prescriptions = await prisma.prescription.findMany({
      where: {
        clinicId: user.clinicId,
        ...(status !== 'ALL' && { dispenseStatus: status }),
        ...(cleanQ && {
          OR: [
            { id: { contains: cleanQ, mode: 'insensitive' } },
            ...(strippedQ ? [{ id: { contains: strippedQ, mode: 'insensitive' } }] : []),
            { patient: { name: { contains: cleanQ, mode: 'insensitive' } } },
            { patient: { phone: { contains: cleanQ } } },
            { doctor: { fullName: { contains: cleanQ, mode: 'insensitive' } } },
          ],
        }),
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            registrationNumber: true,
            medicalCouncil: true,
            verificationStatus: true,
            signatureUrl: true,
          },
        },
        encounter: {
          select: {
            chiefComplaint: true,
            diagnosis: true,
            notes: true,
            followUpDate: true,
          },
        },
        medicines: {
          include: {
            drug: true,
          },
        },
        dispenseLogs: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Fetch clinic's current inventory to match with prescription items
    const inventory = await prisma.pharmacyItem.findMany({
      where: { clinicId: user.clinicId, isActive: true },
    });

    const enrichedPrescriptions = prescriptions.map((p) => {
      const mappedMedicines = p.medicines.map((m) => {
        const medName = m.customName || m.drug?.brandName || m.drug?.genericName || '';
        
        // Find matching inventory item (case-insensitive fuzzy/exact match)
        const stockItem = inventory.find((inv) =>
          inv.medicineName.toLowerCase().includes(medName.toLowerCase()) ||
          (m.drug?.genericName && inv.genericName?.toLowerCase().includes(m.drug.genericName.toLowerCase()))
        );

        // Estimate prescribed quantity from duration & frequency (e.g. 1-0-1 for 5 days = 10 units)
        let estimatedUnits = 10;
        if (m.duration) {
          const daysMatch = m.duration.match(/\d+/);
          const days = daysMatch ? parseInt(daysMatch[0], 10) : 5;
          let dailyCount = 2; // Default 1-0-1
          const f = (m.frequency || '').toLowerCase();
          if (f.includes('1-1-1') || f.includes('thrice') || f.includes('3 times')) dailyCount = 3;
          else if (f.includes('1-0-0') || f.includes('0-1-0') || f.includes('0-0-1') || f.includes('once') || f.includes('od')) dailyCount = 1;
          else if (f.includes('1-0-1') || f.includes('twice') || f.includes('bd')) dailyCount = 2;
          else if (f.includes('1-1-1-1') || f.includes('4 times') || f.includes('qid')) dailyCount = 4;
          estimatedUnits = days * dailyCount;
        }

        return {
          id: m.id,
          name: medName,
          dosageForm: m.dosageForm || 'Tablet',
          strength: m.strength || '',
          frequency: m.frequency || '',
          duration: m.duration || '',
          instructions: m.instructions || '',
          estimatedUnits,
          stockItem: stockItem ? {
            id: stockItem.id,
            medicineName: stockItem.medicineName,
            batchNumber: stockItem.batchNumber,
            expiryDate: stockItem.expiryDate,
            quantityInStock: stockItem.quantityInStock,
            unitPrice: stockItem.unitPrice,
            rackLocation: stockItem.rackLocation,
          } : null,
          inStock: Boolean(stockItem && stockItem.quantityInStock >= estimatedUnits),
        };
      });

      const { fullId, shortId, badgeText } = formatDisplayRxId(p.id);

      return {
        id: p.id,
        fullRxId: fullId,
        shortToken: shortId,
        displayRxId: badgeText,
        createdAt: p.createdAt,
        dispenseStatus: p.dispenseStatus,
        patient: {
          id: p.patient.id,
          name: p.patient.name,
          phone: p.patient.phone,
          age: p.patient.age,
          gender: p.patient.gender,
        },
        doctor: p.doctor,
        encounter: p.encounter,
        medicines: mappedMedicines,
        dispenseLog: p.dispenseLogs[0] || null,
      };
    });

    return NextResponse.json({ success: true, prescriptions: enrichedPrescriptions });
  } catch (error: any) {
    console.error('Fetch Pharmacy Prescriptions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
