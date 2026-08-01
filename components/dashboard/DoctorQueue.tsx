'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, User, Stethoscope, History, Search, FastForward, Loader2 } from 'lucide-react';

interface QueueItem {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  patient_age: number;
  patient_gender: string;
  waiting_since: string;
  status: string;
  tokenNumber: number | null;
}

export default function DoctorQueue({
  queue,
  onViewHistory,
  onSearchPatient,
}: {
  queue: QueueItem[];
  onViewHistory?: (patientId: string) => void;
  onSearchPatient?: () => void;
}) {
  const router = useRouter();
  const [skippingId, setSkippingId] = useState<string | null>(null);

  // Direct 1-click consultation launch into workspace page
  const handleStartConsultation = (patientId: string, queueId: string) => {
    router.push(`/doctor/prescription?patientId=${patientId}&queueId=${queueId}`);
  };

  const handleSkip = async (queueId: string) => {
    setSkippingId(queueId);
    try {
      const res = await fetch(`/api/queue/${queueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SKIPPED' })
      });
      if (res.ok) {
        router.refresh(); // Refresh server component data
      }
    } catch (error) {
      console.error('Failed to skip patient', error);
    } finally {
      setSkippingId(null);
    }
  };

  if (!queue || queue.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-clinic-blue rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100/50">
          <Clock className="text-clinic-blue animate-pulse" size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Your Patient Queue is Clear</h3>
        <p className="text-slate-500 text-sm mt-1.5 max-w-md">
          There are no patients waiting in your room right now. Patients checked in at Reception will automatically appear here live.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => router.push('/doctor/prescription')}
            className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm flex items-center"
          >
            <Stethoscope size={18} className="mr-2" /> Open Clinical Workspace
          </button>
          {onSearchPatient && (
            <button
              onClick={onSearchPatient}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm flex items-center"
            >
              <Search size={18} className="mr-2 text-slate-500" /> Search Directory
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-clinic-emerald/15 text-clinic-emerald flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              Live Patient Queue
              <span className="bg-clinic-emerald text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                {queue.length} {queue.length === 1 ? 'Patient' : 'Patients'} Waiting
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Patients assigned by Reception waiting for consultation</p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="divide-y divide-slate-100">
        {queue.map((item, index) => {
          const waitingTime = Math.max(
            0,
            Math.floor((Date.now() - new Date(item.waiting_since).getTime()) / (1000 * 60))
          );
          
          const isSkipping = skippingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${isSkipping ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* Patient Info */}
              <div className="flex items-center space-x-4">
                {item.tokenNumber ? (
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0 border border-blue-600">
                    #{item.tokenNumber}
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-clinic-blue text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                    {item.patient_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-clinic-blue transition-colors">
                      {item.patient_name}
                    </h4>
                    {index === 0 && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm border border-amber-200">
                        Next Up
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center text-xs text-slate-500 mt-1.5 gap-2 font-medium">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {item.patient_age}y • {item.patient_gender}
                    </span>
                    {item.patient_phone && (
                      <span className="text-slate-600 font-semibold">{item.patient_phone}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md ${waitingTime > 15 ? 'bg-orange-50 text-orange-700' : 'text-slate-400'}`}>
                      • Waiting {waitingTime} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {onViewHistory && (
                  <button
                    onClick={() => onViewHistory(item.patient_id)}
                    className="p-2.5 text-slate-600 hover:text-clinic-blue hover:bg-blue-50 rounded-xl transition-all border border-slate-200 hover:border-blue-200 text-xs font-semibold flex items-center"
                    title="View Patient History"
                  >
                    <History size={16} className="sm:mr-1.5" />
                    <span className="hidden sm:inline">History</span>
                  </button>
                )}

                <button
                  onClick={() => handleSkip(item.id)}
                  disabled={isSkipping}
                  className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold px-3 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs flex items-center border border-slate-200 hover:border-red-200"
                  title="Skip patient if they are not present"
                >
                  {isSkipping ? <Loader2 size={16} className="animate-spin" /> : <FastForward size={16} className="mr-1" />} Skip
                </button>

                {/* 1-Click Consult Now Action -> Immediately loads Clinical Workspace */}
                <button
                  onClick={() => handleStartConsultation(item.patient_id, item.id)}
                  className="bg-clinic-blue hover:bg-clinic-blueDark text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-xs flex items-center"
                >
                  <Stethoscope size={16} className="mr-1.5" /> Consult Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
