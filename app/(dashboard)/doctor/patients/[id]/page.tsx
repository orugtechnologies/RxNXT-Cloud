'use client';

import { useState } from 'react';
import { usePatientHistory } from '@/hooks/usePatientHistory';
import PatientProfile from '@/components/patients/PatientProfile';
import VisitTimeline from '@/components/patients/VisitTimeline';
import PrescriptionHistoryTable from '@/components/patients/PrescriptionHistoryTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patientId = params.id;
  const { patient, encounters, isLoading, error } = usePatientHistory(patientId);
  const [activeTab, setActiveTab] = useState<'visits' | 'medicines'>('visits');
  const router = useRouter();

  const handleClone = (prescriptionId: string) => {
    router.push(`/doctor/prescription?clone=${prescriptionId}&patient=${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-clinic-emerald" />
        <p className="text-slate-500">Loading patient record...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 p-8 rounded-xl text-center max-w-md mx-auto mt-10 border border-red-100">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Not Found</h3>
        <p className="text-slate-600 mb-6">{error || "The patient record you're looking for doesn't exist or you don't have access."}</p>
        <Button asChild>
          <Link href="/doctor/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-slate-900 rounded-full h-10 w-10">
          <Link href="/doctor/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-slate-800">Patient Record</h1>
      </div>

      <PatientProfile patient={patient} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            className={cn(
              "px-6 py-4 text-sm font-semibold transition-colors relative",
              activeTab === 'visits' ? "text-clinic-blue" : "text-slate-500 hover:text-slate-700 bg-slate-50/50"
            )}
            onClick={() => setActiveTab('visits')}
          >
            Visit Timeline
            {activeTab === 'visits' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinic-blue" />
            )}
          </button>
          <button
            className={cn(
              "px-6 py-4 text-sm font-semibold transition-colors relative",
              activeTab === 'medicines' ? "text-clinic-blue" : "text-slate-500 hover:text-slate-700 bg-slate-50/50"
            )}
            onClick={() => setActiveTab('medicines')}
          >
            All Medicines
            {activeTab === 'medicines' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-clinic-blue" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'visits' ? (
            <VisitTimeline encounters={encounters} onClone={handleClone} />
          ) : (
            <PrescriptionHistoryTable encounters={encounters} />
          )}
        </div>
      </div>
    </div>
  );
}
