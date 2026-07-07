'use client';

import { useState } from 'react';
import { PrescriptionMedicineWithName } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Edit, X } from 'lucide-react';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useRouter } from 'next/navigation';

interface ClonePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  medicines: PrescriptionMedicineWithName[];
  onCloneSuccess: (newPrescriptionId: string) => void;
}

export default function ClonePrescriptionModal({
  isOpen,
  onClose,
  prescriptionId,
  patientId,
  patientName,
  medicines,
  onCloneSuccess
}: ClonePrescriptionModalProps) {
  const [selectedMeds, setSelectedMeds] = useState<Set<string>>(
    new Set(medicines.map(m => m.id))
  );
  const { clonePrescription, isLoading, error } = usePrescriptions();
  const router = useRouter();

  if (!isOpen) return null;

  const handleToggleMed = (id: string) => {
    const next = new Set(selectedMeds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMeds(next);
  };

  const handleCloneExact = async () => {
    try {
      // If all medicines selected, use exact clone RPC
      if (selectedMeds.size === medicines.length) {
        const result = await clonePrescription({
          sourcePrescriptionId: prescriptionId,
          targetPatientId: patientId
        });
        onCloneSuccess(result.prescription_id);
      } else {
        // Otherwise, pass only selected medicines
        const filteredMeds = medicines.filter(m => selectedMeds.has(m.id));
        const result = await clonePrescription({
          sourcePrescriptionId: prescriptionId,
          targetPatientId: patientId,
          medicines: filteredMeds as any // Type matches subset
        });
        onCloneSuccess(result.prescription_id);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCloneAndEdit = () => {
    // Navigate to prescription page with clone parameter
    // The prescription page will need to fetch the clone source and populate its state
    router.push(`/doctor/prescription?clone=${prescriptionId}&patient=${patientId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-0">
        <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Clone Prescription</CardTitle>
            <p className="text-sm text-slate-500 mt-1">For {patientName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        
        <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex justify-between items-center">
            <span>Select Medicines to Include</span>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {selectedMeds.size} of {medicines.length} selected
            </Badge>
          </h4>
          
          <div className="space-y-2">
            {medicines.map((med) => {
              const isSelected = selectedMeds.has(med.id);
              return (
                <div 
                  key={med.id}
                  onClick={() => handleToggleMed(med.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-clinic-blue bg-blue-50/30 shadow-sm' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-clinic-blue border-clinic-blue' : 'border-slate-300'
                  }`}>
                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                      {med.medicine_name} {med.strength}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {med.frequency} × {med.duration} • {med.instructions || 'No specific instructions'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="w-full sm:w-1/2" 
            onClick={handleCloneAndEdit}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-2" /> Clone & Edit
          </Button>
          <Button 
            className="w-full sm:w-1/2" 
            onClick={handleCloneExact}
            disabled={isLoading || selectedMeds.size === 0}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Clone Exact ({selectedMeds.size})
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
