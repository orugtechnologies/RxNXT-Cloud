'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  ArrowRight,
  RefreshCw,
  Eye,
  Edit3,
  Calendar,
  Sparkles,
  Droplet,
  CreditCard,
  Send,
  QrCode,
  DollarSign,
  X,
  Loader2,
} from 'lucide-react';
import LabResultEntryModal from '@/components/lab/LabResultEntryModal';
import LabReportViewerModal from '@/components/lab/LabReportViewerModal';

interface LabOrder {
  id: string;
  orderNumber: string;
  status: string;
  priority: string;
  notes?: string | null;
  totalAmount?: number;
  paymentStatus?: 'PENDING' | 'PAID' | string;
  paymentMethod?: string | null;
  paidAt?: string | null;
  releasedToDoctor?: boolean;
  releasedAt?: string | null;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    phone?: string | null;
    age?: number | string | null;
    gender?: string | null;
  };
  doctor?: {
    id: string;
    fullName: string;
    specialization?: string | null;
  } | null;
  tests: Array<{
    id: string;
    testName: string;
    category: string;
    templateType: string;
    price?: number;
    status: string;
    isAbnormal: boolean;
    completedAt?: string | null;
    impression?: string | null;
    results?: any;
  }>;
}

export default function LabDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ORDERED' | 'PROCESSING' | 'COMPLETED'>('ALL');

  // Modals state
  const [selectedTestItem, setSelectedTestItem] = useState<any | null>(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const [selectedReportData, setSelectedReportData] = useState<any | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  // Counter Payment Modal state
  const [paymentModalOrder, setPaymentModalOrder] = useState<LabOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') {
        params.append('status', activeFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/lab/orders?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch lab orders:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Advance Order Status to SAMPLE_COLLECTED / PROCESSING
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/lab/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleOpenPayment = (order: LabOrder) => {
    setPaymentModalOrder(order);
    const total = order.totalAmount && order.totalAmount > 0
      ? order.totalAmount
      : (order.tests || []).reduce((sum, t) => sum + (t.price || 150), 0);
    setCustomAmount(total);
    setPaymentMethod('UPI');
  };

  const handleConfirmPayment = async (andRelease: boolean = false) => {
    if (!paymentModalOrder) return;
    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/lab/orders/${paymentModalOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: andRelease ? 'COLLECT_AND_RELEASE' : 'COLLECT_PAYMENT',
          paymentMethod,
          amount: Number(customAmount) || 0,
        }),
      });
      if (res.ok) {
        setPaymentModalOrder(null);
        fetchOrders();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to record payment');
      }
    } catch (e: any) {
      alert(e.message || 'Payment update failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleReleaseDirectly = async (orderId: string) => {
    try {
      const res = await fetch(`/api/lab/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RELEASE_TO_DOCTOR' }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to release order to doctor:', err);
    }
  };

  // Open Result Entry
  const openResultEntry = (order: LabOrder, test: any) => {
    setSelectedTestItem({
      ...test,
      labOrder: {
        id: order.id,
        orderNumber: order.orderNumber,
        patient: order.patient,
        doctor: order.doctor,
      },
    });
    setIsEntryModalOpen(true);
  };

  // Open Full Report Viewer
  const openReportViewer = async (order: LabOrder, test: any) => {
    try {
      const res = await fetch(`/api/lab/orders/${order.id}`);
      if (res.ok) {
        const json = await res.json();
        const fullOrder = json.data;
        const targetTest = fullOrder.tests.find((t: any) => t.id === test.id) || test;

        setSelectedReportData({
          orderNumber: fullOrder.orderNumber,
          orderDate: fullOrder.createdAt,
          clinicName: fullOrder.clinic?.name,
          clinicAddress: fullOrder.clinic?.address,
          clinicPhone: fullOrder.clinic?.phone,
          patient: fullOrder.patient,
          doctorName: fullOrder.doctor?.fullName,
          technicianName: targetTest.technicianName,
          testName: targetTest.testName,
          category: targetTest.category,
          results: targetTest.results || [],
          impression: targetTest.impression,
          isAbnormal: targetTest.isAbnormal,
          completedAt: targetTest.completedAt,
        });
        setIsViewerModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load full report details:', err);
    }
  };

  // Metrics
  const pendingOrdersCount = orders.filter(o => o.status === 'ORDERED').length;
  const inProcessingCount = orders.filter(o => o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED').length;
  const completedOrdersCount = orders.filter(o => o.status === 'COMPLETED').length;
  const abnormalTestsCount = orders.reduce(
    (sum, o) => sum + o.tests.filter(t => t.isAbnormal).length,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <FlaskConical size={22} className="stroke-[2.5]" />
            </div>
            <span>Diagnostic Laboratory Worklist</span>
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage incoming investigation orders, enter parameter results, and dispatch verified diagnostic reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock size={15} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{pendingOrdersCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Awaiting sample collection</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Processing</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Droplet size={15} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{inProcessingCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Testing in progress</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Reports</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedOrdersCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Sent to doctor & billing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abnormal Findings</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
              <AlertTriangle size={15} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-700 mt-2">{abnormalTestsCount}</p>
          <span className="text-[11px] text-red-600 font-semibold">Out-of-range parameters</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'ALL', label: 'All Orders' },
              { key: 'ORDERED', label: 'Pending Samples' },
              { key: 'PROCESSING', label: 'In Processing' },
              { key: 'COMPLETED', label: 'Completed' },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search patient or order #..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Worklist Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Diagnostic Worklist ({orders.length} orders)
            </h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FlaskConical size={36} className="mx-auto text-slate-300 stroke-[1.5] mb-2" />
            <p className="font-semibold text-slate-600">No diagnostic orders found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Orders sent by doctors from the Prescription Studio will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map(order => {
              const allTestsCompleted = order.tests.every(t => t.status === 'COMPLETED');
              const orderAmount = order.totalAmount && order.totalAmount > 0
                ? order.totalAmount
                : (order.tests || []).reduce((sum, t) => sum + (t.price || 150), 0);
              const isPaid = order.paymentStatus === 'PAID';

              return (
                <div key={order.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Patient & Order Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {order.orderNumber}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {order.patient.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          ({order.patient.age ? `${order.patient.age}Y` : ''}{' '}
                          {order.patient.gender || ''})
                        </span>

                        {/* Status Badge */}
                        {order.status === 'ORDERED' && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                            Pending Sample
                          </span>
                        )}
                        {order.status === 'PROCESSING' && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            In Processing
                          </span>
                        )}
                        {order.status === 'COMPLETED' && (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} /> Reports Ready
                          </span>
                        )}

                        {/* Financial Payment Badge */}
                        {isPaid ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} /> Paid: ₹{orderAmount} ({order.paymentMethod || 'UPI'})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CreditCard size={11} /> ₹{orderAmount} Due
                          </span>
                        )}

                        {/* Doctor Release / Delivery Badge */}
                        {order.releasedToDoctor ? (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Send size={11} /> Released to Doctor
                          </span>
                        ) : order.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            🔒 Held at Lab Desk
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        {order.doctor && (
                          <span>
                            Ref: <strong className="text-slate-700">{order.doctor.fullName}</strong>
                          </span>
                        )}
                        {order.patient.phone && (
                          <span>
                            Phone: <strong className="text-slate-700">{order.patient.phone}</strong>
                          </span>
                        )}
                        <span>
                          Ordered:{' '}
                          <span className="text-slate-600 font-medium">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Quick Stage Actions & Smart Gated Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                      {order.status === 'ORDERED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                          className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Droplet size={13} />
                          <span>Sample Collected</span>
                        </button>
                      )}

                      {/* FLOW A: Upfront Pre-Payment button (when unpaid & not yet completed) */}
                      {!isPaid && order.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(order)}
                          className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <CreditCard size={13} />
                          <span>Collect ₹{orderAmount} (Pre-Pay)</span>
                        </button>
                      )}

                      {/* FLOW B: Unpaid & Completed -> 1-Click Collect & Send to Doctor Gate */}
                      {order.status === 'COMPLETED' && !isPaid && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(order)}
                          className="px-3.5 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                        >
                          <CreditCard size={13} />
                          <span>Collect ₹{orderAmount} & Send to Doctor</span>
                        </button>
                      )}

                      {/* Paid & Completed but not yet released */}
                      {order.status === 'COMPLETED' && isPaid && !order.releasedToDoctor && (
                        <button
                          type="button"
                          onClick={() => handleReleaseDirectly(order.id)}
                          className="px-3.5 py-1.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Send size={13} />
                          <span>Send to Doctor</span>
                        </button>
                      )}

                      {/* Fully released and paid */}
                      {order.releasedToDoctor && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 size={12} /> Live in Doctor Queue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Test Items List */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Ordered Investigations ({order.tests.length}):
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {order.tests.map(test => {
                        const isCompleted = test.status === 'COMPLETED';

                        return (
                          <div
                            key={test.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              isCompleted
                                ? test.isAbnormal
                                  ? 'bg-red-50/40 border-red-200/80'
                                  : 'bg-emerald-50/40 border-emerald-200/80'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {test.testName}
                                </span>
                                {test.isAbnormal && (
                                  <span className="shrink-0 text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.2 rounded">
                                    HIGH/LOW
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Category: {test.category} • {test.templateType}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isCompleted ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openReportViewer(order, test)}
                                    className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                                    title="View & Print Report"
                                  >
                                    <Eye size={12} />
                                    <span>Report</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openResultEntry(order, test)}
                                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
                                    title="Edit Values"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openResultEntry(order, test)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <Edit3 size={12} />
                                  <span>Enter Results</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Entry Modal */}
      <LabResultEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSuccess={() => {
          fetchOrders();
        }}
        testItem={selectedTestItem}
      />

      {/* Report Viewer Modal */}
      <LabReportViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        reportData={selectedReportData}
      />

      {/* Counter Fee Collection Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <CreditCard size={16} className="text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Collect Investigation Fee
                  </h3>
                  <p className="text-[11px] text-blue-200 font-mono">
                    {paymentModalOrder.orderNumber} • {paymentModalOrder.patient.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Ordered Tests summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Ordered Investigations ({paymentModalOrder.tests.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {paymentModalOrder.tests.map(t => (
                    <span key={t.id} className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium">
                      {t.testName} {t.price ? `(₹${t.price})` : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Fee to Collect (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-base font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode size={16} className="text-emerald-600" />
                    <span>UPI / QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign size={16} className="text-blue-600" />
                    <span>Cash at Counter</span>
                  </button>
                </div>
              </div>

              {/* Flow description helper */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900">
                {paymentModalOrder.status === 'COMPLETED' ? (
                  <p>
                    ⚡ <strong>Immediate Release:</strong> Confirming payment will instantly deliver the completed reports to Dr. {paymentModalOrder.doctor?.fullName || 'Doctor'} and transition the patient to <strong>Reports Ready</strong> in the live queue.
                  </p>
                ) : (
                  <p>
                    ⚡ <strong>Automated Delivery:</strong> Patient is paying upfront. Once you finish testing and click &quot;Submit Results&quot;, the reports will automatically transfer to the doctor with zero extra clicks.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentModalOrder(null)}
                disabled={submittingPayment}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingPayment}
                onClick={() => handleConfirmPayment(paymentModalOrder.status === 'COMPLETED')}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submittingPayment ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>
                      {paymentModalOrder.status === 'COMPLETED'
                        ? `Collect ₹${customAmount} & Send to Doctor`
                        : `Confirm ₹${customAmount} Paid`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
