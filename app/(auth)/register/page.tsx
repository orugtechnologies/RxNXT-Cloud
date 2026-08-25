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
    medicalCouncil: 'NMC',
    registrationNumber: '',
    registrationYear: new Date().getFullYear().toString(),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Verification states
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationError, setVerificationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (verificationResult && (e.target.name === 'fullName' || e.target.name === 'registrationNumber' || e.target.name === 'medicalCouncil')) {
      setVerificationResult(null); // reset if they change crucial details
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerificationError('');
    try {
      const res = await fetch('/api/doctor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          medicalCouncil: form.medicalCouncil,
          registrationNumber: form.registrationNumber,
          registrationYear: form.registrationYear
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVerificationError(data.message || data.error || 'Verification failed');
        setVerificationResult(null);
      } else {
        setVerificationResult(data);
        if (data.qualification && !form.specialization) {
          setForm(prev => ({ ...prev, specialization: data.qualification }));
        }
      }
    } catch (err) {
      setVerificationError('Error connecting to verification service');
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        qualification: verificationResult?.qualification,
        verificationStatus: verificationResult?.verificationStatus,
        verifiedAt: verificationResult?.verifiedAt,
        verificationSource: verificationResult?.source,
        verificationDetails: verificationResult?.rawDetails
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <Card className="glass border border-white/80 shadow-2xl bg-white/90 backdrop-blur-md rounded-2xl">
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

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-slate-700">Medical Council Verification</Label>
              {verificationResult?.success && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  Verified
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="medicalCouncil" className="text-xs">State Medical Council / NMC</Label>
                <select 
                  id="medicalCouncil" 
                  name="medicalCouncil" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.medicalCouncil} 
                  onChange={handleChange} 
                  disabled={loading || verificationResult?.success}
                >
                  <option value="NMC">National Medical Commission (NMC)</option>
                  <option value="KMC">Karnataka Medical Council</option>
                  <option value="MMC">Maharashtra Medical Council</option>
                  <option value="DMC">Delhi Medical Council</option>
                  <option value="TSMC">Telangana State Medical Council</option>
                  <option value="APMC">Andhra Pradesh Medical Council</option>
                  <option value="TNMC">Tamil Nadu Medical Council</option>
                  <option value="UPMC">Uttar Pradesh Medical Council</option>
                  <option value="GMC">Gujarat Medical Council</option>
                  <option value="RMC">Rajasthan Medical Council</option>
                  <option value="WBMC">West Bengal Medical Council</option>
                  <option value="Other">Other State Council</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="registrationNumber" className="text-xs">Reg. Number</Label>
                  <Input id="registrationNumber" name="registrationNumber" placeholder="e.g. KMC-123" value={form.registrationNumber} onChange={handleChange} required disabled={loading || verificationResult?.success} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="registrationYear" className="text-xs">Year</Label>
                  <Input id="registrationYear" name="registrationYear" type="number" min="1950" max={new Date().getFullYear()} value={form.registrationYear} onChange={handleChange} required disabled={loading || verificationResult?.success} />
                </div>
              </div>
            </div>

            {!verificationResult?.success && (
              <Button type="button" variant="secondary" className="w-full text-sm font-medium" onClick={handleVerify} disabled={verifying || loading || !form.registrationNumber || !form.fullName}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify Credentials Instantly
              </Button>
            )}

            {verificationError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{verificationError}</div>
            )}
            
            {verificationResult?.success && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                Official Match: <strong>{verificationResult.registeredName}</strong> • {verificationResult.qualification}
              </div>
            )}
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
