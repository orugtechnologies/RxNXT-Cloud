'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from './PatientSearchUI';
import { X, UserCheck, Activity, Stethoscope } from 'lucide-react';

export default function AssignDoctorModal({ 
  patient, 
  onClose, 
  onSuccess 
}: { 
  patient: Patient, 
  onClose: () => void, 
  onSuccess: (message: string) => void 
}) {
  const [doctors, setDoctors] = useState<{id: string, fullName: string, specialization: string | null}[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/clinic/doctors');
        if (res.ok) {
          const json = await res.json();
          setDoctors(json.doctors || []);
          if (json.doctors && json.doctors.length > 0) {
            setSelectedDoctorId(json.doctors[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch doctors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      alert('Please select a doctor');
      return;
    }
    setAssigning(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, doctorId: selectedDoctorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to assign patient');
      
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      onSuccess(`Successfully assigned ${patient.name} to ${doctor?.fullName || 'Doctor'}`);
    } catch (err) {
      console.error(err);
      alert("Failed to assign patient");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        <div className="bg-clinic-navy px-6 py-4 flex justify-between items-center border-b border-clinic-border">
          <h2 className="text-lg font-bold text-white flex items-center">
            <UserCheck size={20} className="mr-2 text-clinic-emerald" />
            Assign to Doctor
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Patient:</strong> {patient.name} {patient.phone ? `(${patient.phone})` : ''}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Available Doctors</label>
            {loading ? (
              <div className="flex items-center text-sm text-gray-500">
                <Activity className="animate-pulse mr-2" size={16}/> Loading doctors...
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                No active doctors found in the clinic.
              </div>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {doctors.map(doc => (
                  <label 
                    key={doc.id} 
                    className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDoctorId === doc.id 
                        ? 'border-clinic-emerald bg-emerald-50' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="doctor" 
                      value={doc.id} 
                      checked={selectedDoctorId === doc.id} 
                      onChange={() => setSelectedDoctorId(doc.id)} 
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      selectedDoctorId === doc.id ? 'border-clinic-emerald bg-clinic-emerald' : 'border-gray-300'
                    }`}>
                      {selectedDoctorId === doc.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 flex items-center">
                        <Stethoscope size={16} className="mr-1.5 text-gray-400" />
                        {doc.fullName}
                      </div>
                      {doc.specialization && (
                        <div className="text-xs text-gray-500 ml-5">{doc.specialization}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button 
              disabled={assigning || doctors.length === 0 || !selectedDoctorId} 
              type="submit" 
              className="w-full bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {assigning ? (
                <><Activity className="animate-pulse mr-2" size={20}/> Assigning...</>
              ) : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
