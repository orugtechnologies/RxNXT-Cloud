'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, AlertCircle, Pill } from 'lucide-react';

interface MedicineSearchResult {
  brand_id?: string;
  generic_id?: string;
  brand_name?: string;
  generic_name: string;
  dosage_form?: string;
  dosage_form_id?: string;
  strength?: string;
  strength_id?: string;
  route?: string;
  route_id?: string;
  route_id?: string;
  match_score: number;
  popularity?: number;
}

interface DrugSearchUIProps {
  onSelect: (medicine: MedicineSearchResult) => void;
}

export default function DrugSearchUI({ onSelect }: DrugSearchUIProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MedicineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLowConfidence, setIsLowConfidence] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchResults = async (searchTerm: string) => {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const params = new URLSearchParams({ q: searchTerm });
        const response = await fetch(`/api/drugs/search?${params.toString()}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }

        const { data, metadata } = await response.json();
        setResults(data || []);
        setIsLowConfidence(metadata?.isLowConfidence || false);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stale request aborted');
        } else {
          console.error(err);
          setError('Unable to fetch medicines at this time.');
          setResults([]);
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchResults(query.trim());
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return (
    <div className="w-full relative">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-clinic-emerald transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for medicines (e.g. Dolo, Paracetamol)..."
          className="w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none text-gray-900 transition-all text-sm"
        />
        {loading && (
          <div className="absolute right-4 top-4 text-clinic-emerald">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        )}
      </div>

      {error && (
        <div className="absolute z-10 w-full mt-2 bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex items-center shadow-md animate-in fade-in">
          <AlertCircle size={18} className="mr-2" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!loading && !error && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 p-6 text-center rounded-lg shadow-xl text-gray-500 animate-in fade-in flex flex-col items-center">
          <Pill size={32} className="text-gray-300 mb-2" />
          <p className="text-sm">No medicines found matching "<span className="font-semibold text-gray-700">{query}</span>"</p>
        </div>
      )}

      {results.length > 0 && !error && (
        <ul className="absolute z-20 w-full mt-2 bg-white border border-clinic-border rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2">
          {isLowConfidence ? (
            <div className="px-4 py-3 text-sm font-bold text-amber-700 uppercase tracking-wider border-b border-amber-200 bg-amber-50">Did you mean?</div>
          ) : (
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/80">Search Results</div>
          )}
          {results.map((result, idx) => {
            const keyId = result.brand_id || result.generic_id || `idx-${idx}`;
            return (
              <li
                key={keyId}
                onClick={() => {
                  onSelect(result);
                  setQuery('');
                  setResults([]);
                }}
                className="p-4 hover:bg-clinic-emerald/5 cursor-pointer flex justify-between items-start transition-colors border-b border-gray-50 group"
              >
                <div>
                  <p className="font-bold text-clinic-navy text-base group-hover:text-clinic-emerald transition-colors">
                    {result.brand_name ? result.brand_name : result.generic_name}
                  </p>
                  <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                    {result.brand_name ? `Generic: ${result.generic_name}` : 'Generic'}
                  </p>
                  {(result.dosage_form || result.strength) && (
                    <div className="flex gap-2 mt-2.5">
                      {result.dosage_form && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase rounded border border-gray-200">
                          {result.dosage_form}
                        </span>
                      )}
                      {result.strength && (
                        <span className="px-2 py-0.5 bg-clinic-emerald/10 text-clinic-emeraldDark text-[11px] font-bold uppercase rounded border border-clinic-emerald/20">
                          {result.strength}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {(result.popularity !== undefined && result.popularity >= 10) && (
                    <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded uppercase border border-yellow-200 flex items-center shadow-sm">
                      ★ Favorite
                    </span>
                  )}
                  {(result.popularity !== undefined && result.popularity > 0 && result.popularity < 10) && (
                    <span className="text-[10px] font-bold text-clinic-emerald bg-clinic-emerald/10 px-2 py-0.5 rounded uppercase border border-clinic-emerald/20 flex items-center shadow-sm">
                      ✓ Preferred
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
