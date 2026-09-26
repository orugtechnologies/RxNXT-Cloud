'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockoutModalProps {
  isOpen: boolean;
  clinicName?: string;
  isTrial?: boolean;
  onRenewSuccess?: () => void;
}

export default function SubscriptionLockoutModal({
  isOpen,
  clinicName,
  isTrial = true,
  onRenewSuccess,
}: LockoutModalProps) {
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
          plan: 'PRO_ANNUAL',
          billingCycle: 'ANNUAL',
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-scale-in">
        <div className="h-16 w-16 bg-rose-100 border border-rose-200 rounded-full flex items-center justify-center mx-auto text-rose-600 shadow-inner">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            {isTrial ? '14-Day Free Trial Ended' : 'Subscription Expired'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your access for <strong>{clinicName || 'your clinic'}</strong> has expired. To continue generating prescriptions, adding OPD patients, and sending automated WhatsApp reminders, please activate your subscription.
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Clinic Pro Annual (Recommended)
          </p>
          <p className="text-slate-500">
            Unlimited digital prescriptions, 3-window smart WhatsApp dose reminders, and front-desk patient queue.
          </p>
          <div className="pt-1 flex items-baseline gap-1 text-slate-900 font-bold text-base">
            ₹14,999 <span className="text-xs font-normal text-slate-500">/year (₹1,249/mo • Save 20%)</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={handleInstantRenew}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 shadow-md text-sm"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldAlert className="h-4 w-4 mr-2" />}
            Unlock Now & Continue OPD
          </Button>

          <Link href="/admin/subscription" className="w-full">
            <Button variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 text-xs py-4">
              Explore All Pricing Plans
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400">
          All your historical patient data, past prescriptions, and custom protocols remain completely preserved.
        </p>
      </div>
    </div>
  );
}
