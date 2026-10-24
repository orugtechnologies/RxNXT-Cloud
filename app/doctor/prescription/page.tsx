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
import { Activity, User, Pill, Stethoscope, Save, Layers, Eye, AlertCircle, FlaskConical, Droplet, ArrowRightCircle } from 'lucide-react';
import TemplateManagementUI from '@/components/prescriptions/TemplateManagementUI';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import AIPatientSummaryCard from '@/components/patients/AIPatientSummaryCard';
import ProtocolPacksBar from '@/components/prescriptions/ProtocolPacksBar';
import QuickTestAndDripPanel, { InvestigationItem, DayCareProcedureItem } from '@/components/prescriptions/QuickTestAndDripPanel';
import QuickSymptomsDiagnosis from '@/components/prescriptions/QuickSymptomsDiagnosis';
import FrequentDrugsBar from '@/components/drugs/FrequentDrugsBar';
import QuickAdviceChips from '@/components/prescriptions/QuickAdviceChips';
import LivePrescriptionSheet from '@/components/prescriptions/LivePrescriptionSheet';

function PrescriptionWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientEncounters, setPatientEncounters] = useState<any[]>([]);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientQuery, setNewPatientQuery] = useState('');
  
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Diagnostic tests & Day-care drips
  const [selectedTests, setSelectedTests] = useState<InvestigationItem[]>([]);
  const [selectedDrips, setSelectedDrips] = useState<DayCareProcedureItem[]>([]);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [sendingForTests, setSendingForTests] = useState(false);
  
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

  const [doctorContext, setDoctorContext] = useState<any>({});

  useEffect(() => {
    // Fetch doctor and clinic details for the PDF
    fetch('/api/doctor/me')
      .then(res => res.json())
      .then(data => setDoctorContext(data))
      .catch(err => console.error('Error fetching doctor context:', err));
  }, []);

  useEffect(() => {
    const cloneId = searchParams.get('clone');
    const paramPatientId = searchParams.get('patient') || searchParams.get('patientId');
    const paramQueueId = searchParams.get('queueId');
    if (paramQueueId) setQueueId(paramQueueId);

    if (cloneId) {
      setFetchingPastRx(true);
      fetch(`/api/prescriptions/${cloneId}`)
        .then(res => res.json())
        .then(async (json) => {
          if (json.data) {
            setPatient(json.data.patient);
            if (!startTime) setStartTime(Date.now());
            setChiefComplaint(json.data.chiefComplaint || '');
            setDiagnosis(json.data.diagnosis || '');
            setNotes(json.data.notes || '');
            
            // Map formatted medicines from backend back to PrescribedMedicine for the frontend
            const medsToLoad = (json.data.medicines || []).map((m: any) => ({
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

            // Fetch patient encounters history for AI summary & past visit timeline
            const targetPatientId = json.data.patient?.id || paramPatientId;
            if (targetPatientId) {
              try {
                const histRes = await fetch(`/api/patients/${targetPatientId}`);
                if (histRes.ok) {
                  const histJson = await histRes.json();
                  setPatientEncounters(histJson.encounters || []);
                }
              } catch (e) {
                console.error('Error fetching patient history on clone:', e);
              }
            }
          }
        })
        .catch(err => console.error('Error cloning prescription:', err))
        .finally(() => setFetchingPastRx(false));
    } else if (paramPatientId) {
      setFetchingPastRx(true);
      fetch(`/api/patients/${paramPatientId}`)
        .then(res => res.json())
        .then(json => {
          if (json.patient) {
            setPatient(json.patient);
            setPatientEncounters(json.encounters || []);
            if (!startTime) setStartTime(Date.now());
            
            // Now fetch recent Rx
            return fetch(`/api/prescriptions/recent?patientId=${paramPatientId}`)
              .then(r => r.json())
              .then(rxJson => {
                if (rxJson.data && rxJson.data.medicines && rxJson.data.medicines.length > 0) {
                  setChiefComplaint(rxJson.data.chiefComplaint || '');
                  setDiagnosis(rxJson.data.diagnosis || '');
                  setNotes(rxJson.data.notes || '');
                  setMedicines(rxJson.data.medicines);
                }
              });
          }
        })
        .catch(err => console.error('Error loading patient from URL:', err))
        .finally(() => setFetchingPastRx(false));
    }
  }, [searchParams]);

  // Global Doctor Hotkeys ('/' for search, Ctrl+Enter to finish)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Focus search with '/' (unless doctor is already in an input/textarea)
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) {
        const searchInput = document.getElementById('drug-search-input') as HTMLInputElement | null;
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }

      // 2. Ctrl + Enter or Cmd + Enter to finalize Rx
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (patient && medicines.length > 0) {
          const validation = validatePrescriptionMedicines();
          if (!validation.isValid) {
            alert(validation.message);
            return;
          }
          setShowReview(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [patient, medicines]);


  const handlePatientSelect = async (selectedPatient: Patient) => {
    setPatient(selectedPatient);
    setPatientEncounters([]);
    if (!startTime) setStartTime(Date.now());
    setFetchingPastRx(true);
    
    try {
      // Fetch recent Rx for auto-fill
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

      // Fetch full patient history for AI Clinical Summary & Vitals
      const histRes = await fetch(`/api/patients/${selectedPatient.id}`);
      if (histRes.ok) {
        const histJson = await histRes.json();
        setPatientEncounters(histJson.encounters || []);
        if (histJson.patient) {
          setPatient(histJson.patient);
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
      frequency: drug.default_frequency || '1-0-1',
      duration: drug.default_duration || '3 days',
      instructions: drug.default_instructions || 'Post-Meal (After Food)'
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

  const validatePrescriptionMedicines = () => {
    if (medicines.length === 0) {
      return { isValid: false, message: 'Please add at least one medicine to the prescription.' };
    }

    const missingDetails: string[] = [];
    medicines.forEach((m, idx) => {
      const missing: string[] = [];
      if (!m.frequency || !m.frequency.trim()) missing.push('Frequency');
      if (!m.duration || !m.duration.trim()) missing.push('Duration');
      if (!m.instructions || !m.instructions.trim()) missing.push('Instructions');

      if (missing.length > 0) {
        missingDetails.push(`• ${m.name || `Medicine #${idx + 1}`}: Missing ${missing.join(', ')}`);
      }
    });

    if (missingDetails.length > 0) {
      return {
        isValid: false,
        message: `Please complete all mandatory details for each prescribed medicine before proceeding:\n\n${missingDetails.join('\n')}`
      };
    }

    return { isValid: true, message: '' };
  };

  const handleToggleTest = (test: InvestigationItem) => {
    setSelectedTests(prev =>
      prev.some(t => t.id === test.id)
        ? prev.filter(t => t.id !== test.id)
        : [...prev, test]
    );
  };

  const handleToggleDrip = (drip: DayCareProcedureItem) => {
    setSelectedDrips(prev =>
      prev.some(d => d.id === drip.id)
        ? prev.filter(d => d.id !== drip.id)
        : [...prev, drip]
    );
  };

  const handleSendForTests = async () => {
    if (!patient) return alert('Patient is required');
    if (selectedTests.length === 0 && selectedDrips.length === 0) {
      return alert('Please select at least one Test or Drip/Procedure to order.');
    }

    setSendingForTests(true);
    try {
      // 1. Create automatic bill item(s) for the ordered tests and drips
      const testDripItems = [
        ...selectedTests.map(t => ({
          description: t.name,
          quantity: 1,
          unitPrice: t.price,
          totalPrice: t.price,
          itemType: 'OTHER'
        })),
        ...selectedDrips.map(d => ({
          description: d.name,
          quantity: 1,
          unitPrice: d.price,
          totalPrice: d.price,
          itemType: 'OTHER'
        }))
      ];

      const otherFeeTotal = testDripItems.reduce((sum, i) => sum + i.totalPrice, 0);

      // Create or update billing for this patient
      await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          consultationFee: 0,
          otherFee: otherFeeTotal,
          discount: 0,
          paymentStatus: 'PENDING',
          notes: `Ordered: ${[...selectedTests.map(t => t.name), ...selectedDrips.map(d => d.name)].join(', ')}`,
          items: testDripItems
        })
      });

      // 2. Update Queue status to IN_PROCEDURE so doctor's queue moves to next patient
      if (queueId) {
        await fetch(`/api/queue/${queueId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'IN_PROCEDURE' })
        });
      }

      alert(`✅ Patient sent for Tests & Day-Care Procedures.\n\n• Ordered: ${[...selectedTests.map(t => t.name), ...selectedDrips.map(d => d.name)].join(', ')}\n• Added to Front Desk Billing (₹${otherFeeTotal})\n• Queue updated to "At Lab / Drip"`);
      
      // Return to doctor dashboard to take next patient in queue
      router.push('/doctor/dashboard');
    } catch (err: any) {
      console.error('Error sending for tests:', err);
      alert('Failed to send for tests: ' + (err.message || 'Network error'));
    } finally {
      setSendingForTests(false);
    }
  };

  const handleProceedToReview = () => {
    const validation = validatePrescriptionMedicines();
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    setShowReview(true);
  };

  const savePrescription = async (enableDailyReminders?: boolean) => {
    if (!patient || medicines.length === 0) return alert('Patient and Medicines are required');
    const validation = validatePrescriptionMedicines();
    if (!validation.isValid) return alert(validation.message);
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
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Your session has expired. Please refresh the page and log in again.');
        }
        throw new Error(errData.error || `Server error (${res.status}): Failed to save prescription`);
      }
      
      const data = await res.json();
      const createdRxId = data.prescriptionId;
      setPrescriptionId(createdRxId);
      
      try {
        const base64 = generatePrescriptionPDF({
          patient, medicines, chiefComplaint, diagnosis, notes, followUpDate, rxId: createdRxId, prescriptionId: createdRxId, ...doctorContext
        }, true) as string;
        setPdfBase64(base64);

        generatePrescriptionPDF({
          patient, medicines, chiefComplaint, diagnosis, notes, followUpDate, rxId: createdRxId, prescriptionId: createdRxId, ...doctorContext
        }, false);
      } catch (pdfErr) {
        console.warn('PDF rendering warning on client:', pdfErr);
      }
      if (startTime) {
        setLastTimeTaken(Math.floor((Date.now() - startTime) / 1000));
      }
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Prescription save error:', err);
      alert(err.message || 'Error saving prescription');
    } finally {
      setSaving(false);
    }
  };

  const startNewPrescription = () => {
    setPatient(null);
    setPatientEncounters([]);
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

  // Real-time Allergy Cross-Check Guardrail
  const patientAllergies = patient?.allergies;
  const allergyConflicts = patientAllergies
    ? medicines.filter(m => {
        const allergenTerms = patientAllergies.toLowerCase().split(/[,;\s]+/).filter(w => w.length > 2);
        const medName = (m.name || '').toLowerCase();
        return allergenTerms.some(term => medName.includes(term));
      })
    : [];

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
          <div className="flex flex-wrap items-center gap-2 mt-1 ml-11">
            <p className="text-slate-500 text-sm font-medium">RxNXT Clinical Flow</p>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
              ⚡ Zero-Typing Faster Prescription Generator
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1780px]">

        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Patient & Clinical Details (Sticky docked) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-20 lg:self-start">
            
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

                        {/* Drug Allergy Warning */}
                        {patient.allergies && (
                          <div className="mt-2.5 flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-bold animate-pulse">
                            <AlertCircle size={14} className="text-rose-600 shrink-0" />
                            <span>Allergy Alert: {patient.allergies}</span>
                          </div>
                        )}

                        {/* Patient Vitals Strip */}
                        {patient.vitals && (patient.vitals.bp || patient.vitals.pulse || patient.vitals.temperature || patient.vitals.weight || patient.vitals.spo2) && (
                          <div className="mt-3 pt-3 border-t border-blue-100/80">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Activity size={12} className="text-rose-500" />
                                Recorded Vitals
                              </span>
                              <span className="text-emerald-600 font-semibold lowercase">Today</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                              {patient.vitals.bp && (
                                <div className="bg-white border border-slate-200 rounded p-1.5 text-center shadow-2xs">
                                  <span className="text-[9px] text-slate-400 block font-semibold">BP</span>
                                  <span className={`font-black ${patient.vitals.bp.includes('/') && parseInt(patient.vitals.bp.split('/')[0]) >= 140 ? 'text-amber-600' : 'text-slate-800'}`}>
                                    {patient.vitals.bp}
                                  </span>
                                </div>
                              )}
                              {patient.vitals.temperature && (
                                <div className="bg-white border border-slate-200 rounded p-1.5 text-center shadow-2xs">
                                  <span className="text-[9px] text-slate-400 block font-semibold">TEMP</span>
                                  <span className={`font-black ${parseFloat(patient.vitals.temperature) >= 100.4 ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {patient.vitals.temperature}°F
                                  </span>
                                </div>
                              )}
                              {patient.vitals.pulse && (
                                <div className="bg-white border border-slate-200 rounded p-1.5 text-center shadow-2xs">
                                  <span className="text-[9px] text-slate-400 block font-semibold">PULSE</span>
                                  <span className="font-black text-slate-800">{patient.vitals.pulse} bpm</span>
                                </div>
                              )}
                              {patient.vitals.weight && (
                                <div className="bg-white border border-slate-200 rounded p-1.5 text-center shadow-2xs">
                                  <span className="text-[9px] text-slate-400 block font-semibold">WEIGHT</span>
                                  <span className="font-black text-slate-800">{patient.vitals.weight} kg</span>
                                </div>
                              )}
                              {patient.vitals.spo2 && (
                                <div className="bg-white border border-slate-200 rounded p-1.5 text-center shadow-2xs">
                                  <span className="text-[9px] text-slate-400 block font-semibold">SpO2</span>
                                  <span className={`font-black ${parseFloat(patient.vitals.spo2) < 95 ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {patient.vitals.spo2}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setPatient(null)} 
                      className="absolute top-2 right-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded shadow-sm border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Change
                    </button>
                    
                    {/* AI Patient Clinical Summary for Returning Patients */}
                    <AIPatientSummaryCard patientId={patient.id} encounters={patientEncounters} />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Clinical Details with 1-Click Chips */}
            {patient && (
              <QuickSymptomsDiagnosis
                chiefComplaint={chiefComplaint}
                setChiefComplaint={setChiefComplaint}
                diagnosis={diagnosis}
                setDiagnosis={setDiagnosis}
              />
            )}
          </div>

          {/* Center Column: Medications & Actions */}
          <div className="lg:col-span-8 xl:col-span-5 space-y-6">
            

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
                  {/* Real-time Allergy Cross-Check Guardrail */}
                  {allergyConflicts.length > 0 && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-900 flex items-center gap-2 animate-bounce">
                      <AlertCircle size={20} className="text-red-600 shrink-0" />
                      <div className="text-xs">
                        <span className="font-extrabold uppercase">Potential Allergy Contraindication!</span>
                        <p className="mt-0.5">Patient has documented allergy to <strong>{patientAllergies}</strong>. Prescribed: {allergyConflicts.map(m => m.name).join(', ')}</p>
                      </div>
                    </div>
                  )}


                  {/* 1-Click My Protocol Packs Bar */}
                  <ProtocolPacksBar 
                    onLoadTemplate={loadTemplate} 
                    onOpenSaveModal={() => setShowSaveTemplate(true)} 
                    cartCount={medicines.length} 
                    refreshKey={templateKey} 
                  />

                  <DrugSearchUI onSelect={handleDrugSelect} />
                  
                  {/* 1-Click Frequent Drugs Bar */}
                  <FrequentDrugsBar 
                    onAddDrug={(newMed) => {
                      setMedicines(prev => [...prev, newMed]);
                      if (!startTime) setStartTime(Date.now());
                    }}
                    alreadyPrescribedIds={medicines.map(m => m.generic_id || m.brand_id || m.name)}
                  />
                  
                  <div className="mt-6">
                    <PrescriptionCart medicines={medicines} onUpdate={updateMedicine} onRemove={removeMedicine} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Advice & Notes</label>
                      <QuickAdviceChips notes={notes} setNotes={setNotes} />
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

                        {/* SOAP Order: Diagnostics & Day-Care Procedures Demoted below Medications */}
            {patient && (
              <QuickTestAndDripPanel
                selectedTests={selectedTests}
                selectedDrips={selectedDrips}
                onToggleTest={handleToggleTest}
                onToggleDrip={handleToggleDrip}
                onSendForTests={handleSendForTests}
                isSending={sendingForTests}
              />
            )}

            {/* Action Bar */}
            {patient && (() => {
              const hasIncompleteMedicines = medicines.some(
                m => !m.frequency?.trim() || !m.duration?.trim() || !m.instructions?.trim()
              );

              return (
                <div className="mt-6 xl:hidden">
                  {medicines.length > 0 && hasIncompleteMedicines && (
                    <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold mb-3 animate-in fade-in shadow-xs">
                      <AlertCircle size={18} className="text-amber-600 shrink-0" />
                      <span>
                        <strong>Medication Details Required:</strong> Please enter Frequency, Duration, and Instructions for all added medicines before advancing.
                      </span>
                    </div>
                  )}

                  <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 shadow-2xl md:static md:bg-transparent md:p-0 md:border-0 md:shadow-none flex flex-wrap justify-end gap-3 rounded-b-2xl md:rounded-none -mx-4 sm:mx-0 px-4 sm:px-0">
                    {(selectedTests.length > 0 || selectedDrips.length > 0) && (
                      <button 
                        type="button"
                        onClick={handleSendForTests}
                        disabled={sendingForTests}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all duration-200 flex items-center text-sm sm:text-base disabled:opacity-50"
                      >
                        <FlaskConical className="mr-2" size={18} />
                        {sendingForTests ? 'Sending...' : 'Send for Tests / Drip & Next Patient'}
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const validation = validatePrescriptionMedicines();
                        if (!validation.isValid) {
                          alert(validation.message);
                          return;
                        }
                        setShowSaveTemplate(true);
                      }}
                      disabled={medicines.length === 0}
                      className="bg-white hover:bg-gray-50 text-clinic-navy border border-gray-200 font-bold py-3 px-5 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Layers className="mr-2 text-blue-500" size={18} /> Save as Group
                    </button>
                    <button 
                      onClick={handleProceedToReview}
                      disabled={medicines.length === 0}
                      className={`font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center text-sm sm:text-base ${
                        hasIncompleteMedicines
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                          : 'bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white hover:shadow-xl'
                      } disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-emerald-400`}
                    >
                      <Eye className="mr-2" size={18} /> Review & Print Rx
                      <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white/20 text-white rounded">Ctrl+Enter</kbd>
                      {hasIncompleteMedicines && (
                        <span className="ml-2 text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full uppercase font-extrabold tracking-wider">
                          Incomplete
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>


          {/* Right Rail: Real-time Live A4 Prescription Sheet & Fitts's Law Action Dock */}
          <div className="hidden xl:block xl:col-span-4 sticky top-20 self-start space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <LivePrescriptionSheet
              patient={patient}
              medicines={medicines}
              chiefComplaint={chiefComplaint}
              diagnosis={diagnosis}
              notes={notes}
              followUpDate={followUpDate}
              selectedTests={selectedTests}
              selectedDrips={selectedDrips}
              doctorContext={doctorContext}
              onProceedToReview={handleProceedToReview}
              onOpenSaveModal={() => setShowSaveTemplate(true)}
              saving={saving}
            />
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
          onGoToDashboard={() => router.push('/doctor/dashboard')}
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
