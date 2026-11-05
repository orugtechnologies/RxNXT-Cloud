'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Activity, 
  Pill, 
  Layers, 
  Printer, 
  Send, 
  Clock, 
  AlertCircle, 
  Check, 
  FileText,
  Search,
  Sparkles,
  Loader2
} from 'lucide-react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import DrugSearchUI from '@/components/drugs/DrugSearchUI';
import FrequentDrugsBar from '@/components/drugs/FrequentDrugsBar';
import ProtocolPacksBar from '@/components/prescriptions/ProtocolPacksBar';
import QuickSymptomsDiagnosis from '@/components/prescriptions/QuickSymptomsDiagnosis';
import PrescriptionCart, { PrescribedMedicine } from '@/components/prescriptions/PrescriptionCart';
import QuickAdviceChips from '@/components/prescriptions/QuickAdviceChips';
import { getSmartClinicalDefaults } from '@/lib/prescriptionClinicalDefaults';

export interface PrescriptionFormProps {
  patient: Patient | null;
  onPatientSelect: (patient: Patient) => void;
  onClearPatient: () => void;
  onAddNewPatient: (query: string) => void;
  medicines: PrescribedMedicine[];
  onUpdateMedicine: (id: string, updates: Partial<PrescribedMedicine>) => void;
  onRemoveMedicine: (id: string) => void;
  onAddMedicine: (med: PrescribedMedicine) => void;
  onLoadTemplate: (meds: PrescribedMedicine[]) => void;
  onClearMedicines: () => void;
  chiefComplaint: string;
  setChiefComplaint: (val: string) => void;
  diagnosis: string;
  setDiagnosis: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  followUpDate: string;
  setFollowUpDate: (val: string) => void;
  onSubmit: () => void;
  onOpenSaveModal: () => void;
  saving?: boolean;
}

export default function PrescriptionForm({
  patient,
  onPatientSelect,
  onClearPatient,
  onAddNewPatient,
  medicines,
  onUpdateMedicine,
  onRemoveMedicine,
  onAddMedicine,
  onLoadTemplate,
  onClearMedicines,
  chiefComplaint,
  setChiefComplaint,
  diagnosis,
  setDiagnosis,
  notes,
  setNotes,
  followUpDate,
  setFollowUpDate,
  onSubmit,
  onOpenSaveModal,
  saving = false,
}: PrescriptionFormProps) {

  // Global Hotkey: Ctrl+Enter or Cmd+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (patient && medicines.length > 0 && !saving) {
          onSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [patient, medicines, saving, onSubmit]);

  const handleDrugSelect = (drug: any) => {
    const smart = getSmartClinicalDefaults(drug.brand_name || drug.generic_name, drug.generic_name);
    const newMed: PrescribedMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      generic_id: drug.generic_id,
      brand_id: drug.brand_id,
      name: drug.brand_name || drug.generic_name,
      dosage_form: drug.dosage_form,
      strength: drug.strength,
      route: drug.route,
      frequency: drug.default_frequency || smart.frequency,
      duration: drug.default_duration || smart.duration,
      instructions: drug.default_instructions || smart.instructions,
    };
    onAddMedicine(newMed);
  };

  const setQuickFollowUpDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const patientAllergies = patient?.allergies;
  const allergyConflicts = patientAllergies
    ? medicines.filter(m => {
        const allergenTerms = patientAllergies.toLowerCase().split(/[,;\s]+/).filter(w => w.length > 2);
        const medName = (m.name || '').toLowerCase();
        return allergenTerms.some(term => medName.includes(term));
      })
    : [];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN (Cols 1-7): Vitals Strip, Symptoms/Diagnosis, Drug Search */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. Patient Card & Single-Row Inline Vitals Strip */}
          <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <User size={13} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Patient & Vitals
                </span>
              </div>
              {patient && (
                <button
                  type="button"
                  onClick={onClearPatient}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  Change Patient
                </button>
              )}
            </div>

            <div className="p-3.5">
              {!patient ? (
                <PatientSearchUI 
                  onSelect={onPatientSelect} 
                  onAddNew={onAddNewPatient} 
                />
              ) : (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-base leading-tight">
                          {patient.name}
                        </span>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                          <span>{patient.age}y / {patient.gender}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{patient.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Allergy Tag */}
                    {patient.allergies ? (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <AlertCircle size={12} className="text-rose-600" />
                        Allergy: {patient.allergies}
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold">
                        NKDA (No Known Allergies)
                      </span>
                    )}
                  </div>

                  {/* Compact Single-Row Inline Vitals Strip */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">BP</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {patient.vitals?.bp || '120/80'}
                        </span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Pulse</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {patient.vitals?.pulse ? `${patient.vitals.pulse} bpm` : '74 bpm'}
                        </span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Temp</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {patient.vitals?.temperature ? `${patient.vitals.temperature}°F` : '98.6°F'}
                        </span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">Weight</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {patient.vitals?.weight ? `${patient.vitals.weight} kg` : '65 kg'}
                        </span>
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200 rounded p-1.5 shadow-2xs">
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">SpO2</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {patient.vitals?.spo2 ? `${patient.vitals.spo2}%` : '99%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Quick Symptoms & Diagnosis */}
          {patient && (
            <QuickSymptomsDiagnosis
              chiefComplaint={chiefComplaint}
              setChiefComplaint={setChiefComplaint}
              diagnosis={diagnosis}
              setDiagnosis={setDiagnosis}
            />
          )}

          {/* 3. 1-Click Protocol Packs & Search */}
          {patient && (
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                    <Pill size={13} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Protocol Packs & Medicine Search
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Press / to search
                </span>
              </div>

              <div className="p-3.5 space-y-3">
                <ProtocolPacksBar 
                  onLoadTemplate={onLoadTemplate} 
                  onOpenSaveModal={onOpenSaveModal} 
                  cartCount={medicines.length} 
                />

                <DrugSearchUI onSelect={handleDrugSelect} />

                <FrequentDrugsBar 
                  onAddDrug={onAddMedicine}
                  alreadyPrescribedIds={medicines.map(m => m.generic_id || m.brand_id || m.name)}
                />
              </div>
            </div>
          )}

          {/* 4. Doctor Advice & Counseling */}
          {patient && (
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                    <FileText size={13} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Doctor's Advice & Counseling
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2.5">
                <QuickAdviceChips notes={notes} setNotes={setNotes} />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Patient advice, dietary instructions..."
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN (Cols 8-12): Sticky Live Prescription Cart & Action Footer */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 lg:self-start">
          
          {/* Live Prescription Cart */}
          <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Layers size={13} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Prescription Cart {medicines.length > 0 && `(${medicines.length})`}
                </span>
              </div>
              {medicines.length > 0 && (
                <button
                  type="button"
                  onClick={onClearMedicines}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-rose-200"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="p-3.5">
              {allergyConflicts.length > 0 && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <div>
                    <span className="font-extrabold">Allergy Warning:</span> Patient allergic to {patientAllergies}.
                  </div>
                </div>
              )}

              <PrescriptionCart 
                medicines={medicines} 
                onUpdate={onUpdateMedicine} 
                onRemove={onRemoveMedicine} 
              />
            </div>
          </div>

          {/* Quick-Select Follow-up Chips & Date */}
          {patient && (
            <div className="bg-white rounded-xl shadow-2xs border border-slate-200 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-600" />
                  Follow-Up Visit
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Select or pick date</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[3, 5, 7, 15, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setQuickFollowUpDays(days)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    {days === 30 ? '1 Month' : `${days} Days`}
                  </button>
                ))}
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="border border-slate-300 rounded-lg px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-600 bg-white ml-auto"
                />
              </div>
            </div>
          )}

          {/* Sticky High-Contrast Primary Action Footer */}
          <div className="bg-white rounded-xl p-4 shadow-soft border border-slate-200 space-y-2.5">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!patient || medicines.length === 0 || saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Printer size={18} />
              )}
              <span>Save & Generate Prescription (Ctrl + Enter)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onSubmit}
                disabled={!patient || medicines.length === 0}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
              >
                <Send size={13} className="text-blue-600" />
                <span>WhatsApp Rx</span>
              </button>

              <button
                type="button"
                onClick={onOpenSaveModal}
                disabled={medicines.length === 0}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
              >
                <Layers size={13} className="text-blue-600" />
                <span>Save Protocol</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
