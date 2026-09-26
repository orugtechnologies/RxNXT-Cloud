'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Calendar, 
  Check, 
  CreditCard, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  CheckCircle2,
  Building2,
  Lock,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionDetails {
  allowed: boolean;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  plan: string;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isTrial: boolean;
  subscriptionEndsAt: string | null;
  trialEndsAt: string | null;
  subscriptionStartedAt: string | null;
  clinicName: string;
}

export default function SubscriptionBillingPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [selectedPlan, setSelectedPlan] = useState<string>('PRO_ANNUAL');
  const [renewing, setRenewing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscription/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSub(data.subscription);
          if (data.subscription.plan === 'STARTER_MONTHLY') {
            setSelectedPlan('STARTER_MONTHLY');
            setBillingCycle('MONTHLY');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleRenew = async (planKey: string) => {
    try {
      setRenewing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Successfully activated ${planKey === 'PRO_ANNUAL' ? 'Clinic Pro Annual' : 'Starter Monthly'}! Your clinical workspace is fully active.`);
        await fetchSubscription();
      } else {
        setErrorMsg(data.error || 'Failed to renew subscription');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while renewing subscription');
    } finally {
      setRenewing(false);
    }
  };

  const plans = [
    {
      id: 'STARTER_MONTHLY',
      name: 'Starter Monthly',
      tagline: 'Ideal for solo practitioners & single-room OPD clinics',
      monthlyPrice: 1499,
      annualPrice: 14990,
      badge: 'Flexible',
      features: [
        'Unlimited Digital Prescriptions',
        'Fuzzy Medicine Search with +100 Alias Scoring',
        '1-Click Dosage, Frequency & Duration Chips',
        'OPD Front-Desk Token Queue & Receptionist View',
        'Meta WhatsApp Prescription PDF Delivery',
        '3-Window Smart Slot Medicine Reminders (8 AM, 1:30 PM, 8:30 PM)',
      ],
    },
    {
      id: 'PRO_ANNUAL',
      name: 'Clinic Pro Annual',
      tagline: 'Best for growing clinics and multi-doctor practices',
      monthlyPrice: 1249,
      annualPrice: 14999,
      badge: 'Most Popular • Save 20%',
      popular: true,
      features: [
        'Everything in Starter',
        'Multi-Doctor & Support Staff Accounts (Receptionist / Nurse)',
        'Custom Treatment Group Prescription Protocols',
        'Day 25 Monthly Chronic Care WhatsApp Refill Engine',
        'Doctor & Clinic OPD Volume Analytics',
        'NMC 2023 Digital Signature & Verified Rx Format',
        'Priority Meta WhatsApp SLA & Zero Cold Starts',
      ],
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Multi-Branch',
      tagline: 'For hospital networks and multi-location medical centers',
      monthlyPrice: 4999,
      annualPrice: 49999,
      badge: 'Hospital Grade',
      features: [
        'Everything in Clinic Pro',
        'Unlimited Clinics & Branch Locations',
        'Custom Hospital EHR / HMIS Integration',
        'Dedicated Pharmacist QR Counter Terminals',
        'Custom WhatsApp Template Branding & WABA Setup',
        'Dedicated 24/7 Priority Support & Clinical Training',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-blue-600" />
          Subscription & License Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your clinic's 14-day free trial, active licensing plan, and automated OPD continuity.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Current Plan Overview Card */}
      {sub && (
        <Card className={`border shadow-sm overflow-hidden ${
          sub.isExpired 
            ? 'border-rose-300 bg-rose-50/40' 
            : sub.isExpiringSoon 
            ? 'border-amber-300 bg-amber-50/30' 
            : 'border-blue-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30'
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Current Clinic Workspace
                  </span>
                  <Badge className={
                    sub.status === 'ACTIVE' 
                      ? 'bg-emerald-500 text-white' 
                      : sub.status === 'TRIAL' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-rose-600 text-white'
                  }>
                    {sub.status === 'TRIAL' ? '14-Day Free Trial' : sub.status}
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {sub.clinicName}
                </h2>

                <p className="text-sm text-slate-600 flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <strong>{sub.daysRemaining} {sub.daysRemaining === 1 ? 'day' : 'days'}</strong> remaining
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Expires on: <strong>{sub.subscriptionEndsAt ? new Date(sub.subscriptionEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</strong>
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {sub.isExpired ? (
                  <Button 
                    onClick={() => handleRenew(selectedPlan)} 
                    disabled={renewing}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-5 shadow-md"
                  >
                    {renewing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Renew & Unlock Now
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleRenew(selectedPlan)} 
                    disabled={renewing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-5 shadow-sm"
                  >
                    {renewing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Renew / Extend License
                  </Button>
                )}
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="mt-6 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>14-Day Full Access Trial:</strong> All features are unlocked during the initial trial period.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>7-Day Prior Alert:</strong> WhatsApp reminders are sent 1 week before expiry to ensure zero OPD disruption.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Continuous Continuity:</strong> Renewals seamlessly extend your validity from the current expiry date.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Cycle Selector */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-4">
        <h3 className="text-xl font-bold text-slate-900 text-center">
          Choose a Plan for Your Clinic
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-md">
          Transparent pricing designed for modern Indian outpatient practices. Cancel or change anytime.
        </p>

        <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              billingCycle === 'MONTHLY' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              billingCycle === 'ANNUAL' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const displayPrice = billingCycle === 'ANNUAL' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <Card 
              key={plan.id}
              className={`relative border transition-all duration-200 flex flex-col justify-between ${
                plan.popular 
                  ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20 bg-white' 
                  : 'border-slate-200 hover:border-slate-300 bg-white shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                    plan.popular ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <CardContent className="p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        /{billingCycle === 'ANNUAL' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'ANNUAL' && (
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        Equivalent to ₹{Math.round(plan.annualPrice / 12).toLocaleString('en-IN')}/month
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-4">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Included in this plan:
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      handleRenew(plan.id);
                    }}
                    disabled={renewing}
                    className={`w-full py-5 font-semibold text-xs transition-all ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {renewing && selectedPlan === plan.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {sub?.plan === plan.id && sub.status === 'ACTIVE'
                      ? 'Renew Current Plan'
                      : `Activate ${plan.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <Card className="border border-slate-200 bg-slate-50/50">
        <CardContent className="p-6 md:p-8 space-y-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Frequently Asked Questions
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs text-slate-600">
            <div>
              <p className="font-semibold text-slate-800">How does the 14-day free trial work?</p>
              <p className="mt-1 leading-relaxed">
                When you register your clinic, you receive 14 days of unrestricted access to the entire RxNXT platform, including WhatsApp delivery and smart dose reminders. No credit card required to start.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">When will I be notified about renewal?</p>
              <p className="mt-1 leading-relaxed">
                RxNXT automatically sends an official WhatsApp alert directly to your registered phone 7 days prior to expiry, giving you ample time to renew without risking outpatient disruptions.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">What happens if my subscription lapses?</p>
              <p className="mt-1 leading-relaxed">
                If not renewed by the expiry date, creation of new prescriptions and patient queueing will be paused. Your historical patient records, encounters, and treatment templates remain 100% safe and accessible.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Do renewals add to my existing validity?</p>
              <p className="mt-1 leading-relaxed">
                Yes! If you renew before your current plan expires, the new 30 days or 365 days are added to your existing expiration date so you never lose a single day.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
