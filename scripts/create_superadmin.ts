import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log('\n==============================================');
  console.log('   🛡️  RxNXT Super Admin Account Setup Tool   ');
  console.log('==============================================\n');
  console.log('This private tool securely creates or updates a Super Admin account.');
  console.log('The password you enter will be encrypted with bcrypt (12 rounds).\n');

  const prisma = new PrismaClient();

  try {
    let email = process.argv[2]?.trim();
    let password = process.argv[3]?.trim();
    let fullName = process.argv[4]?.trim();

    if (!email) {
      email = await ask('👉 Enter Super Admin Email (e.g. admin@rxnxt.com): ');
    } else {
      console.log(`👉 Super Admin Email: ${email}`);
    }

    if (!email || !email.includes('@')) {
      console.error('\n❌ Error: A valid email address is required.');
      return;
    }

    if (!password) {
      password = await ask('👉 Enter Super Admin Password (min 8 characters): ');
    } else {
      console.log(`👉 Super Admin Password: [provided]`);
    }

    if (!password || password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters long.');
      return;
    }

    if (!fullName) {
      const fullNameInput = await ask('👉 Enter Full Name [default: Platform Super Admin]: ');
      fullName = fullNameInput || 'Platform Super Admin';
    } else {
      console.log(`👉 Full Name: ${fullName}`);
    }

    console.log('\n⏳ Encrypting password with bcrypt (12 rounds)...');
    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('⏳ Connecting to database and saving Super Admin user...');

    // Find or create default platform root clinic
    let clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      clinic = await prisma.clinic.create({
        data: {
          id: 'rxnxt-platform-root',
          name: 'RxNXT Platform HQ',
          address: 'Platform Administration Center',
          phone: '+91 0000000000',
          email: cleanEmail,
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: 'ENTERPRISE',
        },
      });
    }

    // Upsert the Super Admin user
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        password: hashedPassword,
        fullName,
        role: 'superadmin',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      create: {
        email: cleanEmail,
        password: hashedPassword,
        fullName,
        role: 'superadmin',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        clinicId: clinic.id,
      },
    });

    console.log('\n==============================================');
    console.log('🎉 Super Admin account configured successfully!');
    console.log('==============================================');
    console.log(`👤 User:     ${user.fullName}`);
    console.log(`📧 Email:    ${user.email}`);
    console.log(`🛡️  Role:     ${user.role}`);
    console.log(`🔒 Security: Encrypted with bcrypt (12 rounds)`);
    console.log('\nYou can now log in at: /superadmin/login\n');
  } catch (err: any) {
    console.error('\n❌ Failed to save Super Admin to database:');
    console.error(err.message || err);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
