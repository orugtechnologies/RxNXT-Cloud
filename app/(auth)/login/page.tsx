'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    const result = await signIn('credentials', {
      email: cleanEmail,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please check credentials and try again.');
      setLoading(false);
      return;
    }

    // Role-based routing after successful authentication
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const role = session?.user?.role?.toLowerCase().replace(/_/g, '');

      if (role === 'superadmin') {
        window.location.href = '/superadmin/dashboard?login=success';
        return;
      }
      if (role === 'receptionist') {
        window.location.href = '/receptionist/dashboard?login=success';
        return;
      }
      if (role === 'pharmacist') {
        window.location.href = '/pharmacist/dashboard?login=success';
        return;
      }
      if (role === 'nurse') {
        window.location.href = '/nurse/dashboard?login=success';
        return;
      }
    } catch (e) {
      // Fall through to default doctor dashboard redirect
    }

    // Successful doctor/clinic_admin login — hard redirect so middleware re-evaluates session
    window.location.href = '/doctor/dashboard?login=success';
  };

  return (
    <Card className="glass border border-white/80 shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl max-w-md mx-auto">
      <CardContent className="pt-8 px-8 pb-8">
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Doctor / Staff Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-10 py-5 bg-slate-50/50 focus:bg-white transition-colors"
                  placeholder="user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="pl-10 py-5 bg-slate-50/50 focus:bg-white transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 flex items-start animate-fade-in">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          New to RxNXT?{' '}
          <Link href="/register" className="font-medium text-clinic-emerald hover:text-clinic-emeraldDark transition-colors">
            Register your Clinic (14-day Free Trial)
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
