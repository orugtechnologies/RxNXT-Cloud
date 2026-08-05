'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, Mail, Loader2, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuperAdminLoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const isNotice = searchParams.get('notice') === 'super_admin_moved';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid Super Admin credentials. Please verify your access.');
      setLoading(false);
      return;
    }

    // Verify user role is super_admin or superadmin
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const role = session?.user?.role?.toLowerCase().replace('_', '');
      if (role !== 'superadmin') {
        setError('Access denied: Account is not authorized for Super Admin Portal access.');
        setLoading(false);
        return;
      }
    } catch (e) {
      // Proceed with redirect
    }

    window.location.href = '/superadmin/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-3">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-10 w-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RxNXT Super Admin Portal</h1>
          <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Platform Infrastructure & Global Controls
          </p>
        </div>

        {isNotice && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs p-3.5 rounded-xl flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
            <span>Super Admin access has been moved to this dedicated portal for enhanced isolation and security.</span>
          </div>
        )}

        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl text-slate-100">
          <CardContent className="pt-8 px-8 pb-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-slate-300">Super Admin Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="admin-email"
                      type="email"
                      required
                      className="pl-10 py-6 bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      placeholder="superadmin@rxnxt.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-slate-300">Master Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="admin-password"
                      type="password"
                      required
                      className="pl-10 py-6 bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 flex items-start">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Authenticate Super Admin
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
              <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-indigo-300 transition-colors">
                <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
                Doctor / Staff Login
              </Link>
              <span className="text-slate-600">RxNXT Security v2.4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <SuperAdminLoginContent />
    </Suspense>
  );
}
