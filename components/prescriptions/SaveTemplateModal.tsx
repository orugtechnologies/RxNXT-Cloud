'use client';

import React, { useState } from 'react';
import { X, Layers, Activity } from 'lucide-react';
import { PrescribedMedicine } from './PrescriptionCart';

export default function SaveTemplateModal({ 
  medicines, 
  onClose, 
  onSuccess 
}: { 
  medicines: PrescribedMedicine[], 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/templates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, medicines })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save template');
      }
      
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error saving template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        <div className="bg-clinic-navy px-6 py-4 flex justify-between items-center border-b border-clinic-border">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Layers size={20} className="mr-2 text-clinic-emerald" />
            Save as Treatment Group
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
            <p className="text-sm text-clinic-navy font-medium">
              You are saving a group containing <span className="font-bold text-clinic-emeraldDark">{medicines.length} medicine(s)</span>.
              <br/>This will instantly load their exact dosages, frequencies, and instructions next time!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Template Name</label>
            <input 
              required 
              type="text" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g. Viral Fever Protocol, Hypertension Starter" 
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all" 
              autoFocus
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={loading || !name.trim()} 
              type="submit" 
              className="w-2/3 bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Activity className="animate-pulse mr-2" size={20}/> Saving...</>
              ) : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
