const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log("Starting full data cleanup...");
  
  const reminders = await prisma.reminder.deleteMany();
  console.log("Deleted reminders:", reminders.count);

  const meds = await prisma.prescriptionMedicine.deleteMany();
  console.log("Deleted prescription medicines:", meds.count);

  const rx = await prisma.prescription.deleteMany();
  console.log("Deleted prescriptions:", rx.count);

  const enc = await prisma.encounter.deleteMany();
  console.log("Deleted encounters:", enc.count);

  const queue = await prisma.queueItem.deleteMany();
  console.log("Deleted queue items:", queue.count);

  const docPrefs = await prisma.doctorDrugPreference.deleteMany();
  console.log("Deleted doctor drug preferences:", docPrefs.count);

  const clinicPrefs = await prisma.clinicDrugPreference.deleteMany();
  console.log("Deleted clinic drug preferences:", clinicPrefs.count);

  const tgtItems = await prisma.treatmentGroupItem.deleteMany();
  console.log("Deleted treatment group items:", tgtItems.count);

  const tgt = await prisma.treatmentGroup.deleteMany();
  console.log("Deleted treatment groups:", tgt.count);

  const patients = await prisma.patient.deleteMany();
  console.log("Deleted patients:", patients.count);

  const customDrugs = await prisma.drug.deleteMany({ where: { NOT: { clinicId: null } } });
  console.log("Deleted custom clinic drugs:", customDrugs.count);

  const users = await prisma.user.deleteMany();
  console.log("Deleted users/doctor/staff accounts:", users.count);

  const clinics = await prisma.clinic.deleteMany();
  console.log("Deleted clinics:", clinics.count);

  const remainingGlobalDrugs = await prisma.drug.count();
  console.log("Preserved standard global drug catalog:", remainingGlobalDrugs);

  console.log("\nDATABASE RESET COMPLETE: Ready for clean testing!");
  await prisma.$disconnect();
}

clean().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
