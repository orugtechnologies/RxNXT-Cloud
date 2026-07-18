'use client';

import React, { useState } from 'react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import AddPatientModal from '@/components/patients/AddPatientModal';
import AssignDoctorModal from '@/components/patients/AssignDoctorModal';
import { PhoneCall } from 'lucide-react';

export default function ReceptionistDashboard() {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientToAssign, setPatientToAssign] = useState<Patient | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const handlePatientSelect = (patient: Patient) => {
    setPatientToAssign(patient);
  };

  const handlePatientAdded = (patient: Patient) => {
    setShowAddPatient(false);
    setPatientToAssign(patient);
  };

  const handleAssignmentSuccess = (message: string) => {
    setPatientToAssign(null);
    setLastAdded(message);
    setTimeout(() => setLastAdded(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <PhoneCall className="text-blue-500 mr-3" size={32} strokeWidth={2.5} />
          Front Desk Dashboard
        </h1>
        <p className="text-slate-500 mt-2 ml-11 text-sm font-medium">
          Register new walk-in patients or search the existing directory.
        </p>
      </div>

      {lastAdded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg font-medium text-center">
          {lastAdded}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
        <PatientSearchUI 
          onSelect={handlePatientSelect} 
          onAddNew={() => setShowAddPatient(true)} 
        />
      </div>

      {showAddPatient && (
        <AddPatientModal 
          onClose={() => setShowAddPatient(false)} 
          onSuccess={handlePatientAdded} 
        />
      )}

      {patientToAssign && (
        <AssignDoctorModal
          patient={patientToAssign}
          onClose={() => setPatientToAssign(null)}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
}
