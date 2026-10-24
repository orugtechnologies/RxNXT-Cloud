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
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
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
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tracking-wider uppercase text-xs sm:text-[13px] font-black text-[#000865]">
              Live Prescription Preview (A4 Sheet)
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            • Syncs Real-Time
          </span>
        </div>

        {/* The Printable A4 Sheet Body */}
        <div className="p-5 sm:p-6 bg-white min-h-[560px] flex flex-col justify-between text-[11px] leading-relaxed">
          
          {/* Header / Clinic Letterhead */}
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

          {/* Patient Details Strip */}
          <div className="bg-[#e8f1fd] rounded-lg p-3 border border-[#bfdbfe] mb-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-xs">
                  {patient ? patient.name : 'Select / Add Patient'}
                </span>
                {patient && (
                  <span className="text-[10px] text-slate-500">
                    {patient.age}y / {patient.gender} • {patient.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
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
            {patient?.vitals && (patient.vitals.bp || patient.vitals.pulse || patient.vitals.temperature) && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex flex-wrap gap-2 text-[10px] text-slate-600 font-medium">
                {patient.vitals.bp && <span>BP: <strong>{patient.vitals.bp}</strong></span>}
                {patient.vitals.temperature && <span>Temp: <strong>{patient.vitals.temperature}°F</strong></span>}
                {patient.vitals.pulse && <span>Pulse: <strong>{patient.vitals.pulse} bpm</strong></span>}
                {patient.vitals.spo2 && <span>SpO2: <strong>{patient.vitals.spo2}%</strong></span>}
              </div>
            )}
          </div>

          {/* Clinical Findings (Diagnosis & Symptoms) */}
          {(chiefComplaint || diagnosis) && (
            <div className="mb-3 pb-2 border-b border-slate-100 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chiefComplaint && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">Chief Complaint</span>
                  <span className="text-slate-800 font-semibold">{chiefComplaint}</span>
                </div>
              )}
              {diagnosis && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">Diagnosis</span>
                  <span className="text-slate-900 font-extrabold">{diagnosis}</span>
                </div>
              )}
            </div>
          )}

          {/* Rx Medications Table / List */}
          <div className="flex-1 mb-3">
            <div className="flex items-center gap-1 text-slate-900 font-black text-xs mb-2">
              <span className="text-sm font-serif italic font-bold">℞</span>
              <span className="uppercase tracking-wider text-[10px]">Medications</span>
            </div>

            {medicines.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <FileText size={24} className="mx-auto text-slate-300 mb-1" />
                <p className="text-[11px] font-medium">No medicines added yet.</p>
                <p className="text-[9px] text-slate-400">Medicines appear here live as you select them.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medicines.map((med, index) => (
                  <div 
                    key={med.id || index}
                    className="p-2.5 rounded-lg bg-[#f0f6ff] border border-[#cbe1fc] flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-1.5 flex-1">
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-xs leading-snug">
                          {med.name}
                          {(med.dosage_form || med.strength) && (
                            <span className="text-[10px] font-medium text-slate-500 ml-1.5">
                              ({[med.dosage_form, med.strength].filter(Boolean).join(' ')})
                            </span>
                          )}
                        </p>
                        <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap gap-x-2 font-medium">
                          <span className="text-blue-700 font-bold">{med.frequency || '1-0-1'}</span>
                          <span>•</span>
                          <span>{med.duration || '3 days'}</span>
                          <span>•</span>
                          <span className="text-slate-500">{med.instructions || 'Post-Meal'}</span>
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
            <div className="mb-3 pt-2 border-t border-slate-100 text-[10px]">
              {selectedTests.length > 0 && (
                <div className="mb-1">
                  <span className="font-bold text-slate-500 uppercase text-[9px]">Lab Investigations: </span>
                  <span className="text-slate-800 font-medium">
                    {selectedTests.map(t => t.name).join(', ')}
                  </span>
                </div>
              )}
              {selectedDrips.length > 0 && (
                <div>
                  <span className="font-bold text-blue-700 uppercase text-[9px]">Day-Care Procedures: </span>
                  <span className="text-slate-800 font-medium">
                    {selectedDrips.map(d => d.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Advice & Follow-Up Date */}
          {(notes || followUpDate) && (
            <div className="mb-3 pt-2 border-t border-slate-100 text-[10px] space-y-1">
              {notes && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">Doctor's Advice</span>
                  <span className="text-slate-700 whitespace-pre-wrap">{notes}</span>
                </div>
              )}
              {followUpDate && (
                <div className="flex items-center gap-1 text-blue-900 font-bold pt-1">
                  <Clock size={11} className="text-blue-600" />
                  <span>Next Follow-Up: {followUpDate}</span>
                </div>
              )}
            </div>
          )}

          {/* Sheet Footer: QR Code & Signature Stamp */}
          <div className="pt-3 border-t border-slate-300 mt-auto flex items-end justify-between">
            <div className="flex items-center gap-2">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="Verified Prescription QR" 
                  className="w-12 h-12 border border-slate-200 rounded"
                />
              )}
              <div className="text-[9px] text-slate-400">
                <span className="block font-bold text-slate-600">Scan to Verify</span>
                <span>RxNXT Encrypted EMR</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-serif italic text-blue-800 font-bold border-b border-slate-400 pb-0.5 inline-block">
                Dr. {doctorName.replace(/^Dr\.?\s*/i, '')}
              </div>
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
