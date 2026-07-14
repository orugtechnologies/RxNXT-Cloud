'use client';

import React, { useState } from 'react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import AddPatientModal from '@/components/patients/AddPatientModal';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function PatientsPage() {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const router = useRouter();

  const handlePatientSelect = (patient: Patient) => {
    router.push(`/doctor/patients/${patient.id}`);
  };

  const handlePatientAdded = (patient: Patient) => {
    setShowAddPatient(false);
    router.push(`/doctor/patients/${patient.id}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Users className="text-clinic-emerald mr-3" size={32} strokeWidth={2.5} />
          Patient Directory
          <InfoTooltip text="Your complete patient database. Click on any patient to view their full medical history, past prescriptions, and recorded vitals." />
        </h1>
        <p className="text-slate-500 mt-2 ml-11 text-sm font-medium">
          Search for existing patients or register a new one to view their complete clinical history.
        </p>
      </div>

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
    </div>
  );
}
