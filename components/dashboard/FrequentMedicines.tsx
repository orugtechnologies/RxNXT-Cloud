'use client';

import { FrequentMedicine } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Pill, TrendingUp } from 'lucide-react';

export default function FrequentMedicines({ medicines }: { medicines: FrequentMedicine[] }) {
  return (
    <Card className="shadow-soft border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-clinic-blue" />
            Frequent Medicines
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {medicines.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <Pill className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-700">No data yet</p>
            <p className="text-sm">Start prescribing to see insights.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {medicines.map((med, i) => (
              <div key={med.medicine_id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs shrink-0">
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{med.medicine_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {[med.dosage_form, med.strength, med.route].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-4 flex flex-col items-end">
                  <span className="text-sm font-bold text-clinic-blue">{med.prescription_count}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">times</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
