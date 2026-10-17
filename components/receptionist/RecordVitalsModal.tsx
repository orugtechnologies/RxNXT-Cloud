'use client';

import React, { useState } from 'react';
import { X, Activity, Heart, Thermometer, Weight, Wind, Gauge, Sparkles, Check } from 'lucide-react';

interface VitalsData {
  bp?: string | null;
  pulse?: string | null;
  temperature?: string | null;
  weight?: string | null;
  height?: string | null;
  spo2?: string | null;
}

interface RecordVitalsModalProps {
  queueId: string;
  patientName: string;
  initialVitals?: VitalsData;
  onClose: () => void;
  onSuccess: (updatedVitals: VitalsData) => void;
}

export default function RecordVitalsModal({
  queueId,
  patientName,
  initialVitals,
  onClose,
  onSuccess,
}: RecordVitalsModalProps) {
  const [bp, setBp] = useState(initialVitals?.bp || '');
  const [pulse, setPulse] = useState(initialVitals?.pulse || '');
  const [temperature, setTemperature] = useState(initialVitals?.temperature || '');
  const [weight, setWeight] = useState(initialVitals?.weight || '');
  const [height, setHeight] = useState(initialVitals?.height || '');
  const [spo2, setSpo2] = useState(initialVitals?.spo2 || '');
  const [saving, setSaving] = useState(false);

  // Quick preset helper for temperature
  const setQuickTemp = (val: string) => setTemperature(val);

  // Auto BMI calculation if weight and height are entered
  const bmi = React.useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      const heightInMeters = h / 100;
      return (w / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [weight, height]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/queue/${queueId}/vitals`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bp,
          pulse,
          temperature,
          weight,
          height,
          spo2,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save vitals');

      onSuccess({ bp, pulse, temperature, weight, height, spo2 });
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save vitals');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 flex justify-between items-center border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <Activity size={20} className="text-rose-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Record Patient Vitals</h2>
              <p className="text-xs text-slate-300">Patient: <span className="text-white font-semibold">{patientName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Pressure */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge size={14} className="text-indigo-600" />
                Blood Pressure (BP)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 120/80"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">mmHg</span>
              </div>
            </div>

            {/* Pulse Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-rose-600" />
                Pulse Rate
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 76"
                  value={pulse}
                  onChange={e => setPulse(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">bpm</span>
              </div>
            </div>

            {/* Body Temperature */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer size={14} className="text-amber-600" />
                  Temperature
                </label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setQuickTemp('98.6')} className="text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded">98.6°F</button>
                  <button type="button" onClick={() => setQuickTemp('100.4')} className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded">100.4°F</button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 98.6"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">°F</span>
              </div>
            </div>

            {/* Oxygen Saturation SpO2 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wind size={14} className="text-cyan-600" />
                SpO2 (Oxygen)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 98"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">%</span>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Weight size={14} className="text-emerald-600" />
                Weight
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 68"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg</span>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-blue-600" />
                Height {bmi && <span className="text-emerald-600 font-bold lowercase text-[11px]">(BMI: {bmi})</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 172"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">cm</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check size={16} />
              {saving ? 'Saving Vitals...' : 'Save Vitals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
