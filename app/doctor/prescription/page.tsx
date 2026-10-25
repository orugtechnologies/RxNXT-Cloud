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
import { Activity, User, Pill, Stethoscope, Save, Layers, Eye, AlertCircle, FlaskConical, Droplet, ArrowRightCircle, FileText } from 'lucide-react';
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
import SubscriptionLockoutModal from '@/components/subscription/SubscriptionLockoutModal';

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

  // Epic 1 State 3: Hard usage lockout modal
  const [showLockoutModal, setShowLockoutModal] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ isUsageLocked?: boolean; prescriptionsCount?: number } | null>(null);

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
        if (res.status === 403 && (errData.error === 'TRIAL_USAGE_LIMIT_REACHED' || errData.error === 'SUBSCRIPTION_EXPIRED')) {
          setLockoutInfo({
            isUsageLocked: errData.error === 'TRIAL_USAGE_LIMIT_REACHED' || errData.subscription?.isUsageLocked,
            prescriptionsCount: errData.subscription?.prescriptionsCount || 150,
          });
          setShowLockoutModal(true);
          setShowReview(false);
          return;
        }
        throw new Error(errData.message || errData.error || `Server error (${res.status}): Failed to save prescription`);
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
            <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border transition-all duration-300 hover:shadow-md relative z-30">
              <div className="bg-[#f0f6fe] px-4 sm:px-5 py-3 border-b border-[#d8e7fc] flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#dbeafe] text-[#0060df] flex items-center justify-center shrink-0 border border-[#bfdbfe]">
                    <User size={15} className="stroke-[2.5]" />
                  </div>
                  <h2 className="text-xs sm:text-[13px] font-extrabold text-[#000865] uppercase tracking-wider">Patient</h2>
                </div>
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

                        {/* Drug Allergy / NKDA Guardrail */}
                        {patient.allergies ? (
                          <div className="mt-2.5 flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-bold animate-pulse">
                            <AlertCircle size={14} className="text-rose-600 shrink-0" />
                            <span>Allergy Alert: {patient.allergies}</span>
                          </div>
                        ) : (
                          <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shrink-0"></span>
                            <span>NKDA (No Known Drug Allergies)</span>
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

          {/* Center Column: Medications & Clinical Actions */}
          <div className="lg:col-span-8 xl:col-span-5 space-y-4">
            
            {patient && (
              <>
                {/* Block 1: 1-Click Protocol Packs & Drug Search */}
                <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border relative z-20">
                  <div className="bg-[#f0f6fe] px-4 sm:px-5 py-3 border-b border-[#d8e7fc] flex items-center justify-between rounded-t-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#dbeafe] text-[#0060df] flex items-center justify-center shrink-0 border border-[#bfdbfe]">
                        <Pill size={15} className="stroke-[2.5]" />
                      </div>
                      <h2 className="text-xs sm:text-[13px] font-extrabold text-[#000865] uppercase tracking-wider">
                        1-Click Protocol Packs & Search
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">Standardized OPD care</span>
                  </div>

                  <div className="p-4 space-y-3.5">
                    <ProtocolPacksBar 
                      onLoadTemplate={loadTemplate} 
                      onOpenSaveModal={() => setShowSaveTemplate(true)} 
                      cartCount={medicines.length} 
                      refreshKey={templateKey} 
                    />

                    <DrugSearchUI onSelect={handleDrugSelect} />
                    
                    <FrequentDrugsBar 
                      onAddDrug={(newMed) => {
                        setMedicines(prev => [...prev, newMed]);
                        if (!startTime) setStartTime(Date.now());
                      }}
                      alreadyPrescribedIds={medicines.map(m => m.generic_id || m.brand_id || m.name)}
                    />
                  </div>
                </div>

                {/* Block 2: Prescribed Medicines Cart */}
                <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden">
                  <div className="bg-[#f0f6fe] px-4 sm:px-5 py-3 border-b border-[#d8e7fc] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#dbeafe] text-[#0060df] flex items-center justify-center shrink-0 border border-[#bfdbfe]">
                        <Layers size={15} className="stroke-[2.5]" />
                      </div>
                      <h2 className="text-xs sm:text-[13px] font-extrabold text-[#000865] uppercase tracking-wider">
                        Prescribed Medicines {medicines.length > 0 && `(${medicines.length})`}
                      </h2>
                    </div>
                    {medicines.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMedicines([])}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer bg-white/80 px-2.5 py-1 rounded border border-rose-200/80"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="p-4">
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

                    <PrescriptionCart medicines={medicines} onUpdate={updateMedicine} onRemove={removeMedicine} />
                  </div>
                </div>

                {/* Block 3: Diagnostics & Day-Care Procedures */}
                <QuickTestAndDripPanel
                  selectedTests={selectedTests}
                  selectedDrips={selectedDrips}
                  onToggleTest={handleToggleTest}
                  onToggleDrip={handleToggleDrip}
                  onSendForTests={handleSendForTests}
                  isSending={sendingForTests}
                />

                {/* Block 4: Doctor's Advice & Counseling */}
                <div className="bg-clinic-card rounded-xl shadow-soft border border-clinic-border overflow-hidden">
                  <div className="bg-[#f0f6fe] px-4 sm:px-5 py-3 border-b border-[#d8e7fc] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#dbeafe] text-[#0060df] flex items-center justify-center shrink-0 border border-[#bfdbfe]">
                        <FileText size={15} className="stroke-[2.5]" />
                      </div>
                      <h2 className="text-xs sm:text-[13px] font-extrabold text-[#000865] uppercase tracking-wider">
                        Doctor's Advice & Counseling
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white/80 px-2 py-0.5 rounded border border-slate-200/60">Included on printout</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <QuickAdviceChips notes={notes} setNotes={setNotes} />
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specific patient advice, dietary instructions..."
                      rows={3}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-[#0080ff] shadow-xs"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-600">Follow-up visit:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[3, 5, 7, 14].map(days => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setQuickFollowUp(days)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1e40af] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            {days} Days
                          </button>
                        ))}
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-[#0080ff]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile / Tablet Action Bar */}
                <div className="mt-4 xl:hidden">
                  <button 
                    onClick={handleProceedToReview}
                    disabled={medicines.length === 0}
                    className="w-full bg-gradient-to-r from-[#0080ff] to-[#0052cc] hover:from-[#0070e6] hover:to-[#0047b3] text-white font-extrabold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Eye size={18} /> Review & Print Rx
                  </button>
                </div>
              </>
            )}
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

      {showLockoutModal && (
        <SubscriptionLockoutModal
          isOpen={showLockoutModal}
          clinicName={doctorContext?.clinicName}
          isTrial={true}
          isUsageLocked={lockoutInfo?.isUsageLocked ?? true}
          prescriptionsCount={lockoutInfo?.prescriptionsCount ?? 150}
          onClose={() => setShowLockoutModal(false)}
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
