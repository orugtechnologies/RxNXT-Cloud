'use client';

import React, { useState } from 'react';
import { Stethoscope, Plus, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface QuickSymptomsDiagnosisProps {
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
}

const COMMON_SYMPTOMS = [
  'Fever',
  'Cold & Runny Nose',
  'Cough',
  'Sore Throat',
  'Headache',
  'Body Ache',
  'Abdominal Pain',
  'Loose Motions',
  'Vomiting',
  'Acidity / GERD',
  'Weakness',
  'Loss of Appetite',
  'Breathlessness',
  'Joint Pain',
  'Lower Back Pain',
  'Skin Rash / Itching',
  'Burning Urination',
  'Dizziness / Vertigo',
  'Constipation',
  'Ear Pain',
  'Eye Redness',
  'Chest Discomfort',
];

const COMMON_DIAGNOSES = [
  'Viral Pyrexia',
  'Acute Viral URI',
  'Acute Pharyngitis',
  'Acute Tonsillitis',
  'Acute Gastroenteritis',
  'GERD / Dyspepsia',
  'Urinary Tract Infection (UTI)',
  'Enteric / Typhoid Fever',
  'Allergic Rhinitis',
  'Acute Bronchitis',
  'Tension Headache',
  'Migraine',
  'Acute Gastritis',
  'Myalgia / Muscle Strain',
  'Allergic Dermatitis',
  'Fungal Skin Infection',
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Lumbago / Back Strain',
  'Osteoarthritis',
  'Suspected Dengue',
  'Bacterial Conjunctivitis',
];

export default function QuickSymptomsDiagnosis({
  chiefComplaint,
  setChiefComplaint,
  diagnosis,
  setDiagnosis,
}: QuickSymptomsDiagnosisProps) {
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [showAllDiagnoses, setShowAllDiagnoses] = useState(false);

  // Helper to test if item is in comma-separated string
  const isSymptomActive = (symptom: string) => {
    if (!chiefComplaint) return false;
    const parts = chiefComplaint.split(/[,+]/).map(p => p.trim().toLowerCase());
    return parts.includes(symptom.toLowerCase());
  };

  const isDiagnosisActive = (diag: string) => {
    if (!diagnosis) return false;
    const parts = diagnosis.split(/[,+]/).map(p => p.trim().toLowerCase());
    return parts.includes(diag.toLowerCase());
  };

  const toggleSymptom = (symptom: string) => {
    const parts = chiefComplaint
      .split(/[,+]/)
      .map(p => p.trim())
      .filter(Boolean);

    const exists = parts.some(p => p.toLowerCase() === symptom.toLowerCase());
    if (exists) {
      const remaining = parts.filter(p => p.toLowerCase() !== symptom.toLowerCase());
      setChiefComplaint(remaining.join(', '));
    } else {
      const updated = [...parts, symptom];
      setChiefComplaint(updated.join(', '));
    }
  };

  const toggleDiagnosis = (diag: string) => {
    const parts = diagnosis
      .split(/[,+]/)
      .map(p => p.trim())
      .filter(Boolean);

    const exists = parts.some(p => p.toLowerCase() === diag.toLowerCase());
    if (exists) {
      const remaining = parts.filter(p => p.toLowerCase() !== diag.toLowerCase());
      setDiagnosis(remaining.join(', '));
    } else {
      const updated = [...parts, diag];
      setDiagnosis(updated.join(', '));
    }
  };

  const displayedSymptoms = showAllSymptoms ? COMMON_SYMPTOMS : COMMON_SYMPTOMS.slice(0, 8);
  const displayedDiagnoses = showAllDiagnoses ? COMMON_DIAGNOSES : COMMON_DIAGNOSES.slice(0, 8);

  return (
    <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative z-10">
      <div className="bg-clinic-navy px-5 py-3 border-b border-clinic-border flex items-center justify-between rounded-t-xl">
        <div className="flex items-center">
          <Stethoscope size={18} className="text-clinic-emerald mr-2" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Details & Diagnosis</h2>
        </div>
        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
          <Sparkles size={11} /> 1-Click Chips
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Chief Complaint / Symptoms */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chief Complaint / Symptoms
            </label>
            <span className="text-[10px] text-slate-400">Pick chips or type custom</span>
          </div>

          <input
            type="text"
            placeholder="e.g. Fever, Cold & Runny Nose, Headache"
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow mb-2.5 bg-white shadow-xs"
          />

          {/* Quick Symptoms Chips */}
          <div className="flex flex-wrap gap-1.5">
            {displayedSymptoms.map(symptom => {
              const active = isSymptomActive(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer select-none ${
                    active
                      ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] font-bold shadow-xs ring-1 ring-[#93c5fd]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/60'
                  }`}
                >
                  {active ? <Check size={12} className="stroke-[3]" /> : <Plus size={11} className="text-slate-400" />}
                  <span>{symptom}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAllSymptoms(!showAllSymptoms)}
              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors"
            >
              {showAllSymptoms ? (
                <>
                  Less <ChevronUp size={12} />
                </>
              ) : (
                <>
                  +{COMMON_SYMPTOMS.length - 8} more <ChevronDown size={12} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Diagnosis / Clinical Impression
            </label>
            <span className="text-[10px] text-slate-400">Pick chips or type custom</span>
          </div>

          <input
            type="text"
            placeholder="e.g. Viral Pyrexia, Acute Pharyngitis"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow mb-2.5 bg-white shadow-xs"
          />

          {/* Quick Diagnosis Chips */}
          <div className="flex flex-wrap gap-1.5">
            {displayedDiagnoses.map(diag => {
              const active = isDiagnosisActive(diag);
              return (
                <button
                  key={diag}
                  type="button"
                  onClick={() => toggleDiagnosis(diag)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer select-none ${
                    active
                      ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] font-bold shadow-xs ring-1 ring-[#93c5fd]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/60'
                  }`}
                >
                  {active ? <Check size={12} className="stroke-[3]" /> : <Plus size={11} className="text-slate-400" />}
                  <span>{diag}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAllDiagnoses(!showAllDiagnoses)}
              className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors"
            >
              {showAllDiagnoses ? (
                <>
                  Less <ChevronUp size={12} />
                </>
              ) : (
                <>
                  +{COMMON_DIAGNOSES.length - 8} more <ChevronDown size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
