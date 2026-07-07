'use client';

import { useState, useEffect } from 'react';
import { PatientHistoryResponse } from '@/types/api';

export function usePatientHistory(patientId: string) {
  const [data, setData] = useState<PatientHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    let mounted = true;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch patient history');
        }
        const json = await res.json();
        if (mounted) {
          setData(json);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [patientId]);

  return { 
    patient: data?.patient, 
    encounters: data?.encounters || [], 
    isLoading, 
    error 
  };
}
