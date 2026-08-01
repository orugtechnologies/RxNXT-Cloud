'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Clock, CheckCircle2, User, Stethoscope, Phone } from 'lucide-react';

interface QueueItem {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  doctor_name: string;
  doctor_specialization: string | null;
  waiting_since: string;
  status: string;
}

interface ClinicQueueProps {
  refreshTrigger?: number; // Allows parent to trigger refresh
}

export default function ClinicQueue({ refreshTrigger = 0 }: ClinicQueueProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/receptionist/queue');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch queue');
      
      setQueue(data.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Could not load the active queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const waitingCount = queue.filter(q => q.status === 'WAITING').length;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200/90 relative mt-8">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Clinic Queue</span>
          {waitingCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {waitingCount} Waiting
            </span>
          )}
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors bg-blue-50 px-3 py-1.5 rounded-md disabled:opacity-50"
          title="Refresh Queue"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && queue.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <RefreshCw size={24} className="animate-spin mx-auto text-slate-300 mb-2" />
          <p className="text-sm">Loading queue...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-red-500 bg-red-50 rounded-xl text-sm font-medium">
          {error}
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={32} className="text-slate-300" />
          </div>
          <p className="font-medium text-slate-500 text-base">The queue is currently empty.</p>
          <p className="text-sm mt-1">New patient assignments will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Assigned Doctor</th>
                <th className="px-5 py-3">Wait Time</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-white">
              {queue.map((item) => {
                const isWaiting = item.status === 'WAITING';
                const waitTimeMins = Math.floor((Date.now() - new Date(item.waiting_since).getTime()) / 60000);
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isWaiting ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {item.patient_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{item.patient_name}</div>
                          <div className="text-xs text-slate-500">
                            {item.patient_gender ? `${item.patient_gender}, ` : ''}{item.patient_age ? `${item.patient_age} yrs` : 'Age N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone size={14} className="text-slate-400" />
                        {item.patient_phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={16} className="text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-700">{item.doctor_name}</div>
                          {item.doctor_specialization && (
                            <div className="text-[11px] text-slate-400">{item.doctor_specialization}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-600">
                        <Clock size={14} className={isWaiting && waitTimeMins > 15 ? 'text-orange-500' : 'text-slate-400'} />
                        <span className={isWaiting && waitTimeMins > 15 ? 'text-orange-600' : ''}>
                          {isWaiting ? `${waitTimeMins} mins` : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isWaiting ? (
                        <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200/60 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Waiting
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-md text-xs font-semibold">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
