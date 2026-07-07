'use client';

import { RecentPrescription } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Copy, Eye, FileDigit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { relativeTime, capitalize } from '@/lib/utils';

interface RecentPrescriptionsProps {
  prescriptions: RecentPrescription[];
  onClone: (id: string, patientId: string) => void;
}

export default function RecentPrescriptions({ prescriptions, onClone }: RecentPrescriptionsProps) {
  return (
    <Card className="shadow-soft h-full border-slate-200" id="recent">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-clinic-emerald" />
            Recent Prescriptions
          </CardTitle>
          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href="/doctor/prescriptions">View All</Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {prescriptions.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500 h-[300px]">
            <FileDigit className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">No prescriptions yet</p>
            <p className="text-sm">Create your first prescription to see it here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Meds</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx) => (
                <TableRow key={rx.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {rx.patient_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-slate-800 font-semibold">{capitalize(rx.patient_name)}</div>
                        <div className="text-xs text-slate-500">
                          {rx.patient_age ? `${rx.patient_age} yrs` : ''} 
                          {rx.patient_gender ? `, ${capitalize(rx.patient_gender)}` : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[150px]">
                    {rx.diagnosis || <span className="text-slate-400 italic">None</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {rx.medicine_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {relativeTime(rx.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-clinic-blue" asChild title="View Details">
                        <Link href={`/doctor/patients/${rx.patient_id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:text-clinic-emerald"
                        title="Clone Prescription"
                        onClick={() => onClone(rx.id, rx.patient_id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
