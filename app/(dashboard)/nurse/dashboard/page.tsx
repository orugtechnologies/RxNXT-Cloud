'use client';

import React, { useState } from 'react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import { Stethoscope } from 'lucide-react';

export default function NurseDashboard() {
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  const handlePatientSelect = (patient: Patient) => {
    // In a full implementation, this would open a Vitals Entry Modal
    setLastSelected(`Selected: ${patient.name} - Vitals tracking coming soon!`);
    setTimeout(() => setLastSelected(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <Stethoscope className="text-pink-500 mr-3" size={32} strokeWidth={2.5} />
          Nurse Dashboard
        </h1>
        <p className="text-slate-500 mt-2 ml-11 text-sm font-medium">
          Search for patients to record preliminary vitals before their consultation.
        </p>
      </div>

      {lastSelected && (
        <div className="bg-pink-50 border border-pink-200 text-pink-700 p-4 rounded-lg font-medium text-center">
          {lastSelected}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
        <PatientSearchUI 
          onSelect={handlePatientSelect} 
          onAddNew={() => {}} // Nurses typically don't register, they just search
        />
      </div>
    </div>
  );
}
