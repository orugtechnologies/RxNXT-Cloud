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
  MapPin,
  Phone,
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteCodeParam = searchParams?.get('invite') || '';

  const [form, setForm] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    inviteCode: inviteCodeParam,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in your name, email/User ID, and password.');
      return;
    }

    if (!inviteCodeParam && !form.clinicName.trim()) {
      setError('Please enter your clinic name.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please review your details.');
        setLoading(false);
        return;
      }

      // Automatically sign in with credentials
      const result = await signIn('credentials', {
        email: form.email.toLowerCase().trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Workspace created! Please proceed to login to sign in.');
        setLoading(false);
        return;
      }

      window.location.href = '/doctor/dashboard';
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
                {inviteCodeParam ? 'Join Your Clinic Team' : 'Create Your Clinic Workspace'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-1 font-medium">
                {inviteCodeParam 
                  ? 'Complete your profile to join your clinic team' 
                  : 'Get started in seconds with high-speed digital prescriptions and patient queue'}
              </p>
            </div>
            {!inviteCodeParam && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-700 text-xs font-semibold self-start">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                14-Day Free Trial
              </div>
            )}
          </div>
        </div>

        {inviteCodeParam && (
          <div className="bg-emerald-50 text-emerald-800 text-sm p-4 rounded-xl border border-emerald-200 mb-6 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>You have been invited to join an existing clinic. Your profile will be automatically linked.</span>
          </div>
        )}

        <form className="space-y-7" onSubmit={handleRegister}>
          {/* SECTION 1: Clinic Details (Only for new clinic creation) */}
          {!inviteCodeParam && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">1</span>
                Clinic Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="clinicName" className="text-xs font-semibold text-slate-700">
                    Clinic Name <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="clinicName" 
                      name="clinicName" 
                      placeholder="e.g. City Health Care Clinic" 
                      className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      value={form.clinicName} 
                      onChange={handleChange} 
                      required 
                      disabled={loading} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clinicAddress" className="text-xs font-semibold text-slate-700">
                    Clinic Address / Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="clinicAddress" 
                      name="clinicAddress" 
                      placeholder="e.g. 12th Main, Indiranagar, Bengaluru" 
                      className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      value={form.clinicAddress} 
                      onChange={handleChange} 
                      disabled={loading} 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clinicPhone" className="text-xs font-semibold text-slate-700">
                    Clinic Contact Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      id="clinicPhone" 
                      name="clinicPhone" 
                      placeholder="e.g. +91 98765 43210" 
                      className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                      value={form.clinicPhone} 
                      onChange={handleChange} 
                      disabled={loading} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: User Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {inviteCodeParam ? '1' : '2'}
              </span>
              User Account & Login Credentials
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
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
                <Label htmlFor="specialization" className="text-xs font-semibold text-slate-700">
                  Specialization / Role
                </Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="specialization" 
                    name="specialization" 
                    placeholder="e.g. General Physician, MD" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.specialization} 
                    onChange={handleChange} 
                    disabled={loading} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address / User ID <span className="text-rose-500">*</span>
                </Label>
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

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Doctor / Personal Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="e.g. 9876543210" 
                    className="pl-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.phone} 
                    onChange={handleChange} 
                    disabled={loading} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Minimum 6 characters" 
                    className="pl-10 pr-10 h-11 text-sm bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6} 
                    disabled={loading} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
              className="w-full h-12 py-3 text-base font-bold transition-all duration-200 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Clinic Workspace...
                </>
              ) : (
                <>
                  {inviteCodeParam ? 'Complete Registration' : 'Create Clinic Workspace'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-slate-400 mt-2 font-medium">
              By creating an account, you get instant access with a 14-day free trial.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign In to Clinic Workspace
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
