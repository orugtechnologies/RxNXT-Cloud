'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Stethoscope, 
  Building2, 
  Package, 
  RefreshCw,
  BellRing,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FEATURE_METADATA, FeatureKey } from '@/lib/feature-flags';

interface FeatureUpsellModalProps {
  isOpen: boolean;
  featureKey: FeatureKey;
  onClose: () => void;
  onUpgradeSuccess?: () => void;
}

export default function FeatureUpsellModal({
  isOpen,
  featureKey,
  onClose,
  onUpgradeSuccess,
}: FeatureUpsellModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const metadata = FEATURE_METADATA[featureKey] || {
    key: featureKey,
    name: 'Advanced Clinical Feature',
    description: 'Upgrade your subscription tier to access this capability.',
    requiredTier: 'SPECIALIST',
    benefits: ['Enhanced clinic workflows', 'Automated intelligence', 'Higher OPD efficiency'],
  };

  const isPolyclinic = metadata.requiredTier === 'POLYCLINIC_HUB';
  const targetPlanName = isPolyclinic ? 'Polyclinic Hub' : 'Specialist';
  const targetPlanPrice = isPolyclinic ? '₹3,999' : '₹1,999';

  const handle1ClickUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: isPolyclinic ? 'ENTERPRISE' : 'PRO_ANNUAL',
          tier: metadata.requiredTier,
          billingCycle: 'MONTHLY',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpgradeSuccess) onUpgradeSuccess();
        window.location.reload();
      } else {
        setError(data.error || 'Failed to activate plan');
      }
    } catch (err: any) {
      setError(err.message || 'Error activating upgrade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-scale-in text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Feature Icon Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
            {featureKey === 'PHARMACY_INVENTORY' ? (
              <Package className="h-6 w-6" />
            ) : featureKey === 'MORNING_ADHERENCE' ? (
              <BellRing className="h-6 w-6" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{metadata.name}</h3>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                {targetPlanName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Available in the {targetPlanName} Tier ({targetPlanPrice}/month)
            </p>
          </div>
        </div>

        {/* Value Proposition Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
          {metadata.description}
        </p>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200 mb-3">
            {error}
          </p>
        )}

        {/* Key Feature Benefits */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 space-y-2">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Included in this Tier:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {metadata.benefits.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Actions */}
        <div className="space-y-2.5">
          <Button
            onClick={handle1ClickUpgrade}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 shadow-md text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Upgrade to {targetPlanName} ({targetPlanPrice}/mo)
          </Button>

          <Link href="/admin/subscription" className="block w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full text-slate-700 border-slate-300 hover:bg-slate-50 text-xs py-4"
            >
              Compare All Commercial Tiers
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          Proration applied automatically. You can switch or cancel plans at any time.
        </p>
      </div>
    </div>
  );
}
