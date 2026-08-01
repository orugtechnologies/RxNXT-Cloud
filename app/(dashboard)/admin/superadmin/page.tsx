'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Legacy Super Admin page route inside doctor/clinic layout.
 * Redirects visitors to the dedicated Super Admin Portal (/superadmin/dashboard)
 * or back to Doctor / Clinic Admin Team Management (/admin/team).
 */
export default function LegacySuperAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/team');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-clinic-blue" />
        <span className="font-medium text-sm">Redirecting...</span>
      </div>
    </div>
  );
}
