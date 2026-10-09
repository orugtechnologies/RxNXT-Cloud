// lib/prisma.ts
// Singleton Prisma client optimized for Serverless & Supabase Connection Pooling.
// Automatically routes Supabase pooler connections to Transaction mode (port 6543)
// and limits connection pool size to prevent EMAXCONNSSESSION errors.

import { PrismaClient } from '@prisma/client';

function getOptimizedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    const parsed = new URL(url);

    // If connecting to Supabase pooler on session port 5432, switch to transaction port 6543
    if (parsed.hostname.includes('pooler.supabase.com') && parsed.port === '5432') {
      parsed.port = '6543';
    }

    // Set connection_limit=1 for serverless functions to prevent pool starvation
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }

    // When on port 6543 or using pooler, enable pgbouncer mode for Prisma
    if ((parsed.port === '6543' || parsed.hostname.includes('pooler.supabase.com')) && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: optimizedUrl ? { db: { url: optimizedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always retain singleton instance on globalThis across all environments (dev & serverless production)
globalForPrisma.prisma = prisma;

