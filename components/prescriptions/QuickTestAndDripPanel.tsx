'use client';

import React from 'react';
import { FlaskConical, Droplet, Plus, X } from 'lucide-react';

export interface InvestigationItem {
  id: string;
  name: string;
  price: number;
}

export interface DayCareProcedureItem {
  id: string;
  name: string;
  price: number;
}

const COMMON_TESTS: InvestigationItem[] = [
  { id: 't1', name: 'Complete Blood Count (CBC)', price: 300 },
  { id: 't2', name: 'Random Blood Sugar (RBS)', price: 100 },
  { id: 't3', name: 'Dengue NS1 Antigen', price: 600 },
  { id: 't4', name: 'Urine Routine & Micro', price: 150 },
  { id: 't5', name: 'Serum Widal / Typhoid', price: 250 },
  { id: 't6', name: '12-Lead ECG', price: 350 },
];

const COMMON_DRIPS: DayCareProcedureItem[] = [
  { id: 'd1', name: 'IV Normal Saline (500ml) + Set', price: 250 },
  { id: 'd2', name: 'IV Paracetamol (100ml Infusion)', price: 200 },
  { id: 'd3', name: 'Nebulization (Duolin / Budecort)', price: 150 },
  { id: 'd4', name: 'IV Pantoprazole / Ondansetron', price: 120 },
  { id: 'd5', name: 'IV Dextrose Normal Saline (DNS)', price: 250 },
];

interface QuickTestAndDripPanelProps {
  selectedTests: InvestigationItem[];
  selectedDrips: DayCareProcedureItem[];
  onToggleTest: (test: InvestigationItem) => void;
  onToggleDrip: (drip: DayCareProcedureItem) => void;
  onAddCustomTest?: (name: string, price: number) => void;
  onAddCustomDrip?: (name: string, price: number) => void;
  onSendForTests?: () => void;
  isSending?: boolean;
}

export default function QuickTestAndDripPanel({
  selectedTests,
  selectedDrips,
  onToggleTest,
  onToggleDrip,
  onSendForTests,
  isSending = false,
}: QuickTestAndDripPanelProps) {
  const isTestSelected = (id: string) => selectedTests.some(t => t.id === id);
  const isDripSelected = (id: string) => selectedDrips.some(d => d.id === id);

  const totalBillable = [
    ...selectedTests.map(t => t.price),
    ...selectedDrips.map(d => d.price),
  ].reduce((sum, p) => sum + p, 0);

  const hasSelections = selectedTests.length > 0 || selectedDrips.length > 0;

  return (
    <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-5 py-3 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical size={18} className="text-cyan-400" />
          <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Diagnostics & Day-Care Procedures (Auto-Billed)
          </h2>
        </div>
        {totalBillable > 0 && (
          <span className="text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded-full">
            Auto-Bill: ₹{totalBillable.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4 bg-white/70">
        {/* Lab Investigations Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical size={14} className="text-blue-600" />
              1-Click Lab Tests
            </span>
            <span className="text-[10px] text-slate-400">Click to order & bill</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_TESTS.map(test => {
              const selected = isTestSelected(test.id);
              return (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => onToggleTest(test)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{test.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    selected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    ₹{test.price}
                  </span>
                  {selected ? <X size={12} className="ml-0.5" /> : <Plus size={12} className="ml-0.5 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day-Care Procedures / IV Drips Chips */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet size={14} className="text-purple-600" />
              1-Click IV Drip / Day-Care
            </span>
            <span className="text-[10px] text-slate-400">Sent to Nursing & Billing</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_DRIPS.map(drip => {
              const selected = isDripSelected(drip.id);
              return (
                <button
                  key={drip.id}
                  type="button"
                  onClick={() => onToggleDrip(drip)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    selected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <span>{drip.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    selected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    ₹{drip.price}
                  </span>
                  {selected ? <X size={12} className="ml-0.5" /> : <Plus size={12} className="ml-0.5 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Callout if tests or drips are selected */}
        {hasSelections && onSendForTests && (
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60 -mx-4 -mb-4 p-3.5 rounded-b-xl border-dashed">
            <div className="text-xs text-indigo-900">
              <span className="font-bold">Ready to order: </span>
              {selectedTests.length > 0 && <span>{selectedTests.length} test{selectedTests.length > 1 ? 's' : ''}</span>}
              {selectedTests.length > 0 && selectedDrips.length > 0 && <span>, </span>}
              {selectedDrips.length > 0 && <span>{selectedDrips.length} drip/procedure{selectedDrips.length > 1 ? 's' : ''}</span>}
              <span className="font-extrabold text-indigo-950 ml-1.5">(₹{totalBillable.toLocaleString('en-IN')})</span>
            </div>
            <button
              type="button"
              onClick={onSendForTests}
              disabled={isSending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <FlaskConical size={14} />
              {isSending ? 'Sending to Lab...' : 'Send for Tests / Drip & Next Patient ➔'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
