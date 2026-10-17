'use client';

import React, { useRef } from 'react';
import { X, Printer, Banknote, Smartphone, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType: string;
}

interface Bill {
  id: string;
  billNumber: string;
  consultationFee: number;
  medicineFee: number;
  otherFee: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMode?: string | null;
  paymentRef?: string | null;
  paidAt?: string | null;
  createdByName?: string | null;
  notes?: string | null;
  createdAt: string;
  patient: {
    name: string;
    phone?: string | null;
    age?: number | null;
    gender?: string | null;
  };
  items: BillItem[];
}

interface BillReceiptModalProps {
  bill: Bill;
  onClose: () => void;
}

const PAYMENT_MODE_LABELS: Record<string, { label: string; icon: any }> = {
  CASH: { label: 'Cash', icon: Banknote },
  UPI: { label: 'UPI', icon: Smartphone },
  CARD: { label: 'Card', icon: CreditCard },
};

export default function BillReceiptModal({ bill, onClose }: BillReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 20px; max-width: 380px; margin: auto; }
            .header { text-align: center; margin-bottom: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 12px; }
            .header h1 { font-size: 18px; font-weight: 800; margin: 0; }
            .header p { font-size: 11px; color: #64748b; margin: 2px 0; }
            .section { margin: 12px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
            .row.bold { font-weight: 700; }
            .row.large { font-size: 15px; font-weight: 800; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
            .paid { background: #d1fae5; color: #065f46; }
            .pending { background: #fef3c7; color: #92400e; }
            .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 10px 0; }
            .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RxNXT Clinic</h1>
            <p>Payment Receipt</p>
            <p>${bill.billNumber}</p>
          </div>

          <div class="section">
            <div class="row"><span>Patient</span><span><b>${bill.patient.name}</b></span></div>
            ${bill.patient.phone ? `<div class="row"><span>Phone</span><span>${bill.patient.phone}</span></div>` : ''}
            <div class="row"><span>Date</span><span>${new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          </div>

          <hr class="divider" />

          <div class="section">
            ${bill.consultationFee > 0 ? `<div class="row"><span>Consultation</span><span>₹${bill.consultationFee.toLocaleString('en-IN')}</span></div>` : ''}
            ${bill.medicineFee > 0 ? `<div class="row"><span>Medicines</span><span>₹${bill.medicineFee.toLocaleString('en-IN')}</span></div>` : ''}
            ${bill.otherFee > 0 ? `<div class="row"><span>Other</span><span>₹${bill.otherFee.toLocaleString('en-IN')}</span></div>` : ''}
            ${bill.discount > 0 ? `<div class="row"><span>Discount</span><span>–₹${bill.discount.toLocaleString('en-IN')}</span></div>` : ''}
            <div class="row large"><span>TOTAL</span><span>₹${bill.totalAmount.toLocaleString('en-IN')}</span></div>
          </div>

          <hr class="divider" />

          <div class="section">
            <div class="row">
              <span>Payment Status</span>
              <span class="badge ${bill.paymentStatus === 'PAID' ? 'paid' : 'pending'}">${bill.paymentStatus}</span>
            </div>
            ${bill.paymentMode ? `<div class="row"><span>Payment Mode</span><span>${bill.paymentMode}</span></div>` : ''}
            ${bill.paymentRef ? `<div class="row"><span>Reference</span><span>#${bill.paymentRef}</span></div>` : ''}
          </div>

          ${bill.notes ? `<hr class="divider" /><div class="section"><p style="font-size:11px;color:#64748b">${bill.notes}</p></div>` : ''}

          <div class="footer">
            <p>Thank you for visiting!</p>
            <p>Powered by RxNXT</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const paymentModeInfo = bill.paymentMode ? PAYMENT_MODE_LABELS[bill.paymentMode] : null;
  const PaymentIcon = paymentModeInfo?.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Receipt — {bill.billNumber}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={printRef} className="px-6 py-5 space-y-4">
          {/* Patient */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</p>
            <p className="text-base font-bold text-slate-900">{bill.patient.name}</p>
            <p className="text-xs text-slate-500">
              {[bill.patient.gender, bill.patient.age ? `${bill.patient.age} yrs` : null, bill.patient.phone]
                .filter(Boolean).join(' · ')}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })} at {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          <div className="border-t border-dashed border-slate-200" />

          {/* Fee Breakdown */}
          <div className="space-y-2">
            {bill.consultationFee > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Consultation Fee</span>
                <span>₹{bill.consultationFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            {bill.medicineFee > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Medicine Fee</span>
                <span>₹{bill.medicineFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            {bill.otherFee > 0 && (
              <div className="flex justify-between text-sm text-slate-600">
                <span>Other / Misc</span>
                <span>₹{bill.otherFee.toLocaleString('en-IN')}</span>
              </div>
            )}
            {bill.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>–₹{bill.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Line items if present */}
            {bill.items.length > 0 && (
              <>
                <div className="border-t border-dashed border-slate-100 my-2" />
                {bill.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-slate-500">
                    <span>{item.description} × {item.quantity}</span>
                    <span>₹{item.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-blue-700">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200" />

          {/* Payment Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Payment Status</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                bill.paymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700'
                  : bill.paymentStatus === 'PENDING'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {bill.paymentStatus === 'PAID' && <CheckCircle2 className="h-3.5 w-3.5" />}
                {bill.paymentStatus === 'PENDING' && <Clock className="h-3.5 w-3.5" />}
                {bill.paymentStatus === 'CANCELLED' && <XCircle className="h-3.5 w-3.5" />}
                {bill.paymentStatus}
              </span>
            </div>

            {paymentModeInfo && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Payment Mode</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  {PaymentIcon && <PaymentIcon className="h-3.5 w-3.5" />}
                  {paymentModeInfo.label}
                </span>
              </div>
            )}

            {bill.paymentRef && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Reference No.</span>
                <span className="text-xs font-mono text-slate-700">#{bill.paymentRef}</span>
              </div>
            )}

            {bill.paidAt && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Paid At</span>
                <span className="text-xs text-slate-500">
                  {new Date(bill.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {bill.notes && (
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 italic border border-slate-100">
              {bill.notes}
            </div>
          )}

          {bill.createdByName && (
            <p className="text-[10px] text-slate-400 text-center">Billed by {bill.createdByName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
