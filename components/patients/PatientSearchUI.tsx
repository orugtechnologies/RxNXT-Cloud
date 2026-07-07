'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, UserPlus, Users } from 'lucide-react';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
}

export default function PatientSearchUI({ onSelect, onAddNew }: { onSelect: (p: Patient) => void, onAddNew: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const fetchPatients = async () => {
      setLoading(true);
      if (abortRef.current) abortRef.current.abort();
      
      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const res = await fetch(`/api/patients?q=${encodeURIComponent(query)}`, { signal: abortController.signal });
        const { data } = await res.json();
        setResults(data || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally {
        if (abortRef.current === abortController) setLoading(false);
      }
    };

    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center group">
        <Search className="absolute left-4 text-gray-400 group-focus-within:text-clinic-emerald transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by Mobile Number (Recommended) or Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-all shadow-sm"
        />
        {loading && <Loader2 className="absolute right-4 animate-spin text-clinic-emerald" size={20} />}
      </div>
      
      {(query.length >= 3 || results.length > 0) && (
        <ul className="absolute z-20 w-full mt-2 bg-white border border-clinic-border rounded-lg shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {results.length > 0 ? (
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/80">Matching Patients</div>
          ) : null}
          
          {results.map(p => (
            <li key={p.id} onClick={() => { onSelect(p); setQuery(''); setResults([]); }} className="p-4 hover:bg-clinic-emerald/5 cursor-pointer border-b border-gray-50 flex items-center group transition-colors">
              <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold mr-4 group-hover:bg-clinic-emerald group-hover:text-white transition-colors">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-clinic-navy text-base">{p.name}</p>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="font-bold text-clinic-emerald bg-clinic-emerald/10 px-1.5 py-0.5 rounded">{p.phone}</span> 
                  <span>• {p.age}y • {p.gender}</span>
                </p>
              </div>
            </li>
          ))}
          <li onClick={() => onAddNew(query)} className="p-4 bg-gray-50 hover:bg-clinic-emerald/10 cursor-pointer text-clinic-emerald flex items-center font-bold border-t border-gray-100 transition-colors">
            <UserPlus size={18} className="mr-3" /> Add New Patient "{query}"
          </li>
        </ul>
      )}
      
      {query.length === 0 && (
        <div className="mt-8 text-center text-gray-400 flex flex-col items-center justify-center py-6">
          <Users size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">Search for an existing patient<br/>or add a new one to begin.</p>
        </div>
      )}
    </div>
  );
}
