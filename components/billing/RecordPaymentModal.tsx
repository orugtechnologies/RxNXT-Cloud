'use client';

import React, { useState } from 'react';
import { X, Banknote, Smartphone, CreditCard, Hash, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMode?: string | null;
  paymentRef?: string | null;
  patient: { name: string };
}

interface RecordPaymentModalProps {
  bill: Bill;
  onClose: () => void;
  onSuccess: (updatedBill: any) => void;
}

const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash', icon: Banknote, color: 'emerald' },
  { id: 'UPI', label: 'UPI', icon: Smartphone, color: 'blue' },
  { id: 'CARD', label: 'Card', icon: CreditCard, color: 'indigo' },
] as const;

type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export default function RecordPaymentModal({ bill, onClose, onSuccess }: RecordPaymentModalProps) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>((bill.paymentMode as PaymentMode) || 'CASH');
  const [paymentRef, setPaymentRef] = useState(bill.paymentRef || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if ((paymentMode === 'UPI' || paymentMode === 'CARD') && !paymentRef.trim()) {
      setError(`Please enter a reference number for ${paymentMode} payment`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/billing/${bill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          paymentMode,
          paymentRef: paymentRef.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update payment');
      onSuccess(data.bill);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Record Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">{bill.billNumber} · {bill.patient.name}</p>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Amount */}
          <div className="text-center py-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-slate-500 mb-1">Amount to collect</p>
            <p className="text-3xl font-extrabold text-blue-700">
              ₹{bill.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Payment Mode */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Payment Mode</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_MODES.map(mode => {
                const Icon = mode.icon;
                const isSelected = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id as PaymentMode)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all ${
                      isSelected
                        ? mode.color === 'emerald'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : mode.color === 'blue'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              {paymentMode === 'CASH'
                ? 'Receipt / Note (optional)'
                : paymentMode === 'UPI'
                ? 'UPI Transaction ID *'
                : 'Card Reference / Last 4 Digits *'}
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={paymentRef}
                onChange={e => setPaymentRef(e.target.value)}
                placeholder={
                  paymentMode === 'CASH'
                    ? 'e.g. Receipt #001 (optional)'
                    : paymentMode === 'UPI'
                    ? 'e.g. 4238XXXX9812'
                    : 'e.g. last 4 digits or auth code'
                }
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {loading ? 'Saving...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
