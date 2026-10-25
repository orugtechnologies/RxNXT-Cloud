'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  History,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WALLET_RECHARGE_PACKAGES } from '@/lib/wallet';

interface WalletCardProps {
  onRechargeSuccess?: () => void;
}

export default function WhatsAppWalletCard({ onRechargeSuccess }: WalletCardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rechargingPackId, setRechargingPackId] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string>('PACK_2000');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wallet/recharge');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBalance(data.balance);
        }
      }
    } catch (e) {
      console.error('Failed to load wallet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handle1ClickRecharge = async (packId: string) => {
    try {
      setRechargingPackId(packId);
      setError(null);
      setSuccessMessage(null);

      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: packId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBalance(data.newBalance);
        setSuccessMessage(data.message);
        if (onRechargeSuccess) onRechargeSuccess();
      } else {
        setError(data.error || 'Failed to recharge wallet');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing recharge');
    } finally {
      setRechargingPackId(null);
    }
  };

  const isLowBalance = balance !== null && balance < 100;
  const isZeroBalance = balance !== null && balance <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
      {/* Low Balance Warning Banner */}
      {isLowBalance && (
        <div className={`px-4 py-2.5 text-white flex items-center justify-between text-xs font-semibold ${
          isZeroBalance ? 'bg-rose-600' : 'bg-amber-500'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              {isZeroBalance
                ? 'Wallet balance is 0 credits. Automated adherence dose reminders are currently paused.'
                : `Low Balance Alert: Only ${balance} WhatsApp credits remaining.`}
            </span>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
            Auto-skipped if 0
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Prepaid WhatsApp Adherence Wallet</h3>
              <p className="text-xs text-slate-500">
                1 Credit = 1 Morning Dose Briefing or Day-25 Refill Alert (Prescription delivery is free)
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 flex items-baseline justify-end gap-1.5 font-mono">
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <>
                  <span className={isLowBalance ? 'text-rose-600' : 'text-emerald-600'}>
                    {(balance ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Credits</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Strictly non-negative audit ledger</p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {successMessage}
          </p>
        )}

        {/* Recharge Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(WALLET_RECHARGE_PACKAGES).map((pack) => {
            const isSelected = selectedPackId === pack.id;
            return (
              <div
                key={pack.id}
                onClick={() => setSelectedPackId(pack.id)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                {pack.id === 'PACK_5000' && (
                  <span className="absolute -top-2.5 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Best Value
                  </span>
                )}
                <p className="text-xs font-bold text-slate-900">{pack.name}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900">₹{pack.price.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (₹{pack.perCredit.toFixed(2)}/credit)
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  +{pack.credits.toLocaleString()} Credits
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Instant webhook ledger sync via Razorpay / Cashfree</span>
          </div>

          <Button
            onClick={() => handle1ClickRecharge(selectedPackId)}
            disabled={rechargingPackId !== null}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 shadow-sm flex items-center gap-2"
          >
            {rechargingPackId !== null ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Recharge {WALLET_RECHARGE_PACKAGES[selectedPackId]?.credits.toLocaleString()} Credits (₹{WALLET_RECHARGE_PACKAGES[selectedPackId]?.price})
          </Button>
        </div>
      </div>
    </div>
  );
}
