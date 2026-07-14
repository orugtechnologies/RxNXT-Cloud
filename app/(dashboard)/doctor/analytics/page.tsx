'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetrics(data.metrics);
          setRecent(data.recent);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const manualMetric = metrics.find(m => m.creationMethod === 'MANUAL');
  const templateMetric = metrics.find(m => m.creationMethod === 'TEMPLATE');

  const avgManual = manualMetric ? manualMetric._avg.timeTakenSeconds : 0;
  const avgTemplate = templateMetric ? templateMetric._avg.timeTakenSeconds : 0;
  const totalCount = (manualMetric?._count?._all || 0) + (templateMetric?._count?._all || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-amber-800">Disclaimer regarding analytical metrics</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                The workflow performance metrics presented in this dashboard are aggregated strictly for operational analysis and platform optimization. This data does not reflect clinical efficacy and must not be utilized as a basis for clinical decision-making, patient care strategies, or medical performance evaluations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Activity className="text-clinic-emerald mr-3" size={28} strokeWidth={2.5} />
            Efficiency Analytics
            <InfoTooltip text="Track your clinic's performance over time. Monitor patient volume, revenue trends, and demographic data to optimize your practice." />
          </h1>
          <p className="text-slate-500 mt-1 ml-11 text-sm font-medium">Measure and optimize your digital prescription workflow</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center text-slate-400 font-medium">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Clock size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Time (Manual)</h3>
            <p className="text-4xl font-extrabold text-slate-800">
              {avgManual ? `${avgManual.toFixed(1)}s` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-2">from {manualMetric?._count?._all || 0} prescriptions</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-emerald-50 text-clinic-emerald rounded-full flex items-center justify-center mb-4">
              <Zap size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Time (Templates)</h3>
            <p className="text-4xl font-extrabold text-clinic-emeraldDark">
              {avgTemplate ? `${avgTemplate.toFixed(1)}s` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-2">from {templateMetric?._count?._all || 0} prescriptions</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Activity size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tracked</h3>
            <p className="text-4xl font-extrabold text-slate-800">{totalCount}</p>
            <p className="text-sm text-gray-500 mt-2">prescriptions with speed data</p>
          </div>

        </div>
      )}

      {/* Recent Prescriptions Table */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-slate-800">Recent Prescription Workflows</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Time Taken</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No tracked prescriptions yet.</td>
                </tr>
              )}
              {recent.map((rx: any) => (
                <tr key={rx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{rx.patient?.name || 'Unknown Patient'}</td>
                  <td className="px-6 py-4">
                    {rx.creationMethod === 'TEMPLATE' ? (
                      <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-bold flex w-fit items-center"><Zap size={12} className="mr-1"/> Template</span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">{rx.timeTakenSeconds}s</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(rx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
