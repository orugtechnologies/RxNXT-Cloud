'use client';

import React, { useState } from 'react';
import PatientSearchUI, { Patient } from '@/components/patients/PatientSearchUI';
import AddPatientModal from '@/components/patients/AddPatientModal';
import DrugSearchUI from '@/components/drugs/DrugSearchUI';
import PrescriptionCart, { PrescribedMedicine } from '@/components/prescriptions/PrescriptionCart';
import TreatmentGroupsUI from '@/components/prescriptions/TreatmentGroupsUI';
import SaveTemplateModal from '@/components/prescriptions/SaveTemplateModal';
import ReviewPrescriptionModal from '@/components/prescriptions/ReviewPrescriptionModal';
import { generatePrescriptionPDF } from '@/components/prescriptions/PrescriptionPrintView';
import { Activity, User, Pill, Stethoscope, Save, Layers, Eye } from 'lucide-react';
import TemplateManagementUI from '@/components/prescriptions/TemplateManagementUI';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

function PrescriptionWorkflowContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientQuery, setNewPatientQuery] = useState('');
  
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  const setQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };
  
  const [saving, setSaving] = useState(false);
  const [fetchingPastRx, setFetchingPastRx] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState<string | undefined>();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  // Using a key to remount TreatmentGroupsUI and fetch fresh templates
  const [templateKey, setTemplateKey] = useState(0);

  // Speed tracking metrics
  const [startTime, setStartTime] = useState<number | null>(null);
  const [creationMethod, setCreationMethod] = useState<'MANUAL' | 'TEMPLATE'>('MANUAL');
  const [lastTimeTaken, setLastTimeTaken] = useState<number | null>(null);

  useEffect(() => {
    const cloneId = searchParams.get('clone');
    if (cloneId) {
      setFetchingPastRx(true);
      fetch(`/api/prescriptions/${cloneId}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setPatient(json.data.patient);
            if (!startTime) setStartTime(Date.now());
            setChiefComplaint(json.data.chiefComplaint || '');
            setDiagnosis(json.data.diagnosis || '');
            setNotes(json.data.notes || '');
            
            // Map formatted medicines from backend back to PrescribedMedicine for the frontend
            const medsToLoad = json.data.medicines.map((m: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              generic_id: m.drugId,
              name: m.name,
              dosage_form: m.dosage_form,
              strength: m.strength,
              route: m.route,
              frequency: m.frequency,
              duration: m.duration,
              instructions: m.instructions
            }));
            
            setMedicines(medsToLoad);
          }
        })
        .finally(() => setFetchingPastRx(false));
    }
  }, [searchParams]);

  const handlePatientSelect = async (selectedPatient: Patient) => {
    setPatient(selectedPatient);
    if (!startTime) setStartTime(Date.now());
    setFetchingPastRx(true);
    
    try {
      const res = await fetch(`/api/prescriptions/recent?patientId=${selectedPatient.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.medicines && json.data.medicines.length > 0) {
          setChiefComplaint(json.data.chiefComplaint || '');
          setDiagnosis(json.data.diagnosis || '');
          setNotes(json.data.notes || '');
          setMedicines(json.data.medicines);
        }
      }
    } catch (err) {
      console.error('Error fetching past rx:', err);
    } finally {
      setFetchingPastRx(false);
    }
  };

  const handleDrugSelect = (drug: any) => {
    const newMed: PrescribedMedicine = {
      id: Math.random().toString(36).substr(2, 9),
      generic_id: drug.generic_id,
      brand_id: drug.brand_id,
      name: drug.brand_name || drug.generic_name,
      dosage_form: drug.dosage_form,
      strength: drug.strength,
      route: drug.route,
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedicines([...medicines, newMed]);
  };

  const loadTemplate = (meds: PrescribedMedicine[]) => {
    setMedicines([...medicines, ...meds]);
    setCreationMethod('TEMPLATE');
  };

  const updateMedicine = (id: string, updates: Partial<PrescribedMedicine>) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const savePrescription = async () => {
    if (!patient || medicines.length === 0) return alert('Patient and Medicines are required');
    setSaving(true);
    try {
      const res = await fetch('/api/prescriptions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          chiefComplaint,
          diagnosis,
          notes,
          followUpDate,
          medicines,
          timeTakenSeconds: startTime ? Math.floor((Date.now() - startTime) / 1000) : null,
          creationMethod
        })
      });
      
      if (!res.ok) throw new Error('Failed to save prescription');
      
      const data = await res.json();
      
      const base64 = generatePrescriptionPDF({
        patient, medicines, chiefComplaint, diagnosis, notes, followUpDate
      }, true) as string;
      setPdfBase64(base64);

      generatePrescriptionPDF({
        patient, medicines, chiefComplaint, diagnosis, notes, followUpDate
      }, false);
      
      setPrescriptionId(data.prescriptionId);
      if (startTime) {
        setLastTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error saving prescription');
    } finally {
      setSaving(false);
    }
  };

  const startNewPrescription = () => {
    setPatient(null);
    setMedicines([]);
    setChiefComplaint('');
    setDiagnosis('');
    setNotes('');
    setFollowUpDate('');
    setShowReview(false);
    setIsSuccess(false);
    setPrescriptionId(undefined);
    setPdfBase64(null);
    setStartTime(null);
    setCreationMethod('MANUAL');
    setLastTimeTaken(null);
  };

  if (tab === 'templates') {
    return <TemplateManagementUI />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Activity className="text-clinic-emerald mr-3" size={28} strokeWidth={2.5} />
            Clinical Workspace
            <InfoTooltip text="Write and send digital prescriptions via WhatsApp. Use the AI Smart Search to quickly find drugs, or switch to the Templates tab to use pre-saved protocols." />
          </h1>
          <p className="text-slate-500 mt-1 ml-11 text-sm font-medium">RxNXT Digital Prescription Flow</p>
        </div>
      </div>

      <div className="max-w-5xl">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Patient & Clinical Details */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Step 1: Patient Selection */}
            <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 hover:shadow-md relative z-20">
              <div className="bg-clinic-navy px-5 py-3 border-b border-clinic-border flex items-center rounded-t-xl">
                <User size={18} className="text-clinic-emerald mr-2" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Patient</h2>
              </div>
              <div className="p-5">
                {!patient ? (
                  <PatientSearchUI 
                    onSelect={handlePatientSelect} 
                    onAddNew={(q) => { setNewPatientQuery(q); setShowAddPatient(true); }} 
                  />
                ) : (
                  <div className="relative group">
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mr-4 shrink-0">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-clinic-navy text-lg leading-tight">{patient.name}</p>
                        <p className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{patient.age}y</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{patient.gender}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPatient(null)} 
                      className="absolute top-2 right-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded shadow-sm border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Clinical Details */}
            {patient && (
              <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative z-10">
                <div className="bg-clinic-navy px-5 py-3 border-b border-clinic-border flex items-center rounded-t-xl">
                  <Stethoscope size={18} className="text-clinic-emerald mr-2" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Diagnosis</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Chief Complaint</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Fever for 3 days" 
                      value={chiefComplaint} 
                      onChange={e=>setChiefComplaint(e.target.value)} 
                      className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Diagnosis</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Viral Pyrexia" 
                      value={diagnosis} 
                      onChange={e=>setDiagnosis(e.target.value)} 
                      className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Medications & Actions */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 3: Medication */}
            {patient && (
              <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 relative z-20">
                <div className="bg-clinic-navy px-6 py-4 border-b border-clinic-border flex items-center justify-between rounded-t-xl">
                  <div className="flex items-center">
                    <Pill size={20} className="text-clinic-emerald mr-2" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Rx Medications</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Treatment Groups UI */}
                  <TreatmentGroupsUI key={templateKey} onLoadTemplate={loadTemplate} />

                  <DrugSearchUI onSelect={handleDrugSelect} />
                  
                  <div className="mt-6">
                    <PrescriptionCart medicines={medicines} onUpdate={updateMedicine} onRemove={removeMedicine} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Advice & Notes</label>
                      <textarea 
                        placeholder="Additional instructions for the patient..." 
                        value={notes} 
                        onChange={e=>setNotes(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none h-24 resize-none transition-shadow" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Follow-up Date</label>
                        <div className="flex gap-2">
                          <button onClick={() => setQuickFollowUp(3)} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors">3 Days</button>
                          <button onClick={() => setQuickFollowUp(7)} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors">1 Week</button>
                          <button onClick={() => setQuickFollowUp(14)} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors">2 Weeks</button>
                          <button onClick={() => setQuickFollowUp(30)} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors">1 Month</button>
                        </div>
                      </div>
                      <input 
                        type="date" 
                        value={followUpDate} 
                        onChange={e=>setFollowUpDate(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none transition-shadow" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            {patient && (
              <div className="flex justify-end gap-4 animate-in fade-in">
                <button 
                  onClick={() => setShowSaveTemplate(true)}
                  disabled={medicines.length === 0}
                  className="bg-white hover:bg-gray-50 text-clinic-navy border border-gray-200 font-bold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Layers className="mr-2 text-blue-500" size={20} /> Save as Group
                </button>
                <button 
                  onClick={() => setShowReview(true)}
                  disabled={medicines.length === 0}
                  className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  <Eye className="mr-2" size={20} /> Review & Print Rx
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {showAddPatient && (
        <AddPatientModal 
          initialQuery={newPatientQuery}
          onClose={() => setShowAddPatient(false)} 
          onSuccess={(p) => { setPatient(p); setShowAddPatient(false); }} 
        />
      )}

      {showSaveTemplate && (
        <SaveTemplateModal
          medicines={medicines}
          onClose={() => setShowSaveTemplate(false)}
          onSuccess={() => {
            setShowSaveTemplate(false);
            setTemplateKey(prev => prev + 1); // Refresh templates list
            alert('Treatment Group saved successfully!');
          }}
        />
      )}

      {showReview && patient && (
        <ReviewPrescriptionModal
          patient={patient}
          chiefComplaint={chiefComplaint}
          diagnosis={diagnosis}
          medicines={medicines}
          notes={notes}
          followUpDate={followUpDate}
          saving={saving}
          isSuccess={isSuccess}
          prescriptionId={prescriptionId}
          pdfBase64={pdfBase64}
          timeTakenSeconds={lastTimeTaken}
          onClose={() => {
            if (isSuccess) startNewPrescription();
            else setShowReview(false);
          }}
          onConfirm={savePrescription}
          onNewPrescription={startNewPrescription}
        />
      )}
    </div>
  );
}

export default function PrescriptionWorkflow() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <PrescriptionWorkflowContent />
    </Suspense>
  );
}
