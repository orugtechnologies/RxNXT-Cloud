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

        // Look up user in local SQLite database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { clinic: true },
        });

        if (!user) return null;

        // Verify password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          clinicId: user.clinicId,
          clinicName: user.clinic.name,
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
