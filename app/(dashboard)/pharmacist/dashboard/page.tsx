'use client';

import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Clock, 
  User, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  RefreshCw, 
  ArrowRight,
  Filter,
  DollarSign,
  QrCode,
  Pill,
  MapPin,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface PharmacyPrescription {
  id: string;
  createdAt: string;
  dispenseStatus: 'PENDING' | 'DISPENSED';
  patient: {
    id: string;
    name: string;
    phone: string;
    age: number;
    gender: string;
  };
  doctor: {
    id: string;
    fullName: string;
    specialization: string;
    registrationNumber: string;
    medicalCouncil: string;
    verificationStatus: string;
  };
  encounter?: {
    chiefComplaint?: string;
    diagnosis?: string;
  };
  medicines: Array<{
    id: string;
    name: string;
    dosageForm: string;
    strength: string;
    frequency: string;
    duration: string;
    instructions: string;
    estimatedUnits: number;
    inStock: boolean;
    stockItem: {
      id: string;
      medicineName: string;
      batchNumber: string;
      expiryDate: string;
      quantityInStock: number;
      unitPrice: number;
      rackLocation: string;
    } | null;
  }>;
  dispenseLog?: {
    totalAmount: number;
    paymentMode: string;
    createdAt: string;
  } | null;
}

interface PharmacyStats {
  totalInventorySkus: number;
  lowStockItems: number;
  expiringSoonItems: number;
  dispensedTodayCount: number;
  todayRevenue: number;
  pendingPrescriptionsCount: number;
}

export default function PharmacistDashboardPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>([]);
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'DISPENSED' | 'ALL'>('PENDING');

  // Dispense modal state
  const [selectedRx, setSelectedRx] = useState<PharmacyPrescription | null>(null);
  const [dispenseItems, setDispenseItems] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [dispensing, setDispensing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      const [rxRes, statsRes] = await Promise.all([
        fetch(`/api/pharmacy/prescriptions?status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`),
        fetch('/api/pharmacy/stats'),
      ]);

      if (rxRes.ok) {
        const rxData = await rxRes.json();
        if (rxData.success) {
          setPrescriptions(rxData.prescriptions);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, [statusFilter, searchQuery]);

  const openDispenseModal = (rx: PharmacyPrescription) => {
    setSelectedRx(rx);
    const initialItems = rx.medicines.map((m) => ({
      medicineName: m.name,
      dosageForm: m.dosageForm,
      quantity: m.estimatedUnits || 10,
      unitPrice: m.stockItem?.unitPrice || 10.0,
      pharmacyItemId: m.stockItem?.id || null,
      batchNumber: m.stockItem?.batchNumber || 'N/A',
      inStock: m.inStock,
    }));
    setDispenseItems(initialItems);
  };

  const handleDispenseSubmit = async () => {
    if (!selectedRx) return;

    try {
      setDispensing(true);
      const res = await fetch('/api/pharmacy/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: selectedRx.id,
          items: dispenseItems,
          paymentMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessNotice(`Prescription #${selectedRx.id.slice(-6).toUpperCase()} successfully dispensed! Stock deducted.`);
        setSelectedRx(null);
        await fetchPharmacyData();
      } else {
        alert(data.error || 'Failed to dispense prescription');
      }
    } catch (e: any) {
      alert(e.message || 'Error dispensing prescription');
    } finally {
      setDispensing(false);
    }
  };

  const totalBill = dispenseItems.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-blue-600" />
            Pharmacy Dispensing Counter
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time prescription verification, live inventory matching, and 1-click stock deduction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchPharmacyData}
            variant="outline"
            size="sm"
            className="text-slate-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-emerald-700 text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Dispense</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">
                {stats?.pendingPrescriptionsCount ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Ready for patient pickup</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dispensed Today</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats?.dispensedTodayCount ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Completed consultations</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock SKUs</p>
              <p className="text-2xl font-extrabold text-amber-500 mt-1">
                {stats?.lowStockItems ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Requires reorder</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Revenue</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Total pharmacy collections</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, phone, or Rx ID..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending Dispense
          </button>
          <button
            onClick={() => setStatusFilter('DISPENSED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'DISPENSED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dispensed
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Prescriptions
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <Card key={rx.id} className="border border-slate-200 hover:border-slate-300 transition-all shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    Rx
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-base">{rx.patient.name}</p>
                      <span className="text-xs text-slate-400">
                        ({rx.patient.age}y / {rx.patient.gender})
                      </span>
                      <Badge className={
                        rx.dispenseStatus === 'DISPENSED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }>
                        {rx.dispenseStatus === 'DISPENSED' ? 'Dispensed' : 'Ready for Dispensing'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {rx.patient.phone}
                      </span>
                      <span>•</span>
                      <span>Rx ID: #{rx.id.slice(-6).toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-700">{rx.doctor.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      NMC Reg: {rx.doctor.registrationNumber || 'VERIFIED'}
                    </p>
                  </div>

                  {rx.dispenseStatus === 'PENDING' ? (
                    <Button
                      onClick={() => openDispenseModal(rx)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 shadow-sm"
                    >
                      <Pill className="h-3.5 w-3.5 mr-1.5" />
                      Verify & Dispense
                    </Button>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        Paid ₹{rx.dispenseLog?.totalAmount ?? 0} ({rx.dispenseLog?.paymentMode || 'CASH'})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medicines Line Items Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {rx.medicines.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 truncate">{m.name} {m.strength}</p>
                      {m.inStock ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                          In Stock ({m.stockItem?.quantityInStock})
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                          Low/Out of Stock
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500">
                      {m.dosageForm} • {m.frequency} • {m.duration}
                    </p>
                    {m.stockItem?.rackLocation && (
                      <p className="text-[11px] text-blue-600 flex items-center gap-1 font-mono">
                        <MapPin className="h-3 w-3" />
                        {m.stockItem.rackLocation} • Batch: {m.stockItem.batchNumber || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && prescriptions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No prescriptions found</p>
            <p className="text-xs text-slate-500 mt-1">
              New prescriptions written by doctors will automatically appear here.
            </p>
          </div>
        )}
      </div>

      {/* Dispense Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Prescription Dispensing & Stock Deduction
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <strong>{selectedRx.patient.name}</strong> • Doctor: <strong>{selectedRx.doctor.fullName}</strong> (MCI: {selectedRx.doctor.registrationNumber})
                </p>
              </div>
              <button onClick={() => setSelectedRx(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            {/* Line Items Pricing Table */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Prescribed Line Items & Quantity Breakdown:
              </p>

              <div className="space-y-2">
                {dispenseItems.map((it, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold text-slate-800">{it.medicineName}</p>
                      <p className="text-[11px] text-slate-500">
                        {it.dosageForm} • Batch: {it.batchNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <label className="text-[10px] text-slate-400 block mb-0.5">Qty</label>
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => {
                            const newArr = [...dispenseItems];
                            newArr[idx].quantity = Number(e.target.value);
                            setDispenseItems(newArr);
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] text-slate-400 block mb-0.5">MRP / Unit</label>
                        <Input
                          type="number"
                          value={it.unitPrice}
                          onChange={(e) => {
                            const newArr = [...dispenseItems];
                            newArr[idx].unitPrice = Number(e.target.value);
                            setDispenseItems(newArr);
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div className="w-20 text-right pt-3">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{(it.quantity * it.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing & Payment Controls */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Total Calculated Bill:</span>
                <p className="text-2xl font-black text-slate-900">
                  ₹{totalBill.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Payment Mode:</span>
                {['UPI', 'CASH', 'CARD'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      paymentMode === mode
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedRx(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDispenseSubmit}
                disabled={dispensing}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-sm"
              >
                {dispensing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirm Dispense & Deduct Stock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
