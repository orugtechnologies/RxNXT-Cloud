'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, UserCheck, RefreshCw } from 'lucide-react';

export interface EncounterSummary {
  id?: string;
  created_at?: string;
  createdAt?: string;
  chief_complaint?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  medicines?: any[];
}

interface AIPatientSummaryCardProps {
  patientId: string;
  encounters?: EncounterSummary[];
}

export default function AIPatientSummaryCard({ patientId, encounters: propEncounters }: AIPatientSummaryCardProps) {
  const [encounters, setEncounters] = useState<EncounterSummary[] | null>(propEncounters || null);
  const [loading, setLoading] = useState<boolean>(!propEncounters);

  useEffect(() => {
    if (propEncounters !== undefined) {
      setEncounters(propEncounters);
      setLoading(false);
      return;
    }

    if (!patientId) return;

    setLoading(true);
    fetch(`/api/patients/${patientId}`)
      .then(res => res.json())
      .then(json => {
        if (json && json.encounters) {
          setEncounters(json.encounters);
        } else {
          setEncounters([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch patient history for AI summary:', err);
        setEncounters([]);
      })
      .finally(() => setLoading(false));
  }, [patientId, propEncounters]);

  if (loading) {
    return (
      <div className="mt-3 p-3.5 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/30 animate-pulse flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0">
          <Sparkles className="animate-spin" size={16} />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-indigo-100/60 rounded w-1/3"></div>
          <div className="h-3 bg-indigo-50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const history = encounters || [];

  // First Visit Badge
  if (history.length === 0) {
    return (
      <div className="mt-3 p-3 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 to-teal-50/30 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="p-1 rounded-md bg-emerald-500 text-white shadow-xs">
            <UserCheck size={14} />
          </span>
          <div>
            <span className="font-semibold text-emerald-900">First-Time Patient</span>
            <p className="text-[10px] text-emerald-700 font-normal">No prior visit history in clinic database.</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 font-bold text-emerald-800 text-[10px] tracking-wide uppercase border border-emerald-200">
          New Patient
        </span>
      </div>
    );
  }

  // Synthesize AI Clinical Insights
  const diagnosesList = Array.from(
    new Set(
      history
        .map(h => h.diagnosis || '')
        .filter(d => d && d.toLowerCase() !== 'general consultation')
    )
  );

  const complaintsList = Array.from(
    new Set(
      history
        .map(h => h.chief_complaint || h.chiefComplaint || '')
        .filter(c => c && c.toLowerCase() !== 'none noted')
    )
  );

  const medsList = Array.from(
    new Set(
      history.flatMap(h =>
        (h.medicines || []).map((m: any) => m.medicine_name || m.name || m.customName || m.drug?.name).filter(Boolean)
      )
    )
  );

  const lastVisit = history[0];
  const lastVisitDateRaw = lastVisit.created_at || lastVisit.createdAt;
  const lastVisitDate = lastVisitDateRaw
    ? new Date(lastVisitDateRaw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent';

  const summaryBullets = [
    diagnosesList.length > 0
      ? `Primary Diagnosis History: ${diagnosesList.join(', ')}`
      : `Chief Complaints: ${complaintsList.join(', ') || 'Routine Wellness Checks'}`,

    medsList.length > 0
      ? `Past Medications: ${medsList.slice(0, 4).join(', ')}${medsList.length > 4 ? ` (+${medsList.length - 4} more)` : ''}`
      : `No prior heavy prescription history.`,

    `Last Visit (${lastVisitDate}): ${lastVisit.diagnosis || lastVisit.chief_complaint || 'Consultation'}`,
  ];

  const keyTakeaway = history.length > 2
    ? `Frequent Visitor (${history.length} visits). Check chronic condition trends.`
    : `Returning Patient (${history.length} visit${history.length > 1 ? 's' : ''}). Last seen on ${lastVisitDate}.`;

  return (
    <div className="mt-3 rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/40 p-3.5 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 border-b border-indigo-100/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xs">
            <Sparkles size={15} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              AI Clinical Insight
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-extrabold border border-indigo-200">
                {history.length} Prior Visit{history.length > 1 ? 's' : ''}
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 font-normal">
              Synthesized from clinical history • Last visit {lastVisitDate}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Bullets */}
      <div className="space-y-1.5 text-[11px]">
        {summaryBullets.map((bullet, idx) => (
          <div key={idx} className="flex items-start gap-2 text-slate-700 font-medium leading-normal">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Key Takeaway Banner */}
      <div className="mt-2.5 pt-2 border-t border-indigo-100/70 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-900">
        <Activity size={12} className="text-indigo-600 shrink-0" />
        <span>{keyTakeaway}</span>
      </div>
    </div>
  );
}
