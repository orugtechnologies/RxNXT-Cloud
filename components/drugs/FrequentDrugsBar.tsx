'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Plus, Check, Pill } from 'lucide-react';
import { PrescribedMedicine } from '@/components/prescriptions/PrescriptionCart';

interface FrequentDrug {
  id: string;
  drugId: string;
  name: string;
  genericName: string;
  brandName?: string | null;
  dosage_form: string;
  strength: string;
  route: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface FrequentDrugsBarProps {
  onAddDrug: (med: PrescribedMedicine) => void;
  alreadyPrescribedIds?: string[];
}

export default function FrequentDrugsBar({ onAddDrug, alreadyPrescribedIds = [] }: FrequentDrugsBarProps) {
  const [frequentDrugs, setFrequentDrugs] = useState<FrequentDrug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/drugs/preferences')
      .then(res => res.json())
      .then(json => {
        if (json.data && Array.isArray(json.data)) {
          setFrequentDrugs(json.data);
        }
      })
      .catch(err => console.error('Error loading frequent drugs:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || frequentDrugs.length === 0) {
    return null;
  }

  const handleChipClick = (drug: FrequentDrug) => {
    const newMed: PrescribedMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      generic_id: drug.drugId,
      brand_id: drug.drugId,
      name: drug.name,
      dosage_form: drug.dosage_form,
      strength: drug.strength,
      route: drug.route,
      frequency: drug.frequency || '1-0-1',
      duration: drug.duration || '3 days',
      instructions: drug.instructions || 'Post-Meal (After Food)',
    };
    onAddDrug(newMed);
  };

  return (
    <div className="mt-3.5 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-[13px] font-extrabold text-[#000865] uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={14} className="text-[#0080ff] fill-[#0080ff]" />
          My Frequent Drugs (1-Click Add)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {frequentDrugs.map(drug => {
          const isAdded = alreadyPrescribedIds.includes(drug.drugId);

          return (
            <button
              key={drug.id}
              type="button"
              onClick={() => handleChipClick(drug)}
              disabled={isAdded}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                isAdded
                  ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] font-bold cursor-not-allowed shadow-2xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-900 ring-1 ring-slate-100 hover:ring-blue-200'
              }`}
              title={`${drug.name} ${drug.strength || ''}`.trim()}
            >
              <Pill size={13} className={isAdded ? 'text-[#1e40af]' : 'text-blue-600'} />
              <span>{drug.name}</span>
              {drug.strength && (
                <span className="text-[10px] text-slate-400 font-normal">
                  {drug.strength}
                </span>
              )}
              {isAdded ? (
                <Check size={12} className="text-[#1e40af] ml-0.5 stroke-[3]" />
              ) : (
                <Plus size={12} className="text-slate-400 group-hover:text-emerald-600 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
