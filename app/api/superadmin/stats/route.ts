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
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: { select: { fullName: true } },
          patient: { select: { name: true, age: true, gender: true } },
          clinic: { select: { name: true } },
          medicines: { select: { customName: true } }
        }
      })
    ]);

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
      doctors: c.users.filter((u) => u.role.toLowerCase() === 'doctor'),
    }));

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
