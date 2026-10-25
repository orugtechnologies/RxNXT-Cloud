'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, RefreshCw, CheckCircle2, Lock, Sparkles, Building2, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockoutModalProps {
  isOpen: boolean;
  clinicName?: string;
  isTrial?: boolean;
  isUsageLocked?: boolean;
  prescriptionsCount?: number;
  trialPrescriptionCap?: number;
  onRenewSuccess?: () => void;
  onClose?: () => void;
}

export default function SubscriptionLockoutModal({
  isOpen,
  clinicName,
  isTrial = true,
  isUsageLocked = false,
  prescriptionsCount = 150,
  trialPrescriptionCap = 150,
  onRenewSuccess,
  onClose,
}: LockoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<'SOLO_GP' | 'SPECIALIST' | 'POLYCLINIC_HUB'>('SPECIALIST');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstantRenew = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedTier === 'SOLO_GP' ? 'STARTER_MONTHLY' : (selectedTier === 'SPECIALIST' ? 'PRO_ANNUAL' : 'ENTERPRISE'),
          tier: selectedTier,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onRenewSuccess) onRenewSuccess();
        window.location.reload();
      } else {
        setError(data.error || 'Failed to activate plan');
      }
    } catch (err: any) {
      setError(err.message || 'Error renewing subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-scale-in my-8">
        <div className="h-16 w-16 bg-rose-100 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-inner">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isUsageLocked
              ? `Free Trial Limit Reached (${prescriptionsCount} Prescriptions)`
              : (isTrial ? 'Free Trial Ended' : 'Subscription Expired')}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {isUsageLocked
              ? `You have reached your 150 free prescription trial limit. Your RxNXT intelligence engine has learned your clinical patterns. Select a tier to keep your workspace active.`
              : `Your access for ${clinicName || 'your clinic'} has expired. Select a subscription tier to continue uninterrupted.`}
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        {/* Tier Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {/* Solo GP */}
          <div
            onClick={() => setSelectedTier('SOLO_GP')}
            className={`cursor-pointer rounded-xl p-3 border transition-all ${
              selectedTier === 'SOLO_GP'
                ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Solo GP</span>
              <User className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-500 mb-2">Core OPD + Token Queue</p>
            <div className="font-bold text-sm text-slate-900">
              ₹999 <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </div>
          </div>

          {/* Specialist */}
          <div
            onClick={() => setSelectedTier('SPECIALIST')}
            className={`cursor-pointer rounded-xl p-3 border transition-all relative ${
              selectedTier === 'SPECIALIST'
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <span className="absolute -top-2.5 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </span>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Specialist</span>
              <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mb-2">Morning WhatsApp + Refills</p>
            <div className="font-bold text-sm text-emerald-700">
              ₹1,999 <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </div>
          </div>

          {/* Polyclinic Hub */}
          <div
            onClick={() => setSelectedTier('POLYCLINIC_HUB')}
            className={`cursor-pointer rounded-xl p-3 border transition-all ${
              selectedTier === 'POLYCLINIC_HUB'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Polyclinic</span>
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <p className="text-[11px] text-slate-500 mb-2">Pharmacy + 3 Doctor Seats</p>
            <div className="font-bold text-sm text-slate-900">
              ₹3,999 <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </div>
          </div>
        </div>

        {/* Selected Tier Feature Highlight */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {selectedTier === 'SOLO_GP' && 'Solo GP: Unlimited Prescriptions, Token Queue & Instant WhatsApp PDF'}
            {selectedTier === 'SPECIALIST' && 'Specialist: Core + Daily 8:00 AM WhatsApp Morning Briefing & Day 25 Refills'}
            {selectedTier === 'POLYCLINIC_HUB' && 'Polyclinic Hub: Pharmacy Inventory, Multi-Doctor Admin & Dispensing Queue'}
          </p>
          <p className="text-slate-500 text-[11px]">
            Includes full historical preservation of all patient records, custom templates, and habitual drug scoring.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <Button
            onClick={handleInstantRenew}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 shadow-md text-sm"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
            Activate {selectedTier === 'SOLO_GP' ? 'Solo GP' : (selectedTier === 'SPECIALIST' ? 'Specialist' : 'Polyclinic Hub')} & Unlock OPD
          </Button>

          <Link href="/admin/subscription" className="w-full">
            <Button variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 text-xs py-4">
              Explore All Billing & Payment Details
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400">
          Instant activation via Razorpay/Cashfree. Cancel or change your plan at any time.
        </p>
      </div>
    </div>
  );
}
