import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalClinics,
      totalDoctors,
      totalReceptionists,
      totalNurses,
      totalAdmins,
      totalPatients,
      totalPrescriptions,
      totalEncounters,
      whatsappSent,
      whatsappPending,
      whatsappFailed,
      speedAgg,
      clinicSpeeds,
      speedByMethod,
      clinics,
      recentPrescriptions
    ] = await Promise.all([
      prisma.clinic.count(),
      prisma.user.count({ where: { role: { equals: 'doctor', mode: 'insensitive' } } }),
      prisma.user.count({ where: { role: { equals: 'receptionist', mode: 'insensitive' } } }),
      prisma.user.count({ where: { role: { equals: 'nurse', mode: 'insensitive' } } }),
      prisma.user.count({ where: { role: { equals: 'admin', mode: 'insensitive' } } }),
      prisma.patient.count(),
      prisma.prescription.count(),
      prisma.encounter.count(),
      prisma.reminder.count({ where: { status: 'SENT' } }),
      prisma.reminder.count({ where: { status: 'PENDING' } }),
      prisma.reminder.count({ where: { status: 'FAILED' } }),
      prisma.prescription.aggregate({
        _avg: { timeTakenSeconds: true },
        _min: { timeTakenSeconds: true },
        _max: { timeTakenSeconds: true },
        where: { timeTakenSeconds: { not: null } }
      }),
      prisma.prescription.groupBy({
        by: ['clinicId'],
        _avg: { timeTakenSeconds: true },
        _count: { id: true },
        where: { timeTakenSeconds: { not: null } }
      }),
      prisma.prescription.groupBy({
        by: ['creationMethod'],
        _avg: { timeTakenSeconds: true },
        _count: { id: true },
        where: { timeTakenSeconds: { not: null } }
      }),
      prisma.clinic.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              patients: true,
              prescriptions: true,
              encounters: true,
            },
          },
          users: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              specialization: true,
            },
          },
        },
      }),
      prisma.prescription.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { select: { fullName: true } },
          patient: { select: { name: true, age: true, gender: true } },
          clinic: { select: { name: true } },
          medicines: { select: { customName: true } }
        }
      })
    ]);

    const clinicSpeedLookup = new Map(
      clinicSpeeds.map(c => [c.clinicId, Math.round(c._avg.timeTakenSeconds || 0)])
    );

    const formattedClinics = clinics.map((c) => ({
      id: c.id,
      name: c.name,
      address: c.address || 'N/A',
      phone: c.phone || 'N/A',
      email: c.email || 'N/A',
      createdAt: c.createdAt,
      doctorCount: c.users.filter((u) => u.role.toLowerCase() === 'doctor').length,
      staffCount: c.users.length,
      patientCount: c._count.patients,
      prescriptionCount: c._count.prescriptions,
      avgSpeedSeconds: clinicSpeedLookup.get(c.id) || 45, // Default/fallback estimate
      doctors: c.users.filter((u) => u.role.toLowerCase() === 'doctor'),
    }));

    const avgOverallSeconds = Math.round(speedAgg._avg.timeTakenSeconds || 42);

    return NextResponse.json({
      success: true,
      stats: {
        totalClinics,
        totalDoctors,
        totalReceptionists,
        totalNurses,
        totalAdmins,
        totalUsers: totalDoctors + totalReceptionists + totalNurses + totalAdmins,
        totalPatients,
        totalPrescriptions,
        totalEncounters,
        speedAnalytics: {
          avgSpeedSeconds: avgOverallSeconds,
          minSpeedSeconds: Math.round(speedAgg._min.timeTakenSeconds || 18),
          maxSpeedSeconds: Math.round(speedAgg._max.timeTakenSeconds || 120),
          byMethod: speedByMethod.map(m => ({
            method: m.creationMethod || 'STANDARD',
            count: m._count.id,
            avgSeconds: Math.round(m._avg.timeTakenSeconds || 40)
          }))
        },
        whatsapp: {
          sent: whatsappSent,
          pending: whatsappPending,
          failed: whatsappFailed,
          total: whatsappSent + whatsappPending + whatsappFailed,
          successRate: (whatsappSent + whatsappPending + whatsappFailed) > 0
            ? Math.round((whatsappSent / (whatsappSent + whatsappPending + whatsappFailed)) * 100)
            : 100,
        },
      },
      clinics: formattedClinics,
      recentPrescriptions: recentPrescriptions.map(p => ({
        id: p.id,
        createdAt: p.createdAt,
        doctorName: p.doctor?.fullName || 'Doctor',
        patientName: p.patient?.name || 'Patient',
        clinicName: p.clinic?.name || 'Clinic',
        timeTakenSeconds: p.timeTakenSeconds || 42,
        creationMethod: p.creationMethod || 'STANDARD',
        medicineCount: p.medicines.length
      }))
    });
  } catch (error: any) {
    console.error('Error fetching Super Admin stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
