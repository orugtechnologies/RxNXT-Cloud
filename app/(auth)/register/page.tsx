'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Award,
  Calendar,
  Hash
} from 'lucide-react';
import { MEDICAL_COUNCILS } from '@/services/doctorVerificationService';

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
      setVerificationResult(null); // Reset verified state if core details change
      setVerificationError('');
    }
  };

  const handleVerify = async () => {
    if (!form.fullName.trim() || !form.registrationNumber.trim()) {
      setVerificationError('Please enter your Full Name and Medical Registration Number first.');
      return;
    }

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
          registrationYear: form.registrationYear,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setVerificationError(data.message || data.error || 'Verification failed. Please check your credentials.');
        setVerificationResult(null);
      } else {
        setVerificationResult(data);
        if (data.qualification && !form.specialization) {
          setForm(prev => ({ ...prev, specialization: data.qualification }));
        }
      }
    } catch (err) {
      setVerificationError('Error connecting to verification service. Please try again.');
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
        verificationStatus: verificationResult?.verificationStatus || 'UNVERIFIED',
        verifiedAt: verificationResult?.verifiedAt,
        verificationSource: verificationResult?.source,
        verificationDetails: verificationResult?.rawDetails,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please review your details.');
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
        setError('Account created! Please navigate to login page to sign in.');
        setLoading(false);
        return;
      }

      if (data.status === 'PENDING') {
        window.location.href = '/pending';
      } else {
        window.location.href = '/doctor/dashboard';
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="glass border border-slate-200/80 shadow-2xl bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardContent className="p-6 sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left border-b border-slate-100 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {inviteCodeParam ? 'Join Your Team' : 'Create Your Clinic Workspace'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1">
                {inviteCodeParam 
                  ? 'Complete registration to join the clinic team' 
                  : 'Start writing high-speed, legally compliant digital prescriptions in seconds'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-700 text-xs font-semibold self-start">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              NMC / DPDP Compliant
            </div>
          </div>
        </div>

        {inviteCodeParam && (
          <div className="bg-emerald-50 text-emerald-800 text-sm p-4 rounded-xl border border-emerald-200 mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>You have been invited to join an existing clinic. Your doctor profile will be automatically linked.</span>
          </div>
        )}

        <form className="space-y-8" onSubmit={handleRegister}>
          {/* SECTION 1: Doctor Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">1</span>
              Doctor Profile Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">Doctor Full Name <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="e.g. Dr. Shanmukha Datta" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    required 
                    disabled={loading} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="specialization" className="text-xs font-semibold text-slate-700">Specialization / Degrees</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="specialization" 
                    name="specialization" 
                    placeholder="e.g. General Physician, MBBS, MD" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.specialization} 
                    onChange={handleChange} 
                    disabled={loading} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Medical Council Verification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">2</span>
                Medical Council Verification
              </div>
              {verificationResult?.success && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Credentials
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-4 shadow-inner">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Medical Council Select */}
                <div className="lg:col-span-6 space-y-1.5">
                  <Label htmlFor="medicalCouncil" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    Medical Council / State Registry
                  </Label>
                  <select 
                    id="medicalCouncil" 
                    name="medicalCouncil" 
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all disabled:opacity-60"
                    value={form.medicalCouncil} 
                    onChange={handleChange} 
                    disabled={loading || verificationResult?.success}
                  >
                    {MEDICAL_COUNCILS.map((council) => (
                      <option key={council.id} value={council.id}>
                        {council.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Registration Number */}
                <div className="lg:col-span-4 space-y-1.5">
                  <Label htmlFor="registrationNumber" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    Registration Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="registrationNumber" 
                    name="registrationNumber" 
                    placeholder="e.g. KMC-12345 / 45678" 
                    className="h-11 text-sm bg-white border-slate-200 focus:bg-white transition-all rounded-xl font-mono uppercase" 
                    value={form.registrationNumber} 
                    onChange={handleChange} 
                    required 
                    disabled={loading || verificationResult?.success} 
                  />
                </div>

                {/* Registration Year */}
                <div className="lg:col-span-2 space-y-1.5">
                  <Label htmlFor="registrationYear" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Year
                  </Label>
                  <Input 
                    id="registrationYear" 
                    name="registrationYear" 
                    type="number" 
                    min="1950" 
                    max={new Date().getFullYear()} 
                    value={form.registrationYear} 
                    onChange={handleChange} 
                    required 
                    className="h-11 text-sm bg-white border-slate-200 rounded-xl"
                    disabled={loading || verificationResult?.success} 
                  />
                </div>
              </div>

              {/* Action Button & Status Banners */}
              {!verificationResult?.success && (
                <div className="pt-1">
                  <Button 
                    type="button" 
                    className="w-full h-11 text-sm font-semibold bg-clinic-emerald hover:bg-clinic-emeraldDark text-white shadow-md hover:shadow-lg transition-all rounded-xl flex items-center justify-center gap-2" 
                    onClick={handleVerify} 
                    disabled={verifying || loading || !form.registrationNumber || !form.fullName}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying with Medical Registry...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify License Credentials
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Error Message */}
              {verificationError && (
                <div className="text-xs sm:text-sm text-rose-700 bg-rose-50/90 p-3.5 rounded-xl border border-rose-200 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{verificationError}</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      Check your registration number or medical council. (In Sandbox mode, test credentials like <strong>KMC-12345</strong> or <strong>TEST-MCI-001</strong> are pre-configured).
                    </p>
                  </div>
                </div>
              )}
              
              {/* Success Banner */}
              {verificationResult?.success && (
                <div className="text-xs sm:text-sm text-emerald-800 bg-emerald-50/90 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900">{verificationResult.registeredName}</span>
                      <span className="text-emerald-700 ml-2 font-medium">• {verificationResult.qualification}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Active License
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Clinic & Account Security */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">3</span>
              Clinic & Account Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!inviteCodeParam && (
                <div className="space-y-1.5">
                  <Label htmlFor="clinicName" className="text-xs font-semibold text-slate-700">Clinic Name <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="clinicName" 
                      name="clinicName" 
                      placeholder="e.g. City Health Clinic" 
                      className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      value={form.clinicName} 
                      onChange={handleChange} 
                      required 
                      disabled={loading} 
                    />
                  </div>
                </div>
              )}

              <div className={`space-y-1.5 ${inviteCodeParam ? 'md:col-span-2' : ''}`}>
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="doctor@clinic.com" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    disabled={loading} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    placeholder="Minimum 6 characters" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6} 
                    disabled={loading} 
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-200 flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-13 py-4 text-base font-bold bg-clinic-blue hover:bg-clinic-blueDark text-white shadow-xl hover:shadow-2xl transition-all duration-200 rounded-2xl flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Clinic Workspace 
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-clinic-emerald hover:text-clinic-emeraldDark transition-colors">
            Sign In to Clinic Workspace
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-clinic-blue h-10 w-10" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
