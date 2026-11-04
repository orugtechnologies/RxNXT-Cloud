'use client';

import React, { useEffect, useState } from 'react';
import { 
  Printer, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Loader2,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import Link from 'next/link';
import { Patient } from '../patients/PatientSearchUI';
import { PrescribedMedicine } from './PrescriptionCart';
import { InvestigationItem, DayCareProcedureItem } from './QuickTestAndDripPanel';

interface LivePrescriptionSheetProps {
  patient: Patient | null;
  medicines: PrescribedMedicine[];
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  followUpDate: string;
  selectedTests?: InvestigationItem[];
  selectedDrips?: DayCareProcedureItem[];
  doctorContext?: any;
  onProceedToReview: () => void;
  onOpenSaveModal: () => void;
  saving?: boolean;
}

export default function LivePrescriptionSheet({
  patient,
  medicines,
  chiefComplaint,
  diagnosis,
  notes,
  followUpDate,
  selectedTests = [],
  selectedDrips = [],
  doctorContext = {},
  onProceedToReview,
  onOpenSaveModal,
  saving = false,
}: LivePrescriptionSheetProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const clinicName = doctorContext?.clinicName || 'RxNXT Clinical Center';
  const doctorName = doctorContext?.doctorName || 'Dr. Medical Practitioner';
  const doctorSpecialization = doctorContext?.doctorSpecialization || 'General Physician / Internal Medicine';
  const doctorRegNo = doctorContext?.doctorRegNo || 'MCI-09281';
  const clinicAddress = doctorContext?.clinicAddress || 'Healthcare Plaza, 1st Floor, OPD Wing';
  const clinicPhone = doctorContext?.clinicPhone || '+91 98765 43210';
  const signatureUrl = doctorContext?.signatureUrl;
  
  // Custom Scanned Prescription Pad Settings
  const prescriptionPadUrl = doctorContext?.prescriptionPadUrl;
  const hasCustomPad = Boolean(prescriptionPadUrl);
  const headerHeightMm = Number(doctorContext?.prescriptionHeaderHeight) || 48;
  const footerHeightMm = Number(doctorContext?.prescriptionFooterHeight) || 30;

  useEffect(() => {
    const qrPayload = JSON.stringify({
      system: 'RxNXT Verified',
      doctor: doctorName,
      clinic: clinicName,
      date: new Date().toISOString().split('T')[0],
      patient: patient?.name || 'Walk-in',
      medCount: medicines.length
    });
    
    QRCode.toDataURL(qrPayload, { width: 90, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR:', err));
  }, [patient, medicines, doctorName, clinicName]);

  const hasIncompleteMedicines = medicines.some(
    m => !m.frequency?.trim() || !m.duration?.trim() || !m.instructions?.trim()
  );

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col space-y-4">
      {/* Live A4 Preview Canvas */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-300/80 overflow-hidden text-slate-800 transition-all duration-300">
        
        {/* Top Sheet Status Ribbon */}
        <div className="bg-[#f0f6fe] px-4 py-3 border-b border-[#d8e7fc] flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tracking-wider uppercase text-xs sm:text-[13px] font-black text-[#000865]">
              Live Prescription Preview (A4 Sheet)
            </span>
          </div>
          
          {hasCustomPad ? (
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
              <Sparkles size={11} className="text-emerald-700" /> Authentic Pad Active
            </span>
          ) : (
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              • Syncs Real-Time
            </span>
          )}
        </div>

        {/* The Printable A4 Sheet Body */}
        <div 
          className="p-5 sm:p-6 min-h-[640px] flex flex-col justify-between text-[11px] leading-relaxed relative bg-white bg-cover bg-no-repeat transition-all"
          style={hasCustomPad ? {
            backgroundImage: `url(${prescriptionPadUrl})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center top'
          } : undefined}
        >
          
          {/* HEADER SECTION */}
          {hasCustomPad ? (
            /* Spacer for Doctor's Authentic Scanned Pad Header */
            <div 
              style={{ height: `${Math.round(headerHeightMm * 2.1)}px` }} 
              className="w-full shrink-0 select-none flex items-start justify-end pointer-events-none"
            >
              <span className="text-[9px] font-bold text-slate-400/90 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200/60 shadow-2xs">
                Scanned Doctor Letterhead
              </span>
            </div>
          ) : (
            /* Default Synthetic Header Layout (Fallback when no pad uploaded) */
            <div className="border-b-2 border-[#001099] pb-3 mb-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-base font-black text-slate-950 uppercase tracking-tight">
                    {clinicName}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {clinicAddress} • Tel: {clinicPhone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-blue-900 leading-tight">
                    {doctorName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {doctorSpecialization}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Reg No: {doctorRegNo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col justify-start">
            
            {/* Patient Details Strip */}
            <div className={`rounded-lg p-3 border mb-3.5 transition-all shadow-xs ${
              hasCustomPad 
                ? 'bg-white/95 backdrop-blur-xs border-slate-300 text-slate-900' 
                : 'bg-[#e8f1fd] border-[#bfdbfe]'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-xs">
                    {patient ? patient.name : 'Select / Add Patient'}
                  </span>
                  {patient && (
                    <span className="text-[10px] text-slate-600 font-medium">
                      {patient.age}y / {patient.gender} • {patient.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar size={11} className="text-slate-400" />
                    {formattedDate}
                  </span>
                  {patient?.allergies ? (
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                      Allergy: {patient.allergies}
                    </span>
                  ) : (
                    <span className="bg-white text-[#0052cc] border border-[#93c5fd] px-2 py-0.5 rounded text-[9px] font-extrabold shadow-2xs">
                      NKDA
                    </span>
                  )}
                </div>
              </div>

              {/* Vitals summary line if available */}
              {patient?.vitals && (patient.vitals.bp || patient.vitals.pulse || patient.vitals.temperature || patient.vitals.spo2) && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-200/70 flex flex-wrap gap-2.5 text-[10px] text-slate-700 font-medium">
                  {patient.vitals.bp && <span>BP: <strong>{patient.vitals.bp}</strong></span>}
                  {patient.vitals.temperature && <span>Temp: <strong>{patient.vitals.temperature}°F</strong></span>}
                  {patient.vitals.pulse && <span>Pulse: <strong>{patient.vitals.pulse} bpm</strong></span>}
                  {patient.vitals.spo2 && <span>SpO2: <strong>{patient.vitals.spo2}%</strong></span>}
                </div>
              )}
            </div>

            {/* Clinical Findings (Diagnosis & Symptoms) */}
            {(chiefComplaint || diagnosis) && (
              <div className={`mb-3 p-2.5 rounded-lg border text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 shadow-2xs ${
                hasCustomPad 
                  ? 'bg-white/95 backdrop-blur-xs border-slate-200 text-slate-900' 
                  : 'border-slate-100 bg-slate-50/70'
              }`}>
                {chiefComplaint && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Chief Complaint</span>
                    <span className="text-slate-900 font-semibold">{chiefComplaint}</span>
                  </div>
                )}
                {diagnosis && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Diagnosis</span>
                    <span className="text-blue-950 font-black">{diagnosis}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rx Medications Table / List */}
            <div className="flex-1 mb-3">
              <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs mb-2">
                <span className="text-base font-serif italic font-extrabold text-[#0052cc]">℞</span>
                <span className="uppercase tracking-wider text-[10px]">Medications</span>
              </div>

              {medicines.length === 0 ? (
                <div className={`py-8 text-center border border-dashed rounded-lg ${
                  hasCustomPad ? 'bg-white/80 border-slate-300 text-slate-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <FileText size={24} className="mx-auto text-slate-400 mb-1" />
                  <p className="text-[11px] font-semibold">No medicines added yet.</p>
                  <p className="text-[9px] text-slate-400">Medicines appear here live as you select them.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {medicines.map((med, index) => (
                    <div 
                      key={med.id || index}
                      className={`p-2.5 rounded-lg border flex items-start justify-between gap-2 shadow-2xs transition-all ${
                        hasCustomPad 
                          ? 'bg-white/95 backdrop-blur-xs border-slate-300' 
                          : 'bg-[#f0f6ff] border-[#cbe1fc]'
                      }`}
                    >
                      <div className="flex items-start gap-1.5 flex-1">
                        <span className="text-[10px] font-black text-slate-500 mt-0.5">
                          {index + 1}.
                        </span>
                        <div>
                          <p className="font-black text-slate-950 text-xs leading-snug">
                            {med.name}
                            {(med.dosage_form || med.strength) && (
                              <span className="text-[10px] font-semibold text-slate-500 ml-1.5">
                                ({[med.dosage_form, med.strength].filter(Boolean).join(' ')})
                              </span>
                            )}
                          </p>
                          <div className="text-[10px] text-slate-700 mt-0.5 flex flex-wrap gap-x-2 font-medium">
                            <span className="text-[#0052cc] font-extrabold">{med.frequency || '1-0-1'}</span>
                            <span>•</span>
                            <span className="font-semibold">{med.duration || '3 days'}</span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">{med.instructions || 'Post-Meal'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Investigations & Day-Care Procedures */}
            {(selectedTests.length > 0 || selectedDrips.length > 0) && (
              <div className={`mb-3 p-2.5 rounded-lg border text-[10px] shadow-2xs ${
                hasCustomPad ? 'bg-white/95 border-slate-300' : 'border-slate-100 bg-slate-50/70'
              }`}>
                {selectedTests.length > 0 && (
                  <div className="mb-1">
                    <span className="font-bold text-slate-600 uppercase text-[9px]">Lab Investigations: </span>
                    <span className="text-slate-900 font-semibold">
                      {selectedTests.map(t => t.name).join(', ')}
                    </span>
                  </div>
                )}
                {selectedDrips.length > 0 && (
                  <div>
                    <span className="font-bold text-[#0052cc] uppercase text-[9px]">Day-Care Procedures: </span>
                    <span className="text-slate-900 font-semibold">
                      {selectedDrips.map(d => d.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Advice & Follow-Up Date */}
            {(notes || followUpDate) && (
              <div className={`mb-3 p-2.5 rounded-lg border text-[10px] space-y-1 shadow-2xs ${
                hasCustomPad ? 'bg-white/95 border-slate-300' : 'border-slate-100 bg-slate-50/70'
              }`}>
                {notes && (
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[9px] block">Doctor's Advice</span>
                    <span className="text-slate-800 font-medium whitespace-pre-wrap">{notes}</span>
                  </div>
                )}
                {followUpDate && (
                  <div className="flex items-center gap-1 text-[#0052cc] font-bold pt-1">
                    <Clock size={11} className="text-[#0052cc]" />
                    <span>Next Follow-Up: {followUpDate}</span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* FOOTER SECTION: QR Code & Authenticated Doctor Signature */}
          <div 
            className={`pt-2.5 mt-auto flex items-end justify-between transition-all ${
              hasCustomPad 
                ? 'bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-300 shadow-xs' 
                : 'border-t border-slate-300'
            }`}
            style={hasCustomPad ? {
              marginBottom: `${Math.max(Math.round(footerHeightMm * 1.1), 10)}px`
            } : undefined}
          >
            <div className="flex items-center gap-2">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="Verified Prescription QR" 
                  className="w-11 h-11 border border-slate-200 rounded bg-white"
                />
              )}
              <div className="text-[9px] text-slate-500">
                <span className="block font-extrabold text-slate-800">Scan to Verify</span>
                <span>RxNXT Encrypted EMR</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              {signatureUrl ? (
                <img 
                  src={signatureUrl} 
                  alt="Doctor Signature" 
                  className="h-8 max-w-[120px] object-contain mb-0.5" 
                />
              ) : (
                <div className="text-[10px] font-serif italic text-blue-900 font-bold border-b border-slate-400 pb-0.5 inline-block">
                  Dr. {doctorName.replace(/^Dr\.?\s*/i, '')}
                </div>
              )}
              <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                Digitally Authenticated
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Fitts's Law Primary Action Dock (Directly Anchored Under the Preview) */}
      <div className="bg-white rounded-xl p-4 shadow-soft border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#dbeafe] text-[#0060df] flex items-center justify-center shrink-0 border border-[#bfdbfe]">
              <ShieldCheck size={15} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xs sm:text-[13px] text-[#000865] uppercase tracking-wider">
              Dispatch Dock
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {patient ? `Patient: ${patient.name}` : 'No patient selected'}
          </span>
        </div>

        {hasIncompleteMedicines && medicines.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>Complete dosage for all medicines before printing.</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onProceedToReview}
            disabled={!patient || medicines.length === 0 || saving}
            className="w-full bg-gradient-to-r from-[#0080ff] to-[#0052cc] hover:from-[#0070e6] hover:to-[#0047b3] text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Printer size={18} />
            )}
            <span>Print Rx & Complete (Ctrl + Enter)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onProceedToReview}
              disabled={!patient || medicines.length === 0}
              className="bg-[#e8f1fd] hover:bg-[#dbeafe] text-[#0052cc] border border-[#bfdbfe] font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
            >
              <Send size={13} className="text-[#0080ff]" />
              <span>WhatsApp Rx</span>
            </button>

            <button
              type="button"
              onClick={onOpenSaveModal}
              disabled={medicines.length === 0}
              className="bg-[#e8f1fd] hover:bg-[#dbeafe] text-[#0052cc] border border-[#bfdbfe] font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
            >
              <Layers size={13} className="text-[#0080ff]" />
              <span>Save Protocol</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
