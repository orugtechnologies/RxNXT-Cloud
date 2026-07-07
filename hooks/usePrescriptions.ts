'use client';

import { useState } from 'react';
import { ClonePrescriptionRequest, ClonePrescriptionResponse, PrescriptionListResponse } from '@/types/api';

export function usePrescriptions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clonePrescription = async (request: ClonePrescriptionRequest): Promise<ClonePrescriptionResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prescriptions/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to clone prescription');
      }
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const listPrescriptions = async (page = 1, limit = 20, patientId?: string): Promise<PrescriptionListResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      let url = `/api/prescriptions?page=${page}&limit=${limit}`;
      if (patientId) url += `&patientId=${patientId}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch prescriptions');
      }
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { clonePrescription, listPrescriptions, isLoading, error };
}
