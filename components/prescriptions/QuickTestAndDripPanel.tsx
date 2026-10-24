'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(hasSelections);

  return (
    <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50/70 hover:bg-slate-100/70 transition-colors px-5 py-3 border-b border-slate-100 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-[#0080ff]" />
          <span className="text-xs font-bold text-[#000865] uppercase tracking-wider">
            Diagnostics & Day-Care Procedures (Optional)
          </span>
          {hasSelections && (
            <span className="text-[10px] font-bold text-[#0052cc] bg-[#e8f1fd] border border-[#bfdbfe] px-2 py-0.5 rounded-full ml-2">
              {selectedTests.length + selectedDrips.length} ordered (₹{totalBillable})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <span>{isOpen ? 'Collapse' : '+ Expand'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
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
                      ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] font-bold shadow-xs ring-1 ring-[#93c5fd]'
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
              <Droplet size={14} className="text-[#0080ff]" />
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
                      ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] font-bold shadow-xs ring-1 ring-[#93c5fd]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
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
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#e8f1fd]/80 -mx-4 -mb-4 p-3.5 rounded-b-xl border-dashed">
            <div className="text-xs text-[#000865]">
              <span className="font-bold">Ready to order: </span>
              {selectedTests.length > 0 && <span>{selectedTests.length} test{selectedTests.length > 1 ? 's' : ''}</span>}
              {selectedTests.length > 0 && selectedDrips.length > 0 && <span>, </span>}
              {selectedDrips.length > 0 && <span>{selectedDrips.length} drip/procedure{selectedDrips.length > 1 ? 's' : ''}</span>}
              <span className="font-extrabold text-[#000865] ml-1.5">(₹{totalBillable.toLocaleString('en-IN')})</span>
            </div>
            <button
              type="button"
              onClick={onSendForTests}
              disabled={isSending}
              className="bg-[#0080ff] hover:bg-[#0066cc] text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
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