'use client';

import React, { useState } from 'react';
import {
  IndianRupee, CheckCircle2, Clock, XCircle, Banknote,
  Smartphone, CreditCard, ReceiptText, Eye, AlertCircle
} from 'lucide-react';
import BillReceiptModal from '@/components/billing/BillReceiptModal';

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
  patient?: {
    name: string;
    phone?: string | null;
    age?: number | null;
    gender?: string | null;
  };
  items: BillItem[];
}

interface PatientBillingHistoryProps {
  bills: Bill[];
  patientName: string;
  patientPhone?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
}

const PaymentModeBadge = ({ mode }: { mode?: string | null }) => {
  if (!mode) return null;
  const configs: Record<string, { icon: any; cls: string; label: string }> = {
    CASH: { icon: Banknote, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Cash' },
    UPI: { icon: Smartphone, cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'UPI' },
    CARD: { icon: CreditCard, cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Card' },
  };
  const cfg = configs[mode];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PARTIAL: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${configs[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status === 'PAID' && <CheckCircle2 className="h-3 w-3" />}
      {status === 'PENDING' && <Clock className="h-3 w-3" />}
      {status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
      {status}
    </span>
  );
};

export default function PatientBillingHistory({
  bills,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
}: PatientBillingHistoryProps) {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const totalPaid = bills
    .filter(b => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const totalPending = bills
    .filter(b => b.paymentStatus === 'PENDING')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const pendingCount = bills.filter(b => b.paymentStatus === 'PENDING').length;
  const paidCount = bills.filter(b => b.paymentStatus === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bills</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{bills.length}</p>
          </div>
          <div className="h-10 w-10 bg-blue-100/70 text-blue-600 rounded-lg flex items-center justify-center font-bold">
            <ReceiptText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700/80 uppercase tracking-wider">Total Paid ({paidCount})</p>
            <p className="text-2xl font-bold text-emerald-800 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className={`rounded-xl border p-4 flex items-center justify-between ${
          pendingCount > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-slate-50/80 border-slate-200/90'
        }`}>
          <div>
            <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider">
              Pending Dues ({pendingCount})
            </p>
            <p className={`text-2xl font-bold mt-0.5 ${pendingCount > 0 ? 'text-amber-800 font-extrabold' : 'text-slate-700'}`}>
              ₹{totalPending.toLocaleString('en-IN')}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${
            pendingCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            This patient has <strong>{pendingCount} unpaid bill{pendingCount > 1 ? 's' : ''}</strong> amounting to <strong>₹{totalPending.toLocaleString('en-IN')}</strong>. Front desk reception can collect and record this payment.
          </span>
        </div>
      )}

      {/* Bills Table */}
      {bills.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <ReceiptText className="h-12 w-12 mx-auto text-slate-200 mb-2" />
          <p className="text-sm font-medium text-slate-500">No billing history for this patient</p>
          <p className="text-xs text-slate-400 mt-1">Invoices created by the front desk reception will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Bill Number</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5 text-right">Fee Breakdown</th>
                <th className="px-5 py-3.5 text-right">Total Amount</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Payment Mode / Ref</th>
                <th className="px-5 py-3.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {bill.billNumber}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600">
                    <div>
                      {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-slate-600">
                    <div className="space-y-0.5">
                      {bill.consultationFee > 0 && <div>Consult: ₹{bill.consultationFee}</div>}
                      {bill.medicineFee > 0 && <div>Med: ₹{bill.medicineFee}</div>}
                      {bill.otherFee > 0 && <div>Other: ₹{bill.otherFee}</div>}
                      {bill.discount > 0 && (
                        <div className="text-emerald-600 font-semibold">–₹{bill.discount} disc</div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      ₹{bill.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={bill.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <PaymentModeBadge mode={bill.paymentMode} />
                      {bill.paymentRef && (
                        <span className="text-[10px] font-mono text-slate-400">
                          #{bill.paymentRef}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedBill({
                        ...bill,
                        patient: bill.patient || {
                          name: patientName,
                          phone: patientPhone,
                          age: patientAge,
                          gender: patientGender,
                        }
                      })}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                      title="View Receipt"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBill && (
        <BillReceiptModal
          bill={selectedBill as any}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
