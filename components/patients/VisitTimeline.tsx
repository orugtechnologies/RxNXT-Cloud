'use client';

import { useState } from 'react';
import { EncounterWithMedicines } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Copy, CalendarDays, User, FileText, Pill } from 'lucide-react';
import { formatDate, relativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function VisitTimeline({ 
  encounters, 
  onClone 
}: { 
  encounters: EncounterWithMedicines[];
  onClone: (prescriptionId: string) => void;
}) {
  const [expandedEncounter, setExpandedEncounter] = useState<string | null>(
    encounters.length > 0 ? encounters[0].id : null
  );

  const toggleExpand = (id: string) => {
    setExpandedEncounter(prev => prev === id ? null : id);
  };

  if (encounters.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center flex flex-col items-center">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No visits recorded</h3>
        <p className="text-slate-500 mt-2">Create a new prescription to start this patient's history.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8 pb-8 mt-6">
      {encounters.map((enc, index) => {
        const isRecent = index === 0;
        const isExpanded = expandedEncounter === enc.id;
        
        return (
          <div key={enc.id} className="relative">
            {/* Timeline Dot */}
            <div className={cn(
              "absolute -left-[35px] h-5 w-5 rounded-full border-4 border-white shadow-sm",
              isRecent ? "bg-clinic-emerald" : "bg-slate-300"
            )} />
            
            <Card className={cn(
              "transition-all duration-300 shadow-sm border",
              isExpanded ? "border-clinic-blue/30 shadow-md ring-1 ring-clinic-blue/10" : "border-slate-200 hover:border-slate-300 hover:shadow"
            )}>
              {/* Header / Summary (Always visible) */}
              <div 
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => toggleExpand(enc.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-slate-900">{formatDate(enc.created_at)}</span>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">
                      {relativeTime(enc.created_at)}
                    </Badge>
                  </div>
                  
                  {enc.chief_complaint ? (
                    <p className="text-slate-800 font-medium mb-1 line-clamp-1">{enc.chief_complaint}</p>
                  ) : (
                    <p className="text-slate-400 italic mb-1">No chief complaint recorded</p>
                  )}
                  
                  {enc.diagnosis && (
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-clinic-blue"></span>
                      {enc.diagnosis}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 mb-1">
                      <Pill className="h-3 w-3 mr-1" /> {enc.medicines?.length || 0} Meds
                    </Badge>
                    <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                      <User className="h-3 w-3" /> Dr. {enc.doctor_name || 'Doctor'}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 animate-accordion-down">
                  {enc.notes && (
                    <div className="mb-4 text-sm text-slate-700 bg-white p-3 rounded-md border border-slate-100">
                      <strong>Notes:</strong> {enc.notes}
                    </div>
                  )}
                  
                  {enc.medicines && enc.medicines.length > 0 && (
                    <div className="space-y-3 mb-5">
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        Prescribed Medicines
                      </h4>
                      <div className="grid gap-2">
                        {enc.medicines.map((med, idx) => (
                          <div key={med.id || idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-clinic-blue">
                                {med.medicine_name} 
                                {med.strength && <span className="font-normal text-slate-500 ml-1">{med.strength}</span>}
                              </p>
                              <p className="text-xs text-slate-500">
                                {[med.dosage_form, med.route].filter(Boolean).join(' • ')}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded text-right whitespace-nowrap">
                              {med.frequency} × {med.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200">
                    {enc.follow_up_date ? (
                      <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md font-medium">
                        <CalendarDays className="h-4 w-4" />
                        Follow-up: {formatDate(enc.follow_up_date)}
                      </div>
                    ) : (
                      <div></div> // empty spacer
                    )}
                    
                    {enc.prescription_id && (
                      <Button 
                        size="sm" 
                        onClick={() => onClone(enc.prescription_id!)}
                        className="w-full sm:w-auto shadow-sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Clone Prescription
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
