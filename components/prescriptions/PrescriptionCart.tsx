'use client';

import React from 'react';
import { Trash2, PlusCircle } from 'lucide-react';

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

interface CartProps {
  medicines: PrescribedMedicine[];
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
  { label: 'AC (Before meals)', value: 'AC' },
  { label: 'PC (After meals)', value: 'PC' },
  // Interval-based
  { label: 'Every 4 hours', value: 'Every 4 hours' },
  { label: 'Every 6 hours', value: 'Every 6 hours' },
  { label: 'Every 8 hours', value: 'Every 8 hours' },
  { label: 'Every 12 hours', value: 'Every 12 hours' },
  // Alternate / Weekly
  { label: 'Alternate days (EOD)', value: 'Alternate days' },
  { label: 'Twice a week', value: 'Twice a week' },
  { label: 'Once a week', value: 'Once a week' },
  { label: 'Once in 2 weeks', value: 'Once in 2 weeks' },
  { label: 'Once a month', value: 'Once a month' },
];

const DURATION_OPTIONS = [
  { label: '— Select Duration —', value: '' },
  { label: '1 day', value: '1 day' },
  { label: '2 days', value: '2 days' },
  { label: '3 days', value: '3 days' },
  { label: '4 days', value: '4 days' },
  { label: '5 days', value: '5 days' },
  { label: '6 days', value: '6 days' },
  { label: '1 week (7 days)', value: '1 week' },
  { label: '10 days', value: '10 days' },
  { label: '2 weeks (14 days)', value: '2 weeks' },
  { label: '15 days', value: '15 days' },
  { label: '3 weeks', value: '3 weeks' },
  { label: '1 month (30 days)', value: '1 month' },
  { label: '45 days', value: '45 days' },
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
  { label: 'Before meals', value: 'Before meals' },
  { label: 'After meals', value: 'After meals' },
  { label: 'With meals', value: 'With meals' },
  { label: 'Empty stomach', value: 'Empty stomach' },
  { label: 'At bedtime', value: 'At bedtime' },
  { label: 'With warm water', value: 'With warm water' },
  { label: 'With milk', value: 'With milk' },
  { label: 'Avoid alcohol', value: 'Avoid alcohol' },
  { label: 'Do not crush/chew', value: 'Do not crush or chew' },
  { label: 'Apply on affected area', value: 'Apply on affected area' },
  { label: 'Shake well before use', value: 'Shake well before use' },
];

export default function PrescriptionCart({ medicines, onUpdate, onRemove }: CartProps) {
  if (medicines.length === 0) return (
    <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
      <PlusCircle className="mx-auto text-gray-300 mb-3" size={32} />
      <p className="text-gray-500 font-medium text-sm">Search and add medicines above to build the prescription.</p>
    </div>
  );

  return (
    <div className="mt-6 border border-clinic-border rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in">
      <div className="bg-gray-50/80 px-5 py-3.5 border-b border-clinic-border flex justify-between items-center">
        <span className="font-bold text-clinic-navy text-sm uppercase tracking-wide">
          Prescribed Medicines
        </span>
        <span className="bg-clinic-navy text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {medicines.length} item{medicines.length !== 1 && 's'}
        </span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {medicines.map((med, index) => (
          <div key={med.id} className="p-5 hover:bg-gray-50/50 transition-colors group">
            {/* Medicine Name & Details */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start">
                <span className="text-gray-300 font-bold mr-3 mt-0.5 select-none">{index + 1}.</span>
                <div>
                  <p className="font-bold text-clinic-navy text-lg leading-tight">{med.name}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">
                    {[med.dosage_form, med.strength, med.route].filter(Boolean).join(' • ') || 'Generic / Standard Form'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(med.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove Medicine"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 ml-7">
              {/* Frequency */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Frequency</label>
                <select
                  value={med.frequency}
                  onChange={(e) => onUpdate(med.id, { frequency: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow shadow-sm hover:border-gray-400"
                >
                  {FREQUENCY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Duration</label>
                <select
                  value={med.duration}
                  onChange={(e) => onUpdate(med.id, { duration: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow shadow-sm hover:border-gray-400"
                >
                  {DURATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Instructions</label>
                <select
                  value={med.instructions}
                  onChange={(e) => onUpdate(med.id, { instructions: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 font-medium focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow shadow-sm hover:border-gray-400"
                >
                  {INSTRUCTIONS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
