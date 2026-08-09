'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Activity, Pill, UserCheck, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

interface AISummaryData {
  isFirstVisit: boolean;
  visitCount: number;
  lastVisitDate?: string;
  patientName?: string;
  summaryBullets?: string[];
  keyTakeaway?: string;
  message?: string;
}

export default function AIPatientSummaryCard({ patientId }: { patientId: string }) {
  const [data, setData] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchSummary = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/patients/${patientId}/ai-summary`);
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error loading AI summary', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [patientId]);

  if (loading) {
    return (
      <div className="mt-4 p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/30 animate-pulse flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-600">
          <Sparkles className="animate-spin" size={18} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-indigo-100/60 rounded w-1/3"></div>
          <div className="h-3 bg-indigo-50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mt-4 p-3.5 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/60 via-white to-sky-50/30 flex items-center justify-between text-xs text-indigo-900 shadow-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles size={16} />
          </span>
          <div>
            <span className="font-semibold text-indigo-950">AI Clinical Insight</span>
            <p className="text-[11px] text-indigo-700 font-normal">First consultation or new patient profile.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-100 font-semibold text-indigo-800 text-[10px] tracking-wide uppercase border border-indigo-200/60">
          New Profile
        </span>
      </div>
    );
  }

  if (data.isFirstVisit) {
    return (
      <div className="mt-4 p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/60 to-teal-50/30 flex items-center justify-between text-xs text-emerald-800 shadow-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-sm">
            <UserCheck size={16} />
          </span>
          <div>
            <span className="font-semibold text-emerald-900">First-Time Patient Visit</span>
            <p className="text-[11px] text-emerald-700/90 font-normal">No prior visit history recorded in clinic database.</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 font-semibold text-emerald-800 text-[10px] tracking-wide uppercase border border-emerald-200/60">
          New Patient
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/40 p-4 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-indigo-100/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              AI Clinical Insight Summary
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                {data.visitCount} Prior Visit{data.visitCount > 1 ? 's' : ''}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-normal">
              Synthesized from past clinical records • Last visit {data.lastVisitDate}
            </p>
          </div>
        </div>

        <button
          onClick={fetchSummary}
          title="Refresh AI Insights"
          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Summary Bullets */}
      <div className="space-y-2 text-xs">
        {data.summaryBullets?.map((bullet, idx) => (
          <div key={idx} className="flex items-start gap-2 text-slate-700 font-medium leading-relaxed">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>

      {/* Key Takeaway Banner */}
      {data.keyTakeaway && (
        <div className="mt-3 pt-2.5 border-t border-indigo-100/70 flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
          <Activity size={13} className="text-indigo-600 flex-shrink-0" />
          <span>{data.keyTakeaway}</span>
        </div>
      )}
    </div>
  );
}
