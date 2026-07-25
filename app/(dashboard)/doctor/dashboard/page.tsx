'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import DoctorQueue from '@/components/dashboard/DoctorQueue';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import PatientHistoryModal from '@/components/patients/PatientHistoryModal';
import { Loader2, Search, History, Stethoscope, Sparkles, X, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard();
  const { profile, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFlash, setShowFlash] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Navigate directly to Clinical Workspace with selected patient
  const handleStartConsultation = (patientId: string) => {
    router.push(`/doctor/prescription?patientId=${patientId}`);
  };

  const handlePatientSelectFromSearch = (patient: Patient) => {
    // Open clinical workspace immediately for the searched patient
    handleStartConsultation(patient.id);
  };

  if (showFlash) {
    return (
      <div className="fixed inset-0 z-[100] bg-blue-50 flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="mb-8 animate-pulse text-clinic-blue">
          <Stethoscope size={120} strokeWidth={2} />
        </div>
        <h1 className="text-clinic-navy text-3xl md:text-5xl font-bold animate-pulse text-center max-w-4xl leading-tight">
          Hello Doctor, Welcome to another day of saving Lives
        </h1>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-[65vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-clinic-emerald" />
          <p className="text-slate-500 font-medium animate-pulse text-sm">Loading Doctor's Command Center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-10 shadow-sm">
        <h3 className="text-lg font-bold mb-2">Error Loading Dashboard</h3>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={() => refresh()}
          className="bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <RefreshCw size={14} className="mr-1.5" /> Retry Loading
        </button>
      </div>
    );
  }

  const doctorName = profile?.full_name || user?.email || 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const queueList = data.todayQueue || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#2563eb] to-[#0ea5e9] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-clinic-emerald backdrop-blur-md mb-2">
              <Sparkles size={14} /> Doctor Command Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {greeting}, <span className="text-clinic-emerald">Dr. {doctorName.replace(/^Dr\.\s*/i, '')}</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-medium">
              {formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 self-start sm:self-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-100">
              {queueList.length} {queueList.length === 1 ? 'Patient' : 'Patients'} Waiting in Queue
            </span>
            <button
              onClick={() => refresh()}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Core Action Buttons (No manual Add Patient needed - Reception registers patients) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Open Clinical Workspace */}
        <button
          onClick={() => router.push('/doctor/prescription')}
          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md bg-gradient-to-br from-[#10b981] via-[#059669] to-[#0f172a] text-white"
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md group-hover:bg-white/30 transition-colors">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">Clinical Workspace</span>
              <h3 className="text-xl font-extrabold text-white">Start Consultation</h3>
              <p className="text-white/80 text-xs font-medium mt-1">Open digital prescription workspace</p>
            </div>
          </div>
        </button>

        {/* Action 2: Search Patient */}
        <button
          onClick={() => setShowSearchDrawer(!showSearchDrawer)}
          className={cn(
            "group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md text-white",
            showSearchDrawer
              ? "bg-gradient-to-br from-[#1d4ed8] to-[#0f172a] ring-2 ring-[#0ea5e9]"
              : "bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0f172a]"
          )}
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md group-hover:bg-white/30 transition-colors">
              <Search className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block mb-0.5">Patient Directory</span>
              <h3 className="text-xl font-extrabold text-white">Search Patient</h3>
              <p className="text-white/80 text-xs font-medium mt-1">Find registered patient & launch Rx</p>
            </div>
          </div>
        </button>

        {/* Action 3: View History */}
        <button
          onClick={() => setShowSearchDrawer(true)}
          className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-md bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0f172a] text-white"
        >
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 transition-transform group-hover:scale-150 duration-500" />
          <div className="relative z-10 flex items-center space-x-4">
            <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md group-hover:bg-white/30 transition-colors">
              <History className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200 block mb-0.5">Medical Records</span>
              <h3 className="text-xl font-extrabold text-white">View History</h3>
              <p className="text-white/80 text-xs font-medium mt-1">Inspect past visit timelines & clone Rx</p>
            </div>
          </div>
        </button>
      </div>

      {/* Expandable Patient Search Quick Drawer */}
      {showSearchDrawer && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200/90 relative animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 text-clinic-blue rounded-xl font-bold">
                <Search size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">Search Patient Directory</h3>
                <p className="text-xs text-slate-500">Search by mobile number or name to launch consultation immediately</p>
              </div>
            </div>
            <button
              onClick={() => setShowSearchDrawer(false)}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <PatientSearchUI
            onSelect={handlePatientSelectFromSearch}
            onAddNew={() => {
              // Redirect to search or show receptionist notice
              alert('Patients are registered by the Reception staff upon arrival.');
            }}
          />
        </div>
      )}

      {/* Main Focus Section: Patients Queue */}
      <div className="pt-2">
        <DoctorQueue
          queue={queueList}
          onViewHistory={(patientId) => setHistoryPatientId(patientId)}
          onSearchPatient={() => setShowSearchDrawer(true)}
        />
      </div>

      {/* Patient History Modal Overlay */}
      {historyPatientId && (
        <PatientHistoryModal
          patientId={historyPatientId}
          onClose={() => setHistoryPatientId(null)}
          onStartConsultation={handleStartConsultation}
        />
      )}
    </div>
  );
}
