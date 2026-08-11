'use client';

import React from 'react';
import { usePatientHistory } from '@/hooks/usePatientHistory';
import VisitTimeline from '@/components/patients/VisitTimeline';
import AIPatientSummaryCard from '@/components/patients/AIPatientSummaryCard';
import { X, User, Stethoscope, Loader2, AlertCircle, Calendar, Phone, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientHistoryModal({
  patientId,
  onClose,
  onStartConsultation,
}: {
  patientId: string;
  onClose: () => void;
  onStartConsultation?: (patientId: string) => void;
}) {
  const { patient, encounters, isLoading, error } = usePatientHistory(patientId);
  const router = useRouter();

  const handleClone = (prescriptionId: string) => {
    onClose();
    router.push(`/doctor/prescription?clone=${prescriptionId}&patient=${patientId}`);
  };

  const handleConsult = () => {
    onClose();
    if (onStartConsultation) {
      onStartConsultation(patientId);
    } else {
      router.push(`/doctor/prescription?patientId=${patientId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-clinic-emerald/20 text-clinic-emerald flex items-center justify-center font-bold text-lg border border-clinic-emerald/30">
              {patient?.name ? patient.name.charAt(0).toUpperCase() : <User size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {patient?.name || 'Patient History'}
                {patient && (
                  <span className="text-xs font-normal text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                    {patient.age} yrs • {patient.gender}
                  </span>
                )}
              </h2>
              {patient?.phone && (
                <p className="text-xs text-slate-300 flex items-center mt-0.5">
                  <Phone size={12} className="mr-1 text-clinic-emerald" /> {patient.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {patient && (
              <button
                onClick={handleConsult}
                className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center shadow-sm"
              >
                <Stethoscope size={15} className="mr-1.5" /> Consult Now
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <AIPatientSummaryCard patientId={patientId} />
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-clinic-emerald" />
              <p className="text-sm text-slate-500 font-medium">Fetching medical history...</p>
            </div>
          ) : error || !patient ? (
            <div className="bg-red-50 p-6 rounded-xl text-center border border-red-100 my-4">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">Unable to load record</h3>
              <p className="text-xs text-slate-600 mt-1">{error || 'Patient history could not be retrieved.'}</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                  <Calendar size={16} className="mr-2 text-clinic-blue" /> Past Encounters ({encounters.length})
                </h3>
                <span className="text-xs text-slate-500 font-medium">Click any visit to expand details or clone prescription</span>
              </div>
              <VisitTimeline encounters={encounters} onClone={handleClone} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
