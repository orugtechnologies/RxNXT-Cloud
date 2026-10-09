// lib/auth-server.ts
// Server-side helper — call this in API routes to get the authenticated user.
// Replaces the old getAuthenticatedUser() from lib/supabase/server.ts

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  clinicId: string;
  fullName: string | null;
  clinicName: string | null;
}

/**
 * Returns the authenticated user from the NextAuth JWT session.
 * Returns null if no valid session exists (triggers 401 in API routes).
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = session.user as any;
  let clinicId = user.clinicId ?? '';
  let clinicName = user.clinicName ?? null;
  const email = user.email?.toLowerCase().trim() ?? '';

  // Auto-heal clinicId if missing from session
  if (!clinicId && email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email },
        include: { clinic: true },
      });
      if (dbUser?.clinicId) {
        clinicId = dbUser.clinicId;
        clinicName = dbUser.clinic?.name || clinicName;
      }
    } catch (e) {
      console.error('Failed to resolve clinicId from DB:', e);
    }
  }

  // Fallback to first clinic if still missing
  if (!clinicId) {
    try {
      const firstClinic = await prisma.clinic.findFirst();
      if (firstClinic) {
        clinicId = firstClinic.id;
        clinicName = firstClinic.name;
      }
    } catch (e) {
      console.error('Failed to fallback to first clinic:', e);
    }
  }

  return {
    id: user.id,
    email,
    role: user.role ?? 'doctor',
    clinicId,
    fullName: user.name ?? null,
    clinicName,
  };
}
