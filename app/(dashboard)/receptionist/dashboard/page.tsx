'use client';

import React, { useState } from 'react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import AddPatientModal from '@/components/patients/AddPatientModal';
import AssignDoctorModal from '@/components/patients/AssignDoctorModal';
import ClinicQueue from '@/components/receptionist/ClinicQueue';
import { PhoneCall, UserPlus, RefreshCw } from 'lucide-react';

export default function ReceptionistDashboard() {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [patientToAssign, setPatientToAssign] = useState<Patient | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handlePatientSelect = (patient: Patient) => {
    setPatientToAssign(patient);
  };

  const handlePatientAdded = (patient: Patient) => {
    setShowAddPatient(false);
    setInitialQuery('');
    setResetKey(prev => prev + 1);
    setPatientToAssign(patient);
  };

  const handleAssignmentSuccess = (message: string) => {
    setPatientToAssign(null);
    setInitialQuery('');
    setResetKey(prev => prev + 1);
    setLastAdded(message);
    setTimeout(() => setLastAdded(null), 5000);
  };

  const handleResetSearch = () => {
    setInitialQuery('');
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <PhoneCall className="text-[#2563eb] mr-3" size={32} strokeWidth={2.5} />
            Front Desk Dashboard
          </h1>
          <p className="text-slate-500 mt-2 ml-11 text-sm font-medium">
            Register new walk-in patients or search the existing directory.
          </p>
        </div>

        <button
          onClick={() => {
            setInitialQuery('');
            setShowAddPatient(true);
          }}
          className="bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <UserPlus size={18} />
          <span>Register New Patient</span>
        </button>
      </div>

      {lastAdded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl font-bold text-center shadow-sm flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <span>✅</span>
          <span>{lastAdded}</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200/90 relative">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patient Lookup & Registration</span>
          <button
            onClick={handleResetSearch}
            className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors bg-blue-50 px-2.5 py-1 rounded-md"
            title="Clear and reset search field"
          >
            <RefreshCw size={12} />
            <span>Reset Field</span>
          </button>
        </div>

        <PatientSearchUI 
          clearTrigger={resetKey}
          onSelect={handlePatientSelect} 
          onAddNew={(query) => {
            setInitialQuery(query);
            setShowAddPatient(true);
          }} 
        />
      </div>

      <ClinicQueue refreshTrigger={resetKey} />

      {showAddPatient && (
        <AddPatientModal 
          initialQuery={initialQuery}
          onClose={() => {
            setShowAddPatient(false);
            setInitialQuery('');
            setResetKey(prev => prev + 1);
          }} 
          onSuccess={handlePatientAdded} 
        />
      )}

      {patientToAssign && (
        <AssignDoctorModal
          patient={patientToAssign}
          onClose={() => {
            setPatientToAssign(null);
            setInitialQuery('');
            setResetKey(prev => prev + 1);
          }}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
}
