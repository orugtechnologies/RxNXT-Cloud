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

        // Auto-provision a Dev Doctor for quick testing without registration
        if (!user && cleanEmail === 'dev@rxnxt.com') {
          try {
            let clinic = await prisma.clinic.findFirst();
            if (!clinic) {
              clinic = await prisma.clinic.create({
                data: {
                  id: 'demo-clinic-002',
                  name: 'Development Clinic',
                  address: '123 Test Street, Dev City',
                  phone: '+91 99999 99999',
                  email: 'devclinic@rxnxtdemo.com',
                },
              });
            }
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = await prisma.user.create({
              data: {
                email: 'dev@rxnxt.com',
                password: hashedPassword,
                fullName: 'Dr. Dev Tester',
                role: 'doctor',
                specialization: 'General Physician',
                medicalCouncil: 'NMC',
                registrationNumber: 'DEV-12345',
                verificationStatus: 'VERIFIED',
                clinicId: clinic.id,
              },
              include: { clinic: true },
            });
          } catch (createErr) {
            console.error('Error auto-provisioning Dev Doctor:', createErr);
          }
        }

        if (!user) return null;

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
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
