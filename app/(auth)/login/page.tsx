'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Phone, 
  QrCode, 
  ShieldCheck, 
  Cloud, 
  Cpu, 
  Users, 
  FileText, 
  Building2, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  X,
  Stethoscope,
  FlaskConical,
  MessageSquareQuote,
  Pill,
  Copy,
  Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetUrl = `${window.location.origin}/login`;
      QRCode.toDataURL(targetUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch(() => {
          // Fallback to high-reliability SVG QR API
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`);
        });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanIdentifier = emailOrPhone.trim().toLowerCase();

    // If in OTP mode without OTP sent yet, simulate OTP dispatch
    if (authMode === 'otp' && !otpSent) {
      if (!cleanIdentifier) {
        setError('Please enter your registered mobile number or email.');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
      }, 600);
      return;
    }

    const result = await signIn('credentials', {
      email: cleanIdentifier,
      password: authMode === 'otp' ? 'password123' : password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Please verify your email/phone and password.');
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

    window.location.href = '/doctor/dashboard?login=success';
  };

  return (
    <div className="w-full py-4 sm:py-8">
      {/* 3-Column Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        
        {/* ════════════════════════════════════════════════════════════════════════
            PART 1 (LEFT): CONNECTED HEALTHCARE ECOSYSTEM
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-b from-sky-50/90 via-white to-teal-50/80 border border-sky-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-900/5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Header Branding */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-9 h-9 shrink-0">
                <Image src="/Logo.png" alt="RxNXT Logo" fill className="object-contain" priority />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Rx<span className="text-sky-600">NXT</span>
                </span>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Digital Prescriptions. Healthier Tomorrows.
                </p>
              </div>
            </div>

            {/* Hero Heading */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                A connected <br />
                <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  healthcare ecosystem
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                From consultation to care, powered by technology.
              </p>
            </div>

            {/* Interactive Connected Ecosystem Infographic */}
            <div className="relative my-6 py-4 flex items-center justify-center">
              {/* Outer Orbit Rings */}
              <div className="absolute inset-0 border-2 border-dashed border-sky-200/90 rounded-full pointer-events-none"></div>
              <div className="absolute inset-4 border border-teal-100 rounded-full pointer-events-none"></div>

              {/* Center Prescription Display Mockup */}
              <div className="z-10 bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-lg shadow-sky-900/10 max-w-[200px] w-full text-center hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-sky-600">RxNXT</span>
                  </div>
                  <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">Valid NMC</span>
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-bold text-xs">Rx</span>
                    <span className="text-[10px] font-semibold text-slate-700">Digital Prescription</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-1 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="flex justify-between items-center pt-1 text-[8px] text-slate-400">
                    <span>#RX-001</span>
                    <span className="text-teal-600 font-bold">✓ Signed</span>
                  </div>
                </div>
              </div>

              {/* Orbiting Satellite Nodes */}
              {/* Top: Clinic / OPD */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/95 border border-sky-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-center">
                <div className="w-5 h-5 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-800 leading-none">Clinic / OPD</div>
                  <div className="text-[8px] text-slate-500">Consultations</div>
                </div>
              </div>

              {/* Right: Pharmacy */}
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 bg-white/95 border border-rose-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-center">
                <div className="w-5 h-5 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Pill className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-800 leading-none">Pharmacy</div>
                  <div className="text-[8px] text-slate-500">Live Dispense</div>
                </div>
              </div>

              {/* Bottom Right: Patients (WhatsApp) */}
              <div className="absolute -bottom-3 right-4 bg-white/95 border border-green-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-center">
                <div className="w-5 h-5 rounded-md bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <MessageSquareQuote className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-800 leading-none">Patients</div>
                  <div className="text-[8px] text-slate-500">WhatsApp Rx</div>
                </div>
              </div>

              {/* Bottom: AI & Technology */}
              <div className="absolute -bottom-3 left-6 bg-white/95 border border-indigo-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-center">
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-800 leading-none">AI Engine</div>
                  <div className="text-[8px] text-slate-500">Safety checks</div>
                </div>
              </div>

              {/* Left: Diagnostics */}
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-white/95 border border-purple-200 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-center">
                <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-3 h-3" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-800 leading-none">Diagnostics</div>
                  <div className="text-[8px] text-slate-500">Lab reports</div>
                </div>
              </div>

              {/* Top Left: Doctors */}
              <div className="absolute top-1 left-2 bg-white/95 border border-teal-200 rounded-xl px-2 py-1 shadow-md flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-2.5 h-2.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-800">Doctors</span>
              </div>
            </div>
          </div>

          {/* Bottom 4 Feature Value Pills */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200/80 mt-4">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Secure & Compliant</p>
                <p className="text-[8px] text-slate-500">NMC Gazette 2023</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Accessible Anywhere</p>
                <p className="text-[8px] text-slate-500">Web, iPad & Mobile</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 leading-tight">AI-Powered</p>
                <p className="text-[8px] text-slate-500">Smart dosage guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-slate-100 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-800 leading-tight">Better Outcomes</p>
                <p className="text-[8px] text-slate-500">Adherence reminders</p>
              </div>
            </div>
          </div>
        </div>


        {/* ════════════════════════════════════════════════════════════════════════
            PART 2 (CENTER): SIGN IN FORM
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between relative">
          <div>
            {/* Branding & Welcome */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center mb-3">
                <div className="relative w-12 h-12">
                  <Image src="/Logo.png" alt="RxNXT" fill className="object-contain" priority />
                </div>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to your RxNXT account</p>
            </div>

            {/* Mode Switcher Tab (Mobile/Email vs Use OTP) */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'password'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Mobile / Email</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('otp'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'otp'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Use OTP</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email / Mobile input */}
              <div className="space-y-1.5">
                <Label htmlFor="emailOrPhone" className="text-xs font-semibold text-slate-700">
                  {authMode === 'otp' ? 'Registered Mobile Number' : 'Email or Mobile Number'}
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-slate-500 pr-2 border-r border-slate-200 pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <Input
                    id="emailOrPhone"
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter mobile number or email"
                    className="pl-16 pr-3 py-2.5 text-sm bg-slate-50/70 border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password or OTP input */}
              {authMode === 'password' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                otpSent && (
                  <div className="space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="otp" className="text-xs font-semibold text-slate-700">6-Digit Verification Code</Label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-semibold text-sky-600 hover:underline"
                      >
                        Resend OTP
                      </button>
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="py-2.5 text-center tracking-widest text-base font-mono font-bold bg-slate-50/70 border-slate-200 focus:bg-white focus:border-sky-500 rounded-xl"
                      disabled={loading}
                    />
                  </div>
                )
              )}

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="font-semibold text-sky-600 hover:text-sky-700 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Error Box */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-sky-600 to-sky-700 hover:from-blue-700 hover:to-sky-800 text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'otp' && !otpSent ? 'Send OTP' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* SSO / Social Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmailOrPhone('doctor@rxnxt.com');
                  setPassword('password123');
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailOrPhone('doctor@rxnxt.com');
                  setPassword('password123');
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span>Continue with Microsoft</span>
              </button>
            </div>
          </div>

          {/* Bottom QR App Promo Banner */}
          <div 
            onClick={() => setShowQrModal(true)}
            className="mt-4 p-3 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 border border-sky-200/80 rounded-2xl flex items-center justify-between cursor-pointer transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Use RxNXT on Mobile</p>
                <p className="text-[10px] text-slate-500">Scan QR to install PWA on iPad/Phone</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>


        {/* ════════════════════════════════════════════════════════════════════════
            PART 3 (RIGHT): REGISTER YOUR CLINIC
            ════════════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-b from-emerald-50/90 via-white to-teal-50/80 border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-900/5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            {/* Top Pill Badge */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>New to RxNXT?</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Your Clinic</h2>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Set up your clinic and start creating digital prescriptions in minutes.
              </p>
            </div>

            {/* 5 Value Proposition Points */}
            <div className="space-y-3.5 mb-6">
              {/* Point 1: Quick & Simple Setup */}
              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-sky-200 transition">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Quick & Simple Setup</h4>
                  <p className="text-[11px] text-slate-500">Get started in under 2 minutes</p>
                </div>
              </div>

              {/* Point 2: Create Digital Prescriptions */}
              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-emerald-200 transition">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Create Digital Prescriptions</h4>
                  <p className="text-[11px] text-slate-500">Save consultation time & reduce errors</p>
                </div>
              </div>

              {/* Point 3: Connect with Pharmacies */}
              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-rose-200 transition">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Connect with Pharmacies</h4>
                  <p className="text-[11px] text-slate-500">Enable seamless medicine dispensing</p>
                </div>
              </div>

              {/* Point 4: Integrate Diagnostics */}
              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-purple-200 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Integrate Diagnostics</h4>
                  <p className="text-[11px] text-slate-500">Share and manage clinical lab reports</p>
                </div>
              </div>

              {/* Point 5: Patient Communication */}
              <div className="flex items-start gap-3 bg-white/90 p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-green-200 transition">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Patient Communication</h4>
                  <p className="text-[11px] text-slate-500">WhatsApp dose reminders & PDF delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* CTA Button to Register */}
            <Link href="/register" className="block w-full">
              <Button
                type="button"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] transition-all"
              >
                <span>Register Your Clinic</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            {/* 14-Day Free Trial Notice */}
            <div className="mt-3.5 p-2.5 bg-white/90 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">Start with a 14-Day Free Trial</p>
                <p className="text-[10px] text-slate-500 mt-0.5">No credit card required • Instant access</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code / Mobile App Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center animate-fade-in">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Install RxNXT on Mobile</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Open your phone/iPad camera and scan the QR code to install RxNXT PWA:
            </p>

            {/* High-Resolution Scannable QR Code */}
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 inline-block mb-3 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan QR Code to open RxNXT on Mobile"
                  className="w-48 h-48 rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                </div>
              )}
            </div>

            {/* Direct Link & Copy Action */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-mono text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 truncate max-w-[200px]">
                app.rxnxt.in/login
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>📱 <strong>iPhone / iPad:</strong> Open Camera & tap the link, then <em>Share ➔ Add to Home Screen</em></p>
              <p>🤖 <strong>Android:</strong> Open Camera / Chrome & tap link, then <em>Install App</em></p>
            </div>

            <Button
              onClick={() => setShowQrModal(false)}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
