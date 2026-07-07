'use client';

import React, { useState } from 'react';
import { Layers, FolderOpen } from 'lucide-react';
import { PrescribedMedicine } from './PrescriptionCart';
import QuickTreatmentGroupsPanel from './QuickTreatmentGroupsPanel';

export interface TreatmentGroup {
  id: string;
  name: string;
  items: any[];
}

export default function TreatmentGroupsUI({ onLoadTemplate }: { onLoadTemplate: (medicines: PrescribedMedicine[]) => void }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Layers size={16} className="text-clinic-emerald mr-2" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Treatment Groups</h3>
        </div>
      </div>
      
      <div className="flex">
        <button
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center bg-white border border-clinic-emerald/30 hover:border-clinic-emerald text-clinic-navy hover:text-clinic-emeraldDark px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all group text-sm font-semibold w-full sm:w-auto"
        >
          <FolderOpen size={16} className="mr-2 text-clinic-emerald group-hover:text-clinic-emeraldDark transition-colors" />
          Browse Quick Treatment Groups
        </button>
      </div>

      <QuickTreatmentGroupsPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        onLoadTemplate={onLoadTemplate} 
      />
    </div>
  );
}
