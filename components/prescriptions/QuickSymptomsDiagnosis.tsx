'use client';

import React, { useState, useMemo } from 'react';
import { Stethoscope, Plus, Check, ChevronDown, ChevronUp, Sparkles, Lightbulb } from 'lucide-react';

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

// Clinical Knowledge Base: Symptom-to-Diagnosis Correlation Matrix
const CLINICAL_CORRELATIONS: { diagnosis: string; triggerKeywords: string[] }[] = [
  {
    diagnosis: 'Acute Viral URI',
    triggerKeywords: ['cold', 'runny nose', 'cough', 'sore throat', 'fever', 'headache']
  },
  {
    diagnosis: 'Viral Pyrexia',
    triggerKeywords: ['fever', 'body ache', 'weakness', 'headache']
  },
  {
    diagnosis: 'Acute Pharyngitis',
    triggerKeywords: ['sore throat', 'fever', 'cough', 'ear pain']
  },
  {
    diagnosis: 'Acute Tonsillitis',
    triggerKeywords: ['sore throat', 'fever', 'ear pain', 'weakness']
  },
  {
    diagnosis: 'Acute Gastroenteritis',
    triggerKeywords: ['loose motions', 'diarrhea', 'vomiting', 'nausea', 'abdominal pain', 'fever', 'weakness']
  },
  {
    diagnosis: 'Acute Gastritis',
    triggerKeywords: ['acidity', 'gerd', 'abdominal pain', 'vomiting', 'nausea', 'loss of appetite']
  },
  {
    diagnosis: 'GERD / Dyspepsia',
    triggerKeywords: ['acidity', 'gerd', 'chest discomfort', 'abdominal pain']
  },
  {
    diagnosis: 'Urinary Tract Infection (UTI)',
    triggerKeywords: ['burning urination', 'fever', 'abdominal pain', 'lower back pain']
  },
  {
    diagnosis: 'Suspected Dengue',
    triggerKeywords: ['fever', 'body ache', 'headache', 'weakness', 'skin rash', 'itching']
  },
  {
    diagnosis: 'Enteric / Typhoid Fever',
    triggerKeywords: ['fever', 'abdominal pain', 'headache', 'loose motions', 'weakness', 'loss of appetite']
  },
  {
    diagnosis: 'Acute Bronchitis',
    triggerKeywords: ['cough', 'breathlessness', 'fever', 'chest discomfort']
  },
  {
    diagnosis: 'Allergic Rhinitis',
    triggerKeywords: ['cold', 'runny nose', 'eye redness', 'skin rash', 'itching', 'cough']
  },
  {
    diagnosis: 'Tension Headache',
    triggerKeywords: ['headache', 'dizziness', 'vertigo', 'weakness', 'body ache']
  },
  {
    diagnosis: 'Migraine',
    triggerKeywords: ['headache', 'vomiting', 'dizziness', 'vertigo']
  },
  {
    diagnosis: 'Allergic Dermatitis',
    triggerKeywords: ['skin rash', 'itching']
  },
  {
    diagnosis: 'Fungal Skin Infection',
    triggerKeywords: ['skin rash', 'itching']
  },
  {
    diagnosis: 'Myalgia / Muscle Strain',
    triggerKeywords: ['body ache', 'joint pain', 'lower back pain', 'weakness']
  },
  {
    diagnosis: 'Lumbago / Back Strain',
    triggerKeywords: ['lower back pain', 'joint pain']
  },
  {
    diagnosis: 'Osteoarthritis',
    triggerKeywords: ['joint pain', 'body ache', 'lower back pain']
  },
  {
    diagnosis: 'Bacterial Conjunctivitis',
    triggerKeywords: ['eye redness', 'itching']
  },
  {
    diagnosis: 'Essential Hypertension',
    triggerKeywords: ['headache', 'dizziness', 'vertigo', 'chest discomfort']
  },
  {
    diagnosis: 'Type 2 Diabetes Mellitus',
    triggerKeywords: ['weakness', 'loss of appetite', 'burning urination', 'dizziness']
  }
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

  // Compute clinically correlated diagnoses based on currently selected / typed symptoms
  const { correlatedDiagnoses, otherDiagnoses } = useMemo(() => {
    if (!chiefComplaint || !chiefComplaint.trim()) {
      return { correlatedDiagnoses: [], otherDiagnoses: COMMON_DIAGNOSES };
    }

    const complaintLower = chiefComplaint.toLowerCase();

    const scored = CLINICAL_CORRELATIONS.map(item => {
      // Count matched keywords
      let score = 0;
      item.triggerKeywords.forEach(kw => {
        if (complaintLower.includes(kw)) {
          score += 1;
        }
      });
      return { diagnosis: item.diagnosis, score };
    });

    const correlated = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.diagnosis);

    const others = COMMON_DIAGNOSES.filter(d => !correlated.includes(d));

    return { correlatedDiagnoses: correlated, otherDiagnoses: others };
  }, [chiefComplaint]);

  const displayedSymptoms = showAllSymptoms ? COMMON_SYMPTOMS : COMMON_SYMPTOMS.slice(0, 8);
  const displayedOtherDiagnoses = showAllDiagnoses ? otherDiagnoses : otherDiagnoses.slice(0, Math.max(4, 8 - correlatedDiagnoses.length));

  return (
    <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative z-10">
      <div className="bg-clinic-navy px-5 py-3 border-b border-clinic-border flex items-center justify-between rounded-t-xl">
        <div className="flex items-center">
          <Stethoscope size={18} className="text-clinic-emerald mr-2" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Details & Diagnosis</h2>
        </div>
        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
          <Sparkles size={11} /> Smart Clinical Assist
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
          <div className={`flex flex-wrap gap-1.5 ${showAllSymptoms ? 'max-h-36 overflow-y-auto pr-1' : ''}`}>
            {displayedSymptoms.map(symptom => {
              const active = isSymptomActive(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer select-none ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60'
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

          {/* Clinically Correlated Diagnoses (Highlighted when symptoms are picked) */}
          {correlatedDiagnoses.length > 0 && (
            <div className="mb-3 p-2.5 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 rounded-lg border border-indigo-200/80 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5 mb-2 text-indigo-950 font-bold text-[11px]">
                <Lightbulb size={13} className="text-amber-500 fill-amber-400" />
                <span>Clinically Correlated with Symptoms:</span>
                <span className="text-[10px] font-normal text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded-full ml-auto">
                  {correlatedDiagnoses.length} match{correlatedDiagnoses.length > 1 ? 'es' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {correlatedDiagnoses.map(diag => {
                  const active = isDiagnosisActive(diag);
                  return (
                    <button
                      key={diag}
                      type="button"
                      onClick={() => toggleDiagnosis(diag)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer select-none shadow-xs ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/40'
                          : 'bg-white text-indigo-900 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 ring-1 ring-indigo-200'
                      }`}
                    >
                      {active ? (
                        <Check size={12} className="stroke-[3]" />
                      ) : (
                        <Sparkles size={11} className="text-amber-500 fill-amber-400" />
                      )}
                      <span>{diag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Diagnoses Chips */}
          <div>
            {correlatedDiagnoses.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Other Common Diagnoses
              </span>
            )}
            <div className={`flex flex-wrap gap-1.5 ${showAllDiagnoses ? 'max-h-36 overflow-y-auto pr-1' : ''}`}>
              {displayedOtherDiagnoses.map(diag => {
                const active = isDiagnosisActive(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => toggleDiagnosis(diag)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer select-none ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-1 ring-indigo-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/60'
                    }`}
                  >
                    {active ? <Check size={12} className="stroke-[3]" /> : <Plus size={11} className="text-slate-400" />}
                    <span>{diag}</span>
                  </button>
                );
              })}

              {otherDiagnoses.length > displayedOtherDiagnoses.length && (
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
                      +{otherDiagnoses.length - displayedOtherDiagnoses.length} more <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
