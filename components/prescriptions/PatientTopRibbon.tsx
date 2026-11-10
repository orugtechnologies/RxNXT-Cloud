'use client';

import React from 'react';
import { 
  User, 
  Activity, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  X, 
  Search, 
  UserPlus, 
  Calendar,
  Pill,
  Clock
} from 'lucide-react';
import { Patient } from '@/components/patients/PatientSearchUI';
import PatientSearchUI from '@/components/patients/PatientSearchUI';

interface PatientTopRibbonProps {
  patient: Patient | null;
  patientEncounters?: any[];
  onSelectPatient: (p: Patient) => void;
  onClearPatient: () => void;
  onAddNewPatient: (query?: string) => void;
  onCloneLastRx?: (encounter: any) => void;
  elapsedSeconds?: number;
}

export default function PatientTopRibbon({
  patient,
  patientEncounters = [],
  onSelectPatient,
  onClearPatient,
  onAddNewPatient,
  onCloneLastRx,
  elapsedSeconds = 0,
}: PatientTopRibbonProps) {
  // If no patient is selected, display quick inline patient finder
  if (!patient) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-slate-200/90 p-3.5 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <User size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Select Patient To Begin Consultation
              </h2>
              <p className="text-[11px] text-slate-500">
                Search by name or mobile number, or register a new walk-in patient.
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <PatientSearchUI 
              onSelect={onSelectPatient} 
              onAddNew={onAddNewPatient} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Find most recent encounter for past visit history & 1-click cloning
  const lastEncounter = patientEncounters && patientEncounters.length > 0 
    ? patientEncounters[0] 
    : null;

  const pastDiagnosis = lastEncounter?.diagnosis || lastEncounter?.chiefComplaint || lastEncounter?.chief_complaint;
  const pastMeds: any[] = lastEncounter?.medicines || lastEncounter?.prescriptions?.[0]?.medicines || [];
  
  const pastVisitDateStr = lastEncounter?.created_at || lastEncounter?.createdAt 
    ? new Date(lastEncounter.created_at || lastEncounter.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200/90 overflow-hidden transition-all">
      {/* Primary Patient & Vitals Strip */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/20">
        
        {/* Left: Patient Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-base leading-tight truncate">
                {patient.name}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded border border-slate-200">
                {patient.age}y • {patient.gender}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {patient.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Vitals & Allergies Strip (100% visible, zero clicks) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Drug Allergy / NKDA Guardrail */}
          {patient.allergies ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-bold animate-pulse">
              <AlertCircle size={13} className="text-rose-600 shrink-0" />
              <span>Allergy: {patient.allergies}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
              <span>NKDA (No Drug Allergies)</span>
            </div>
          )}

          {/* Recorded Vitals */}
          {patient.vitals && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Activity size={13} className="text-rose-500 shrink-0" />
              <div className="flex items-center gap-2 text-slate-700 font-semibold divide-x divide-slate-200">
                {patient.vitals.bp && (
                  <span className="pl-1 first:pl-0">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">BP</span>
                    <strong className="text-slate-900 font-black">{patient.vitals.bp}</strong>
                  </span>
                )}
                {patient.vitals.temperature && (
                  <span className="pl-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">TEMP</span>
                    <strong className="text-slate-900 font-black">{patient.vitals.temperature}°F</strong>
                  </span>
                )}
                {patient.vitals.pulse && (
                  <span className="pl-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">PULSE</span>
                    <strong className="text-slate-900 font-black">{patient.vitals.pulse} bpm</strong>
                  </span>
                )}
                {patient.vitals.spo2 && (
                  <span className="pl-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">SpO2</span>
                    <strong className="text-slate-900 font-black">{patient.vitals.spo2}%</strong>
                  </span>
                )}
                {patient.vitals.weight && (
                  <span className="pl-2">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">WT</span>
                    <strong className="text-slate-900 font-black">{patient.vitals.weight}kg</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Consultation Timer */}
          {elapsedSeconds > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <Clock size={12} className="text-emerald-600" />
              <span>{Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          )}

          {/* Change Patient Trigger */}
          <button
            type="button"
            onClick={onClearPatient}
            className="text-xs font-bold text-slate-500 hover:text-blue-700 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            title="Switch patient"
          >
            <X size={12} />
            <span>Change</span>
          </button>
        </div>

      </div>

      {/* Secondary Ribbon: Returning Patient Past Visit & 1-Click Clone Bar */}
      {lastEncounter && (
        <div className="px-4 py-1.5 bg-blue-50/50 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px] shrink-0">
              <Sparkles size={11} className="text-blue-600" />
              LAST VISIT {pastVisitDateStr ? `(${pastVisitDateStr})` : ''}
            </span>

            {pastDiagnosis && (
              <span className="font-semibold text-slate-900 truncate">
                {pastDiagnosis}
              </span>
            )}

            {pastMeds.length > 0 && (
              <span className="text-slate-500 text-[11px] truncate hidden md:inline">
                • Prescribed: {pastMeds.slice(0, 3).map((m: any) => m.name || m.customName).join(', ')}
                {pastMeds.length > 3 ? ` (+${pastMeds.length - 3} more)` : ''}
              </span>
            )}

            {patientEncounters.length > 1 && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded shrink-0">
                {patientEncounters.length} total visits
              </span>
            )}
          </div>

          {/* 1-Click Clone Action (Zero extra clicks, direct trigger) */}
          {onCloneLastRx && pastMeds.length > 0 && (
            <button
              type="button"
              onClick={() => onCloneLastRx(lastEncounter)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition-colors shadow-xs cursor-pointer shrink-0"
              title="Clone medicines from last consultation directly into the prescription"
            >
              <Copy size={11} />
              <span>Clone Last Rx</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
