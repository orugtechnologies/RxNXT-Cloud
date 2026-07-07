// lib/auth-server.ts
// Server-side helper — call this in API routes to get the authenticated user.
// Replaces the old getAuthenticatedUser() from lib/supabase/server.ts

import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

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
  return {
    id: user.id,
    email: user.email ?? '',
    role: user.role ?? 'doctor',
    clinicId: user.clinicId ?? '',
    fullName: user.name ?? null,
    clinicName: user.clinicName ?? null,
  };
}
