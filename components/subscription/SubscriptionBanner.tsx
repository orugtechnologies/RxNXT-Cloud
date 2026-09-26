'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionData {
  allowed: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  plan: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isTrial: boolean;
  subscriptionEndsAt: string | null;
  trialEndsAt: string | null;
}

export default function SubscriptionBanner() {
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSub(data.subscription);
        }
      }
    } catch (e) {
      console.error('Failed to load subscription status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading || !sub) return null;

  // Case 1: EXPIRED
  if (sub.isExpired) {
    return (
      <div className="bg-rose-600 text-white px-4 py-3 rounded-xl mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse border border-rose-500">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-700/80 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {sub.isTrial ? '14-Day Free Trial Expired' : 'Subscription Expired'}
            </p>
            <p className="text-xs text-rose-100">
              Clinical actions (prescriptions, patient queue) are currently paused. Renew your subscription to restore full access.
            </p>
          </div>
        </div>
        <Link href="/admin/subscription">
          <Button size="sm" className="bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-sm">
            Renew Subscription Now
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Case 2: EXPIRING SOON (<= 7 days remaining)
  if (sub.isExpiringSoon) {
    return (
      <div className="bg-amber-500 text-white px-4 py-3 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-400">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-600/70 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-2">
              <span>{sub.isTrial ? 'Free Trial Expiring Soon' : 'Subscription Renewal Due'}</span>
              <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-mono">
                {sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'} remaining
              </span>
            </p>
            <p className="text-xs text-amber-100">
              Renew today to ensure continuous prescription generation and uninterrupted patient WhatsApp reminders.
            </p>
          </div>
        </div>
        <Link href="/admin/subscription">
          <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs shadow-sm">
            Upgrade / Renew Plan
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // Case 3: ACTIVE TRIAL (> 7 days remaining)
  if (sub.isTrial) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <p className="font-medium text-xs sm:text-sm flex items-center gap-2">
              <span>14-Day Free Trial Active</span>
              <span className="bg-white/20 text-blue-50 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono">
                {sub.daysRemaining} days left
              </span>
            </p>
          </div>
        </div>
        <Link href="/admin/subscription">
          <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white text-xs h-8">
            View Plans & Pricing
          </Button>
        </Link>
      </div>
    );
  }

  // Active paid subscription with > 7 days remaining: no intrusive banner needed
  return null;
}
