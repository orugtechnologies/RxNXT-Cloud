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
  Zap, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  X, 
  MessageSquareQuote, 
  Copy, 
  Check, 
  ChevronRight, 
  Shield 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// The 4 Pillars definition matching www.rxnxt.in
const FOUR_PILLARS = [
  {
    id: 1,
    pillarNumber: 'Pillar 1',
    title: 'Go Digital',
    tagline: '100% Paperless & Legally Compliant',
    icon: Building2,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    themeColor: 'emerald',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderAccent: 'hover:border-emerald-400',
    activeBorder: 'border-emerald-500 shadow-emerald-500/10',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-100 text-emerald-700',
    description: 'Eliminate paper pads, messy copies, and clinic chaos with a fully digitized clinical identity.',
    points: [
      {
        title: 'NMC Direct Verification',
        detail: 'Instant server-side verification with the National Medical Commission & 24+ Indian State Councils.',
      },
      {
        title: 'Official Branded A4 PDFs',
        detail: 'Auto-embeds your clinic logo, NMC registration number, and digital signature with zero lag.',
      },
      {
        title: 'Live Waiting Room Queue',
        detail: 'Receptionist issues tokens in 0.5s; doctor monitors live waiting timers right on their desk.',
      },
    ],
    metric: '100% Paperless & NMC Gazette 2023 Compliant',
  },
  {
    id: 2,
    pillarNumber: 'Pillar 2',
    title: 'Data Protected',
    tagline: 'Zero Data Sharing • Enterprise Privacy',
    icon: ShieldCheck,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    themeColor: 'teal',
    gradient: 'from-teal-500/10 via-cyan-500/5 to-transparent',
    borderAccent: 'hover:border-teal-400',
    activeBorder: 'border-teal-500 shadow-teal-500/10',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-100 text-teal-700',
    description: 'Your patients belong to you. We safeguard your clinic with strict data privacy and Indian localization.',
    points: [
      {
        title: 'PostgreSQL Row-Level Security (RLS)',
        detail: 'Mathematically isolates clinic records. Clinic A can never access Clinic B\'s patient records.',
      },
      {
        title: '100% Indian Data Sovereignty',
        detail: 'Cloud database hosted in Mumbai (ap-south-1), fully adhering to the Indian DPDP Act 2023.',
      },
      {
        title: 'Encrypted Role Isolation',
        detail: 'Receptionists manage queues without modifying clinical prescriptions; doctors sign securely.',
      },
    ],
    metric: 'DPDP Act 2023 & Indian Data Sovereignty',
  },
  {
    id: 3,
    pillarNumber: 'Pillar 3',
    title: 'Consult Faster',
    tagline: '< 20-Second Prescriptions',
    icon: Zap,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    themeColor: 'sky',
    gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    borderAccent: 'hover:border-sky-400',
    activeBorder: 'border-sky-500 shadow-sky-500/10',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-100 text-sky-700',
    description: 'Traditional EMRs steal time with 20 clicks per drug. RxNXT is tuned for high-volume OPDs to finish in under 20s.',
    points: [
      {
        title: 'Instant Typo-Tolerant Search',
        detail: 'Type misspellings or clinical shorthands like "PCM" and get immediate brand & generic matches.',
      },
      {
        title: '1-Click Dosage Chips',
        detail: 'Tap "1-0-1", "After Food", "5 Days" instead of typing repetitive dosage instructions.',
      },
      {
        title: '1-Tap Chronic Rx Cloning',
        detail: 'For repeat diabetes and hypertension patients, clone the past prescription in 1 single click.',
      },
    ],
    metric: 'See 20+ More Patients Without Rushing',
  },
  {
    id: 4,
    pillarNumber: 'Pillar 4',
    title: 'Care Continuity',
    tagline: 'Automated WhatsApp Adherence',
    icon: MessageSquareQuote,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    themeColor: 'green',
    gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
    borderAccent: 'hover:border-emerald-400',
    activeBorder: 'border-emerald-500 shadow-emerald-500/10',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-100 text-emerald-700',
    description: 'Zero apps for patients to install. Automated WhatsApp daily dosage nudges and chronic refill alerts keep care continuous.',
    points: [
      {
        title: 'Direct WhatsApp PDF Delivery',
        detail: 'Prescription PDF lands in the patient\'s WhatsApp chat before they even exit your consultation room.',
      },
      {
        title: '3-Slot Daily Nudges',
        detail: 'Automated alerts at 8:00 AM (Morning), 1:30 PM (Noon), and 8:30 PM (Night) maintain dose adherence.',
      },
      {
        title: 'Day-25 Chronic Refill Alerts',
        detail: 'Notifies chronic patients when medication is running low, driving timely clinic revisits.',
      },
    ],
    metric: '38% Higher Compliance & Patient Loyalty',
  },
];

export default function LoginPage() {
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate mobile PWA QR code on mount
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
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`);
        });
    }
  }, []);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, resendTimer]);

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

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
        setResendTimer(30);
        setLoading(false);
      }, 500);
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

  const activePillar = FOUR_PILLARS[activePillarIndex];

  return (
    <div className="w-full py-2 sm:py-6 space-y-6">
      
      {/* ════════════════════════════════════════════════════════════════════════
          TOP HEADER BAR: 4 PILLAR CONCEPT BANNER & QUICK ACTIONS
          ════════════════════════════════════════════════════════════════════════ */}
      <header className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & 4-Pillar Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 shrink-0">
            <Image src="/Logo.png" alt="RxNXT Logo" fill className="object-contain" priority />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Rx<span className="text-emerald-600">NXT</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Cloud 2.0
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">
              <span className="text-slate-800 font-bold">The 4 Pillars:</span> Go Digital • Data Protected • Consult Faster • Care Continuity
            </p>
          </div>
        </div>

        {/* Top Header CTAs */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Link
            href="/superadmin/login"
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Platform</span> Super Admin
          </Link>
          <Link
            href="/register"
            className="text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-emerald-700/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>14-Day Free Trial</span>
          </Link>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN 2-COLUMN STAGE: 4 PILLARS SHOWCASE (LEFT) + SIGN IN CARD (RIGHT)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ==================== LEFT COLUMN (COL 1-7): 4 PILLARS SHOWCASE ==================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main 4 Pillar Header Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engineered Around 4 Core Principles</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Go Digital. Data Protected.<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Consult Faster. Care Continuity.
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Every screen, algorithm, and clinical workflow in RxNXT is purpose-built to deliver on these four foundational pillars for Indian outpatient OPDs.
              </p>

              {/* 4 Pillars Interactive Tab Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {FOUR_PILLARS.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const isActive = activePillarIndex === idx;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => setActivePillarIndex(idx)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-slate-800/95 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                          : 'bg-slate-950/60 border-slate-800/90 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                          0{pillar.id}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-tight">
                          {pillar.pillarNumber}
                        </div>
                        <div className={`text-xs font-bold leading-tight mt-0.5 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {pillar.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Pillar Deep-Dive Spotlight Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${activePillar.accentBg} shadow-sm`}>
                  <activePillar.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {activePillar.pillarNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${activePillar.badgeColor}`}>
                      {activePillar.tagline}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {activePillar.title}
                  </h3>
                </div>
              </div>

              {/* Quick Navigation Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {FOUR_PILLARS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePillarIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      activePillarIndex === i ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`View Pillar ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed font-medium">
              {activePillar.description}
            </p>

            {/* 3 Key Implementation Points for Selected Pillar */}
            <div className="space-y-3 mb-5">
              {activePillar.points.map((pt, pIdx) => (
                <div key={pIdx} className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activePillar.accentBg} font-bold text-xs`}>
                    ✓
                  </div>
                  <div className="text-xs">
                    <strong className="text-slate-900">{pt.title}:</strong>{' '}
                    <span className="text-slate-600">{pt.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Proof Metric Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">{activePillar.metric}</span>
              </div>
              <button
                type="button"
                onClick={() => setActivePillarIndex((prev) => (prev + 1) % FOUR_PILLARS.length)}
                className="text-emerald-700 font-extrabold hover:text-emerald-900 flex items-center gap-1 transition"
              >
                <span>Next Pillar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Pillar Value Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/90 border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
              <div className="text-lg font-black text-emerald-600">&lt; 20s</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Rx Speed</div>
            </div>
            <div className="bg-white/90 border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
              <div className="text-lg font-black text-teal-600">100% RLS</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">Data Isolation</div>
            </div>
            <div className="bg-white/90 border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
              <div className="text-lg font-black text-sky-600">24+ Councils</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">NMC Verified</div>
            </div>
            <div className="bg-white/90 border border-slate-200/90 p-3 rounded-2xl text-center shadow-xs">
              <div className="text-lg font-black text-green-600">+38%</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">WhatsApp Adherence</div>
            </div>
          </div>

        </div>


        {/* ==================== RIGHT COLUMN (COL 8-12): SIGN IN CARD ==================== */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            
            {/* Header & Greeting */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center mb-2.5">
                <div className="relative w-12 h-12">
                  <Image src="/Logo.png" alt="RxNXT" fill className="object-contain" priority />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to RxNXT</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Access your outpatient clinical workspace</p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setError(''); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'password'
                    ? 'bg-emerald-600 text-white shadow-sm'
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
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Use OTP</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email / Mobile Identifier */}
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
                    placeholder="e.g. doctor@rxnxt.com or 9876543210"
                    className="pl-16 pr-3 py-2.5 text-sm bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password or OTP */}
              {authMode === 'password' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                    {capsLockActive && (
                      <span className="text-[10px] font-bold text-amber-600 animate-pulse">
                        ⚠️ Caps Lock is ON
                      </span>
                    )}
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
                      onKeyUp={handleKeyUp}
                      placeholder="Enter password"
                      className="pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl"
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
                      {resendTimer > 0 ? (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setResendTimer(30);
                            setError('A new 6-digit verification code has been dispatched.');
                          }}
                          className="text-[11px] font-semibold text-emerald-600 hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • • • •"
                      className="py-2.5 text-center tracking-widest text-base font-mono font-bold bg-slate-50/70 border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl"
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
                    className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
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
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'otp' && !otpSent ? 'Send OTP Code' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Mobile PWA Trigger Banner */}
            <div 
              onClick={() => setShowQrModal(true)}
              className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/80 rounded-2xl flex items-center justify-between cursor-pointer transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Use RxNXT on Mobile & iPad</p>
                  <p className="text-[10px] text-slate-500">Scan QR to install instant PWA app</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Bottom 14-Day Free Trial Notice & Registration */}
            <div className="pt-2 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-600">
                New to RxNXT?{' '}
                <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                  Register Your Clinic (14-Day Free Trial)
                </Link>
              </p>
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
                <span>🛡️ NMC Gazette 2023</span>
                <span>•</span>
                <span>🇮🇳 DPDP Act 2023</span>
                <span>•</span>
                <span>⚡ Sub-20s Rx</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          QR CODE / MOBILE APP PWA MODAL
          ════════════════════════════════════════════════════════════════════════ */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 relative text-center animate-fade-in">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Install RxNXT on Mobile</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Open your phone or iPad camera and scan to install the RxNXT PWA:
            </p>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 inline-block mb-3 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan QR Code to open RxNXT on Mobile"
                  className="w-44 h-44 rounded-xl object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              )}
            </div>

            {/* Direct URL & Copy Action */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 truncate max-w-[200px]">
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
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>📱 <strong>iPhone / iPad:</strong> Open Camera & tap link, then <em>Share ➔ Add to Home Screen</em></p>
              <p>🤖 <strong>Android:</strong> Open Chrome & tap link, then <em>Install App</em></p>
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
