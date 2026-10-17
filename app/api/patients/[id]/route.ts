import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const patient = await prisma.patient.findFirst({
      where: { id: params.id },
      include: {
        bills: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true
          }
        },
        queueItems: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            bp: true,
            pulse: true,
            temperature: true,
            weight: true,
            height: true,
            spo2: true,
            createdAt: true,
          }
        },
        encounters: {
          orderBy: { createdAt: 'desc' },
          include: {
            prescription: {
              include: {
                medicines: {
                  include: {
                    drug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const latestVitals = patient.queueItems[0] || null;

    // Format to match what the frontend hook expects
    const formattedPatient = {
      id: patient.id,
      name: patient.name,
      phone: patient.phone ?? '',
      age: patient.age ?? 0,
      gender: patient.gender ?? '',
      allergies: patient.allergies ?? null,
      vitals: latestVitals ? {
        bp: latestVitals.bp,
        pulse: latestVitals.pulse,
        temperature: latestVitals.temperature,
        weight: latestVitals.weight,
        height: latestVitals.height,
        spo2: latestVitals.spo2,
      } : null,
      clinic_id: patient.clinicId,
      created_at: patient.createdAt.toISOString(),
    };

    const formattedEncounters = patient.encounters.map(enc => ({
      id: enc.id,
      created_at: enc.createdAt.toISOString(),
      chief_complaint: enc.chiefComplaint,
      diagnosis: enc.diagnosis,
      notes: enc.notes,
      follow_up_date: enc.followUpDate,
      prescription_id: enc.prescription?.id ?? null,
      medicines: enc.prescription ? enc.prescription.medicines.map(med => ({
        id: med.id,
        drug_id: med.drugId,
        medicine_name: med.customName ?? med.drug?.brandName ?? med.drug?.genericName ?? 'Unknown',
        dosage_form: med.dosageForm,
        strength: med.strength,
        route: med.route,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions
      })) : []
    }));

    return NextResponse.json({ 
      patient: formattedPatient,
      encounters: formattedEncounters,
      bills: patient.bills || []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
