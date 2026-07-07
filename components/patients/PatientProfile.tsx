'use client';

import { Patient } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Calendar, User, Activity } from 'lucide-react';
import { formatDate, capitalize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PatientProfile({ patient }: { patient: Patient }) {
  if (!patient) return null;

  // Generate color based on name length for avatar
  const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700'];
  const colorIndex = patient.name.length % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <Card className="border-0 shadow-md bg-white overflow-hidden relative">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-clinic-blue to-clinic-emerald" />
      
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm shrink-0 ${avatarColor}`}>
            {patient.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{capitalize(patient.name)}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member since {formatDate(patient.created_at, { year: 'numeric', month: 'long' })}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {patient.age && (
                <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-1 px-3">
                  <User className="h-3 w-3 mr-1" /> {patient.age} years
                </Badge>
              )}
              {patient.gender && (
                <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm py-1 px-3">
                  <Activity className="h-3 w-3 mr-1" /> {capitalize(patient.gender)}
                </Badge>
              )}
              {patient.phone && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm py-1 px-3">
                  <Phone className="h-3 w-3 mr-1" /> {patient.phone}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
