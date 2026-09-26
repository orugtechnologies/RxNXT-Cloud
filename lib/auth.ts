// lib/auth.ts
// NextAuth configuration for RxNXT — fully local, credentials-based login.
// No internet required. Validates email + password against the local SQLite DB.

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const cleanEmail = credentials.email.toLowerCase().trim();

        // Look up user in database
        let user = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { clinic: true },
        });

        // Auto-provision Super Admin if account is not in database yet
        if (!user && cleanEmail === 'superadmin@rxnxt.com') {
          try {
            let clinic = await prisma.clinic.findFirst();
            if (!clinic) {
              clinic = await prisma.clinic.create({
                data: {
                  id: 'demo-clinic-001',
                  name: 'RxNXT Demo Clinic',
                  address: '123 Health Street, Bengaluru',
                  phone: '+91 80 1234 5678',
                  email: 'info@rxnxtdemo.com',
                },
              });
            }
            const hashedPassword = await bcrypt.hash('admin123', 12);
            user = await prisma.user.create({
              data: {
                email: 'superadmin@rxnxt.com',
                password: hashedPassword,
                fullName: 'RxNXT Platform Executive Admin',
                role: 'superadmin',
                specialization: 'Platform Administration',
                clinicId: clinic.id,
              },
              include: { clinic: true },
            });
          } catch (createErr) {
            console.error('Error auto-provisioning Super Admin:', createErr);
          }
        }

        // Auto-provision a Pharmacist for pharmacy verification & testing
        if (!user && (cleanEmail === 'pharmacist@rxnxt.com' || cleanEmail === 'pharmacy@rxnxt.com')) {
          try {
            let clinic = await prisma.clinic.findFirst();
            if (!clinic) {
              clinic = await prisma.clinic.create({
                data: {
                  id: 'demo-clinic-001',
                  name: 'RxNXT Demo Clinic',
                  address: '123 Health Street, Bengaluru',
                  phone: '+91 80 1234 5678',
                  email: 'info@rxnxtdemo.com',
                },
              });
            }
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = await prisma.user.create({
              data: {
                email: cleanEmail,
                password: hashedPassword,
                fullName: 'Suresh Sharma (Chief Pharmacist)',
                role: 'pharmacist',
                specialization: 'Dispensing & Inventory Specialist',
                clinicId: clinic.id,
              },
              include: { clinic: true },
            });

            // Seed initial sample inventory for the clinic if empty
            const existingItems = await prisma.pharmacyItem.count({ where: { clinicId: clinic.id } });
            if (existingItems === 0) {
              const now = new Date();
              const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
              const nextMonth = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

              await prisma.pharmacyItem.createMany({
                data: [
                  {
                    clinicId: clinic.id,
                    medicineName: 'Paracetamol 650mg (Dolo)',
                    genericName: 'Paracetamol',
                    dosageForm: 'Tablet',
                    strength: '650mg',
                    batchNumber: 'DL-2026-A1',
                    expiryDate: nextYear,
                    quantityInStock: 250,
                    minReorderLevel: 50,
                    unitPrice: 32.0,
                    costPrice: 22.0,
                    rackLocation: 'Rack A-1',
                  },
                  {
                    clinicId: clinic.id,
                    medicineName: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)',
                    genericName: 'Amoxicillin + Clavulanic Acid',
                    dosageForm: 'Tablet',
                    strength: '625mg',
                    batchNumber: 'AUG-8891',
                    expiryDate: nextYear,
                    quantityInStock: 80,
                    minReorderLevel: 20,
                    unitPrice: 195.0,
                    costPrice: 150.0,
                    rackLocation: 'Rack B-3',
                  },
                  {
                    clinicId: clinic.id,
                    medicineName: 'Pantoprazole 40mg (Pan-40)',
                    genericName: 'Pantoprazole',
                    dosageForm: 'Tablet',
                    strength: '40mg',
                    batchNumber: 'PAN-7721',
                    expiryDate: nextYear,
                    quantityInStock: 140,
                    minReorderLevel: 30,
                    unitPrice: 110.0,
                    costPrice: 85.0,
                    rackLocation: 'Rack A-4',
                  },
                  {
                    clinicId: clinic.id,
                    medicineName: 'Cetirizine 10mg (Cetzine)',
                    genericName: 'Cetirizine',
                    dosageForm: 'Tablet',
                    strength: '10mg',
                    batchNumber: 'CTZ-4410',
                    expiryDate: nextMonth,
                    quantityInStock: 15, // Low stock simulation
                    minReorderLevel: 25,
                    unitPrice: 45.0,
                    costPrice: 30.0,
                    rackLocation: 'Rack C-2',
                  },
                  {
                    clinicId: clinic.id,
                    medicineName: 'Azithromycin 500mg (Azithral)',
                    genericName: 'Azithromycin',
                    dosageForm: 'Tablet',
                    strength: '500mg',
                    batchNumber: 'AZT-9002',
                    expiryDate: nextYear,
                    quantityInStock: 60,
                    minReorderLevel: 15,
                    unitPrice: 125.0,
                    costPrice: 95.0,
                    rackLocation: 'Rack B-1',
                  },
                ],
              });
            }
          } catch (createErr) {
            console.error('Error auto-provisioning Pharmacist:', createErr);
          }
        }

        // Auto-provision a Doctor / Clinic Admin for quick testing
        if (!user && (cleanEmail === 'doctor@rxnxt.com' || cleanEmail === 'dev@rxnxt.com')) {
          try {
            let clinic = await prisma.clinic.findFirst();
            if (!clinic) {
              clinic = await prisma.clinic.create({
                data: {
                  id: 'demo-clinic-001',
                  name: 'RxNXT Demo Clinic',
                  address: '123 Health Street, Bengaluru',
                  phone: '+91 80 1234 5678',
                  email: 'info@rxnxtdemo.com',
                },
              });
            }
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = await prisma.user.create({
              data: {
                email: cleanEmail,
                password: hashedPassword,
                fullName: 'Dr. Shanmukha Datta',
                role: 'clinic_admin',
                specialization: 'General Physician & Diabetologist',
                medicalCouncil: 'NMC / Karnataka Medical Council',
                registrationNumber: 'KMC-54912',
                verificationStatus: 'VERIFIED',
                clinicId: clinic.id,
              },
              include: { clinic: true },
            });
          } catch (createErr) {
            console.error('Error auto-provisioning Doctor:', createErr);
          }
        }

        // Auto-provision a Receptionist for front-desk queue testing
        if (!user && cleanEmail === 'receptionist@rxnxt.com') {
          try {
            let clinic = await prisma.clinic.findFirst();
            if (!clinic) {
              clinic = await prisma.clinic.create({
                data: {
                  id: 'demo-clinic-001',
                  name: 'RxNXT Demo Clinic',
                  address: '123 Health Street, Bengaluru',
                  phone: '+91 80 1234 5678',
                  email: 'info@rxnxtdemo.com',
                },
              });
            }
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = await prisma.user.create({
              data: {
                email: cleanEmail,
                password: hashedPassword,
                fullName: 'Pooja Verma (Front Desk)',
                role: 'receptionist',
                specialization: 'OPD Reception & Patient Onboarding',
                clinicId: clinic.id,
              },
              include: { clinic: true },
            });
          } catch (createErr) {
            console.error('Error auto-provisioning Receptionist:', createErr);
          }
        }

        if (!user) return null;

        // Verify password with bcrypt
        let isValid = await bcrypt.compare(credentials.password, user.password);

        // Demo account fallback & self-healing:
        // If credentials match standard demo passwords for known test emails, auto-sync and authenticate
        const demoCredentials: Record<string, string> = {
          'doctor@rxnxt.com': 'password123',
          'receptionist@rxnxt.com': 'password123',
          'pharmacist@rxnxt.com': 'password123',
          'pharmacy@rxnxt.com': 'password123',
          'admin@rxnxt.com': 'password123',
          'dev@rxnxt.com': 'password123',
          'superadmin@rxnxt.com': 'admin123',
        };

        if (!isValid && demoCredentials[cleanEmail] && credentials.password === demoCredentials[cleanEmail]) {
          try {
            const newHash = await bcrypt.hash(credentials.password, 12);
            await prisma.user.update({
              where: { id: user.id },
              data: {
                password: newHash,
                status: 'ACTIVE',
                verificationStatus: 'VERIFIED',
              },
            });
            isValid = true;
          } catch (updateErr) {
            console.error('Error updating demo user password hash:', updateErr);
            isValid = true;
          }
        }

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          status: user.status,
          clinicId: user.clinicId,
          clinicName: user.clinic?.name || 'RxNXT Platform',
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      // On login, copy user fields into the JWT token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.clinicId = (user as any).clinicId;
        token.clinicName = (user as any).clinicName;
      }
      return token;
    },
    async session({ session, token }) {
      // Make user data available in useSession() on the client
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).status = token.status as string;
        (session.user as any).clinicId = token.clinicId as string;
        (session.user as any).clinicName = token.clinicName as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  // For local dev, this secret just needs to exist — any string works
  secret: process.env.NEXTAUTH_SECRET ?? 'rxnxt-local-dev-secret-key-2024',
};
