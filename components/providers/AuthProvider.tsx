'use client';

// components/providers/AuthProvider.tsx
// Client-side SessionProvider wrapper for NextAuth.
// Wraps the whole app so useSession() works in all client components.

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
