'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  Edit3
} from 'lucide-react';

export interface PrescribedMedicine {
  id: string;
  generic_id?: string;
  brand_id?: string;
  name: string;
  dosage_form?: string;
  strength?: string;
  route?: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface CartProps {
  medicines?: PrescribedMedicine[];
  items?: PrescribedMedicine[];
  onUpdate: (id: string, updates: Partial<PrescribedMedicine>) => void;
  onRemove: (id: string) => void;
}

const FREQUENCY_OPTIONS = [
  { label: '— Select Frequency —', value: '' },
  // Standard dose patterns
  { label: '1-0-0 (Morning only)', value: '1-0-0' },
  { label: '0-1-0 (Afternoon only)', value: '0-1-0' },
  { label: '0-0-1 (Night only)', value: '0-0-1' },
  { label: '1-0-1 (Morning & Night)', value: '1-0-1' },
  { label: '1-1-0 (Morning & Afternoon)', value: '1-1-0' },
  { label: '0-1-1 (Afternoon & Night)', value: '0-1-1' },
  { label: '1-1-1 (Three times a day)', value: '1-1-1' },
  { label: '1-1-1-1 (Four times a day)', value: '1-1-1-1' },
  // Special frequencies
  { label: 'SOS (As needed)', value: 'SOS' },
  { label: 'OD (Once daily)', value: 'OD' },
  { label: 'BD (Twice daily)', value: 'BD' },
  { label: 'TDS (Three times daily)', value: 'TDS' },
  { label: 'QID (Four times daily)', value: 'QID' },
  { label: 'HS (At bedtime)', value: 'HS' },
  { label: 'AC (Before Food)', value: 'AC' },
  { label: 'PC (After Food)', value: 'PC' },
  // Interval-based
  { label: 'Every 4 hours', value: 'Every 4 hours' },
  { label: 'Every 6 hours', value: 'Every 6 hours' },
  { label: 'Every 8 hours', value: 'Every 8 hours' },
  { label: 'Every 12 hours', value: 'Every 12 hours' },
  // Alternate / Weekly
  { label: 'Alternate days', value: 'Alternate days' },
  { label: 'Once a week', value: 'Once a week' },
  { label: 'Twice a week', value: 'Twice a week' },
];

const DURATION_OPTIONS = [
  { label: '— Select Duration —', value: '' },
  { label: '1 day', value: '1 day' },
  { label: '2 days', value: '2 days' },
  { label: '3 days', value: '3 days' },
  { label: '5 days', value: '5 days' },
  { label: '7 days', value: '7 days' },
  { label: '10 days', value: '10 days' },
  { label: '14 days', value: '14 days' },
  { label: '15 days', value: '15 days' },
  { label: '21 days', value: '21 days' },
  { label: '1 month / 30 days', value: '1 month' },
  { label: '2 months', value: '2 months' },
  { label: '3 months', value: '3 months' },
  { label: '6 months', value: '6 months' },
  { label: '1 year', value: '1 year' },
  { label: 'Ongoing / Long term', value: 'Ongoing' },
  { label: 'Till review', value: 'Till review' },
  { label: 'SOS (As needed)', value: 'SOS' },
];

const INSTRUCTIONS_OPTIONS = [
  { label: '— Select Instructions —', value: '' },
  { label: 'Before Food', value: 'Before Food' },
  { label: 'After Food', value: 'After Food' },
  { label: 'With Food', value: 'With Food' },
  { label: 'Empty stomach', value: 'Empty stomach' },
  { label: 'At bedtime', value: 'At bedtime' },
  { label: 'With warm water', value: 'With warm water' },
  { label: 'With milk', value: 'With milk' },
  { label: 'Avoid alcohol', value: 'Avoid alcohol' },
  { label: 'Do not crush/chew', value: 'Do not crush or chew' },
  { label: 'Apply on affected area', value: 'Apply on affected area' },
  { label: 'Shake well before use', value: 'Shake well before use' },
];

const QUICK_FREQUENCIES = ['1-0-1', '1-1-1', '1-0-0', '0-0-1', 'OD', 'SOS'];
const QUICK_DURATIONS = ['3 days', '5 days', '7 days', '10 days', '15 days', '1 month'];
const QUICK_INSTRUCTIONS = ['After Food', 'Before Food', 'At bedtime', 'SOS'];

export default function PrescriptionCart({ medicines, items, onUpdate, onRemove }: CartProps) {
  const medList = items || medicines || [];
  
  // Track expanded accordion cards
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const prevCountRef = useRef(medList.length);

  // Auto-expand only newly added medicine or any item missing frequency/duration
  useEffect(() => {
    if (medList.length > prevCountRef.current) {
      const latestItem = medList[medList.length - 1];
      const newExpanded: Record<string, boolean> = {};
      medList.forEach(m => {
        const isIncomplete = !m.frequency?.trim() || !m.duration?.trim();
        if (m.id === latestItem.id || isIncomplete) {
          newExpanded[m.id] = true;
        }
      });
      setExpandedIds(newExpanded);
    }
    prevCountRef.current = medList.length;
  }, [medList.length]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allExpanded = medList.length > 0 && medList.every(m => expandedIds[m.id]);

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      medList.forEach(m => { next[m.id] = true; });
      setExpandedIds(next);
    }
  };

  return (
    <div className="bg-white">
      {medList.length === 0 ? (
        <div className="py-8 px-4 text-center bg-white flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-slate-500">
            — No medicines prescribed yet —
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Pick from My Frequent Drugs chips or search to add medicines.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Cart Header Controls */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
            <span className="text-xs font-bold text-slate-600">
              {medList.length} Medicine{medList.length > 1 ? 's' : ''} in Plan
            </span>
            <button
              type="button"
              onClick={toggleExpandAll}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition-colors cursor-pointer"
            >
              <ChevronsUpDown size={13} />
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          </div>

          {/* Accordion Medicine Rows */}
          <div className="space-y-2">
            {medList.map((med, index) => {
              const isExpanded = Boolean(expandedIds[med.id]);
              const isIncomplete = !med.frequency?.trim() || !med.duration?.trim() || !med.instructions?.trim();

              return (
                <div 
                  key={med.id} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-blue-300 shadow-sm bg-white ring-1 ring-blue-100' 
                      : isIncomplete 
                        ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400' 
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* 1-Line Compact Summary Header */}
                  <div className="p-3 flex items-center justify-between gap-3">
                    
                    {/* Medicine Identity & Summary Pills */}
                    <div 
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                      onClick={() => toggleExpand(med.id)}
                    >
                      <span className="text-slate-400 font-black text-xs shrink-0 select-none">
                        {index + 1}.
                      </span>

                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {med.name}
                        </span>

                        {(med.dosage_form || med.strength) && (
                          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide shrink-0">
                            {[med.dosage_form, med.strength].filter(Boolean).join(' • ')}
                          </span>
                        )}

                        {/* Inline Summary Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          {med.frequency ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                              {med.frequency}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              ! Dose
                            </span>
                          )}

                          {med.duration ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              {med.duration}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              ! Days
                            </span>
                          )}

                          {med.instructions && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 hidden sm:inline shadow-2xs">
                              {med.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Expand/Collapse & Remove */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleExpand(med.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isExpanded 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'text-slate-500 hover:text-blue-700 hover:bg-slate-100'
                        }`}
                        title={isExpanded ? 'Collapse' : 'Edit dose & instructions'}
                      >
                        <Edit3 size={14} className="sm:hidden" />
                        <span className="hidden sm:inline text-[11px]">{isExpanded ? 'Done' : 'Edit'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemove(med.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove medicine"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                  </div>

                  {/* Expanded Customizer Drawer (Quick chips, datalists, steppers) */}
                  {isExpanded && (
                    <div className="p-3.5 pt-2 border-t border-slate-100 bg-slate-50/60 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        
                        {/* Frequency Card */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                              Frequency *
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">Quick Pick:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {QUICK_FREQUENCIES.map(q => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => onUpdate(med.id, { frequency: q })}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all shadow-2xs ${
                                  med.frequency === q
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                          <div className="relative pt-0.5">
                            <input
                              type="text"
                              list={`freq-list-${med.id}`}
                              value={med.frequency}
                              onChange={(e) => onUpdate(med.id, { frequency: e.target.value })}
                              placeholder="e.g. 1-0-1, TDS, SOS..."
                              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold outline-none"
                            />
                            <datalist id={`freq-list-${med.id}`}>
                              {FREQUENCY_OPTIONS.filter(o => o.value).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* Duration Card with -1d / +1d Steppers */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                              Duration *
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">Quick Pick:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {QUICK_DURATIONS.map(q => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => onUpdate(med.id, { duration: q })}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all shadow-2xs ${
                                  med.duration === q
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 pt-0.5">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                list={`dur-list-${med.id}`}
                                value={med.duration}
                                onChange={(e) => onUpdate(med.id, { duration: e.target.value })}
                                placeholder="e.g. 5 days, 1 month..."
                                className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold outline-none"
                              />
                              <datalist id={`dur-list-${med.id}`}>
                                {DURATION_OPTIONS.filter(o => o.value).map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </datalist>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const num = parseInt(med.duration) || 5;
                                const next = Math.max(1, num - 1);
                                onUpdate(med.id, { duration: `${next} day${next > 1 ? 's' : ''}` });
                              }}
                              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                              title="Decrease 1 day"
                            >
                              -1d
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const num = parseInt(med.duration) || 5;
                                const next = num + 1;
                                onUpdate(med.id, { duration: `${next} day${next > 1 ? 's' : ''}` });
                              }}
                              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                              title="Increase 1 day"
                            >
                              +1d
                            </button>
                          </div>
                        </div>

                        {/* Instructions Card */}
                        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                              Instructions *
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">Quick Pick:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {QUICK_INSTRUCTIONS.map(q => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => onUpdate(med.id, { instructions: q })}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all shadow-2xs ${
                                  med.instructions === q
                                    ? 'bg-slate-800 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                          <div className="relative pt-0.5">
                            <input
                              type="text"
                              list={`inst-list-${med.id}`}
                              value={med.instructions}
                              onChange={(e) => onUpdate(med.id, { instructions: e.target.value })}
                              placeholder="e.g. After Food, Before Food..."
                              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold outline-none"
                            />
                            <datalist id={`inst-list-${med.id}`}>
                              {INSTRUCTIONS_OPTIONS.filter(o => o.value).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </datalist>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
