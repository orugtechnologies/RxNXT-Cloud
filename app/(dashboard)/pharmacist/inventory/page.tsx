'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Filter, 
  MapPin, 
  DollarSign, 
  Pill,
  Trash2,
  Edit2,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PharmacyItem {
  id: string;
  medicineName: string;
  genericName?: string;
  dosageForm: string;
  strength?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantityInStock: number;
  minReorderLevel: number;
  unitPrice: number;
  costPrice?: number;
  rackLocation?: string;
  createdAt: string;
}

export default function PharmacyInventoryPage() {
  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'expiring_soon'>('all');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    dosageForm: 'Tablet',
    strength: '',
    batchNumber: '',
    expiryDate: '',
    quantityInStock: 100,
    minReorderLevel: 20,
    unitPrice: 50.0,
    costPrice: 35.0,
    rackLocation: 'Rack A-1',
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pharmacy/inventory?filter=${activeFilter}&q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.items);
        }
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeFilter, searchQuery]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setFormData({
          medicineName: '',
          genericName: '',
          dosageForm: 'Tablet',
          strength: '',
          batchNumber: '',
          expiryDate: '',
          quantityInStock: 100,
          minReorderLevel: 20,
          unitPrice: 50.0,
          costPrice: 35.0,
          rackLocation: 'Rack A-1',
        });
        await fetchInventory();
      } else {
        alert(data.error || 'Failed to add item');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving item');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickQuantityAdjust = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const res = await fetch('/api/pharmacy/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantityInStock: newQty }),
      });
      if (res.ok) {
        setItems(items.map((it) => it.id === id ? { ...it, quantityInStock: newQty } : it));
      }
    } catch (e) {
      console.error('Failed to update stock quantity:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Package className="h-7 w-7 text-blue-600" />
            Pharmacy Stock & Inventory Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time medicine batches, rack locations, expiry alerts, and stock level tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Medicine / Batch
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine name, generic, batch, or rack..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Medicines ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('low_stock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'low_stock'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Low Stock (&le;20)
          </button>
          <button
            onClick={() => setActiveFilter('expiring_soon')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'expiring_soon'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expiring Soon (&le;30d)
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Medicine & Form</th>
                <th className="py-3 px-4">Batch & Location</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Price (MRP)</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it) => {
                const isLow = it.quantityInStock <= it.minReorderLevel;
                const isOut = it.quantityInStock === 0;

                return (
                  <tr key={it.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{it.medicineName}</p>
                        <p className="text-[11px] text-slate-400">
                          {it.genericName ? `${it.genericName} • ` : ''}{it.dosageForm} {it.strength ? `(${it.strength})` : ''}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">{it.batchNumber || 'N/A'}</span>
                        {it.rackLocation && (
                          <p className="text-[11px] text-blue-600 font-sans flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {it.rackLocation}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {it.expiryDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(it.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹{it.unitPrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge className={
                        isOut 
                          ? 'bg-rose-100 text-rose-800 border-rose-200' 
                          : isLow 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }>
                        {it.quantityInStock} {it.dosageForm}s
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickQuantityAdjust(it.id, it.quantityInStock, -10)}
                          className="h-7 w-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                          title="Deduct 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleQuickQuantityAdjust(it.id, it.quantityInStock, 10)}
                          className="h-7 w-7 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs"
                          title="Add 10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleQuickQuantityAdjust(it.id, it.quantityInStock, 50)}
                          className="h-7 w-8 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs"
                          title="Add 50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No medicines matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add New Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add Medicine to Clinic Pharmacy
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Brand / Medicine Name *</label>
                <Input
                  required
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg (Dolo)"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Generic Name</label>
                  <Input
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dosage Form</label>
                  <select
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-xs"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                  <Input
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. BT-9021"
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rack Location</label>
                  <Input
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="Rack A-2"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Qty</label>
                  <Input
                    type="number"
                    value={formData.quantityInStock}
                    onChange={(e) => setFormData({ ...formData, quantityInStock: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">MRP Price (₹)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Alert Qty</label>
                  <Input
                    type="number"
                    value={formData.minReorderLevel}
                    onChange={(e) => setFormData({ ...formData, minReorderLevel: Number(e.target.value) })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                  {saving ? 'Adding...' : 'Save Stock Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
