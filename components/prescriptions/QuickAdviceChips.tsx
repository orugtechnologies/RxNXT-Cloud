'use client';

import React from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';

const COMMON_ADVICE = [
  'Plenty of warm fluids & hydration',
  'Avoid cold, oily & spicy food',
  'Complete full antibiotic course',
  'Rest for 2–3 days',
  'Steam inhalation twice daily',
  'Warm salt water gargle',
  'Light soft diet',
  'Review SOS if fever persists or breathlessness',
  'Maintain regular BP & sugar monitoring',
  'Take medicines strictly after meals',
];

interface QuickAdviceChipsProps {
  notes: string;
  setNotes: (val: string) => void;
}

export default function QuickAdviceChips({ notes, setNotes }: QuickAdviceChipsProps) {
  const isAdviceSelected = (advice: string) => {
    return notes.toLowerCase().includes(advice.toLowerCase());
  };

  const handleToggleAdvice = (advice: string) => {
    if (isAdviceSelected(advice)) {
      // Remove it
      const parts = notes.split('\n').filter(line => !line.toLowerCase().includes(advice.toLowerCase()));
      setNotes(parts.join('\n').trim());
    } else {
      // Append it as bullet point or new line
      const clean = notes.trim();
      if (!clean) {
        setNotes(`• ${advice}`);
      } else {
        setNotes(`${clean}\n• ${advice}`);
      }
    }
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={11} className="text-emerald-600" />
          1-Click Quick Advice
        </span>
        <span className="text-[10px] text-slate-400">Click to append</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_ADVICE.map(advice => {
          const selected = isAdviceSelected(advice);
          return (
            <button
              key={advice}
              type="button"
              onClick={() => handleToggleAdvice(advice)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                selected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              {selected ? <Check size={11} className="stroke-[3]" /> : <Plus size={10} className="text-slate-400" />}
              <span>{advice}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
