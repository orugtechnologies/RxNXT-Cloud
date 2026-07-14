'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Building2, Loader2, ArrowRight } from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteCodeParam = searchParams?.get('invite') || '';

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    clinicName: '',
    specialization: '',
    phone: '',
    inviteCode: inviteCodeParam,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: form.email.toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registered but login failed. Please go to login page.');
        setLoading(false);
        return;
      }

      if (data.status === 'PENDING') {
        window.location.href = '/pending';
      } else {
        window.location.href = '/doctor/dashboard';
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-0 shadow-2xl bg-white/95 backdrop-blur-md">
      <CardContent className="pt-8 px-8 pb-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {inviteCodeParam ? 'Join Your Team' : 'Create Your Clinic'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {inviteCodeParam ? 'Complete registration to join the clinic workspace' : 'Set up your RxNXT workspace'}
          </p>
        </div>

        {inviteCodeParam && (
          <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-md border border-emerald-100 mb-6 text-center font-medium">
            You have been invited to join a clinic. Your account will be linked automatically.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="fullName" name="fullName" placeholder="Dr. Shanmukha Datta" className="pl-9" value={form.fullName} onChange={handleChange} required disabled={loading} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" name="specialization" placeholder="General Physician" value={form.specialization} onChange={handleChange} disabled={loading} />
            </div>
          </div>

          {!inviteCodeParam && (
            <div className="space-y-1">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="clinicName" name="clinicName" placeholder="City Health Clinic" className="pl-9" value={form.clinicName} onChange={handleChange} required disabled={loading} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="email" name="email" type="email" placeholder="doctor@clinic.com" className="pl-9" value={form.email} onChange={handleChange} required disabled={loading} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input id="password" name="password" type="password" placeholder="Minimum 6 characters" className="pl-9" value={form.password} onChange={handleChange} required minLength={6} disabled={loading} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-6 text-base font-semibold" disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <>Create Workspace <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-clinic-emerald hover:text-clinic-emeraldDark transition-colors">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-clinic-blue h-8 w-8" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
