import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_EMAILS_TO_REMOVE = [
  'paanidatta@orugtech.com',
  'radhareception@orugtech.com',
  'manishpharmacist@orugtech.com',
  'ragininurse@orugtech.com',
  'labtech@rxnxt.com',
  'd1@rxnxt.com',
  'doctor.d1@rxnxt.com',
  'd2@rxnxt.com',
  'doctor.d2@rxnxt.com',
  'd3@rxnxt.com',
  'doctor.d3@rxnxt.com',
  'doctor@rxnxt.com',
  'receptionist@rxnxt.com',
  'pharmacist@rxnxt.com',
  'pharmacy@rxnxt.com',
  'admin@rxnxt.com',
  'dev@rxnxt.com',
  'nurse@rxnxt.com',
];

const DUMMY_CLINIC_IDS = ['clinic-d1', 'clinic-d2', 'clinic-d3'];

async function main() {
  console.log('\n==============================================');
  console.log('   🧹  RxNXT Demo Account & Dummy Clinic Purge');
  console.log('==============================================\n');

  try {
    // 1. Delete all demo users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        clinicId: true,
      },
    });

    const demoUsers = allUsers.filter(u =>
      DEMO_EMAILS_TO_REMOVE.includes(u.email.toLowerCase()) ||
      DUMMY_CLINIC_IDS.includes(u.clinicId)
    );

    console.log(`Found ${demoUsers.length} demo account(s) to remove.`);

    for (const du of demoUsers) {
      console.log(`⏳ Deleting demo user dependencies for: ${du.email} (${du.fullName})...`);

      // 1. Delete reminders & prescription items linked to this doctor/clinic
      const rxList = await prisma.prescription.findMany({
        where: { doctorId: du.id },
        select: { id: true }
      });
      const rxIds = rxList.map(r => r.id);

      if (rxIds.length > 0) {
        await prisma.reminder.deleteMany({ where: { prescriptionId: { in: rxIds } } });
        await prisma.prescriptionMedicine.deleteMany({ where: { prescriptionId: { in: rxIds } } });
        await prisma.prescription.deleteMany({ where: { id: { in: rxIds } } });
      }

      // 2. Encounters & queue items
      await prisma.encounter.deleteMany({ where: { doctorId: du.id } });
      await prisma.queueItem.deleteMany({ where: { doctorId: du.id } });

      // 3. Lab orders / test results
      await prisma.labTestResult.deleteMany({ where: { technicianId: du.id } }).catch(() => {});
      await prisma.labOrder.deleteMany({ where: { doctorId: du.id } }).catch(() => {});

      // 4. Preferences & templates
      await prisma.doctorDrugPreference.deleteMany({ where: { doctorId: du.id } }).catch(() => {});
      await prisma.treatmentGroup.deleteMany({ where: { doctorId: du.id } }).catch(() => {});

      // 5. Delete User
      await prisma.user.delete({ where: { id: du.id } });
      console.log(`  ✅ PERMANENTLY DELETED: ${du.email} (${du.fullName})`);
    }

    // 2. Clean up dummy clinics (clinic-d1, clinic-d2, clinic-d3)
    for (const cId of DUMMY_CLINIC_IDS) {
      console.log(`⏳ Purging dummy clinic ${cId}...`);
      // Delete clinic's remaining records
      const cRx = await prisma.prescription.findMany({ where: { clinicId: cId }, select: { id: true } });
      const cRxIds = cRx.map(r => r.id);
      if (cRxIds.length > 0) {
        await prisma.reminder.deleteMany({ where: { prescriptionId: { in: cRxIds } } });
        await prisma.prescriptionMedicine.deleteMany({ where: { prescriptionId: { in: cRxIds } } });
        await prisma.prescription.deleteMany({ where: { id: { in: cRxIds } } });
      }

      await prisma.encounter.deleteMany({ where: { clinicId: cId } });
      await prisma.queueItem.deleteMany({ where: { clinicId: cId } });
      await prisma.labTestResult.deleteMany({ where: { labOrder: { clinicId: cId } } }).catch(() => {});
      await prisma.labOrder.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await (prisma as any).dispensedItem?.deleteMany({ where: { dispenseLog: { clinicId: cId } } }).catch(() => {});
      await (prisma as any).dispenseLog?.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await (prisma as any).pharmacyItem?.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await (prisma as any).billItem?.deleteMany({ where: { bill: { clinicId: cId } } }).catch(() => {});
      await (prisma as any).bill?.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await (prisma as any).treatmentGroupItem?.deleteMany({}).catch(() => {});
      await (prisma as any).treatmentGroup?.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await prisma.clinicDrugPreference.deleteMany({ where: { clinicId: cId } }).catch(() => {});
      await prisma.patient.deleteMany({ where: { clinicId: cId } });
      await prisma.user.deleteMany({ where: { clinicId: cId } });

      await prisma.clinic.delete({ where: { id: cId } }).catch((e) => {
        console.log(`  Notice: Clinic ${cId} already removed or not found.`);
      });
      console.log(`  ✅ Cleaned dummy clinic ${cId}`);
    }

    // 3. Rename demo-clinic-002 to RxNXT Platform HQ
    await prisma.clinic.update({
      where: { id: 'demo-clinic-002' },
      data: {
        name: 'RxNXT Platform HQ',
        email: 'admin@rxnxt.com',
      }
    }).catch(() => {});

    // 4. Output final active accounts in database
    const finalUsers = await prisma.user.findMany({
      select: {
        email: true,
        fullName: true,
        role: true,
        clinic: { select: { name: true } },
      }
    });

    console.log('\n==============================================');
    console.log('🎉 Active Accounts in Live Database:');
    for (const u of finalUsers) {
      console.log(`  👤 ${u.email} | ${u.fullName} (${u.role}) — ${u.clinic?.name}`);
    }
    console.log('==============================================\n');

  } catch (err: any) {
    console.error('❌ Error during purge:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
