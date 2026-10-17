'use client';

import React, { useState } from 'react';
import {
  X, Plus, Trash2, IndianRupee, Banknote, Smartphone, CreditCard,
  Hash, User, FileText, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Percent,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  itemType: 'CONSULTATION' | 'MEDICINE' | 'OTHER';
}

interface CreateBillModalProps {
  patient: Patient;
  encounterId?: string;
  prescriptionId?: string;
  onClose: () => void;
  onSuccess: (bill: any) => void;
}

const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash', icon: Banknote, color: 'emerald' },
  { id: 'UPI', label: 'UPI', icon: Smartphone, color: 'blue' },
  { id: 'CARD', label: 'Card', icon: CreditCard, color: 'indigo' },
] as const;

type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export default function CreateBillModal({
  patient, encounterId, prescriptionId, onClose, onSuccess,
}: CreateBillModalProps) {
  // Line items
  const [items, setItems] = useState<BillItem[]>([
    { description: 'Consultation Fee', quantity: 1, unitPrice: 0, itemType: 'CONSULTATION' },
  ]);

  // Fees (derived from items for convenience)
  const [consultationFee, setConsultationFee] = useState(0);
  const [otherFee, setOtherFee] = useState(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [markAsPaid, setMarkAsPaid] = useState(false);

  // UI state
  const [notes, setNotes] = useState('');
  const [showLineItems, setShowLineItems] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = consultationFee + otherFee;
  const calculatedDiscount = discountType === 'PERCENT'
    ? Math.round(((subtotal * (discountValue || 0)) / 100) * 100) / 100
    : (discountValue || 0);
  const discount = Math.min(subtotal, Math.max(0, calculatedDiscount));
  const totalAmount = Math.max(0, subtotal - discount);

  const addItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, itemType: 'OTHER' }]);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof BillItem, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (totalAmount === 0 && !markAsPaid) {
      // Allow zero bills (e.g. free visit)
    }
    if (markAsPaid && !paymentMode) {
      setError('Please select a payment mode');
      return;
    }
    if (markAsPaid && (paymentMode === 'UPI' || paymentMode === 'CARD') && !paymentRef.trim()) {
      setError(`Please enter a reference number for ${paymentMode} payment`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          encounterId: encounterId || null,
          prescriptionId: prescriptionId || null,
          consultationFee,
          medicineFee: 0,
          otherFee,
          discount,
          paymentStatus: markAsPaid ? 'PAID' : 'PENDING',
          paymentMode: markAsPaid ? paymentMode : null,
          paymentRef: markAsPaid && paymentRef.trim() ? paymentRef.trim() : null,
          notes: notes.trim() || null,
          items: items.filter(i => i.description.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create bill');

      onSuccess(data.bill);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Bill / Invoice</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.name}
                {patient.age ? `, ${patient.age} yrs` : ''}
                {patient.gender ? ` · ${patient.gender}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Patient info bar */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{patient.name}</span>
            {patient.phone && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{patient.phone}</span>
              </>
            )}
          </div>

          {/* ── Fee Breakdown ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fee Breakdown</p>
            <div className="space-y-2.5">
              {/* Consultation */}
              <div className="flex items-center gap-3">
                <label className="w-36 text-sm text-slate-600 font-medium shrink-0">Consultation Fee</label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={consultationFee || ''}
                    onChange={e => setConsultationFee(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>


              {/* Other */}
              <div className="flex items-center gap-3">
                <label className="w-36 text-sm text-slate-600 font-medium shrink-0">Other / Misc</label>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={otherFee || ''}
                    onChange={e => setOtherFee(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Discount */}
              <div className="flex items-center gap-3">
                <div className="w-36 shrink-0 flex items-center justify-between">
                  <label className="text-sm text-slate-600 font-medium text-emerald-700">Discount (–)</label>
                  <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (discountType !== 'FIXED') {
                          setDiscountType('FIXED');
                          setDiscountValue(discount);
                        }
                      }}
                      className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-all ${
                        discountType === 'FIXED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Flat amount discount in Rupees"
                    >
                      ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (discountType !== 'PERCENT') {
                          setDiscountType('PERCENT');
                          const pct = subtotal > 0 ? Math.round(((discountValue / subtotal) * 100) * 10) / 10 : 0;
                          setDiscountValue(pct);
                        }
                      }}
                      className={`px-1.5 py-0.5 text-[11px] font-bold rounded transition-all ${
                        discountType === 'PERCENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Percentage discount"
                    >
                      %
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm font-semibold">
                    {discountType === 'FIXED' ? '₹' : '%'}
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={discountType === 'PERCENT' ? 100 : undefined}
                    step={discountType === 'PERCENT' ? '0.1' : '1'}
                    value={discountValue || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      if (discountType === 'PERCENT') {
                        setDiscountValue(Math.min(100, Math.max(0, val)));
                      } else {
                        setDiscountValue(Math.max(0, val));
                      }
                    }}
                    placeholder="0"
                    className="w-full pl-7 pr-16 py-2 border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                  />
                  {discountType === 'PERCENT' && discount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                      = ₹{discount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 px-5 py-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 mb-1">
                <span>
                  Discount {discountType === 'PERCENT' ? `(${discountValue}%)` : ''}
                </span>
                <span>– ₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-blue-100 mt-2">
              <span>Total Amount</span>
              <span className="text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Optional line items toggle */}
          <button
            type="button"
            onClick={() => setShowLineItems(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {showLineItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showLineItems ? 'Hide' : 'Add'} detailed line items (optional)
          </button>

          {showLineItems && (
            <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Line Items</p>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={item.itemType}
                    onChange={e => updateItem(idx, 'itemType', e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="CONSULTATION">Consult</option>
                    <option value="MEDICINE">Medicine</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-14 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full pl-5 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          )}

          {/* ── Mark as Paid Toggle ── */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setMarkAsPaid(v => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${markAsPaid ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform duration-200 ${markAsPaid ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700">Mark as Paid Now</span>
              {!markAsPaid && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  Pending
                </span>
              )}
            </label>

            {markAsPaid && (
              <div className="space-y-4 pt-1">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
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
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                        paymentMode === 'CASH'
                          ? 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'
                          : 'border-slate-200 focus:ring-blue-500/30 focus:border-blue-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Follow-up discount applied, senior citizen concession..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : markAsPaid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {loading ? 'Saving...' : markAsPaid ? 'Save & Mark Paid' : 'Save as Pending'}
          </button>
        </div>
      </div>
    </div>
  );
}
