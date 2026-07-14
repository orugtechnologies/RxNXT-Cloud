'use client';

// hooks/useAuth.ts
// Replaces the old Supabase-based useAuth hook.
// Now uses NextAuth's useSession() — works 100% offline.

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const user = session?.user
    ? {
        id: (session.user as any).id as string,
        email: session.user.email ?? '',
        role: (session.user as any).role as string ?? 'doctor',
        status: (session.user as any).status as string ?? 'ACTIVE',
        clinic_id: (session.user as any).clinicId as string,
      }
    : null;

  const profile = session?.user
    ? {
        full_name: session.user.name ?? '',
        clinic_name: (session.user as any).clinicName as string,
      }
    : null;

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/login' });
  };

  return {
    user,
    profile,
    role: user?.role,
    clinicId: user?.clinic_id,
    isLoading,
    signOut,
  };
}
