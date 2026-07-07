'use client';

import React, { useState, useEffect } from 'react';
import { Patient } from './PatientSearchUI';
import { X, UserPlus, Activity } from 'lucide-react';

export default function AddPatientModal({ onClose, onSuccess, initialQuery = '' }: { onClose: () => void, onSuccess: (p: Patient) => void, initialQuery?: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      if (/\d/.test(initialQuery)) {
        setPhone(initialQuery.replace(/\D/g, ''));
      } else {
        setName(initialQuery);
      }
    }
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, age, gender })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create patient');
      const { data } = json;
      onSuccess(data);
    } catch (err) {
      console.error(err);
      alert("Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        <div className="bg-clinic-navy px-6 py-4 flex justify-between items-center border-b border-clinic-border">
          <h2 className="text-lg font-bold text-white flex items-center">
            <UserPlus size={20} className="mr-2 text-clinic-emerald" />
            Patient Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Mobile Number (Mandatory)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-500 font-medium text-sm">+91</span>
              <input 
                required 
                type="tel" 
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                placeholder="10-digit number" 
                autoFocus={!phone}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 pl-12 pr-3 text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Patient Name</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g. Rahul Sharma" 
              autoFocus={!!phone}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Age</label>
              <input required type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="Years" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Gender</label>
              <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="pt-4">
            <button disabled={loading} type="submit" className="w-full bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <><Activity className="animate-pulse mr-2" size={20}/> Saving...</>
              ) : 'Save Patient Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
