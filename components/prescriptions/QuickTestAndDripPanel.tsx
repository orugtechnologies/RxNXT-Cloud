'use client';

import React, { useState } from 'react';
import { FlaskConical, Droplet, Plus, X, ChevronDown, ChevronUp, Check, ShieldAlert } from 'lucide-react';

export interface InvestigationItem {
  id: string;
  name: string;
  category: 'BLOOD' | 'IMAGING' | 'URINE' | 'OTHER';
  price: number;
}

export interface DayCareProcedureItem {
  id: string;
  name: string;
  category: 'IV_DRIP' | 'INJECTION' | 'NEBULIZATION' | 'DRESSING';
  price: number;
}

const COMMON_TESTS: InvestigationItem[] = [
  { id: 't-cbc', name: 'Complete Blood Count (CBC)', category: 'BLOOD', price: 250 },
  { id: 't-widal', name: 'Widal / Typhidot Test', category: 'BLOOD', price: 200 },
  { id: 't-dengue', name: 'Dengue NS1 Antigen', category: 'BLOOD', price: 600 },
  { id: 't-rbs', name: 'Random Blood Sugar (RBS)', category: 'BLOOD', price: 80 },
  { id: 't-lft', name: 'Liver Function Test (LFT)', category: 'BLOOD', price: 650 },
  { id: 't-kft', name: 'Kidney Function Test (KFT)', category: 'BLOOD', price: 550 },
  { id: 't-crp', name: 'C-Reactive Protein (CRP)', category: 'BLOOD', price: 350 },
  { id: 't-urine-re', name: 'Urine Routine & Micro', category: 'URINE', price: 120 },
  { id: 't-cxr', name: 'Chest X-Ray PA View', category: 'IMAGING', price: 350 },
  { id: 't-ecg', name: '12-Lead Resting ECG', category: 'OTHER', price: 200 },
];

const COMMON_DRIPS: DayCareProcedureItem[] = [
  { id: 'd-ns-pantop', name: 'IV Pantocid + Ondem in 100ml NS', category: 'IV_DRIP', price: 450 },
  { id: 'd-ns-pcm', name: 'IV Paracetamol (100ml Infusion)', category: 'IV_DRIP', price: 350 },
  { id: 'd-dns-multivit', name: 'IV DNS + Multivitamin + Neurobion', category: 'IV_DRIP', price: 550 },
  { id: 'd-neb-duo', name: 'Nebulization (Duolin + Budecort)', category: 'NEBULIZATION', price: 200 },
  { id: 'd-inj-tt', name: 'Inj. Tetanus Toxoid (TT 0.5ml)', category: 'INJECTION', price: 100 },
  { id: 'd-inj-voveran', name: 'Inj. Voveran (Diclofenac) IM/IV', category: 'INJECTION', price: 150 },
  { id: 'd-dressing', name: 'Wound Cleaning & Sterile Dressing', category: 'DRESSING', price: 250 },
];

interface QuickTestAndDripPanelProps {
  selectedTests: InvestigationItem[];
  selectedDrips: DayCareProcedureItem[];
  onToggleTest: (item: InvestigationItem) => void;
  onToggleDrip: (item: DayCareProcedureItem) => void;
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
  const [isOpen, setIsOpen] = useState(hasSelections);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50/80 hover:bg-slate-100 transition-colors px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <FlaskConical size={15} className="stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 uppercase tracking-wider">
            Diagnostics & Day-Care Procedures (Optional)
          </span>
          {hasSelections && (
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-1">
              {selectedTests.length + selectedDrips.length} ordered (₹{totalBillable})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
          <span>{isOpen ? 'Collapse' : '+ Expand'}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-white/70">
        {/* Lab Investigations Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
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
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{test.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    selected ? 'bg-blue-200/60 text-blue-900' : 'bg-slate-200/70 text-slate-600'
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
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet size={14} className="text-blue-600" />
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
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selected
                      ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span>{drip.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    selected ? 'bg-blue-200/60 text-blue-900' : 'bg-slate-200/70 text-slate-600'
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
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 -mx-4 -mb-4 p-3.5 rounded-b-xl border-dashed">
            <div className="text-xs text-slate-900">
              <span className="font-bold">Ready to order: </span>
              {selectedTests.length > 0 && <span>{selectedTests.length} test{selectedTests.length > 1 ? 's' : ''}</span>}
              {selectedTests.length > 0 && selectedDrips.length > 0 && <span>, </span>}
              {selectedDrips.length > 0 && <span>{selectedDrips.length} drip/procedure{selectedDrips.length > 1 ? 's' : ''}</span>}
              <span className="font-extrabold text-blue-700 ml-1.5">(₹{totalBillable.toLocaleString('en-IN')})</span>
            </div>
            <button
              type="button"
              onClick={onSendForTests}
              disabled={isSending}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <FlaskConical size={14} />
              {isSending ? 'Sending to Lab...' : 'Send for Tests / Drip & Next Patient ➔'}
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
