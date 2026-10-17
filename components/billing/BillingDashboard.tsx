'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  IndianRupee, RefreshCw, Plus, CheckCircle2, Clock, Banknote,
  Smartphone, CreditCard, XCircle, Search, Filter, Eye, ReceiptText,
} from 'lucide-react';
import CreateBillModal from './CreateBillModal';
import RecordPaymentModal from './RecordPaymentModal';
import BillReceiptModal from './BillReceiptModal';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';

interface Bill {
  id: string;
  billNumber: string;
  patientId: string;
  encounterId?: string | null;
  prescriptionId?: string | null;
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
    id: string;
    name: string;
    phone?: string | null;
    age?: number | null;
    gender?: string | null;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    itemType: string;
  }[];
}

interface Stats {
  todayRevenue: number;
  todayPaidCount: number;
  pendingCount: number;
}

const STATUS_FILTERS = [
  { id: '', label: 'All Bills' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PAID', label: 'Paid' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

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

export default function BillingDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<Stats>({ todayRevenue: 0, todayPaidCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [billToRecord, setBillToRecord] = useState<Bill | null>(null);
  const [billToView, setBillToView] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/billing?${params}`);
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleBillCreated = (bill: Bill) => {
    setShowCreateModal(false);
    setSelectedPatient(null);
    fetchBills();
  };

  const handlePaymentRecorded = (updatedBill: Bill) => {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
    setBillToRecord(null);
    setStats(prev => ({
      ...prev,
      todayRevenue: prev.todayRevenue + updatedBill.totalAmount,
      todayPaidCount: prev.todayPaidCount + 1,
      pendingCount: Math.max(0, prev.pendingCount - 1),
    }));
  };

  // Client-side patient name filter
  const filtered = bills.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.patient.name.toLowerCase().includes(q) ||
      b.billNumber.toLowerCase().includes(q) ||
      b.patient.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-11 w-11 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <IndianRupee className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">₹{stats.todayRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-11 w-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bills Paid Today</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.todayPaidCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-11 w-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Bills</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search patient for new bill */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone or bill no..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchBills}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Bill
          </button>
        </div>
      </div>

      {/* ── Bills Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && bills.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-slate-300 mb-3" />
            <p className="text-sm">Loading bills...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ReceiptText className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <p className="font-medium text-slate-500">No bills found</p>
            <p className="text-sm mt-1">Create a new bill using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Bill No.</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filtered.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {bill.billNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{bill.patient.name}</div>
                      {bill.patient.phone && (
                        <div className="text-xs text-slate-400">{bill.patient.phone}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {new Date(bill.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(bill.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-slate-900">
                        ₹{bill.totalAmount.toLocaleString('en-IN')}
                      </span>
                      {bill.discount > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          –₹{bill.discount.toLocaleString('en-IN')} disc.
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={bill.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <PaymentModeBadge mode={bill.paymentMode} />
                        {bill.paymentRef && (
                          <span className="text-[10px] font-mono text-slate-400">
                            #{bill.paymentRef}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setBillToView(bill)}
                          title="View Receipt"
                          className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {bill.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => setBillToRecord(bill)}
                            className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Collect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreateModal && (
        <PatientPickerWrapper
          onPatientSelected={(patient) => {
            setSelectedPatient(patient);
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {selectedPatient && (
        <CreateBillModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onSuccess={handleBillCreated}
        />
      )}

      {billToRecord && (
        <RecordPaymentModal
          bill={billToRecord}
          onClose={() => setBillToRecord(null)}
          onSuccess={handlePaymentRecorded}
        />
      )}

      {billToView && (
        <BillReceiptModal
          bill={billToView}
          onClose={() => setBillToView(null)}
        />
      )}
    </div>
  );
}

// ── Inline patient picker wrapper for "New Bill" flow ──
function PatientPickerWrapper({
  onPatientSelected,
  onClose,
}: {
  onPatientSelected: (patient: Patient) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Select Patient for Bill</h2>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        <PatientSearchUI onSelect={onPatientSelected} onAddNew={() => {}} />
        <p className="text-xs text-slate-400 mt-3 text-center">
          Search by name or phone number to select the patient.
        </p>
      </div>
    </div>
  );
}
