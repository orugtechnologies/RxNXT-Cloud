'use client';

import React, { useState } from 'react';
import { Stethoscope, Activity, Plus, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Block: Chief Complaints */}
      <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden transition-all duration-300">
        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope size={15} className="text-[#0080ff]" />
            <h3 className="text-xs font-bold text-[#000865] uppercase tracking-wider">Chief Complaints</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Tap to toggle</span>
        </div>

        <div className="p-3.5 space-y-2.5">
          <input
            type="text"
            placeholder="e.g. Fever, Cold & Runny Nose, Headache"
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0080ff] focus:border-[#0080ff] outline-none transition-shadow bg-white shadow-xs"
          />

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
              className="text-[10px] font-bold text-[#1e40af] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors"
            >
              {showAllSymptoms ? (
                <>Less <ChevronUp size={12} /></>
              ) : (
                <>+{COMMON_SYMPTOMS.length - 8} more <ChevronDown size={12} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Block: Diagnosis / Clinical Impression */}
      <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden transition-all duration-300">
        <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-[#0080ff]" />
            <h3 className="text-xs font-bold text-[#000865] uppercase tracking-wider">Diagnosis / Impression</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Tap to toggle</span>
        </div>

        <div className="p-3.5 space-y-2.5">
          <input
            type="text"
            placeholder="e.g. Viral Pyrexia, Acute Pharyngitis"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0080ff] focus:border-[#0080ff] outline-none transition-shadow bg-white shadow-xs"
          />

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
              className="text-[10px] font-bold text-[#1e40af] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded-md flex items-center gap-0.5 transition-colors"
            >
              {showAllDiagnoses ? (
                <>Less <ChevronUp size={12} /></>
              ) : (
                <>+{COMMON_DIAGNOSES.length - 8} more <ChevronDown size={12} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}