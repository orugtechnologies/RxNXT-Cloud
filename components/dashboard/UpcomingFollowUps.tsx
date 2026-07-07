'use client';

import { UpcomingFollowUp } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function UpcomingFollowUps({ followUps }: { followUps: UpcomingFollowUp[] }) {
  return (
    <Card className="shadow-soft border-slate-200 mb-6">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" />
            Follow-ups Due
          </CardTitle>
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            {followUps.length} upcoming
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {followUps.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            <Clock className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-slate-700">No follow-ups scheduled</p>
            <p className="text-sm">for the next 7 days.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {followUps.map((fu) => {
              const daysBadge = fu.days_until === 0 
                ? <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded animate-pulse-soft">Today</span>
                : fu.days_until === 1
                ? <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Tomorrow</span>
                : <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">In {fu.days_until} days</span>;

              return (
                <Link 
                  href={`/doctor/patients/${fu.patient_id}`}
                  key={fu.encounter_id} 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{fu.patient_name}</p>
                      {daysBadge}
                    </div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                      <span>{formatDate(fu.follow_up_date)}</span>
                      {fu.diagnosis && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="truncate">{fu.diagnosis}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-clinic-blue transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
