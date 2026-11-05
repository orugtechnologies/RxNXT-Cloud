'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import { Patient } from '@/components/patients/PatientSearchUI';
import { PrescribedMedicine } from '@/components/prescriptions/PrescriptionCart';
import ReviewPrescriptionModal from '@/components/prescriptions/ReviewPrescriptionModal';
import SaveTemplateModal from '@/components/prescriptions/SaveTemplateModal';
import { generatePrescriptionPDF } from '@/components/prescriptions/PrescriptionPrintView';
import { Activity, Loader2 } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

function NewPrescriptionPadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState<string | undefined>();
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [doctorContext, setDoctorContext] = useState<any>({});
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    fetch('/api/doctor/me')
      .then(res => res.json())
      .then(data => setDoctorContext(data))
      .catch(err => console.error('Error fetching doctor context:', err));
  }, []);

  useEffect(() => {
    const patientId = searchParams.get('patientId') || searchParams.get('patient');
    if (patientId) {
      fetch(`/api/patients/${patientId}`)
        .then(res => res.json())
        .then(json => {
          if (json.patient) setPatient(json.patient);
        })
        .catch(err => console.error('Error loading patient:', err));
    }
  }, [searchParams]);

  const handleAddMedicine = (med: PrescribedMedicine) => {
    setMedicines(prev => [...prev, med]);
  };

  const handleUpdateMedicine = (id: string, updates: Partial<PrescribedMedicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleLoadTemplate = (meds: PrescribedMedicine[]) => {
    setMedicines(prev => [...prev, ...meds]);
  };

  const handleSavePrescription = async (enableReminders?: boolean) => {
    if (!patient || medicines.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          chiefComplaint,
          diagnosis,
          notes,
          followUpDate,
          medicines,
          enableReminders,
          deliveryMethod: 'both',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save prescription');
      }

      const data = await res.json();
      const createdId = data.prescriptionId;
      setPrescriptionId(createdId);

      try {
        const base64 = generatePrescriptionPDF({
          patient,
          medicines,
          chiefComplaint,
          diagnosis,
          notes,
          followUpDate,
          rxId: createdId,
          prescriptionId: createdId,
          ...doctorContext,
        }, true) as string;
        setPdfBase64(base64);
      } catch (pdfErr) {
        console.warn('PDF generation warning:', pdfErr);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Save prescription error:', err);
      alert(err.message || 'Error saving prescription');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Activity className="text-emerald-600 mr-3" size={28} strokeWidth={2.5} />
            Clinical Prescription Pad
            <InfoTooltip text="Ergonomic zero-typing prescription workflow with smart clinical pre-fills and instant WhatsApp delivery." />
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 ml-11">
            <p className="text-slate-500 text-sm font-medium">RxNXT Clinical Flow</p>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              ⚡ 15s Rapid Consultation UX
            </span>
          </div>
        </div>
      </div>

      <PrescriptionForm
        patient={patient}
        onPatientSelect={(p) => setPatient(p)}
        onClearPatient={() => setPatient(null)}
        onAddNewPatient={(q) => router.push(`/doctor/prescription?newPatient=${encodeURIComponent(q)}`)}
        medicines={medicines}
        onUpdateMedicine={handleUpdateMedicine}
        onRemoveMedicine={handleRemoveMedicine}
        onAddMedicine={handleAddMedicine}
        onLoadTemplate={handleLoadTemplate}
        onClearMedicines={() => setMedicines([])}
        chiefComplaint={chiefComplaint}
        setChiefComplaint={setChiefComplaint}
        diagnosis={diagnosis}
        setDiagnosis={setDiagnosis}
        notes={notes}
        setNotes={setNotes}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        onSubmit={() => setShowReview(true)}
        onOpenSaveModal={() => setShowSaveTemplate(true)}
        saving={saving}
      />

      {showSaveTemplate && (
        <SaveTemplateModal
          medicines={medicines}
          onClose={() => setShowSaveTemplate(false)}
          onSuccess={() => {
            setShowSaveTemplate(false);
            alert('Protocol pack saved successfully!');
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
          timeTakenSeconds={Math.floor((Date.now() - startTime) / 1000)}
          onClose={() => {
            if (isSuccess) handleReset();
            else setShowReview(false);
          }}
          onConfirm={handleSavePrescription}
          onNewPrescription={handleReset}
          onGoToDashboard={() => router.push('/doctor/dashboard')}
        />
      )}
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="text-sm font-semibold text-slate-600">Loading Clinical Prescription Pad...</p>
      </div>
    }>
      <NewPrescriptionPadContent />
    </Suspense>
  );
}
